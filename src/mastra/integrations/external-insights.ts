/**
 * External Insights Integration
 * Captura e integra insights do repositório x1xhlol/system-prompts-and-models-of-ai-tools
 * 
 * Este módulo documenta os insights principais capturados e como são aplicados
 * ao Mastra para torná-lo uma ferramenta excelente e inigualável
 */

/**
 * INSIGHTS CAPTURADOS DO REPOSITÓRIO EXTERNO
 * 
 * O repositório x1xhlol/system-prompts-and-models-of-ai-tools agrega system prompts
 * de ferramentas AI líderes (v0, Cursor, Claude, etc) e permite extrair padrões
 * de excelência que foram implementados no Mastra.
 */

export const EXTERNAL_INSIGHTS = {
  /**
   * 1. AUTONOMIA INTELIGENTE
   * Padrão: Agentes que executam múltiplas buscas/ações para compreensão completa
   * Aplicação Mastra: 
   * - ResearchOrchestratorAgent coordena múltiplas ferramentas
   * - Agents tomam decisões fundamentadas sem pedir confirmação
   * - Graceful degradation quando ferramenta falha
   */
  autonomiaInteligente: {
    principio: 'Executar sem necessidade de intervenção humana repetitiva',
    implementacaoMastra: [
      'AnalysisPipeline executa múltiplas etapas automaticamente',
      'ErrorHandler + RetryLogic recuperam de falhas gracefully',
      'GracefulDegradation continua com dados parciais',
    ],
    exemploBrasileiro: 'Quando YouTube API falha, sistema usa dados de cache e trends para continuar análise',
  },

  /**
   * 2. INTENÇÃO DO USUÁRIO PRIORITÁRIA
   * Padrão: Seguir instruções explícitas e inferir contexto de padrões
   * Aplicação Mastra:
   * - System prompts definem regras claras de priorização
   * - ContentStrategistAgent compreende contexto antes de agir
   * - Prompts estruturados para máxima clareza
   */
  intencaoUsuarioPrioritaria: {
    principio: 'Sempre perseguir a intenção fundamental, não apenas as palavras',
    implementacaoMastra: [
      'System prompts começam com "AUTONOMIA ESPERADA" - claridade de escopo',
      'HookEngineerAgent adapta culturalmente sem perder intenção original',
      'AnalysisPipeline valida input antes de processar (intent validation)',
    ],
    exemploBrasileiro: 'Se usuário pede "ganco para português", entende que quer culturalmente adaptado, não tradução literal',
  },

  /**
   * 3. STRUCTURED THINKING
   * Padrão: Decomposição sistemática de problemas complexos
   * Aplicação Mastra:
   * - AnalysisPipeline decompõe em 5 etapas claras
   * - SYSTEM_PROMPTS usam formato "ESTRUTURA DE PENSAMENTO"
   * - Schemas (Zod) impõem estrutura de output
   */
  structuredThinking: {
    principio: 'Pensar sistemática e comunicar raciocínio explicitamente',
    implementacaoMastra: [
      'Pipeline stages: validation → collection → analysis → synthesis → output',
      'ContentStrategistAgent usa "ESTRUTURA DE ANÁLISE" com 5 passos',
      'ViralAnalystAgent decompõe em DECOMPOSIÇÃO → PADRÃO → COMPARAÇÃO → QUANTIFICAÇÃO → PREVISÃO',
    ],
    exemploBrasileiro: 'Ao analisar vídeo, não apenas "é bom/ruim", mas: hooK = X%, retenção = Y%, trend alignment = Z%',
  },

  /**
   * 4. TRANSPARÊNCIA EM INCERTEZA
   * Padrão: Comunicar explicitamente o que é certo vs incerto
   * Aplicação Mastra:
   * - Todos os schemas incluem "confidence" score
   * - ErrorHandler comunica limitações de degradação
   * - ViralAnalystPrompt diferencia "pode funcionar" vs "provavelmente funcionará"
   */
  transparenciaIncerteza: {
    principio: 'Nunca oculte incerteza - comunique probabilidades e limitations',
    implementacaoMastra: [
      'CompleteAnalysisResponse inclui "confidence" (0-1)',
      'GracefulDegradation explica "degradedMode" e ferramentas falhadas',
      'System prompts instruem: "Comunique incertezas EXPLICITAMENTE"',
    ],
    exemploBrasileiro: 'Retornar: "Hook tem 85% chance de sucesso (pois padrão X está em alta)" não "Hook é melhor"',
  },

  /**
   * 5. TOOL ORCHESTRATION
   * Padrão: Estratégia clara de qual tool usar em qual contexto
   * Aplicação Mastra:
   * - ResearchOrchestratorAgent define ordem de ferramentas (trends antes de demographics)
   * - Cada agent tem lista clara de "FERRAMENTAS À DISPOSIÇÃO"
   * - AnalysisPipeline coordena paralelamente quando possível
   */
  toolOrchestration: {
    principio: 'Usar ferramentas especializadas de forma orquestrada e eficiente',
    implementacaoMastra: [
      'ResearchOrchestratorPrompt: "ESTRATÉGIA DE ORQUESTRAÇÃO" documenta fluxo',
      'Pipeline executa coleta em paralelo para eficiência',
      'ErrorHandler fornece fallbacks por tool',
    ],
    exemploBrasileiro: 'Trends primeiro (para saber o contexto), depois demographics (para entender audience)',
  },

  /**
   * 6. CONTEXTO BRASILEIRO NATIVO
   * Padrão: (Insights especiais do Mastra) - Mercado brasileiro é diferente
   * Aplicação Mastra:
   * - CulturalTranslatorAgent: não tradução, transcreation
   * - HookEngineerAgent: padrões virais brasileiros
   * - System prompts sempre mencionam "contexto brasileiro"
   */
  contextoBrasileiroNativo: {
    principio: 'Não é apenas tradução - é adaptação cultural e mercado profundo',
    implementacaoMastra: [
      'CulturalTranslatorAgent: "Nunca traduza ao pé da letra"',
      'HookEngineerAgent: Padrões de retenção brasileiros',
      'RESEARCH_ORCHESTRATOR: "Sempre priorize dados brasileiros"',
    ],
    exemploBrasileiro: 'Usar "Receita Federal" ao invés de "IRS", "Detran" ao invés de "DMV"',
  },

  /**
   * 7. MEMORY & LEARNING
   * Padrão: Aprender com histórico e não repetir erros
   * Aplicação Mastra:
   * - MEMORY_CONTEXT_PROMPT fornece instruções para leverage histórico
   * - Agents têm "enableMemory: true" nas settings
   * - Sistema pode aprender padrões bem-sucedidos
   */
  memoryLearning: {
    principio: 'Aprender com passado para melhorar futuro',
    implementacaoMastra: [
      'Agents salvam análises bem-sucedidas',
      'Padrões que funcionaram são reutilizados',
      'Sistema evita repetir abordagens que falharam',
    ],
    exemploBrasileiro: 'Se certos tipos de hook funcionam bem para criador X, usar como base para próximas análises',
  },

  /**
   * 8. ERROR RECOVERY & RESILIENCE
   * Padrão: Nunca falhar completamente por um erro parcial
   * Aplicação Mastra:
   * - ErrorHandler com estratégias por tipo de erro
   * - RetryLogic com exponential backoff
   * - GracefulDegradation continua com dados disponíveis
   */
  errorRecovery: {
    principio: 'Degradação graciosa > falha completa',
    implementacaoMastra: [
      'ErrorHandler detecta tipo de erro e aplica estratégia apropriada',
      'RetryLogic implementa exponential backoff para rate limits',
      'GracefulDegradation fornece resultado parcial quando tools falham',
    ],
    exemploBrasileiro: 'Transcript falha? Use apenas metadata + trends. Performance reduzida mas não falha 0',
  },
};

