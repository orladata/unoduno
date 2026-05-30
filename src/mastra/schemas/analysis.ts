/**
 * Analysis Schemas - Validação estruturada de outputs
 * Inspirado em best practices de tools como v0, Cursor, Claude
 * Zod schemas para type-safety e runtime validation
 */

import { z } from 'zod';

/**
 * Hook Variation Schema - Múltiplas variações de ganchos testáveis
 */
export const HookVariationSchema = z.object({
  id: z.string().describe('ID único para a variação'),
  text: z.string().max(30).describe('Texto do hook (máx 30 palavras)'),
  model: z.enum([
    'curiosity',
    'fear',
    'utility',
    'contradiction',
    'story',
    'authority',
    'scarcity',
    'humor',
    'contrast',
  ]).describe('Modelo de hook utilizado'),
  emotionalTrigger: z.string().describe('Gatilho emocional primário'),
  culturalNotes: z.string().optional().describe('Notas sobre adaptação cultural'),
  estimatedRetention: z.number().min(0).max(100).describe('% estimada de retenção (0-100)'),
  rationale: z.string().describe('Por que esse hook funcionaria'),
});

export type HookVariation = z.infer<typeof HookVariationSchema>;

/**
 * Content Strategy Schema - Estratégia estruturada de conteúdo
 */
export const ContentStrategySchema = z.object({
  title: z.string().describe('Título da estratégia'),
  targetAudience: z.string().describe('Descrição da audiência alvo'),
  primaryMessage: z.string().describe('Mensagem principal do conteúdo'),
  keyInsights: z.array(z.string()).describe('Insights principais identificados'),
  strengthsToLeverage: z.array(z.string()).describe('Pontos fortes do conteúdo a explorar'),
  areasForImprovement: z.array(z.string()).describe('Áreas que poderiam melhorar'),
  recommendedHooks: z.array(HookVariationSchema).describe('Hooks recomendados'),
  culturalAdaptations: z.array(z.string()).describe('Adaptações culturais sugeridas'),
  expectedPerformance: z.enum(['low', 'medium', 'high', 'viral']).describe('Performance esperada'),
  confidence: z.number().min(0).max(1).describe('Nível de confiança (0-1)'),
  nextSteps: z.array(z.string()).describe('Próximos passos recomendados'),
});

export type ContentStrategy = z.infer<typeof ContentStrategySchema>;

/**
 * Performance Metrics Schema - Métricas de performance e engajamento
 */
export const PerformanceMetricsSchema = z.object({
  estimatedCTR: z.number().min(0).max(1).describe('Taxa estimada de cliques (0-1)'),
  estimatedAverageViewDuration: z.number().describe('Duração média estimada (segundos)'),
  estimatedRetentionCurve: z.array(
    z.object({
      timePoint: z.number().describe('Ponto de tempo (segundos)'),
      retentionPercent: z.number().describe('% de retenção naquele ponto'),
    })
  ).describe('Curva de retenção estimada'),
  engagementFactors: z.array(
    z.object({
      factor: z.string().describe('Fator de engajamento'),
      impact: z.enum(['low', 'medium', 'high']).describe('Impacto estimado'),
      reasoning: z.string().describe('Por que esse fator importa'),
    })
  ).describe('Fatores que afetam engajamento'),
  viralityScore: z.number().min(0).max(100).describe('Score de viralidade (0-100)'),
  benchmarkComparison: z.string().describe('Como compara com benchmarks do mercado'),
});

export type PerformanceMetrics = z.infer<typeof PerformanceMetricsSchema>;

/**
 * Complete Analysis Response Schema - Response completa estruturada
 */
export const CompleteAnalysisResponseSchema = z.object({
  success: z.boolean().describe('Se a análise foi bem-sucedida'),
  videoTitle: z.string().describe('Título do vídeo analisado'),
  videoAuthor: z.string().optional().describe('Autor do vídeo'),
  analysisType: z.enum(['quick', 'detailed', 'expert']).describe('Tipo de análise realizada'),
  strategy: ContentStrategySchema.describe('Estratégia de conteúdo completa'),
  hooks: z.array(HookVariationSchema).describe('Variações de hooks recomendadas'),
  metrics: PerformanceMetricsSchema.describe('Métricas de performance estimadas'),
  culturalInsights: z.array(
    z.object({
      insight: z.string().describe('Insight cultural'),
      adaptation: z.string().describe('Adaptação recomendada'),
    })
  ).describe('Insights culturais específicos para mercado brasileiro'),
  toolsUsed: z.array(z.string()).describe('Ferramentas utilizadas na análise'),
  executionTime: z.number().describe('Tempo de execução (ms)'),
  confidence: z.number().min(0).max(1).describe('Confiança geral da análise'),
  limitations: z.array(z.string()).optional().describe('Limitações da análise'),
  recommendations: z.array(z.string()).describe('Recomendações finais'),
  nextSteps: z.array(z.string()).describe('Próximos passos sugeridos'),
});

