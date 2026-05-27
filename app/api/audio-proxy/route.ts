import { NextResponse } from "next/server";
import ytdl from "@distube/ytdl-core";

export const maxDuration = 120; // 2 minutos de limite
export const dynamic = "force-dynamic";

/**
 * Endpoint de Proxy de Áudio no seu domínio (unoduno.com)
 * Ele extrai o áudio do YouTube usando ytdl-core internamente e faz o stream em tempo real para o Modal!
 */
export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url);
    const videoId = searchParams.get("videoId");

    if (!videoId || !/^[a-zA-Z0-9_-]{11}$/.test(videoId)) {
      return NextResponse.json({ error: "ID do vídeo do YouTube inválido." }, { status: 400 });
    }

    console.log(`[AudioProxy] Iniciando extração de áudio nativa para o vídeo: ${videoId}...`);

    const videoUrl = `https://www.youtube.com/watch?v=${videoId}`;
    
    // Configura o ytdl para pegar a melhor qualidade de áudio disponível
    const audioStream = ytdl(videoUrl, {
      quality: 'highestaudio',
      filter: 'audioonly'
    });

    // Como o ytdl retorna um stream legível do Node, podemos transformá-arlo 
    // em um stream da web compatível com o NextResponse.
    const webStream = new ReadableStream({
      start(controller) {
        audioStream.on('data', (chunk) => controller.enqueue(chunk));
        audioStream.on('end', () => controller.close());
        audioStream.on('error', (err) => controller.error(err));
      }
    });

    return new Response(webStream, {
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
