# 🎵 YouTube Audio Extraction & Transcription Integration Guide

## 📋 Visão Geral da Arquitetura

Seu projeto **Unoduno** possui uma arquitetura elegante e multi-camadas para download de áudio do YouTube e transcrição:

```
YouTube Link
    ↓
[1] Modal Script (modal_transcriber.py)
    ├─ Detecta se é YouTube
    ├─ Usa yt-dlp com bypass mobile (Android/iOS client)
    ├─ Extrai áudio MP3 via FFmpeg
    └─ Transcreve com Whisper Large-v3 (GPU T4)
    ↓
[2] Ou alternativa: Audio Proxy (app/api/audio-proxy/route.ts)
    ├─ Usa Cobalt API pública
    ├─ Obtém link direto MP3
    └─ Faz redirect para Modal capturar
    ↓
[3] Transcrição Tool (src/mastra/tools/transcribeAudio.ts)
    ├─ Backend Groq: sub-segundo LPU
    ├─ Backend Custom Whisper: microsserviço Modal
    └─ Retorna texto + segmentos + metadata
    ↓
Frontend Modal (captura resultado)
```

---

## 🔧 Como Funciona Atualmente

### 1. **Modal Transcriber (Python Backend)**

**Arquivo:** `scripts/modal_transcriber.py`

**Capacidades:**
- ✅ Detecta links do YouTube (youtube.com, youtu.be)
- ✅ Bypass de Bot usando `yt-dlp` com client mobile (Android/iOS)
- ✅ Download de áudio em MP3 via FFmpeg
- ✅ Transcrição GPU (Whisper Large-v3, float16, VAD Filter)
- ✅ Retorna segmentos com timestamps

**Como é acionado:**
```javascript
// Do transcribeAudio.ts
const response = await fetch(CUSTOM_WHISPER_URL, {
  method: 'POST',
  body: JSON.stringify({
    audio_url: 'https://youtube.com/watch?v=dQw4w9WgXcQ',
    language: 'pt'
  })
});
```

**Resultado:**
```json
{
  "success": true,
  "language": "pt",
  "language_probability": 0.95,
  "duration_seconds": 234.5,
  "text": "Transcrição completa...",
  "segments": [
    {"start": 0.0, "end": 4.2, "text": "Primeira frase..."},
    {"start": 4.2, "end": 8.5, "text": "Segunda frase..."}
  ]
}
```

---

## 🎯 Solução Completa: Download + Modal Modal + Transcrição

### A. **Criar Ferramenta Mastra para Download de Áudio**

```typescript
// src/mastra/tools/youtube-audio-downloader.ts
import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

export const downloadYouTubeAudioTool = createTool({
  id: 'download-youtube-audio',
  description: 'Faz download de áudio em MP3/M4A do YouTube e retorna URL pública',
  inputSchema: z.object({
    videoUrl: z.string().url().describe('URL completa do YouTube'),
    format: z.enum(['mp3', 'm4a']).optional().default('mp3'),
  }),
  execute: async ({ videoUrl, format }) => {
    try {
      // Step 1: Obter link direto via Cobalt API (já existe!)
      const cobaltResponse = await fetch('https://api.cobalt.tools/api/json', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          url: videoUrl,
          isAudioOnly: true,
          aFormat: format,
        })
      });

      if (!cobaltResponse.ok) {
        throw new Error(`Cobalt API error: ${cobaltResponse.status}`);
      }

      const data = await cobaltResponse.json();

      if (data.status === 'error' || !data.url) {
        throw new Error(data.text || 'Cobalt didn\'t return audio URL');
      }

      // Step 2: Se precisar armazenar, usar Vercel Blob
      // const blob = await put(audioPath, audioStream, { access: 'public' });

      return {
        success: true,
        audioUrl: data.url,
        format: format,
        source: 'cobalt-api',
        duration: data.duration || null,
        thumbnail: data.thumbnail || null,
      };
    } catch (error: any) {
      return {
        success: false,
        error: error.message,
      };
    }
  }
});
```

### B. **Criar Agent Especializado para YouTube**

