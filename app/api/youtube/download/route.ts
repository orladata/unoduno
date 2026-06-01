import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';
import { createR2Service } from '@/lib/cloudflare-r2';

export const maxDuration = 300; // 5 minutos para download
export const dynamic = 'force-dynamic';

/**
 * API Route: Download de Áudio YouTube com Bright Data Proxy
 * 
 * Este endpoint roda yt-dlp no servidor Vercel usando o proxy residencial Bright Data.
 * O arquivo MP3 em bitrate baixo é retornado como resposta.
 * 
 * Fluxo:
 * 1. Recebe URL do YouTube
 * 2. Valida URL
 * 3. Executa yt-dlp com Bright Data proxy
 * 4. Retorna MP3 em stream
 * 
 * POST /api/youtube/download
 */
export async function POST(request: Request) {
  const startTime = Date.now();
  let tempDir: string | null = null;
  let audioFilePath: string | null = null;

  try {
    console.log('[YouTubeDownload] Nova requisição recebida');

    // 1. Extrair payload
    let payload;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Payload JSON inválido' },
        { status: 400 }
      );
    }

    const { videoUrl } = payload;

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'videoUrl é obrigatória' },
        { status: 400 }
      );
    }

    // 2. Validar URL do YouTube
    const youtubeRegex = /^(https:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\//;
    if (!youtubeRegex.test(videoUrl)) {
      return NextResponse.json(
        { error: 'URL não é um link válido do YouTube' },
        { status: 400 }
      );
    }

    console.log(`[YouTubeDownload] Processando: ${videoUrl}`);

    // 3. Configurar Bright Data proxy
    const brightDataUsername = process.env.BRIGHT_DATA_USERNAME;
    const brightDataPassword = process.env.BRIGHT_DATA_PASSWORD;
    const brightDataHost = process.env.BRIGHT_DATA_HOST || 'brd.superproxy.io';
    const brightDataPort = process.env.BRIGHT_DATA_PORT || '33335';

    if (!brightDataUsername || !brightDataPassword) {
      console.error('[YouTubeDownload] Bright Data não configurado!');
      return NextResponse.json(
        { error: 'Bright Data proxy não configurado. Contate o suporte.' },
        { status: 500 }
      );
    }

    const proxyUrl = `http://${brightDataUsername}:${brightDataPassword}@${brightDataHost}:${brightDataPort}`;
    console.log(`[YouTubeDownload] Proxy configurado: ${brightDataHost}:${brightDataPort}`);

    // 4. Criar diretório temporário
    tempDir = fs.mkdtempSync(path.join(os.tmpdir(), 'yt-'));
    console.log(`[YouTubeDownload] Diretório temporário: ${tempDir}`);

    audioFilePath = path.join(tempDir, 'audio.mp3');

    // 5. Executar yt-dlp com proxy
    console.log('[YouTubeDownload] Iniciando download com yt-dlp...');

    const ytDlpArgs = [
      '-x', // Extract audio only
      '--audio-format', 'mp3',
      '--audio-quality', '48', // 48kbps bitrate baixo
      '--proxy', proxyUrl,
      '--socket-timeout', '30',
      '--retries', '3',
      '--fragment-retries', '3',
      '-o', audioFilePath,
      videoUrl,
    ];

    const ytDlpProcess = spawn('yt-dlp', ytDlpArgs);

    let stderr = '';
    let stdout = '';

    ytDlpProcess.stderr.on('data', (data) => {
      stderr += data.toString();
      console.log(`[YouTubeDownload] yt-dlp stderr:`, data.toString());
    });

    ytDlpProcess.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    // Aguardar conclusão
    await new Promise<void>((resolve, reject) => {
      ytDlpProcess.on('close', (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`yt-dlp falhou com código ${code}: ${stderr}`));
        }
      });

      ytDlpProcess.on('error', (err) => {
        reject(err);
      });

      // Timeout de 300 segundos
      setTimeout(() => {
        ytDlpProcess.kill();
        reject(new Error('yt-dlp timeout'));
      }, 300000);
    });

    // 6. Verificar se arquivo foi criado
    if (!fs.existsSync(audioFilePath)) {
      throw new Error('Arquivo de áudio não foi criado');
    }

    const fileSizeMB = fs.statSync(audioFilePath).size / (1024 * 1024);
    console.log(`[YouTubeDownload] ✅ Download concluído: ${fileSizeMB.toFixed(2)}MB`);

    // 7. Ler arquivo e converter para base64
    console.log('[YouTubeDownload] Convertendo para base64...');
    const audioBuffer = fs.readFileSync(audioFilePath);
    const audioBase64 = audioBuffer.toString('base64');
    const audioSizeBytes = audioBuffer.length;

    console.log(`[YouTubeDownload] ✅ Base64 pronto: ${audioSizeBytes} bytes`);

    // 8. Cleanup imediato
    try {
      if (tempDir && fs.existsSync(tempDir)) {
        fs.rmSync(tempDir, { recursive: true, force: true });
        console.log(`[YouTubeDownload] Diretório temporário deletado`);
      }
    } catch (err) {
      console.error('[YouTubeDownload] Erro ao limpar temporário:', err);
    }

    const processingTime = (Date.now() - startTime) / 1000;
    console.log(`[YouTubeDownload] Tempo total: ${processingTime.toFixed(2)}s`);

    // 9. Extrair video ID da URL
    const videoIdMatch = videoUrl.match(/(?:youtube\.com\/watch\?v=|youtu\.be\/)([^&\n?#]+)/);
    const videoId = videoIdMatch?.[1] || 'unknown';

    // 10. Upload para Cloudflare R2 (se configurado)
    let r2Url: string | null = null;
    try {
      if (
        process.env.CLOUDFLARE_R2_ACCOUNT_ID &&
        process.env.CLOUDFLARE_R2_ACCESS_KEY_ID &&
        process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY
      ) {
        console.log('[YouTubeDownload] Fazendo upload para Cloudflare R2...');
        const r2 = createR2Service();
        const fileName = `audio/${videoId}/${Date.now()}.mp3`;
        
        const uploadResult = await r2.uploadFile(audioBuffer, {
          key: fileName,
          contentType: 'audio/mpeg',
          metadata: {
            videoId,
            uploadedAt: new Date().toISOString(),
            videoUrl,
          },
        });

        r2Url = uploadResult.url;
        console.log(`[YouTubeDownload] ✅ Upload R2 concluído: ${r2Url}`);
      }
    } catch (r2Error) {
      console.warn('[YouTubeDownload] ⚠️ Erro ao fazer upload R2 (continuando):', r2Error);
      // Continuar mesmo se R2 falhar - base64 ainda será retornado
    }

    // 11. Retornar JSON com áudio em base64 e URL do R2
    return NextResponse.json({
      success: true,
      videoId,
      audioBase64,
      audioSizeBytes,
      audioFormat: 'audio/mpeg',
      bitrate: '48kbps',
      processingTimeSeconds: processingTime,
      r2Url, // URL do arquivo no R2 (se upload foi bem-sucedido)
      storageMethod: r2Url ? 'cloudflare_r2' : 'base64_only',
    }, {
      status: 200,
      headers: {
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

  } catch (error: any) {
    console.error('[YouTubeDownload] Erro:', error.message);

    // Cleanup em caso de erro
    if (tempDir && fs.existsSync(tempDir)) {
      try {
        fs.rmSync(tempDir, { recursive: true, force: true });
      } catch (err) {
        console.error('[YouTubeDownload] Erro ao limpar temporário:', err);
      }
    }

    return NextResponse.json(
      {
        error: 'Falha ao fazer download do vídeo',
        details: error.message,
      },
      { status: 500 }
    );
  }
}

/**
 * GET endpoint para health check
 */
export async function GET(request: Request) {
  return NextResponse.json({
    status: 'ok',
    endpoint: '/api/youtube/download',
    method: 'POST',
    description: 'Faz download de áudio YouTube usando Bright Data proxy com suporte a Cloudflare R2',
    usage: {
      payload: {
        videoUrl: 'string (obrigatório) - Link do YouTube',
      },
      example: {
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
    },
    response: {
      success: 'boolean',
      videoId: 'string - ID do vídeo YouTube',
      audioBase64: 'string - Áudio em base64 (48kbps MP3)',
      audioSizeBytes: 'number - Tamanho em bytes',
      audioFormat: 'string - Formato MIME (audio/mpeg)',
      bitrate: 'string - Bitrate do áudio',
      processingTimeSeconds: 'number - Tempo de processamento',
      r2Url: 'string (opcional) - URL pública no Cloudflare R2',
      storageMethod: 'string - "cloudflare_r2" ou "base64_only"',
    },
  });
}
