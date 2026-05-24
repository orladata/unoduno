import { createTool } from '@mastra/core/tools';
import { z } from 'zod';
import { YoutubeTranscript } from 'youtube-transcript';

export const fetchTranscriptTool = createTool({
  id: 'fetch-youtube-transcript',
  description: 'Extrai e retorna a transcrição completa (legendas) de um vídeo do YouTube. Essencial para analisar o conteúdo falado do vídeo.',
  inputSchema: z.object({
    url: z.string().url().describe('A URL completa do vídeo do YouTube a ser analisado.'),
  }),
  execute: async ({ context }) => {
    try {
      console.log(`[fetchTranscriptTool] Buscando transcrição para: ${context.url}`);
      const transcript = await YoutubeTranscript.fetchTranscript(context.url);
      const text = transcript.map(t => t.text).join(' ');
      
      return { 
        success: true, 
        transcript: text,
        wordCount: text.split(' ').length
      };
    } catch (error: any) {
      console.error(`[fetchTranscriptTool] Erro: ${error.message}`);
      return { 
        success: false, 
        error: `Não foi possível extrair a transcrição. Motivo: ${error.message}. O vídeo pode não ter legendas ou estar privado.` 
      };
    }
  }
});

export const fetchVideoMetadataTool = createTool({
  id: 'fetch-youtube-metadata',
  description: 'Busca os metadados oficiais do vídeo do YouTube (como Título original e Nome do Autor) usando a API pública oEmbed.',
  inputSchema: z.object({
    url: z.string().url().describe('A URL completa do vídeo do YouTube.'),
  }),
  execute: async ({ context }) => {
    try {
      console.log(`[fetchVideoMetadataTool] Buscando metadados para: ${context.url}`);
      // oEmbed is a public endpoint that doesn't require API keys
      const oembedUrl = `https://www.youtube.com/oembed?url=${encodeURIComponent(context.url)}&format=json`;
      const response = await fetch(oembedUrl);
      
      if (!response.ok) {
        throw new Error('Falha ao acessar oEmbed do YouTube');
      }

      const data = await response.json();
      
      return {
        success: true,
        title: data.title,
        author: data.author_name,
        thumbnail: data.thumbnail_url,
      };
    } catch (error: any) {
      console.error(`[fetchVideoMetadataTool] Erro: ${error.message}`);
      return { 
        success: false, 
        error: 'Falha ao buscar os metadados do vídeo. ' + error.message 
      };
    }
  }
});