```typescript
// src/mastra/agents/youtubeAudioAgent.ts
import { Agent } from '@mastra/core/agent';
import { downloadYouTubeAudioTool } from '../tools/youtube-audio-downloader';
import { transcribeAudioTool } from '../tools/transcribeAudio';
import { fetchTranscriptTool } from '../tools/youtube';
import { SYSTEM_PROMPTS } from '../prompts/system-prompts';

export const youtubeAudioAgent = new Agent({
  id: 'youtube-audio-agent',
  name: 'YouTube Audio Processor',
  instructions: `Você é um especialista em processar vídeos do YouTube.
Seu objetivo é:
1. Analisar o link do YouTube fornecido
2. Fazer download do áudio em MP3 ou M4A
3. Transcrever usando o backend mais eficiente (Groq para velocidade, Modal para qualidade)
4. Retornar transcrição com segmentos e timestamps

Sempre valide a URL do YouTube antes de processar.
Se houver erro, tente métodos alternativos (Groq vs Modal).
Comunicar progresso ao usuário claramente.`,
  model: 'google/gemini-2.5-pro',
  tools: {
    downloadAudio: downloadYouTubeAudioTool,
    transcribeAudio: transcribeAudioTool,
    fetchTranscript: fetchTranscriptTool,
  },
  maxSteps: 12,
  settings: {
    enableMemory: true,
    enableStructuredOutput: true,
    enableErrorRecovery: true,
  },
});
```

### C. **API Route para Modal de Transcrição**

```typescript
// app/api/mastra/youtube-to-transcript/route.ts
import { NextResponse } from 'next/server';
import { mastra } from '@/src/mastra';
import { YoutubeTranscriptionSchema } from '@/src/mastra/schemas/analysis';

export const maxDuration = 300; // 5 minutos

export async function POST(request: Request) {
  try {
    const { videoUrl, format = 'mp3' } = await request.json();

    if (!videoUrl) {
      return NextResponse.json(
        { error: 'videoUrl é obrigatória' },
        { status: 400 }
      );
    }

    // Validar URL do YouTube
    const youtubeRegex = /^(https:\/\/)?(www\.)?(youtube|youtu|youtube-nocookie)\.(com|be)\//;
    if (!youtubeRegex.test(videoUrl)) {
      return NextResponse.json(
        { error: 'URL não é um link válido do YouTube' },
        { status: 400 }
      );
    }

    // Executar agent especializado
    const result = await mastra.agents.youtubeAudioAgent.generate(
      `Por favor, processe este vídeo do YouTube:
      URL: ${videoUrl}
      Formato de áudio: ${format}
      
      1. Faça download do áudio
      2. Transcreva o áudio
      3. Retorne a transcrição em JSON com estrutura: { 
        audioUrl, 
        transcript, 
        segments: [{start, end, text}],
        duration,
        language
      }`
    );

    // Validar e retornar
    const validated = YoutubeTranscriptionSchema.parse(JSON.parse(result));
    return NextResponse.json(validated);

  } catch (error: any) {
    console.error('[YouTube Transcription API]', error);
    return NextResponse.json(
      { error: error.message || 'Erro ao processar vídeo' },
      { status: 500 }
    );
  }
}
```

### D. **Schema de Validação**

```typescript
// src/mastra/schemas/analysis.ts (adicionar)
export const YoutubeTranscriptionSchema = z.object({
  audioUrl: z.string().url(),
  transcript: z.string(),
  segments: z.array(z.object({
    start: z.number(),
    end: z.number(),
    text: z.string(),
  })),
  duration: z.number().optional(),
  language: z.string(),
  metadata: z.object({
    title: z.string().optional(),
    author: z.string().optional(),
    thumbnail: z.string().url().optional(),
  }).optional(),
});
```

---

## 🚀 Como Usar no Frontend

### Exemplo com React:

