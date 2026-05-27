import { NextResponse } from 'next/server';
import { translationPipeline } from '../../../../src/mastra/workflows/translationPipeline';

export async function POST(request: Request) {
  try {
    const { transcript } = await request.json();

    if (!transcript) {
      return NextResponse.json({ error: 'Transcrição é obrigatória.' }, { status: 400 });
    }

    // Aciona o fluxo do Mastra AI
    const run = await translationPipeline.createRun();
    const result = await run.start({ inputData: { transcript } });

    return NextResponse.json({
      success: true,
      data: (result as any).result?.finalScript 
        || (result as any).results?.translateContent?.payload?.finalScript 
        || (result as any).steps?.translateContent?.payload?.finalScript
    });
    
  } catch (error: any) {
    console.error('Erro na API Mastra:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
