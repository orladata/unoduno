/**
 * API Integration Guide - Enhanced Mastra Analysis
 * 
 * Este documento explica como integrar com a nova API aprimorada
 * Exemplos em múltiplas linguagens e frameworks
 */

export const API_INTEGRATION_GUIDE = {
  /**
   * ENDPOINT PRINCIPAL
   */
  endpoint: {
    method: 'POST',
    path: '/api/mastra/analyze-enhanced',
    description: 'Executa análise completa estruturada de vídeo YouTube',
    authentication: 'Optional (add Authorization header if needed)',
  },

  /**
   * REQUEST PAYLOAD
   */
  requestSchema: {
    videoUrl: {
      type: 'string (URL)',
      required: true,
      example: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
      description: 'URL completa do vídeo YouTube a ser analisado',
    },
    analysisType: {
      type: 'enum',
      required: false,
      default: 'detailed',
      options: ['quick', 'detailed', 'expert'],
      description: 'Profundidade da análise. Quick (~3s), Detailed (~5s), Expert (~6s)',
    },
    analysisMode: {
      type: 'enum',
      required: false,
      default: 'comprehensive',
      options: ['content', 'viral', 'cultural', 'comprehensive'],
      description: 'Foco da análise. Comprehensive inclui todas as perspectivas.',
    },
    includeMetrics: {
      type: 'boolean',
      required: false,
      default: true,
      description: 'Incluir métricas quantificadas (CTR, retention curve, etc)',
    },
    returnStructured: {
      type: 'boolean',
      required: false,
      default: true,
      description: 'Retornar resposta com schema estruturado (vs texto livre)',
    },
    userContext: {
      type: 'object',
      required: false,
      fields: {
        demographics: 'string - Descrição da audiência alvo',
        previousSuccesses: 'array<string> - Vídeos anteriores bem-sucedidos',
        targetAudience: 'string - Descrição específica da audiência',
      },
      description: 'Contexto adicional do usuário para personalização',
    },
    creatorId: {
      type: 'string',
      required: false,
      description: 'ID único do criador para tracking e memory',
    },
  },

  /**
   * EXEMPLO 1: JavaScript/TypeScript
   */
  exampleJavaScript: {
    title: 'Cliente JavaScript/TypeScript',
    code: \`
async function analyzeVideo(videoUrl) {
  const response = await fetch('/api/mastra/analyze-enhanced', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      videoUrl,
      analysisType: 'expert',
      analysisMode: 'comprehensive',
      includeMetrics: true,
      userContext: {
        targetAudience: 'Tech entrepreneurs in Brazil, age 25-40',
        demographics: 'High education, early adopters',
      },
    }),
  });

  if (!response.ok) {
    throw new Error(\`API error: \${response.status}\`);
  }

  const result = await response.json();
  
  // Result structure:
  // {
  //   success: boolean
  //   videoTitle: string
  //   videoAuthor: string
  //   analysisType: 'expert'
  //   strategy: { ... }
  //   hooks: [ ... ]
  //   metrics: { ... }
  //   culturalInsights: [ ... ]
  //   toolsUsed: string[]
  //   executionTime: number (ms)
  //   confidence: number (0-1)
  //   degradedMode: boolean
  //   recommendations: string[]
  //   nextSteps: string[]
  // }
  
  return result;
}

// Uso:
const analysis = await analyzeVideo('https://youtube.com/watch?v=...');
console.log('Hook recomendado:', analysis.hooks[0].text);
console.log('Confiança da análise:', analysis.confidence);
console.log('Tempo de execução:', analysis.executionTime, 'ms');
    \`,
  },

  /**
   * EXEMPLO 2: React Hook
   */
  exampleReactHook: {
    title: 'React Hook para Análise',
    code: \`
import { useState } from 'react';

export function useVideoAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [result, setResult] = useState(null);

  const analyze = async (videoUrl, options = {}) => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await fetch('/api/mastra/analyze-enhanced', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl,
          analysisType: options.analysisType || 'detailed',
          analysisMode: options.analysisMode || 'comprehensive',
          ...options,
        }),
      });

      if (!response.ok) {
        throw new Error(\`Analysis failed: \${response.status}\`);
      }

      const data = await response.json();
      
      if (!data.success) {
        throw new Error(data.error || 'Analysis failed');
      }

      setResult(data);
      return data;
    } catch (err) {
      setError(err.message);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  return { analyze, loading, error, result };
}

// Uso:
export function VideoAnalyzer() {
  const { analyze, loading, result } = useVideoAnalysis();

  const handleAnalyze = async (url) => {
    const analysis = await analyze(url, { analysisType: 'expert' });
    
    return (
      <div>
        <h2>{analysis.videoTitle}</h2>
        <p>Confiança: {(analysis.confidence * 100).toFixed(0)}%</p>
        <p>Gancho recomendado: {analysis.hooks[0].text}</p>
        <p>Tempo: {analysis.executionTime}ms</p>
      </div>
    );
  };
}
    \`,
  },

  /**
   * EXEMPLO 3: cURL
   */
  exampleCurl: {
    title: 'cURL Request',
    command: \`
curl -X POST http://localhost:3000/api/mastra/analyze-enhanced \\
  -H "Content-Type: application/json" \\
  -d '{
    "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "analysisType": "expert",
    "analysisMode": "comprehensive",
    "includeMetrics": true,
    "userContext": {
      "targetAudience": "Tech entrepreneurs",
      "demographics": "Brazil, age 25-40"
    }
  }'
    \`,
  },

  /**
   * EXEMPLO 4: Python
   */
  examplePython: {
    title: 'Python Client',
    code: \`
import requests
import json

def analyze_video(video_url, analysis_type='detailed'):
    """
    Analisa vídeo usando Mastra API
    """
    url = 'http://localhost:3000/api/mastra/analyze-enhanced'
    
    payload = {
        'videoUrl': video_url,
        'analysisType': analysis_type,
        'analysisMode': 'comprehensive',
        'includeMetrics': True,
        'userContext': {
            'targetAudience': 'Brazilian tech audience',
        }
    }
    
    response = requests.post(url, json=payload)
    
    if response.status_code != 200:
        raise Exception(f"API error: {response.status_code}")
    
    result = response.json()
    
    if not result['success']:
        raise Exception(result.get('error', 'Analysis failed'))
    
    return result

# Uso:
try:
    analysis = analyze_video(
        'https://youtube.com/watch?v=...',
        analysis_type='expert'
    )
    
    print(f"Título: {analysis['videoTitle']}")
    print(f"Confiança: {analysis['confidence']:.0%}")
    print(f"Gancho: {analysis['hooks'][0]['text']}")
    print(f"Tempo: {analysis['executionTime']}ms")
    
except Exception as e:
    print(f"Erro: {e}")
    \`,
  },

  /**
   * RESPONSE STRUCTURE
   */
  responseStructure: {
    success: 'boolean - Se análise foi bem-sucedida',
    videoTitle: 'string - Título do vídeo analisado',
    videoAuthor: 'string - Autor do vídeo',
    analysisType: 'string - Tipo de análise realizada',
    
    strategy: {
      title: 'string - Título da estratégia',
      targetAudience: 'string - Audiência alvo',
      primaryMessage: 'string - Mensagem primária',
      keyInsights: 'string[] - Insights principais',
      strengthsToLeverage: 'string[] - Pontos fortes',
      areasForImprovement: 'string[] - Áreas a melhorar',
      recommendedHooks: 'object[] - Ganchos recomendados',
      culturalAdaptations: 'string[] - Adaptações culturais',
      expectedPerformance: 'enum - low/medium/high/viral',
      confidence: 'number - Confiança (0-1)',
      nextSteps: 'string[] - Próximos passos',
    },

    hooks: {
      id: 'string - ID único',
      text: 'string - Texto do gancho (<30 palavras)',
      model: 'enum - curiosity/fear/utility/etc',
      emotionalTrigger: 'string - Gatilho emocional',
      estimatedRetention: 'number - % estimada de retenção',
      rationale: 'string - Por que funcionaria',
    },

    metrics: {
      estimatedCTR: 'number - Taxa de clique estimada',
      estimatedAverageViewDuration: 'number - Duração média (segundos)',
      estimatedRetentionCurve: 'object[] - Curva de retenção por tempo',
      engagementFactors: 'object[] - Fatores de engajamento',
      viralityScore: 'number - Score de viralidade (0-100)',
      benchmarkComparison: 'string - Comparação com benchmarks',
    },

    culturalInsights: 'object[] - Insights culturais para Brasil',
    toolsUsed: 'string[] - Ferramentas utilizadas na análise',
    executionTime: 'number - Tempo total (ms)',
    confidence: 'number - Confiança geral (0-1)',
    degradedMode: 'boolean - Se análise foi em modo degradado',
    limitations: 'string[] - Limitações da análise',
    recommendations: 'string[] - Recomendações finais',
    nextSteps: 'string[] - Próximos passos sugeridos',
    timestamp: 'string - ISO timestamp da análise',
  },

  /**
   * ERROR HANDLING
   */
  errorHandling: {
    400: {
      description: 'Validation error',
      example: {
        success: false,
        error: 'Validation error: videoUrl: Invalid url',
        timestamp: '2026-05-29T10:30:00Z',
      },
    },
    500: {
      description: 'Server error during analysis',
      example: {
        success: false,
        error: 'Tool TOOL_FAILURE occurred',
        recoveryAction: 'fallback',
        executionTime: 2000,
        timestamp: '2026-05-29T10:30:00Z',
      },
    },
    200: {
      description: 'Analysis with degraded mode',
      example: {
        success: true,
        // ... resultado parcial
        degradedMode: true,
        limitations: ['Some tools were unavailable'],
        confidence: 0.7,
      },
    },
  },

  /**
   * BEST PRACTICES
   */
  bestPractices: [
    {
      title: 'Escolha análysisType apropriado',
      description: 'quick=3s, detailed=5s, expert=6s. Use quick para prototipagem.',
    },
    {
      title: 'Forneça userContext quando possível',
      description: 'Permite personalização e melhores recomendações.',
    },
    {
      title: 'Trate degradedMode gracefully',
      description: 'Quando degradedMode=true, confidence é menor mas resultado ainda é válido.',
    },
    {
      title: 'Cache resultados quando apropriado',
      description: 'Mesma URL pode ser cacheada por ~1 hora sem problemas.',
    },
    {
      title: 'Use metricas para decisões',
      description: 'Não confie apenas em confidence. Veja viralityScore, retention curve, etc.',
    },
    {
      title: 'Implemente retry logic',
      description: 'A API implementa retry automático, mas cliente também pode tentar novamente.',
    },
  ],

  /**
   * PERFORMANCE NOTES
   */
  performance: {
    quickAnalysis: '~3 segundos',
    detailedAnalysis: '~5 segundos',
    expertAnalysis: '~6 segundos',
    tokensUsed: '15-20K tokens',
    concurrency: 'Suporta múltiplas requisições paralelas',
    rateLimit: 'Sem limite implementado (pode ser adicionado)',
  },

  /**
   * INTEGRATION CHECKLIST
   */
  integrationChecklist: [
    '✓ Importar/clonar a rota `/api/mastra/analyze-enhanced`',
    '✓ Garantir que `src/mastra/workflows/analysis-pipeline.ts` está disponível',
    '✓ Garantir que todos os schemas estão importáveis',
    '✓ Garantir que ErrorHandler está disponível',
    '✓ Testar com URL válida do YouTube',
    '✓ Monitorar executionTime e degradedMode',
    '✓ Implementar cache client-side se necessário',
    '✓ Adicionar error boundaries na UI',
  ],
};

export default API_INTEGRATION_GUIDE;
