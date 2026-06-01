import { NextResponse } from 'next/server';
import { createR2Service } from '@/lib/cloudflare-r2';

export const maxDuration = 300;
export const dynamic = 'force-dynamic';

/**
 * GET /api/r2/files
 * Listar arquivos no R2 (com prefix opcional)
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const prefix = searchParams.get('prefix') || undefined;

    console.log('[R2 API] Listando arquivos', { prefix });

    const r2 = createR2Service();
    const files = await r2.listFiles(prefix);

    return NextResponse.json(
      {
        success: true,
        count: files.length,
        files,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[R2 API] Erro ao listar:', error);
    return NextResponse.json(
      {
        error: 'Erro ao listar arquivos',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

/**
 * POST /api/r2/upload
 * Upload de arquivo para R2
 *
 * Body: {
 *   "fileBase64": "string",
 *   "fileName": "string",
 *   "contentType": "string (optional)"
 * }
 */
export async function POST(request: Request) {
  try {
    console.log('[R2 API] Requisição de upload');

    const payload = await request.json();
    const { fileBase64, fileName, contentType = 'audio/mpeg' } = payload;

    if (!fileBase64 || !fileName) {
      return NextResponse.json(
        {
          error: 'fileBase64 e fileName são obrigatórios',
        },
        { status: 400 }
      );
    }

    // Converter base64 para buffer
    const buffer = Buffer.from(fileBase64, 'base64');
    console.log(`[R2 API] Arquivo: ${fileName} (${buffer.length} bytes)`);

    const r2 = createR2Service();

    // Fazer upload
    const result = await r2.uploadFile(buffer, {
      key: fileName,
      contentType,
      metadata: {
        uploadedAt: new Date().toISOString(),
      },
    });

    console.log('[R2 API] ✅ Upload concluído', result);

    return NextResponse.json(
      {
        success: true,
        file: result,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[R2 API] Erro ao fazer upload:', error);
    return NextResponse.json(
      {
        error: 'Erro ao fazer upload',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/r2/files
 * Deletar arquivo do R2
 *
 * Query: fileName=string
 */
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const fileName = searchParams.get('fileName');

    if (!fileName) {
      return NextResponse.json(
        {
          error: 'fileName é obrigatório',
        },
        { status: 400 }
      );
    }

    console.log(`[R2 API] Deletando arquivo: ${fileName}`);

    const r2 = createR2Service();
    await r2.deleteFile(fileName);

    return NextResponse.json(
      {
        success: true,
        message: `Arquivo ${fileName} deletado`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('[R2 API] Erro ao deletar:', error);
    return NextResponse.json(
      {
        error: 'Erro ao deletar arquivo',
        details: error instanceof Error ? error.message : 'Erro desconhecido',
      },
      { status: 500 }
    );
  }
}
