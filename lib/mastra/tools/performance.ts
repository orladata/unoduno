/**
 * Performance Metrics Tool
 * Analisa performance de conteúdo anterior do criador
 */

import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const analyzePerformanceTool = createTool({
  id: 'analyze-performance',
  description: 'Analisa performance de conteúdo anterior para identificar padrões de sucesso, tipos de vídeos que convertem, e otimizações possíveis.',
  inputSchema: z.object({
    creatorId: z.string().describe('ID do criador ou canal'),
    numberOfVideos: z.number().optional().default(10).describe('Quantidade de vídeos anteriores a analisar'),
    metricFocus: z.array(z.enum(['engagement', 'reach', 'retention', 'conversion'])).optional(),
  }),
  execute: async ({ creatorId, numberOfVideos, metricFocus }) => {
    try {
      console.log(`[analyzePerformanceTool] Analisando performance de ${numberOfVideos} vídeos do criador: ${creatorId}`);

      await new Promise(resolve => setTimeout(resolve, 1200));

      const performanceData = {
        success: true,
        creatorId,
        analysisWindow: `Last ${numberOfVideos} videos`,
        averageMetrics: {
          views: 75000,
          engagement: 0.08,
          retentionPercent: 65,
          avgWatchTime: '3:45',
          shareRate: 0.09,
        },
        topPerformer: {
          title: 'Título do vídeo top performer',
          views: 250000,
          engagement: 0.12,
          keySuccess: 'Hook de curiosidade + storytelling',
        },
        underperformer: {
          title: 'Vídeo com menos performance',
          views: 15000,
          engagement: 0.03,
          keyWeakness: 'Hook fraco, muita promoção no início',
        },
        patterns: {
          bestTopics: ['Topic A', 'Topic B', 'Topic C'],
          bestFormats: ['Tutorial', 'Story-driven', 'Challenge'],
          bestUploadDays: ['Tuesday', 'Thursday'],
          bestUploadTimes: ['18:00-20:00 BRT'],
        },
        recommendations: [
          'Replicar estrutura de top performers',
          'Melhorar hooks em formato fraco',
          'Aumentar frequência de upload',
          'Engajar mais nos primeiros minutos',
        ],
      };

      if (metricFocus?.includes('engagement')) {
        performanceData.engagementDetails = {
          avgComments: 500,
          avgLikes: 5000,
          commentSentiment: 'Positive',
          topCommentThemes: ['Request for more', 'Appreciation', 'Questions'],
        };
      }

      return performanceData;
    } catch (error: any) {
      console.error(`[analyzePerformanceTool] Erro: ${error.message}`);
      return {
        success: false,
        error: `Falha na análise de performance: ${error.message}`,
      };
    }
  },
});
