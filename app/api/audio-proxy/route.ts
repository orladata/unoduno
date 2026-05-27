import { NextResponse } from "next/server";

export const maxDuration = 120;
export const dynamic = "force-dynamic";

/**
 * Endpoint de Proxy de Áudio no seu domínio (unoduno.com)
 * Ele obtém a URL direta de áudio usando a API open-source Cobalt e redireciona o Modal!
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");

    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return NextResponse.json({ error: "ID do vídeo do YouTube inválido." }, { status: 400 });
    }

    console.log(`[AudioProxy] Solicitando link direto do Cobalt API para o vídeo: ${videoId}...`);
    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Usamos a API pública e extremamente confiável do Cobalt (open-source)
    const cobaltResponse = await fetch("https://api.cobalt.tools/api/json", {
      method: "POST",
      headers: {
        "Accept": "application/json",
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        url: videoUrl,
        isAudioOnly: true,
        aFormat: "mp3"
      })
    });

    if (!cobaltResponse.ok) {
      throw new Error(`Cobalt API falhou com status: ${cobaltResponse.status}`);
    }

    const data = await cobaltResponse.json();

    if (data.status === 'error' || !data.url) {
      throw new Error(data.text || "Cobalt API não retornou uma URL válida.");
    }

    console.log(`[AudioProxy] Link direto obtido com sucesso! Redirecionando a requisição do Modal...`);
    
    // Em vez de gastar banda da Vercel baixando e repassando o áudio,
    // nós fazemos um REDIRECT (302). O urllib do Python no Modal vai 
    // seguir esse redirecionamento e baixar direto do servidor do Cobalt!
    return NextResponse.redirect(data.url);

  } catch (error: any) {
    console.error(`[AudioProxy] Erro no proxy de áudio:`, error.message);
    return NextResponse.json({ error: `Erro no proxy de áudio: ${error.message}` }, { status: 500 });
  }
}
