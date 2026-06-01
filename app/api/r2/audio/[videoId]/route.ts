import { NextResponse } from 'next/server';
import { createR2Service } from '@/lib/cloudflare-r2';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/**
 * GET /api/r2/audio/[videoId]
 * Download de áudio do R2
 */
export async function GET(
  request: Request,
  { params }: { params: Promise<{ videoId: string }> }
) {
  try {
    const { videoId } = await params;

    if (!videoId) {
      return NextResponse.json(
        { error: 'videoId é obrigatório' },
        { status: 400 }
      );
    }

    console.log(`[R2 Audio] Baixando: ${videoId}`);

    const r2 = createR2Service();
    const fileName = `audio/${videoId}.mp3`;

    // Tentar baixar do R2
    const file = await r2.downloadFile(fileName);

    // Retornar como stream de áudio
    const response = new NextResponse(Buffer.from(file.body), {
      status: 200,
      headers: {
        'Content-Type': file.contentType || 'audio/mpeg',
        'Content-Length': file.body.length.toString(),
        'Cache-Control': 'public, max-age=86400', // Cache 24h
      },
    });

    return response;
  } catch (error) {
    console.error('[R2 Audio] Erro ao baixar:', error);

    // Se não encontrar, retornar 404
    if (
      error instanceof Error &&
      error.message.includes('NoSuchKey')
    ) {
      return NextResponse.json(
        { error: 'Áudio não encontrado' },
        { status: 404 }
      );
    }

    return NextResponse.json(
      {
        error: 'Erro ao baixar áudio',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
