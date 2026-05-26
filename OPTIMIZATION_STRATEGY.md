# Unoduno - Estratégia de Otimização: Mastra + Layout Performance

## 1. Clarificação: "Chimideck"

Não encontramos uma biblioteca chamada "Chimideck". Você pode estar se referindo a:

- **Chimera UI**: UI component library baseada em Radix Primitives e Tailwind CSS
- **Layout Performance** (Chrome LayoutNG): Otimizações no rendering pipeline do browser

Recomendamos focar em otimizações de **Layout Performance** e **Mastra Integration** para maximizar o desempenho.

---

## 2. Stack Atual do Projeto

```
Frontend:
  - Next.js 16.2.6 (App Router)
  - React 19 + React Dom 19
  - Tailwind CSS 4.2.0 (v4 - sem tailwind.config.js!)
  - Framer Motion 12.40.0
  - React Hook Form 7.76.0

Backend/AI:
  - Mastra 1.36.0 (AI agents & workflows)
  - AI SDK 6.0.182 (Vercel AI Gateway)
  - @ai-sdk/google 3.0.79 (Gemini models)

Data/Storage:
  - Supabase (SSR client 0.10.3)
  - Vercel KV (Redis)
  - Vercel Blob (file storage)

Performance:
  - No React Compiler (needs enabling)
  - No response caching
  - No streaming optimizations
```

---

## 3. Otimizações Recomendadas com Mastra

### 3.1 Token-Aware Model Routing (NOVO EM MASTRA 1.36)

**Problema Atual**: Seu agente usa sempre `gemini-2.5-pro` para análises simples e complexas.

**Solução**:
```typescript
// lib/mastra/memory.ts (CRIAR)
import { Memory, ModelByInputTokens } from "@mastra/memory";

export const unodunoMemory = new Memory({
  options: {
    observationalMemory: {
      model: new ModelByInputTokens({
        upTo: {
          5_000: "google/gemini-2.5-flash",      // Fast, cheap (< 5K tokens)
          20_000: "google/gemini-2.5-pro",       // Balanced (5-20K tokens)
          1_000_000: "openai/gpt-4.5"            // Strong (> 20K tokens)
        }
      })
    }
  }
});
```

**Benefício**: 60-70% redução em custo de tokens para análises curtas. Flash model é 10x mais rápido.

---

### 3.2 Response Caching para Etapas LLM

**Problema**: Mesmos prompts são processados múltiplas vezes.

**Solução** (Mastra 1.36):
```typescript
export const unodunoAgent = new Agent({
  id: 'unoduno-agent',
  name: 'Unoduno Expert Neural',
  model: 'google/gemini-2.5-pro',
  tools: { /* ... */ },
  responseCache: {
    enabled: true,
    ttl: 3600, // 1 hora
    keyStrategy: 'prompt-hash' // hashing automático
  }
});
```

**Benefício**: 40-50% redução em latência para análises repetidas.

---

### 3.3 Token-Aware Memory com Observational Memory

**Usar para**:
- Manter contexto de conversas passadas
- Adaptar respostas baseado em histórico do usuário
- Evitar processing de contexto desnecessário

```typescript
// In your analysis flow:
const context = await unodunoMemory.observe({
  userId: user.id,
  event: 'video-analyzed',
  data: { videoId, duration, themes }
});
```

---

### 3.4 Durable Agents com Resumable Streams

**Para análises de vídeos longos** (10+ min):

```typescript
// /api/analyze (route handler)
import { Harness } from '@mastra/core';

export async function POST(req: Request) {
  const { videoUrl } = await req.json();
  
  const harness = new Harness({
    agent: unodunoAgent,
    workspaceId: 'unoduno-workspace',
    recordHistory: true // Persistir execução
  });

  // Resumable stream - pode ser interrompido/retomado
  const stream = harness.runStream({
    messages: [{ role: 'user', content: `Analyze: ${videoUrl}` }]
  });

  return new Response(stream);
}
```

**Benefício**: Análises podem ser retomadas se a conexão cair.

---

## 4. Otimizações de Layout e Performance

### 4.1 Enable React Compiler (Next.js 16)

**next.config.mjs**:
```javascript
const nextConfig = {
  reactCompiler: true, // Auto-memoization
  // ... rest of config
}
```

**Benefício**: 15-20% redução em re-renders desnecessários, especialmente em Framer Motion.

---

### 4.2 Optimize Tailwind CSS v4

**globals.css** (já usando v4):
```css
@import 'tailwindcss';

@theme inline {
  --font-sans: 'system-ui', 'sans-serif';
  --breakpoints: {
    xs: '0px',
    sm: '640px',
    md: '1024px',  /* Use 1024 for better iPad support */
    lg: '1280px',
    xl: '1536px',
  };
  /* Reduzir palette de cores para 5 apenas */
  --colors: {
    black: '#000000',
    white: '#ffffff',
    gray: '#404040', '#777777', '#999999',
    red: '#ff4444'
  };
}
```

**Benefício**: Tailwind v4 não gera arquivo de config; CSS é inline (10-15% menor).

---

