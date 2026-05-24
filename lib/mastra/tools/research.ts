import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const searchWebForTrendsTool = createTool({
  id: 'search-web-trends',
  description: 'Pesquisa as tendências atuais na web brasileira sobre um determinado nicho ou tópico. Útil para adaptar ganchos e scripts ao contexto atual do mercado.',
  inputSchema: z.object({
    query: z.string().describe('O termo de pesquisa ou tópico que você deseja investigar as tendências (ex: "Tendências de mercado digital Brasil 2026").'),
  }),
  execute: async ({ context }) => {
    try {
      console.log(`[searchWebForTrendsTool] Analisando tendências para: ${context.query}`);
      
      // MOCK: In a real scenario, you'd connect this to Tavily, Google Search API, or Serper.dev
      // For now, we simulate a latency and return a rich context mock to prove the workflow works.
      await new Promise(resolve => setTimeout(resolve, 800));

      const mockTrends = [
        `As buscas por "${context.query}" revelam que o público brasileiro está preferindo conteúdos rápidos, diretos ao ponto e com ganchos visuais nos primeiros 3 segundos.`,
        `Termos em alta relacionados: "Como ganhar dinheiro com ${context.query}", "Erros comuns em ${context.query}".`,
        `O tom de voz que mais converte atualmente é informal, usando storytelling e quebras de expectativa.`
      ];

      return {
        success: true,
        trends: mockTrends,
        advice: "Sempre traduza conceitos muito complexos para analogias simples da cultura brasileira."
      };
    } catch (error: any) {
      console.error(`[searchWebForTrendsTool] Erro: ${error.message}`);
      return { 
        success: false, 
        error: 'Falha na pesquisa de tendências.' 
      };
    }
  }
});
