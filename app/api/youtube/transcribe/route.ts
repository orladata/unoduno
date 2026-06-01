import { NextResponse } from 'next/server';

export const maxDuration = 300; // 5 minutos
export const dynamic = 'force-dynamic';

/**
 * API Route: Transcrição de Áudio via Modal Worker
 * 
 * Fluxo:
 * 1. Recebe áudio em base64 (já baixado pelo /api/youtube/download)
 * 2. Extrai videoId da requisição
 * 3. Envia ao Modal Worker de transcrição
 * 4. Retorna transcrição estruturada
 * 
 * POST /api/youtube/transcribe
 */
export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    console.log('[YouTubeTranscribe] Nova requisição recebida');

    // 1. Extrair payload JSON
    let payload;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json(
        { error: 'Payload JSON inválido' },
        { status: 400 }
      );
    }

    const { videoId, audioBase64, audioFormat = 'audio/mpeg' } = payload;

    if (!videoId || !audioBase64) {
      return NextResponse.json(
        { error: 'videoId e audioBase64 são obrigatórios' },
        { status: 400 }
      );
    }

    console.log(`[YouTubeTranscribe] Processando vídeo: ${videoId}`);
    const audioSizeBytes = Math.ceil(audioBase64.length * 0.75); // Aproximado
    console.log(`[YouTubeTranscribe] Tamanho do áudio: ${(audioSizeBytes / (1024 * 1024)).toFixed(2)}MB`);

    console.log(`[YouTubeTranscribe] Enviando para Modal Worker...`);

    // 2. Chamar Modal Worker de transcrição
    const modalWorkerUrl = process.env.MODAL_TRANSCRIPTION_WORKER_URL;
    if (!modalWorkerUrl) {
      console.error('[YouTubeTranscribe] MODAL_TRANSCRIPTION_WORKER_URL não configurada!');
      return NextResponse.json(
        { error: 'Processador Modal não configurado. Contate o suporte.' },
        { status: 500 }
      );
    }

    console.log(`[YouTubeTranscribe] Chamando Modal Worker: ${modalWorkerUrl.substring(0, 50)}...`);

    let modalResponse;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 300000); // 5 minutos

      const response = await fetch(modalWorkerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: videoId,
          audio_base64: audioBase64,
          audio_format: audioFormat,
          audio_size_bytes: audioSizeBytes,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        const errorText = await response.text();
        console.error(`[YouTubeTranscribe] Modal Worker erro ${response.status}:`, errorText);
        throw new Error(`Modal Worker retornou ${response.status}`);
      }

      modalResponse = await response.json();
    } catch (fetchError) {
      console.error('[YouTubeTranscribe] Erro ao chamar Modal Worker:', fetchError);
      return NextResponse.json(
        {
          error: 'Falha ao conectar com o processador Modal',
          details: fetchError instanceof Error ? fetchError.message : 'Erro de rede',
        },
        { status: 503 }
      );
    }

    console.log('[YouTubeTranscribe] Resposta do Modal Worker recebida');

    // 3. Verificar se houve erro no Modal
    if (!modalResponse.success) {
      console.error('[YouTubeTranscribe] Erro no Modal Worker:', modalResponse.error);
      return NextResponse.json(
        {
          error: 'Falha ao transcrever áudio no Modal',
          details: modalResponse.error,
        },
        { status: 400 }
      );
    }

    // 4. Adicionar metadados de processamento
    const processingTime = (Date.now() - startTime) / 1000;
    
    const response = {
      ...modalResponse,
      success: true,
      videoId,
      processingTimeSeconds: processingTime,
      status: 'completed',
      processedVia: 'modal_transcription_worker',
    };

    console.log(`[YouTubeTranscribe] ✅ Sucesso! Tempo total: ${processingTime.toFixed(2)}s`);
    console.log(`[YouTubeTranscribe] Transcrição: ${response.transcript?.substring(0, 100)}...`);

    return NextResponse.json(response, { status: 200 });

  } catch (error: any) {
    console.error('[YouTubeTranscribe] Erro geral:', error);

    const processingTime = (Date.now() - startTime) / 1000;

    return NextResponse.json(
      {
        error: 'Erro ao transcrever áudio',
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
    endpoint: '/api/youtube/transcribe',
    method: 'POST',
    description: 'Transcreve áudio já baixado usando Modal Worker',
    usage: {
      payload: {
        videoId: 'string (obrigatório) - ID do vídeo YouTube',
        audioBase64: 'string (obrigatório) - Áudio em base64 (MP3)',
        audioFormat: 'string (opcional) - Formato MIME, default: audio/mpeg',
      },
    },
    response: {
      success: 'boolean',
      videoId: 'string - ID do vídeo',
      transcript: 'string - Transcrição completa',
      segments: 'array - [{start, end, text}, ...]',
      stats: 'object - {wordCount, segmentCount, processingTimeSeconds, ...}',
      processingTimeSeconds: 'number',
      processedVia: 'string - modal_transcription_worker',
    },
  });
}