```typescript
// components/youtube-transcriber.tsx
'use client';

import { useState } from 'react';
import { Loader2 } from 'lucide-react';

export function YouTubeTranscriber() {
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);

  const handleTranscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/mastra/youtube-to-transcript', {
        method: 'POST',
        body: JSON.stringify({
          videoUrl,
          format: 'mp3',
        }),
      });

      if (!response.ok) throw new Error('Transcription failed');
      
      const data = await response.json();
      setResult(data);
    } catch (error) {
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="text"
        placeholder="Cole o link do YouTube..."
        value={videoUrl}
        onChange={(e) => setVideoUrl(e.target.value)}
        className="w-full p-2 border rounded"
      />

      <button
        onClick={handleTranscribe}
        disabled={loading}
        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded"
      >
        {loading && <Loader2 className="animate-spin w-4 h-4" />}
        Transcrever
      </button>

      {result && (
        <div className="space-y-4">
          <h3>Áudio: <a href={result.audioUrl} target="_blank">Download MP3</a></h3>
          <div className="bg-gray-100 p-4 rounded">
            <p>{result.transcript}</p>
          </div>
          <div className="space-y-2">
            {result.segments.map((seg, i) => (
              <div key={i} className="text-sm p-2 border-l-2">
                <span className="font-mono text-gray-600">
                  {seg.start.toFixed(2)}s - {seg.end.toFixed(2)}s:
                </span>
                {' '}{seg.text}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
```

---

## ⚙️ Configuração Necessária

### 1. **Variáveis de Ambiente**

```bash
# .env.local
CUSTOM_WHISPER_URL=https://seu-modal-endpoint.modal.run
GROQ_API_KEY=gsk_xxxxx  # Para transcrição ultra-rápida
```

### 2. **Deploy Modal (se usar backend customizado)**

```bash
modal deploy scripts/modal_transcriber.py
# Obterá uma URL pública como:
# https://seu-usuario--unoduno-transcriber.modal.run
```

### 3. **Vercel Blob (para armazenar áudios persistentemente)**

```typescript
import { put } from '@vercel/blob';

const blob = await put(`audio/${videoId}.mp3`, audioStream, {
  access: 'public'
});
```

---

## 🎯 Fluxo Recomendado para Modal do Frontend

```
[Modal de Transcrição]
    ↓
1. Input: URL do YouTube
    ↓
2. Loading State (mostra progresso)
    ↓
3. POST /api/mastra/youtube-to-transcript
    ↓
4. Backend:
    - Valida URL
    - Faz download de áudio (Cobalt API)
    - Transcreve (Modal + Whisper)
    - Retorna dados
    ↓
5. Frontend renderiza:
    - Link para download do MP3
    - Transcrição completa
    - Segmentos com timestamps
    - Metadados (duração, idioma, etc)
```

---

## 🔄 Alternativas e Trade-offs

| Método | Velocidade | Qualidade | Custo | Confiabilidade |
|--------|-----------|-----------|-------|----------------|
| **Groq Whisper** | ⚡⚡⚡ Ultra-rápido | ⭐⭐⭐⭐ | $ Baixo | ⭐⭐⭐⭐ |
| **Modal + Whisper Large-v3** | ⚡⚡ Rápido | ⭐⭐⭐⭐⭐ Melhor | $$ Médio | ⭐⭐⭐⭐ |
| **Google Cloud STT** | ⚡ Normal | ⭐⭐⭐⭐ | $$$ Alto | ⭐⭐⭐⭐⭐ |

---

## ✅ Checklist de Implementação

- [ ] Criar `youtube-audio-downloader.ts` tool
- [ ] Criar `youtubeAudioAgent.ts` agent
- [ ] Adicionar schema `YoutubeTranscriptionSchema`
- [ ] Criar API route `/api/mastra/youtube-to-transcript`
- [ ] Criar componente React `YouTubeTranscriber`
- [ ] Testar com URL real do YouTube
- [ ] Configurar variáveis de ambiente
- [ ] Adicionar tratamento de erro robusto
- [ ] Documentar uso no README

---

## 📚 Referências

- [Cobalt API](https://cobalt.tools/)
- [yt-dlp Documentação](https://github.com/yt-dlp/yt-dlp)
- [Faster-Whisper](https://github.com/SYSTRAN/faster-whisper)
- [Modal Labs](https://modal.com/)
- [Groq Whisper](https://groq.com/)