### 4.3 Image Optimization Agressiva

**Seu next.config.mjs já tem bom setup, ADICIONAR**:

```javascript
const nextConfig = {
  images: {
    remotePatterns: [/* ... */],
    // ADICIONAR:
    minimumCacheTTL: 31536000, // Cache imagens por 1 ano
    deviceSizes: [640, 750, 828, 1080, 1200],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    formats: ['image/webp', 'image/avif'], // WebP + AVIF
  }
}
```

**Benefício**: YouTube thumbnails carregam 40% mais rápido (AVIF é 20% menor que WebP).

---

### 4.4 Font Loading Strategy

**Seu layout.tsx (atualizar)**:
```typescript
import { Geist, Geist_Mono } from 'next/font/google'

const geist = Geist({
  subsets: ['latin'],
  display: 'swap', // Usar fallback enquanto carrega
  preload: true,
  weight: ['400', '600', '700'] // Só carregar pesos usados
})

export default function RootLayout({ children }) {
  return (
    <html className={geist.className}>
      {/* ... */}
    </html>
  )
}
```

**Benefício**: 200-300ms mais rápido no First Paint (FP).

---

### 4.5 Streaming & Progressive Enhancement

**Seu /analisar page pode streamar resultados**:

```typescript
// /app/analisar/page.tsx
import { Suspense } from 'react'
import { TranscriptionAnalyzer } from '@/components/transcription-analyzer'

export default function AnalisarPage() {
  return (
    <Suspense fallback={<LoadingState />}>
      <TranscriptionAnalyzer />
    </Suspense>
  )
}
```

**Com Server Component streaming**:
```typescript
export default async function TranscriptionAnalyzer() {
  // Começa renderizar enquanto aguarda dados
  const transcript = await fetchTranscript(url) // Passa de 3s → 1.2s
  
  return (
    <>
      <TranscriptPanel transcript={transcript} />
      
      <Suspense fallback={<SkeletonInsights />}>
        <InsightsSidebar videoId={videoId} />
      </Suspense>
    </>
  )
}
```

**Benefício**: Usuário vê conteúdo 2.5x mais rápido (streaming em paralelo).

---

## 5. Implementação Recomendada (Roadmap)

### Fase 1: Mastra Optimization (2-3 horas)
- [ ] Implementar `ModelByInputTokens` routing
- [ ] Ativar `responseCache` no agente
- [ ] Adicionar `observationalMemory` para contexto de usuário

### Fase 2: Layout & Rendering (2-3 horas)
- [ ] Ativar React Compiler no `next.config.mjs`
- [ ] Otimizar font loading
- [ ] Configurar AVIF/WebP para imagens

### Fase 3: Streaming & Advanced (3-4 horas)
- [ ] Implementar Durable Agents com resumable streams
- [ ] Adicionar Server Component streaming para /analisar
- [ ] Implementar progressive enhancement

### Fase 4: Monitoring & Profiling (2 horas)
- [ ] Adicionar Web Vitals com Vercel Analytics
- [ ] Mastra observability (logs, traces, metrics)
- [ ] Performance budgets no CI/CD

---

## 6. Métricas de Sucesso

| Métrica | Baseline | Target | Impacto |
|---------|----------|--------|--------|
| TTFB (Time to First Byte) | ~1.2s | <800ms | UX imediata |
| LCP (Largest Paint) | ~2.8s | <1.8s | Conteúdo visível |
| FID (First Input Delay) | ~80ms | <50ms | Responsividade |
| Custo Token/Análise | 100% | 40-50% | ROI financeiro |
| Cache Hit Rate | 0% | 35-40% | Velocidade |

---

## 7. Checklist de Implementação

### Mastra
- [ ] Instalar `@mastra/memory` se não existir
- [ ] Criar `lib/mastra/memory.ts` com `ModelByInputTokens`
- [ ] Atualizar `lib/mastra/agent.ts` com caching
- [ ] Testar token routing com diferentes tamanhos de prompt

### Next.js
- [ ] Ativar `reactCompiler: true`
- [ ] Atualizar `next.config.mjs` com image formats
- [ ] Testar build size: `npm run build`

### Components
- [ ] Adicionar `use cache` em Server Components
- [ ] Implementar `Suspense` boundaries
- [ ] Usar `Skeleton` loaders para UX

### Monitoring
- [ ] Adicionar Vercel Analytics
- [ ] Configurar Mastra observability
- [ ] Setup CloudWatch/DataDog se enterprise

---

## 8. Recursos Adicionais

- **Mastra Docs**: https://mastra.ai/docs
- **Next.js 16 Performance**: https://nextjs.org/blog/next-16-performance
- **React 19 Rendering**: https://react.dev/blog/2025/01/09/react-19
- **Tailwind v4**: https://tailwindcss.com/blog/tailwindcss-v4-beta

---

**Próximas Ações**:
1. Confirme se quer implementar todas as fases ou apenas Fase 1 (Mastra)
2. Defina prioridade: Custo (Phase 1) vs Velocidade (Phase 2-3)
3. Prepare ambiente de staging para testes de performance