export type CompleteAnalysisResponse = z.infer<typeof CompleteAnalysisResponseSchema>;

/**
 * Translation Task Schema - Tarefa de tradução estruturada
 */
export const TranslationTaskSchema = z.object({
  originalText: z.string().describe('Texto original em inglês'),
  translatedText: z.string().describe('Texto traduzido em português brasileiro'),
  adaptations: z.array(
    z.object({
      original: z.string().describe('Termo/expressão original'),
      translated: z.string().describe('Tradução/adaptação'),
      reason: z.string().describe('Por que essa adaptação foi escolhida'),
    })
  ).describe('Adaptações culturais realizadas'),
  tonePreserved: z.boolean().describe('Se o tom foi preservado'),
  pacePreserved: z.boolean().describe('Se o ritmo foi preservado'),
  authenticityScore: z.number().min(0).max(1).describe('Score de autenticidade (0-1)'),
});

export type TranslationTask = z.infer<typeof TranslationTaskSchema>;

/**
 * Viral Pattern Detection Schema - Padrões virais identificados
 */
export const ViralPatternSchema = z.object({
  patternName: z.string().describe('Nome do padrão viral'),
  description: z.string().describe('Descrição do padrão'),
  presenceInContent: z.enum(['strong', 'moderate', 'weak', 'absent']).describe('Força da presença'),
  estimatedImpactOnViralityScore: z.number().min(-20).max(20).describe('Impacto no score (-20 a +20)'),
  examples: z.array(z.string()).describe('Exemplos de vídeos que usam esse padrão'),
  recommendations: z.array(z.string()).describe('Recomendações para amplificar esse padrão'),
});

export type ViralPattern = z.infer<typeof ViralPatternSchema>;

/**
 * Research Finding Schema - Achado de pesquisa individual
 */
export const ResearchFindingSchema = z.object({
  topic: z.string().describe('Tópico pesquisado'),
  finding: z.string().describe('Achado principal'),
  source: z.string().describe('Fonte da informação'),
  relevance: z.enum(['high', 'medium', 'low']).describe('Relevância para o projeto'),
  actionItems: z.array(z.string()).describe('Itens de ação resultantes'),
});

export type ResearchFinding = z.infer<typeof ResearchFindingSchema>;

/**
 * YouTube Transcription Schema - Resultado estruturado de transcrição
 */
export const YouTubeTranscriptionSchema = z.object({
  success: z.boolean().describe('Se a transcrição foi bem-sucedida'),
  videoId: z.string().describe('ID único do vídeo no YouTube'),
  audioUrl: z.string().url().describe('URL pública do arquivo de áudio (MP3/M4A)'),
  transcript: z.string().describe('Texto completo da transcrição'),
  segments: z.array(
    z.object({
      start: z.number().describe('Tempo de início do segmento (segundos)'),
      end: z.number().describe('Tempo de término do segmento (segundos)'),
      text: z.string().describe('Texto do segmento'),
      confidence: z.number().min(0).max(1).optional().describe('Confiança da transcrição (0-1)'),
    })
  ).describe('Segmentos de áudio com timestamps'),
  metadata: z.object({
    title: z.string().optional().describe('Título original do vídeo'),
    author: z.string().optional().describe('Autor/criador do vídeo'),
    duration: z.number().optional().describe('Duração total do vídeo (segundos)'),
    language: z.string().describe('Idioma detectado (código ISO, ex: "pt", "en")'),
    languageProbability: z.number().min(0).max(1).optional().describe('Confiança na detecção de idioma'),
    thumbnail: z.string().url().optional().describe('URL da thumbnail do vídeo'),
  }).describe('Metadados do vídeo'),
  transcriptionStats: z.object({
    wordCount: z.number().describe('Número total de palavras'),
    averageWordsPerSegment: z.number().describe('Média de palavras por segmento'),
    totalSegments: z.number().describe('Número total de segmentos'),
    processingTimeSeconds: z.number().describe('Tempo de processamento (segundos)'),
    backend: z.enum(['groq', 'modal', 'google-cloud']).describe('Backend utilizado'),
  }).describe('Estatísticas da transcrição'),
  error: z.string().optional().describe('Mensagem de erro se houver falha'),
  timestamp: z.string().datetime().describe('Data/hora de processamento'),
});

export type YouTubeTranscription = z.infer<typeof YouTubeTranscriptionSchema>;

// Export todos os schemas
export const SCHEMAS = {
  HookVariation: HookVariationSchema,
  ContentStrategy: ContentStrategySchema,
  PerformanceMetrics: PerformanceMetricsSchema,
  CompleteAnalysisResponse: CompleteAnalysisResponseSchema,
  TranslationTask: TranslationTaskSchema,
  ViralPattern: ViralPatternSchema,
  ResearchFinding: ResearchFindingSchema,
  YouTubeTranscription: YouTubeTranscriptionSchema,
};
