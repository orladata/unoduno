import { NextResponse } from 'next/server';
import { mastra } from '../../../../src/mastra';

export async function POST(req: Request) {
  try {
    const { messages } = await req.json();

    if (!messages || !Array.isArray(messages)) {
      return NextResponse.json({ error: 'Messages are required and must be an array.' }, { status: 400 });
    }

    const agent = mastra.getAgent('transcriptionAgent');
    
    // Convert the message history into the format Mastra expects
    // Assuming 'messages' is an array of objects with 'role' and 'content'
    const result = await agent.generate(messages);

    return NextResponse.json({
      role: 'assistant',
      content: result.text
    });

  } catch (error: any) {
    console.error('Error in Mastra chat API:', error);
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
