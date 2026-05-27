import { NextResponse } from 'next/server';
import { mastra } from '@/src/mastra';

export const maxDuration = 300; // 5 minutos (Dublagem é um processo pesado)
export const dynamic = 'force-dynamic';

export async function POST(req: Request) {
  try {
    const { videoUrl, language = 'pt' } = await req.json();

    if (!videoUrl) {
      return NextResponse.json({ error: 'A URL do vídeo é obrigatória.' }, { status: 400 });
    }

    const MODAL_API_URL = process.env.CUSTOM_WHISPER_URL || 'http://localhost:8000';
    const TRANSCRIBE_URL = `${MODAL_API_URL}/transcribe`;
    const DUB_URL = `${MODAL_API_URL}/dub`;

    // 1. Obter a transcrição original (Inglês) da Modal
    console.log('[DubRoute] 1. Extraindo áudio e transcrevendo na Modal...');
    const transcribeRes = await fetch(TRANSCRIBE_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ audio_url: videoUrl, language: 'en' })
    });

    if (!transcribeRes.ok) {
      const err = await transcribeRes.text();
      throw new Error(`Falha na transcrição: ${err}`);
    }

    const transcribeData = await transcribeRes.json();
    const originalSegments = transcribeData.segments;

    if (!originalSegments || originalSegments.length === 0) {
      throw new Error('Nenhum segmento de fala encontrado no vídeo.');
    }

    // 2. Usar o Agente de Dublagem do Mastra para traduzir o Lip-Sync
    console.log('[DubRoute] 2. Traduzindo segmentos usando o Agente de Dublagem (Mastra)...');
    const dubbingAgent = mastra.getAgent('dubbing-agent');
    
    const translationPrompt = `
      Traduza o seguinte array de segmentos para o idioma ${language}. 
      Mantenha o formato JSON exato. Lembre-se de manter o tempo de fala curto!
      JSON: ${JSON.stringify(originalSegments)}
    `;

    const translationResponse = await dubbingAgent.generate(translationPrompt);
    const translationText = translationResponse.text;

    // Extrair JSON da resposta do Agente
    let translatedSegments = [];
    try {
      const jsonMatch = translationText.match(/\[.*\]/s);
      const jsonStr = jsonMatch ? jsonMatch[0] : translationText;
      translatedSegments = JSON.parse(jsonStr);
    } catch (parseErr) {
      console.error('[DubRoute] Falha ao parsear o JSON do Mastra:', translationText);
      throw new Error('O Agente não retornou um formato de legenda válido.');
    }

    // 3. Enviar para a Modal gerar as Vozes XTTS e Renderizar o Vídeo
    console.log('[DubRoute] 3. Solicitando Clonagem de Voz e Renderização de Vídeo à Modal...');
    const dubRes = await fetch(DUB_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ 
        video_url: videoUrl, 
        segments: translatedSegments,
        language: language
      })
    });

    if (!dubRes.ok) {
      const err = await dubRes.text();
      throw new Error(`Falha na geração do vídeo (Modal): ${err}`);
    }

    console.log('[DubRoute] 4. Vídeo gerado com sucesso! Redirecionando stream para o cliente...');
    
    // Repassando o arquivo MP4 diretamente para o cliente usando Streams
    return new NextResponse(dubRes.body, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'attachment; filename="video_dublado.mp4"',
      },
    });

  } catch (error: any) {
    console.error('[DubRoute] Erro fatal na pipeline de dublagem:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
