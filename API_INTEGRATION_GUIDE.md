# API Integration Guide - Unified AI Engines

Guia prático para usar os novos endpoints da API com Mastra + Vercel AI SDK + LangGraph.

---

## Endpoints Disponíveis

### 1. Quick Analysis (Vercel AI SDK)
**POST** `/api/analyze/quick`

Análise rápida com geração de texto (2-5s).

**Request:**
```json
{
  "videoUrl": "https://youtube.com/watch?v=...",
  "model": "gemini-2.5-pro"  // opcional
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": "Gancho principal identificado: ...",
    "videoUrl": "https://youtube.com/watch?v=...",
    "model": "gemini-2.5-pro",
    "engine": "vercel-ai-sdk"
  },
  "metadata": {
    "duration": 2500,
    "tokensUsed": {
      "input": 450,
      "output": 320
    }
  }
}
```

**Custo:** 100 créditos | **Tempo:** 2-5s | **Melhor para:** Preview rápida

---

### 2. Detailed Analysis (Mastra Agent)
**POST** `/api/analyze/detailed`

Análise completa com extração de tools (10-30s).

**Request:**
```json
{
  "videoUrl": "https://youtube.com/watch?v=..."
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "analysis": "Análise detalhada com:\n- Gancho principal\n- Público-alvo\n- Estratégias virais\n- 3 hooks alternativos\n- Potencial viral: 85%",
    "videoUrl": "https://youtube.com/watch?v=...",
    "engine": "mastra-agent"
  },
  "metadata": {
    "duration": 18000,
    "toolsUsed": ["fetchVideoMetadata", "fetchTranscript", "searchTrends"]
  }
}
```

**Custo:** 300 créditos | **Tempo:** 10-30s | **Melhor para:** Análise completa com tools

---

### 3. Unified Analysis (Orquestrador Inteligente)
**POST** `/api/analyze`

Análise com seleção automática do melhor engine.

**Request:**
```json
{
  "videoUrl": "https://youtube.com/watch?v=...",
  "type": "quick",                    // "quick" | "detailed" | "interactive"
  "returnStructured": true            // opcional, para dados estruturados
}
```

**Response (type: quick):**
```json
{
  "success": true,
  "data": {
    "analysis": "String com análise",
    "structured": null
  },
  "metadata": {
    "engine": "vercel-ai-sdk",
    "duration": 3200,
    "creditsCost": 100,
    "analysisType": "quick",
    "timestamp": "2026-05-27T10:30:00Z"
  }
}
```

**Response (type: interactive, returnStructured: true):**
```json
{
  "success": true,
  "data": {
    "analysis": "String com análise",
    "structured": {
      "hooks": ["Hook 1", "Hook 2", "Hook 3"],
      "strategies": ["Strategy 1", "Strategy 2"],
      "themes": ["theme1", "theme2"],
      "engagement_tactics": ["tactic1", "tactic2"],
      "viral_potential": 85,
      "recommended_duration": "3m"
    }
  },
  "metadata": {
    "engine": "langgraph",
    "duration": 28000,
    "creditsCost": 500,
    "analysisType": "interactive"
  }
}
```

**Custos:**
- quick: 100 créditos (2-5s)
- detailed: 300 créditos (10-30s)
- interactive: 500 créditos (15-45s)

---

### 4. Streaming Analysis (Tempo Real)
**POST** `/api/analyze/stream`

Análise com streaming de resposta em tempo real (Server-Sent Events).

**Request:**
```json
{
  "videoUrl": "https://youtube.com/watch?v=...",
  "prompt": "Custom analysis prompt",  // opcional
  "model": "gemini-2.5-pro"           // opcional
}
```

**Response Stream (SSE):**
```
data: {"text":"Análise"}
data: {"text":" do vídeo"}
data: {"text":" em streaming..."}
data: [DONE]
```

**Custo:** 150 créditos | **Tipo:** Server-Sent Events | **Melhor para:** UI em tempo real

**Exemplo Client (JavaScript):**
```typescript
const response = await fetch("/api/analyze/stream", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ videoUrl: "..." })
});

const reader = response.body?.getReader();
while (true) {
  const { done, value } = await reader?.read() || {};
  if (done) break;
  
  const text = new TextDecoder().decode(value);
  const json = JSON.parse(text.replace("data: ", ""));
  console.log(json.text);
}
```

---

### 5. Batch Analysis (Múltiplos Vídeos)
**POST** `/api/analyze/batch`

Análise em paralelo de múltiplos vídeos (máximo 10).

**Request:**
```json
{
  "videoUrls": [
    "https://youtube.com/watch?v=url1",
    "https://youtube.com/watch?v=url2",
    "https://youtube.com/watch?v=url3"
  ],
  "type": "quick"  // "quick" | "detailed" | "interactive"
}
```

