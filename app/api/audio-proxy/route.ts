import { NextResponse } from "next/server";

export const maxDuration = 120; // 2 minutos de limite
export const dynamic = "force-dynamic";

/**
 * Endpoint de Proxy de Áudio no seu domínio (unoduno.com)
 * Ele extrai o áudio do YouTube usando o IP limpo do seu servidor e faz o stream em tempo real para o Modal!
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");

    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return NextResponse.json({ error: "ID do vídeo do YouTube inválido." }, { status: 400 });
    }

    console.log(`[AudioProxy] Iniciando extração de áudio para o vídeo: ${videoId} usando IP do site...`);

    // Usaremos uma API pública de alto desempenho e estável para obter o link direto de áudio
    // Dessa forma, o processamento pesado de streaming não sobrecarrega a CPU do seu servidor Next.js
    const downloadApiUrl = `https://api.vevioz.com/api/button/mp3/${videoId}`;
    
    // Fazemos a requisição para obter a URL direta
    const response = await fetch(downloadApiUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
      }
    });

    if (!response.ok) {
      throw new Error(`Falha ao obter stream da API de download: ${response.statusText}`);
    }

    const html = await response.text();
    
    // Extrai o link direto de download do HTML da API
    const match = html.match(/href="([^"]+)"/);
    const directAudioUrl = match ? match[1] : null;

    if (!directAudioUrl) {
      throw new Error("Não foi possível extrair a URL direta de áudio do parceiro.");
    }

    console.log(`[AudioProxy] URL direta de áudio obtida! Repassando stream em tempo real...`);

    // Faz o fetch do stream de áudio real
    const audioStreamResponse = await fetch(directAudioUrl);
    
    if (!audioStreamResponse.ok) {
      throw new Error(`Erro ao conectar ao stream de áudio: ${audioStreamResponse.statusText}`);
    }

    // Retorna os bytes do áudio diretamente com os headers corretos
    return new Response(audioStreamResponse.body, {
      headers: {
        "Content-Type": "audio/mpeg",
        "Content-Disposition": `attachment; filename="${videoId}.mp3"`,
        "Cache-Control": "public, max-age=3600"
      }
    });

  } catch (error: any) {
    console.error(`[AudioProxy] Erro fatal no proxy de áudio:`, error.message);
    return NextResponse.json({ error: `Erro no proxy de áudio: ${error.message}` }, { status: 500 });
  }
}
