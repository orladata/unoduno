import { NextResponse } from 'next/server';
import { spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import * as os from 'os';

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

    // 7. Retornar arquivo como stream
    const fileStream = fs.createReadStream(audioFilePath);

    const response = new NextResponse(fileStream, {
      status: 200,
      headers: {
        'Content-Type': 'audio/mpeg',
        'Content-Length': fs.statSync(audioFilePath).size.toString(),
        'Cache-Control': 'no-cache, no-store, must-revalidate',
      },
    });

    // 8. Cleanup após resposta (não bloqueia)
    setImmediate(() => {
      try {
        if (tempDir && fs.existsSync(tempDir)) {
          fs.rmSync(tempDir, { recursive: true, force: true });
          console.log(`[YouTubeDownload] Diretório temporário deletado`);
        }
      } catch (err) {
        console.error('[YouTubeDownload] Erro ao limpar temporário:', err);
      }
    });

    const processingTime = (Date.now() - startTime) / 1000;
    console.log(`[YouTubeDownload] Tempo total: ${processingTime.toFixed(2)}s`);

    return response;

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
    description: 'Faz download de áudio YouTube usando Bright Data proxy',
    usage: {
      payload: {
        videoUrl: 'string (obrigatório) - Link do YouTube',
      },
      example: {
        videoUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      },
    },
    response: 'MP3 audio stream (audio/mpeg)',
  });
}