**Response:**
```json
{
  "success": true,
  "data": {
    "results": [
      {
        "videoUrl": "https://youtube.com/watch?v=url1",
        "success": true,
        "data": { "analysis": "..." },
        "metadata": { "duration": 2500 }
      },
      // ... mais resultados
    ],
    "summary": {
      "total": 3,
      "successful": 3,
      "failed": 0,
      "successRate": "100.0%"
    }
  },
  "metadata": {
    "duration": 8500,
    "totalCreditsUsed": 300,  // 3 videos × 100 credits
    "analysisType": "quick"
  }
}
```

**Custo:** `creditosPerVideo × quantidadeVideos` | **Melhor para:** Análise em lote

---

## Exemplos de Uso

### React Hook

```typescript
// hooks/useVideoAnalysis.ts
import { useState } from "react";

export function useVideoAnalysis() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState(null);

  const analyze = async (videoUrl: string, type: "quick" | "detailed" | "interactive" = "quick") => {
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl, type, returnStructured: true }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Analysis failed");
      }

      const data = await res.json();
      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : String(err));
    } finally {
      setLoading(false);
    }
  };

  return { analyze, loading, error, result };
}
```

### React Component com Streaming

```typescript
// components/StreamingAnalyzer.tsx
"use client";
import { useState, useRef } from "react";

export function StreamingAnalyzer() {
  const [text, setText] = useState("");
  const [loading, setLoading] = useState(false);
  const [videoUrl, setVideoUrl] = useState("");

  const handleStream = async () => {
    if (!videoUrl) return;
    
    setLoading(true);
    setText("");

    try {
      const response = await fetch("/api/analyze/stream", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ videoUrl }),
      });

      const reader = response.body?.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader?.read() || {};
        if (done) break;

        const chunk = decoder.decode(value);
        const lines = chunk.split("\n");

        for (const line of lines) {
          if (line.startsWith("data: ")) {
            const data = JSON.parse(line.slice(6));
            if (data.text) {
              setText(prev => prev + data.text);
            }
          }
        }
      }
    } catch (error) {
      console.error("Stream error:", error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <input 
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        placeholder="Cola a URL do vídeo..."
      />
      <button onClick={handleStream} disabled={loading}>
        {loading ? "Analisando..." : "Analisar Streaming"}
      </button>
      <div className="analysis-result">
        {text}
      </div>
    </div>
  );
}
```

### cURL Examples

Quick Analysis:
```bash
curl -X POST http://localhost:3000/api/analyze/quick \
  -H "Content-Type: application/json" \
  -d '{"videoUrl": "https://youtube.com/watch?v=..."}'
```

Detailed Analysis:
```bash
curl -X POST http://localhost:3000/api/analyze/detailed \
  -H "Content-Type: application/json" \
  -d '{"videoUrl": "https://youtube.com/watch?v=..."}'
```

Streaming Analysis:
```bash
curl -X POST http://localhost:3000/api/analyze/stream \
  -H "Content-Type: application/json" \
  -d '{"videoUrl": "https://youtube.com/watch?v=..."}' \
  --no-buffer
```

Batch Analysis:
```bash
curl -X POST http://localhost:3000/api/analyze/batch \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrls": [
      "https://youtube.com/watch?v=url1",
      "https://youtube.com/watch?v=url2"
    ],
    "type": "quick"
  }'
```

---

## Tratamento de Erros

### 400 - Invalid Input
```json
{
  "error": "Invalid input",
  "details": [
    { "code": "invalid_url", "message": "URL inválida" }
  ]
}
```

### 401 - Unauthorized
```json
{
  "error": "Unauthorized"
}
```

### 402 - Insufficient Credits
```json
{
  "error": "Insufficient credits",
  "required": 300
}
```

### 500 - Server Error
```json
{
  "error": "Analysis failed",
  "details": "Error message details"
}
```

---

## Fluxo de Integração

1. **Autenticação**: Usuário deve estar logado
2. **Validação**: URL do YouTube é validada
3. **Deduções de Créditos**: Creditocost é debitado
4. **Processamento**: Engine apropriado processa
5. **Resposta**: Resultado é retornado

---

## Matriz de Decisão

| Use Case | Endpoint | Tempo | Custo |
|----------|----------|-------|-------|
| Preview rápida no UI | `/api/analyze/quick` | 2-5s | 100cr |
| Análise completa | `/api/analyze/detailed` | 10-30s | 300cr |
| Dados estruturados | `/api/analyze?type=interactive` | 15-45s | 500cr |
| Streaming em tempo real | `/api/analyze/stream` | 2-5s | 150cr |
| Múltiplos vídeos | `/api/analyze/batch` | Paralelo | N×100cr |

---

## Melhorias Futuras

- [ ] Caching de resultados com Vercel KV
- [ ] WebSocket para streaming bidirecional
- [ ] Rate limiting por usuário
- [ ] Webhooks para notificações
- [ ] API key para integrações third-party

---

**Para mais detalhes**: Veja [AI_ORCHESTRATION_ARCHITECTURE.md](./AI_ORCHESTRATION_ARCHITECTURE.md)