/**
 * MAPEAMENTO: De Insights Teóricos para Implementação Prática
 */
export const INSIGHT_TO_IMPLEMENTATION_MAP = {
  'v0-like-autonomy': {
    insight: 'v0 executa múltiplas buscas para compreensão antes de gerar',
    mastraImplementation: 'ResearchOrchestratorAgent + AnalysisPipeline',
    fileLocation: 'src/mastra/agents/researchOrchestrator.ts, src/mastra/workflows/analysis-pipeline.ts',
  },
  'cursor-like-tooling': {
    insight: 'Cursor tem estratégia clara de qual tool usar quando',
    mastraImplementation: 'System prompts com "FERRAMENTAS À DISPOSIÇÃO" + ErrorHandler',
    fileLocation: 'src/mastra/prompts/system-prompts.ts, src/mastra/utils/error-handler.ts',
  },
  'claude-like-reasoning': {
    insight: 'Claude comunica seu raciocínio explicitamente',
    mastraImplementation: 'Schemas com campos de rationale + STRUCTURED_THINKING nos prompts',
    fileLocation: 'src/mastra/schemas/analysis.ts, src/mastra/prompts/system-prompts.ts',
  },
  'multilingual-adaptation': {
    insight: 'Ferramentas líderes adaptam para contexto local',
    mastraImplementation: 'CulturalTranslatorAgent + context-specific prompts',
    fileLocation: 'src/mastra/agents/culturalTranslator.ts',
  },
  'confidence-transparency': {
    insight: 'Melhor comunicar "85% certeza" do que "é isso"',
    mastraImplementation: 'CompleteAnalysisResponse com confidence score',
    fileLocation: 'src/mastra/schemas/analysis.ts',
  },
};

