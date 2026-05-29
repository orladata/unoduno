/**
 * Tools Suite Index & Documentation
 * Documentação centralizada de todas as ferramentas disponíveis no Mastra
 * 
 * Este módulo documenta a suite completa expandida de ferramentas e como são orquestradas
 */

export const MASTRA_TOOLS_SUITE = {
  /**
   * FASE 0: Ferramentas Originais (YouTube/Research)
   */
  originalTools: {
    fetchYoutubeTranscript: {
      id: 'fetch-youtube-transcript',
      description: 'Extrai transcrição completa de vídeos do YouTube',
      file: 'lib/mastra/tools/youtube.ts',
      usage: 'Obtém texto falado completo para análise de conteúdo',
      inputValidation: 'URL válida do YouTube',
      errorHandling: 'Retorna mensagem se vídeo não tem legendas',
    },
    fetchYoutubeMetadata: {
      id: 'fetch-youtube-metadata',
      description: 'Busca metadados do YouTube (título, autor, thumbnail)',
      file: 'lib/mastra/tools/youtube.ts',
      usage: 'Contexto sobre o criador e vídeo',
      inputValidation: 'URL válida do YouTube',
      errorHandling: 'Graceful fallback se oEmbed falha',
    },
    searchWebForTrends: {
      id: 'search-web-trends',
      description: 'Pesquisa tendências atuais na web brasileira',
      file: 'lib/mastra/tools/research.ts',
      usage: 'Entender contexto de tendências do mercado',
      inputValidation: 'Query string com termo de pesquisa',
      errorHandling: 'Retorna mock data se real API indisponível',
    },
  },

  /**
   * FASE 1: Ferramentas Expandidas (Análise Aprofundada)
   */
  expandedTools: {
    analyzeDemographics: {
      id: 'analyze-demographics',
      description: 'Analisa padrões demográficos da audiência alvo',
      file: 'lib/mastra/tools/demographics.ts',
      usage: 'Compreender who is your audience: idade, gênero, interesse, comportamento',
      inputValidation: 'topic, platform, includeEngagement',
      features: [
        'Audiência primária e secundária',
        'Padrões de engajamento',
        'Horários de pico',
        'Insights comportamentais',
      ],
      errorHandling: 'Retorna dados genéricos se específicos indisponíveis',
    },
    analyzeCompetitor: {
      id: 'analyze-competitor',
      description: 'Analisa concorrentes e criadores bem-sucedidos',
      file: 'lib/mastra/tools/competitor.ts',
      usage: 'Identificar estratégias vencedoras e gaps no mercado',
      inputValidation: 'topic, numberOfCompetitors, includeStrategyBreakdown',
      features: [
        'Análise de top criadores',
        'Padrões de hook bem-sucedidos',
        'Upload frequency',
        'Gaps de mercado',
      ],
      errorHandling: 'Continua com dados parciais se alguns competitors indisponíveis',
    },
    analyzePerformance: {
      id: 'analyze-performance',
      description: 'Analisa performance de conteúdo anterior',
      file: 'lib/mastra/tools/performance.ts',
      usage: 'Aprender o que funciona para ESTE criador específico',
      inputValidation: 'creatorId, numberOfVideos, metricFocus',
      features: [
        'Top performers vs underperformers',
        'Padrões de sucesso pessoais',
        'Métricas de engajamento',
        'Recomendações personalizadas',
      ],
      errorHandling: 'Usa defaults se histórico completo indisponível',
    },
    analyzeTrendsAdvanced: {
      id: 'analyze-trends-advanced',
      description: 'Análise aprofundada de tendências brasileiras',
      file: 'lib/mastra/tools/trends-advanced.ts',
      usage: 'Entender se trend está rising/stable/declining e longevidade',
      inputValidation: 'keyword, region, timeRange',
      features: [
        'Search volume trends',
        'Trend lifecycle analysis',
        'Related searches',
        'Best platforms for trend',
        'Saturation level',
      ],
      errorHandling: 'Retorna análise conservadora se dados incompletos',
    },
  },

  /**
   * Tool Orchestration Strategy
   */
  orchestrationStrategy: {
    recommendedOrder: [
      '1. analyzeTrendsAdvanced - PRIMEIRO: Entender o contexto geral',
      '2. analyzeDemographics - Quem vamos atingir',
      '3. analyzeCompetitor - Como outros estão ganhando',
      '4. analyzePerformance - Histórico pessoal do criador',
      '5. fetchYoutubeTranscript/Metadata - Detalhes do conteúdo específico',
    ],
    parallelizable: [
      'analyzeDemographics e analyzeCompetitor podem rodar em paralelo',
      'fetchYoutubeTranscript e fetchYoutubeMetadata podem rodar em paralelo',
    ],
    errorFallbacks: [
      'Se trends falha: continua com dados genéricos',
      'Se demographics falha: usa defaults por nicho',
      'Se performance falha: fornece benchmarks do mercado',
      'Se competitor falha: análise sem comparação direta',
    ],
  },

  /**
   * Integration Points with Agents
   */
  agentToolMapping: {
    contentStrategistAgent: [
      'analyzeDemographics - entender audience',
      'analyzeCompetitor - estratégias de mercado',
      'analyzePerformance - histórico criador',
      'analyzeTrendsAdvanced - contexto de trends',
      'searchWebForTrends - pesquisa geral',
    ],
    viralAnalystAgent: [
      'analyzeTrendsAdvanced - padrões virais',
      'analyzePerformance - vídeos virais passados',
      'analyzeCompetitor - estratégias virais',
    ],
    hookEngineerAgent: [
      'analyzePerformance - hooks que funcionaram antes',
      'analyzeTrendsAdvanced - trends para hooks',
      'analyzeDemographics - audience triggers',
    ],
    researchOrchestratorAgent: [
      'TODAS as 5 ferramentas',
      'Orquestra em sequência optimizada',
      'Combina insights em análise única',
    ],
    culturalTranslatorAgent: [
      'analyzeDemographics - cultural context',
      'analyzeCompetitor - cultural patterns',
    ],
  },

  /**
   * Performance & Caching Considerations
   */
  performanceNotes: {
    slowestTools: [
      'analyzeCompetitor (~1000ms)',
      'analyzePerformance (~1200ms)',
    ],
    parallelizationBenefit: 'Pode reduzir tempo total de ~4.5s para ~2s',
    cachingStrategy: [
      'Cache trends por 24 horas',
      'Cache demographics por 48 horas',
      'Cache competitor analysis por 7 dias',
      'Performance data: sempre fresh (real-time)',
    ],
    tokenEfficiency: {
      totalTokensPerFullAnalysis: '~15-20K tokens',
      withOptimization: '~10-12K tokens',
      savings: 'Skip tools desnecessárias based on analysisType',
    },
  },

  /**
   * Usage Examples
   */
  usageExamples: {
    quickAnalysis: {
      tools: ['fetchYoutubeTranscript', 'analyzeTrendsAdvanced'],
      time: '~3 seconds',
      bestFor: 'Quick feedback, rapid iteration',
    },
    detailedAnalysis: {
      tools: ['TODAS EXCEPT analyzePerformance'],
      time: '~5 seconds (parallelized)',
      bestFor: 'New creator without history',
    },
    expertAnalysis: {
      tools: ['TODAS as 5 ferramentas'],
      time: '~6 seconds (parallelized)',
      bestFor: 'Established creator, full market analysis',
    },
  },

  /**
   * Future Tool Additions
   */
  futureTools: {
    audienceCommentAnalysisTool: 'Analisa sentimento e temas dos comentários',
    audioQualityAnalysisTool: 'Avalia qualidade de áudio/vídeo',
    soundTrendingTool: 'Identifica áudios trending em uso',
    hashtagOptimizationTool: 'Sugestões de hashtags por trend',
    scriptingAssistantTool: 'Ajuda a escrever roteiro otimizado',
    thumbnailAnalysisTool: 'Análise de thumbnails efetivos',
  },
};

