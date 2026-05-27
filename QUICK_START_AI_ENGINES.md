# Quick Start - Unified AI Engines

Guia rápido para usar Mastra + Vercel AI SDK + LangGraph no Unoduno.

## 1. Importar o Engine Unificado

```typescript
import { analyzeVideo } from "@/lib/ai-orchestration/unified-ai-engine";
```

## 2. Escolher a Velocidade Certa

### Rápido (2-5s) - Para UI Preview
```typescript
const result = await analyzeVideo({
  videoUrl: "https://youtube.com/watch?v=...",
  analysisType: "quick"
});

console.log(result.data.analysis); // String com análise rápida
```

### Detalhado (10-30s) - Com Tools
```typescript
const result = await analyzeVideo({
  videoUrl: "https://youtube.com/watch?v=...",
  analysisType: "detailed"
});

// Usa Mastra Agent com 3 tools:
// - Metadata (título, autor)
// - Transcript (legendas)
// - Research (tendências)
```

### Completo (15-45s) - Com Estado
```typescript
const result = await analyzeVideo({
  videoUrl: "https://youtube.com/watch?v=...",
  analysisType: "interactive",
  returnStructured: true
});

console.log(result.data.structured);
// {
//   hooks: ["Hook 1", "Hook 2", "Hook 3"],
//   strategies: ["Strategy 1", "Strategy 2"],
//   themes: [...],
//   viral_potential: 85,
//   recommended_duration: "3m"
// }
```

## 3. Usar em API Route

```typescript
// app/api/analyze/route.ts
import { analyzeVideo } from "@/lib/ai-orchestration/unified-ai-engine";

export async function POST(req: Request) {
  const { videoUrl, type } = await req.json();

  const result = await analyzeVideo({
    videoUrl,
    analysisType: type || "quick",
    returnStructured: true
  });

  return Response.json(result);
}
```

## 4. Usar em React Component

```typescript
// components/VideoAnalyzer.tsx
"use client";
import { useState } from "react";
import { streamAnalysis } from "@/lib/ai-sdk/vercel-bridge";

export function VideoAnalyzer() {
  const [text, setText] = useState("");

  const handleAnalyze = async (url: string) => {
    const stream = await streamAnalysis(
      `Analyze: ${url}`,
      "gemini-2.5-pro"
    );

    for await (const event of stream) {
      if (event.type === "text-delta") {
        setText(prev => prev + event.delta);
      }
    }
  };

  return (
    <div>
      <button onClick={() => handleAnalyze("...")}>Analisar</button>
      <p>{text}</p>
    </div>
  );
}
```

## 5. Batch Processing (Múltiplos Videos)

```typescript
import { batchAnalysis } from "@/lib/ai-orchestration/unified-ai-engine";

const urls = [
  "https://youtube.com/watch?v=url1",
  "https://youtube.com/watch?v=url2",
  "https://youtube.com/watch?v=url3"
];

const results = await batchAnalysis(urls, "quick");
// Processa em paralelo, retorna array de resultados
```

## 6. Decision Matrix

| Necessidade | Engine | Função |
|-------------|--------|--------|
| Preview rápido | quick | `analyzeVideo({ type: "quick" })` |
| Análise completa | detailed | `analyzeVideo({ type: "detailed" })` |
| Fluxo gerenciado | interactive | `analyzeVideo({ type: "interactive" })` |
| Dados estruturados | interactive | `returnStructured: true` |
| Streaming em tempo real | Vercel SDK | `streamAnalysis()` |
| Múltiplos vídeos | Batch | `batchAnalysis()` |

## 7. Exemplo Completo

```typescript
// hooks/useVideoAnalysis.ts
import { analyzeVideo } from "@/lib/ai-orchestration/unified-ai-engine";
import { useState } from "react";

export function useVideoAnalysis() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);

  const analyze = async (videoUrl: string) => {
    setLoading(true);
    setError(null);
    try {
      const res = await analyzeVideo({
        videoUrl,
        analysisType: "interactive",
        returnStructured: true
      });
      if (res.success) {
        setResult(res.data);
      } else {
        setError(res.error);
      }
    } catch (err) {
      setError(String(err));
    } finally {
      setLoading(false);
    }
  };

  return { analyze, loading, result, error };
}
```

## 8. Tipos TypeScript

```typescript
// Request
interface UnifiedAnalysisRequest {
  videoUrl: string;
  analysisType: "quick" | "detailed" | "interactive";
  returnStructured?: boolean;
}

// Response
interface UnifiedAnalysisResponse {
  success: boolean;
  data?: {
    basic: { title?: string; author?: string };
    analysis?: string;
    structured?: ContentAnalysis;
  };
  error?: string;
  metadata: {
    engine: "mastra" | "vercel-ai-sdk" | "langgraph" | "hybrid";
    duration: number;
    tokensUsed?: number;
  };
}

// Structured Data
interface ContentAnalysis {
  hooks: string[];
  strategies: string[];
  themes: string[];
  engagement_tactics: string[];
  viral_potential: number;
  recommended_duration: string;
}
```

## 9. Troubleshooting

**Q: Qual engine usar?**
A: Use a matriz de decisão acima, ou comece com "quick" para testar.

**Q: Tokens usados são muito altos?**
A: O engine automaticamente seleciona o modelo mais barato baseado nos tokens.

**Q: Como fazer streaming em tempo real?**
A: Use `streamAnalysis()` do Vercel AI SDK, não LangGraph.

**Q: Como cachear resultados?**
A: O resultado inclui a URL do vídeo como chave. Armazene em Supabase/Redis.

## 10. Próximos Passos

1. ✅ Integrar com API routes
2. ✅ Adicionar UI com streaming
3. ✅ Cachear resultados com Vercel KV
4. ✅ Monitorar custos por engine
5. ✅ A/B testing entre engines

---

Para mais detalhes: [AI_ORCHESTRATION_ARCHITECTURE.md](./AI_ORCHESTRATION_ARCHITECTURE.md)
