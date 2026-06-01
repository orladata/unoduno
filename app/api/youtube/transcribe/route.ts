import { NextResponse } from 'next/server';
import { YouTubeTranscriptionSchema } from '@/src/mastra/schemas/analysis';

export const maxDuration = 600; // 10 minutos
export const dynamic = 'force-dynamic';

/**
 * API Route: Transcrever Áudio via Modal Worker
 * 
 * Este endpoint recebe um arquivo MP3 já baixado e faz a transcrição.
 * O Modal Worker APENAS faz transcrição, não faz download.
 * 
 * Fluxo:
 * 1. Recebe arquivo MP3 (multipart/form-data)
 * 2. Envia para Modal Worker
 * 3. Modal Worker: transcrição com Whisper
 * 4. Retorna transcript estruturado
 * 
 * POST /api/youtube/transcribe
 */
export async function POST(request: Request) {
  const startTime = Date.now();

  try {
    console.log('[YouTubeTranscribe] Nova requisição recebida');

    // 1. Extrair form data
    let formData;
    try {
      formData = await request.formData();
    } catch {
      return NextResponse.json(
        { error: 'Form data inválido' },
        { status: 400 }
      );
    }

    const audioFile = formData.get('audio') as File;
    const videoId = formData.get('videoId') as string;

    if (!audioFile) {
      return NextResponse.json(
        { error: 'Campo "audio" é obrigatório' },
        { status: 400 }
      );
    }

    if (!videoId) {
      return NextResponse.json(
        { error: 'Campo "videoId" é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`[YouTubeTranscribe] Processando: ${videoId}, tamanho: ${audioFile.size} bytes`);

    // 2. Validar tipo de arquivo
    if (!audioFile.type.startsWith('audio/')) {
      return NextResponse.json(
        { error: 'Arquivo deve ser de áudio (audio/mp3, audio/wav, etc)' },
        { status: 400 }
      );
    }

    // 3. Converter arquivo para buffer
    const audioBuffer = await audioFile.arrayBuffer();
    const audioBase64 = Buffer.from(audioBuffer).toString('base64');

    console.log(`[YouTubeTranscribe] Áudio convertido para base64, enviando para Modal Worker...`);

    // 4. Chamar Modal Worker serverless
    const modalWorkerUrl = process.env.MODAL_WORKER_URL;
    if (!modalWorkerUrl) {
      console.error('[YouTubeTranscribe] MODAL_WORKER_URL não configurada!');
      return NextResponse.json(
        { error: 'Processador Modal não configurado. Contate o suporte.' },
        { status: 500 }
      );
    }

    console.log(`[YouTubeTranscribe] Chamando Modal Worker: ${modalWorkerUrl.substring(0, 50)}...`);

    let modalResponse;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minutos

      const response = await fetch(modalWorkerUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_id: videoId,
          audio_base64: audioBase64, // Áudio já em base64
          audio_format: audioFile.type, // Ex: audio/mpeg
          audio_size_bytes: audioFile.size,
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
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

    // 5. Verificar se houve erro no Modal
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

    // 6. Validar e sanitizar resposta do Modal
    try {
      const validated = YouTubeTranscriptionSchema.parse({
        ...modalResponse,
        success: true,
        videoId: videoId,
        timestamp: new Date().toISOString(),
      });

      // Adicionar metadados de processamento
      const processingTime = (Date.now() - startTime) / 1000;

      const response = {
        ...validated,
        processingTimeSeconds: processingTime,
        status: 'completed',
        processedVia: 'modal_worker_audio_only',
      };

      console.log(`[YouTubeTranscribe] ✅ Sucesso! Tempo total: ${processingTime.toFixed(2)}s`);

      return NextResponse.json(response, { status: 200 });

    } catch (validationError: any) {
      console.error('[YouTubeTranscribe] Erro de validação:', validationError);
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
    description: 'Transcreve um arquivo de áudio usando Modal Worker',
    usage: {
      contentType: 'multipart/form-data',
      fields: {
        audio: 'File (obrigatório) - Arquivo de áudio (MP3, WAV, etc)',
        videoId: 'string (obrigatório) - ID do vídeo YouTube',
      },
      example: {
        audio: 'audio.mp3',
        videoId: 'dQw4w9WgXcQ',
      },
    },
    response: {
      success: 'boolean',
      videoId: 'string - ID do vídeo',
      transcript: 'string - Transcrição completa',
      segments: 'array - [{start, end, text}, ...]',
      metadata: 'object - {title, language}',
      transcriptionStats: 'object - {wordCount, segmentCount}',
      processingTimeSeconds: 'number',
      processedVia: 'string - método utilizado',
    },
  });
}
