import { createClient } from '@/utils/supabase/server'
import { NextResponse } from 'next/server'

export async function GET(request: Request) {
  const supabase = await createClient()
  const { data: { session }, error } = await supabase.auth.getSession()

  if (error || !session) {
    return NextResponse.json({ error: 'Não autorizado. Por favor, faça login.' }, { status: 401 })
  }

  // O provider_token é o token OAuth do Google
  const providerToken = session.provider_token

  if (!providerToken) {
    return NextResponse.json({ 
      error: 'Token do Google não encontrado. Você precisa sair e entrar novamente usando o botão do Google para autorizar o acesso ao YouTube.' 
    }, { status: 400 })
  }

  try {
    // 1. Pega os detalhes do canal do usuário logado para encontrar a ID da playlist de Uploads
    const channelResponse = await fetch('https://www.googleapis.com/youtube/v3/channels?part=contentDetails&mine=true', {
      headers: { 
        Authorization: `Bearer ${providerToken}`,
        Accept: 'application/json'
      }
    });
    
    const channelData = await channelResponse.json();
    
    if (!channelResponse.ok) {
      console.error("YouTube API Channel Error:", channelData);
      throw new Error(`Erro na API do Google: ${channelData.error?.message || 'Desconhecido'}`);
    }

    if (!channelData.items || channelData.items.length === 0) {
      return NextResponse.json({ data: [], message: 'Nenhum canal do YouTube encontrado para esta conta.' });
    }

    const uploadsPlaylistId = channelData.items[0].contentDetails.relatedPlaylists.uploads;

    // 2. Busca os últimos 20 vídeos dessa playlist (os vídeos do próprio usuário)
    const playlistResponse = await fetch(`https://www.googleapis.com/youtube/v3/playlistItems?part=snippet&playlistId=${uploadsPlaylistId}&maxResults=20`, {
      headers: { 
        Authorization: `Bearer ${providerToken}`,
        Accept: 'application/json'
      }
    });

    const playlistData = await playlistResponse.json();

    if (!playlistResponse.ok) {
      throw new Error(`Erro ao buscar vídeos: ${playlistData.error?.message || 'Desconhecido'}`);
    }

    // 3. Mapeia a resposta para algo mais limpo para o front-end
    const videos = playlistData.items.map((item: any) => ({
      id: item.snippet.resourceId.videoId,
      title: item.snippet.title,
      description: item.snippet.description,
      thumbnail: item.snippet.thumbnails?.medium?.url || item.snippet.thumbnails?.default?.url,
      publishedAt: item.snippet.publishedAt
    }));

    return NextResponse.json({ success: true, data: videos })

  } catch (err: any) {
    console.error("[YouTube API Error]", err);
    return NextResponse.json({ error: err.message }, { status: 500 })
  }
}
