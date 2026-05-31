import { NextResponse } from 'next/server';
import { YouTubeTranscriptionSchema } from '@/src/mastra/schemas/analysis';

export const maxDuration = 600; // 10 minutos (Modal worker pode levar tempo)
export const dynamic = 'force-dynamic';

/**
 * API Route: YouTube to Transcript via Modal Worker
 * 
 * Fluxo:
 * 1. Recebe URL do YouTube do cliente
 * 2. Extrai headers HTTP do usuário (preserva IP original)
 * 3. Envia para Modal Worker serverless
 * 4. Modal Worker: download com IP do usuário → transcrição com Whisper
 * 5. Retorna transcript estruturado ao cliente
 * 
 * POST /api/mastra/youtube-to-transcript
 */
export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    console.log('[YouTubeToTranscript] Nova requisição recebida');

    // 1. Extrair payload do cliente
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

    console.log(`[YouTubeToTranscript] Processando: ${videoUrl}`);

    // 3. Extrair headers do usuário para preservar IP e contexto original
    // Estes headers serão repassados ao Modal Worker para garantir que
    // yt-dlp baixe com o IP e contexto do usuário real, não do datacenter
    const userHeaders = {
      'user-agent': request.headers.get('user-agent') || 'Mozilla/5.0',
      'accept-language': request.headers.get('accept-language') || 'pt-BR,pt;q=0.9',
      'referer': request.headers.get('referer') || 'https://unoduno.com',
      'x-forwarded-for': request.headers.get('x-forwarded-for') || undefined,
    };

    // Remover undefined values
    Object.keys(userHeaders).forEach(key => {
      if (userHeaders[key as keyof typeof userHeaders] === undefined) {
        delete userHeaders[key as keyof typeof userHeaders];
      }
    });

    console.log('[YouTubeToTranscript] Headers do usuário extraídos, enviando para Modal Worker...');

    // 4. Chamar Modal Worker serverless
    const modalWorkerUrl = process.env.MODAL_WORKER_URL;
    if (!modalWorkerUrl) {
      console.error('[YouTubeToTranscript] MODAL_WORKER_URL não configurada!');
      return NextResponse.json(
        { error: 'Processador Modal não configurado. Contate o suporte.' },
        { status: 500 }
      );
    }

    console.log(`[YouTubeToTranscript] Chamando Modal Worker: ${modalWorkerUrl.substring(0, 50)}...`);

    let modalResponse;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minutos

      const response = await fetch(modalWorkerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_url: videoUrl,
          user_headers: userHeaders, // IP do usuário preservado
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Modal Worker retornou ${response.status}`);
      }

      modalResponse = await response.json();
    } catch (fetchError) {
      console.error('[YouTubeToTranscript] Erro ao chamar Modal Worker:', fetchError);
      return NextResponse.json(
        {
          error: 'Falha ao conectar com o processador Modal',
          details: fetchError instanceof Error ? fetchError.message : 'Erro de rede',
        },
        { status: 503 }
      );
    }

    console.log('[YouTubeToTranscript] Resposta do Modal Worker recebida');

    // 5. Verificar se houve erro no Modal
    if (!modalResponse.success) {
      console.error('[YouTubeToTranscript] Erro no Modal Worker:', modalResponse.error);
      return NextResponse.json(
        {
          error: 'Falha ao processar vídeo no Modal',
          details: modalResponse.error,
        },
        { status: 400 }
      );
    }

    // 6. Validar e sanitizar resposta do Modal
    try {
      const validated = YouTubeTranscriptionSchema.parse({
        ...modalResponse,
        success: true,
        timestamp: new Date().toISOString(),
      });

      // Adicionar metadados de processamento
      const processingTime = (Date.now() - startTime) / 1000;
      
      const response = {
        ...validated,
        processingTimeSeconds: processingTime,
        status: 'completed',
        processedVia: 'modal_worker_with_user_ip',
      };

      console.log(`[YouTubeToTranscript] ✅ Sucesso! Tempo total: ${processingTime.toFixed(2)}s`);

      return NextResponse.json(response, { status: 200 });

    } catch (validationError: any) {
      console.error('[YouTubeToTranscript] Erro de validação:', validationError);
      return NextResponse.json(
        {
          error: 'Resposta do Modal não passou na validação',
          details: validationError.errors || validationError.message,
          rawResponse: modalResponse,
        },
        { status: 500 }
      );
    }

  } catch (error: any) {
    console.error('[YouTubeToTranscript] Erro geral:', error);
    
    const processingTime = (Date.now() - startTime) / 1000;

    return NextResponse.json(
      {
        error: 'Erro ao processar YouTube transcription',
        details: error.message || error,
        processingTimeSeconds: processingTime,
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
    endpoint: '/api/mastra/youtube-to-transcript',
    method: 'POST',
    description: 'Processa um link do YouTube usando Modal Worker com IP do usuário',
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
      videoId: 'string - ID do vídeo',
      transcript: 'string - Transcrição completa',
      segments: 'array - [{start, end, text}, ...]',
      metadata: 'object - {title, author, duration, language}',
      transcriptionStats: 'object - {wordCount, segments, backend}',
      processingTimeSeconds: 'number',
      processedVia: 'string - método utilizado',
    },
  });
}