/**
 * Tool Dependencies & Compatibility
 */
export const TOOL_DEPENDENCIES = {
  analyzeDemographics: {
    requires: [],
    enhancedBy: ['analyzeTrendsAdvanced', 'analyzeCompetitor'],
  },
  analyzeCompetitor: {
    requires: ['analyzeTrendsAdvanced'],
    enhancedBy: [],
  },
  analyzePerformance: {
    requires: ['creatorId'],
    enhancedBy: ['analyzeDemographics'],
  },
  analyzeTrendsAdvanced: {
    requires: [],
    enhancedBy: [],
  },
  fetchYoutubeTranscript: {
    requires: ['valid-youtube-url'],
    enhancedBy: ['analyzeTrendsAdvanced'],
  },
};

/**
 * Error Recovery for Each Tool
 */
export const TOOL_ERROR_RECOVERY = {
  analyzeDemographics: {
    timeout: 5000,
    retries: 2,
    fallback: 'Return generic demographic data',
  },
  analyzeCompetitor: {
    timeout: 8000,
    retries: 1,
    fallback: 'Return market benchmarks instead of specific competitors',
  },
  analyzePerformance: {
    timeout: 10000,
    retries: 0,
    fallback: 'Return "no history available" - not critical',
  },
  analyzeTrendsAdvanced: {
    timeout: 5000,
    retries: 2,
    fallback: 'Return stable trend indicator',
  },
};

export default MASTRA_TOOLS_SUITE;