/**
 * MATRIZ DE EXCELÊNCIA DO MASTRA
 * 
 * Verificação: O Mastra toca em cada aspecto de excelência
 */
export const EXCELLENCE_MATRIX = [
  { criterion: 'Autonomia', implemented: true, file: 'analysis-pipeline.ts' },
  { criterion: 'User Intent Priority', implemented: true, file: 'system-prompts.ts' },
  { criterion: 'Structured Thinking', implemented: true, file: 'system-prompts.ts' },
  { criterion: 'Uncertainty Transparency', implemented: true, file: 'analysis.ts' },
  { criterion: 'Tool Orchestration', implemented: true, file: 'researchOrchestrator.ts' },
  { criterion: 'Brazilian Context', implemented: true, file: 'culturalTranslator.ts' },
  { criterion: 'Memory & Learning', implemented: true, file: 'system-prompts.ts' },
  { criterion: 'Error Resilience', implemented: true, file: 'error-handler.ts' },
  { criterion: 'Graceful Degradation', implemented: true, file: 'error-handler.ts' },
  { criterion: 'Performance Optimization', implemented: true, file: 'analysis-pipeline.ts' },
];

/**
 * UNIQUE SELLING POINTS - Como Mastra se diferencia
 */
export const UNIQUE_SELLING_POINTS = [
  {
    proposition: 'Autonomia Genuína',
    description: 'Não precisa de intervenção a cada passo - executa análise completa automaticamente',
    evidence: 'AnalysisPipeline orquestra 5 etapas com recovery automático',
  },
  {
    proposition: 'Adaptação Cultural Profunda',
    description: 'Não apenas traduz - adapta para mercado brasileiro com autenticidade',
    evidence: 'CulturalTranslatorAgent + contexto específico em todos os prompts',
  },
  {
    proposition: 'Inteligência em Modo Degradado',
    description: 'Continua fornecendo insights mesmo quando algumas ferramentas falham',
    evidence: 'GracefulDegradation + ErrorHandler com fallback strategies',
  },
  {
    proposition: 'Raciocínio Transparente',
    description: 'Comunicação explícita de confiança, incerteza e rationale',
    evidence: 'Schemas com confidence scores + rationale fields',
  },
  {
    proposition: 'Orquestração de Múltiplos Agentes',
    description: 'Usa melhor agent para cada tipo de tarefa (strategy, viral, cultural, hooks)',
    evidence: '7+ agentes especializados com prompts específicos',
  },
];

export const EXTERNAL_INSIGHTS_MODULE = {
  EXTERNAL_INSIGHTS,
  INSIGHT_TO_IMPLEMENTATION_MAP,
  EXCELLENCE_MATRIX,
  UNIQUE_SELLING_POINTS,
};

export default EXTERNAL_INSIGHTS_MODULE;
