import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

export async function POST(req: Request) {
  try {
    const errorData = await req.json();
    
    // Catalogar o erro no console
    console.error('[CATÁLOGO DE ERROS - CLIENTE]:', JSON.stringify(errorData, null, 2));
    
    // Integrar com o Supabase
    if (process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.SUPABASE_SERVICE_ROLE_KEY) {
      const supabaseAdmin = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL,
        process.env.SUPABASE_SERVICE_ROLE_KEY
      );

      await supabaseAdmin.from('error_logs').insert([
        {
          message: errorData.message,
          error_code: errorData.code,
          url: errorData.url,
          user_agent: errorData.userAgent,
          created_at: errorData.timestamp || new Date().toISOString()
        }
      ]);
    }
    
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('[ERRO AO SALVAR LOG NO SUPABASE]:', err);
    return NextResponse.json({ success: false, error: 'Failed to log error' }, { status: 400 });
  }
}
