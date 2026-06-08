import { NextResponse } from 'next/server';
import { YouTubeTranscriptionSchema } from '@/src/mastra/schemas/analysis';

export const maxDuration = 300; // 5 minutos (Vercel Hobby plan limit)
export const dynamic = 'force-dynamic';

/**
 * API Route: YouTube to Transcript via Cerebrium
 * 
 * 1. Recebe URL do YouTube do cliente
 * 2. Envia payload para Cerebrium API (Serverless GPU)
 * 3. Cerebrium: Faz download anônimo com proxy residencial
 * 4. Cerebrium: Transcreve, faz upload do JSON pro R2 e devolve a r2_url
 * 5. Retorna transcript estruturado e a URL pública para o cliente
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

    // 3. Chamar API Cerebrium Serverless
    const cerebriumUrl = process.env.CEREBRIUM_API_URL || 'https://api.aws.us-east-1.cerebrium.ai/v4/p-2cd4cd4c/unoduno-transcriber/run';
    if (!cerebriumUrl) {
      console.error('[YouTubeToTranscript] CEREBRIUM_API_URL não configurada!');
      return NextResponse.json(
        { error: 'Processador Cerebrium não configurado. Contate o suporte.' },
        { status: 500 }
      );
    }

    console.log(`[YouTubeToTranscript] Chamando Cerebrium API: ${cerebriumUrl.substring(0, 50)}...`);

    let cerebriumResponse;
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 600000); // 10 minutos (GPUs costumam resolver em 10s)

      const response = await fetch(cerebriumUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          video_url: videoUrl
        }),
        signal: controller.signal,
      });

      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Cerebrium API retornou ${response.status}`);
      }

      const rawResponse = await response.json();
      
      // O Cerebrium encapsula os retornos em { "run_id": "...", "result": {...} }
      cerebriumResponse = rawResponse.result;
    } catch (fetchError) {
      console.error('[YouTubeToTranscript] Erro ao chamar Cerebrium API:', fetchError);
      return NextResponse.json(
        {
          error: 'Falha ao conectar com o processador de GPU (Cerebrium)',
          details: fetchError instanceof Error ? fetchError.message : 'Erro de rede',
        },
        { status: 503 }
      );
    }

    console.log('[YouTubeToTranscript] Resposta do Cerebrium recebida');

    // 4. Verificar se houve erro no script da Cerebrium
    if (!cerebriumResponse.success) {
      console.error('[YouTubeToTranscript] Erro na Cerebrium:', cerebriumResponse.error);
      return NextResponse.json(
        {
          error: 'Falha ao processar vídeo na GPU',
          details: cerebriumResponse.error,
        },
        { status: 400 }
      );
    }

    // 5. Validar e sanitizar resposta da Cerebrium
    try {
      const validated = YouTubeTranscriptionSchema.parse({
        ...cerebriumResponse,
        success: true,
        timestamp: new Date().toISOString(),
      });

      // Adicionar metadados de processamento
      const processingTime = (Date.now() - startTime) / 1000;
      
      const response = {
        ...validated,
        processingTimeSeconds: processingTime,
        status: 'completed',
        processedVia: 'cerebrium_gpu',
      };

      console.log(`[YouTubeToTranscript] ✅ Sucesso! Tempo total: ${processingTime.toFixed(2)}s`);

      return NextResponse.json(response, { status: 200 });

    } catch (validationError: any) {
      console.error('[YouTubeToTranscript] Erro de validação:', validationError);
      return NextResponse.json(
        {
          error: 'Resposta da Cerebrium não passou na validação Zod',
          details: validationError.errors || validationError.message,
          rawResponse: cerebriumResponse,
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
export async function GET() {
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
