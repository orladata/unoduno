# 🎵 Quick Start: YouTube Audio Download + Transcription

## 1. Uso Básico da API

### Requisição
```bash
curl -X POST http://localhost:3000/api/mastra/youtube-to-transcript \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "format": "mp3",
    "transcriptionBackend": "auto"
  }'
```

### Resposta (Success)
```json
{
  "success": true,
  "videoId": "dQw4w9WgXcQ",
  "audioUrl": "https://storage.example.com/audio/dQw4w9WgXcQ.mp3",
  "transcript": "Never gonna give you up never gonna let you down...",
  "segments": [
    {
      "start": 0.0,
      "end": 3.2,
      "text": "Never gonna give you up"
    },
    {
      "start": 3.2,
      "end": 6.5,
      "text": "never gonna let you down"
    }
  ],
  "metadata": {
    "title": "Rick Astley - Never Gonna Give You Up",
    "author": "Rick Astley",
    "duration": 213.5,
    "language": "en",
    "languageProbability": 0.98,
    "thumbnail": "https://i.ytimg.com/vi/dQw4w9WgXcQ/maxresdefault.jpg"
  },
  "transcriptionStats": {
    "wordCount": 847,
    "averageWordsPerSegment": 12,
    "totalSegments": 71,
    "processingTimeSeconds": 8.2,
    "backend": "groq"
  },
  "timestamp": "2024-01-15T10:30:45.123Z",
  "processingTimeSeconds": 8.5,
  "status": "completed"
}
```

---

## 2. Integração no Frontend

### React Component

```typescript
// components/TranscriptionModal.tsx
'use client';

import { useState, useRef, useEffect } from 'react';
import { Loader2, Download, Copy, ChevronDown } from 'lucide-react';

interface Segment {
  start: number;
  end: number;
  text: string;
}

interface TranscriptionResult {
  success: boolean;
  videoId: string;
  audioUrl: string;
  transcript: string;
  segments: Segment[];
  metadata: {
    title: string;
    author: string;
    duration: number;
    language: string;
    thumbnail?: string;
  };
  transcriptionStats: {
    wordCount: number;
    processingTimeSeconds: number;
    backend: string;
  };
}

export function TranscriptionModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [videoUrl, setVideoUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<TranscriptionResult | null>(null);
  const [expandedSegment, setExpandedSegment] = useState<number | null>(null);
  const [copied, setCopied] = useState(false);

  const handleTranscribe = async () => {
    if (!videoUrl.trim()) {
      alert('Cole um link do YouTube válido');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/mastra/youtube-to-transcript', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          videoUrl: videoUrl.trim(),
          format: 'mp3',
          transcriptionBackend: 'auto',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao transcrever');
      }

      const data = await response.json();
      setResult(data);
      setVideoUrl('');
    } catch (error) {
      console.error('Error:', error);
      alert(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyTranscript = () => {
    if (result) {
      navigator.clipboard.writeText(result.transcript);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleDownloadAudio = () => {
    if (result) {
      const a = document.createElement('a');
      a.href = result.audioUrl;
      a.download = `${result.videoId}.mp3`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
    }
  };

  if (!isOpen) {
    return (
      <button
        onClick={() => setIsOpen(true)}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
      >
        🎵 Transcrever YouTube
      </button>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
        
        {/* Header */}
        <div className="sticky top-0 bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
          <h2 className="text-2xl font-bold">🎵 YouTube to Transcript</h2>
          <button
            onClick={() => {
              setIsOpen(false);
              setResult(null);
            }}
            className="text-2xl hover:opacity-80"
          >
            ✕
          </button>
        </div>

        <div className="p-6 space-y-6">
          
          {!result ? (
            <>
              {/* Input Section */}
              <div className="space-y-3">
                <label className="block text-sm font-semibold text-gray-700">
                  Cole o link do YouTube
                </label>
                <input
                  type="text"
                  placeholder="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
                  value={videoUrl}
                  onChange={(e) => setVideoUrl(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter') handleTranscribe();
                  }}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  disabled={loading}
                />
              </div>

              {/* Button */}
              <button
                onClick={handleTranscribe}
                disabled={loading || !videoUrl.trim()}
                className="w-full py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {loading && <Loader2 className="w-5 h-5 animate-spin" />}
                {loading ? 'Processando...' : 'Transcrever'}
              </button>
            </>
          ) : (
            <>
              {/* Results Section */}
              
              {/* Video Info */}
              <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                {result.metadata.thumbnail && (
                  <img
                    src={result.metadata.thumbnail}
                    alt={result.metadata.title}
                    className="w-full h-40 object-cover rounded"
                  />
                )}
                <h3 className="font-bold text-lg">{result.metadata.title}</h3>
                <p className="text-sm text-gray-600">
                  por {result.metadata.author}
                </p>
                <div className="flex gap-2 text-xs text-gray-600">
                  <span>⏱️ {(result.metadata.duration / 60).toFixed(1)}min</span>
                  <span>📝 {result.transcriptionStats.wordCount} palavras</span>
                  <span>🚀 Modal Whisper</span>
                </div>
              </div>

              {/* Download Button */}
              <button
                onClick={handleDownloadAudio}
                className="w-full py-2 bg-green-600 text-white font-semibold rounded-lg hover:bg-green-700 flex items-center justify-center gap-2"
              >
                <Download className="w-4 h-4" />
                Baixar Áudio (MP3)
              </button>

              {/* Transcript Section */}
              <div className="space-y-3">
                <div className="flex justify-between items-center">
                  <h4 className="font-bold text-gray-900">Transcrição Completa</h4>
                  <button
                    onClick={handleCopyTranscript}
                    className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded flex items-center gap-1"
                  >
                    <Copy className="w-4 h-4" />
                    {copied ? 'Copiado!' : 'Copiar'}
                  </button>
                </div>
                <p className="bg-gray-100 p-4 rounded-lg text-gray-900 leading-relaxed max-h-40 overflow-y-auto">
                  {result.transcript}
                </p>
              </div>

              {/* Segments Timeline */}
              <div className="space-y-3">
                <h4 className="font-bold text-gray-900">Segmentos com Timestamps</h4>
                <div className="space-y-2 max-h-48 overflow-y-auto">
                  {result.segments.map((segment, idx) => (
                    <button
                      key={idx}
                      onClick={() =>
                        setExpandedSegment(
                          expandedSegment === idx ? null : idx
                        )
                      }
                      className="w-full text-left p-3 bg-gray-100 hover:bg-gray-200 rounded-lg transition"
                    >
                      <div className="flex justify-between items-start gap-2">
                        <div className="flex-1">
                          <p className="text-xs font-mono text-gray-600">
                            {segment.start.toFixed(2)}s - {segment.end.toFixed(2)}s
                          </p>
                          <p className="text-sm text-gray-900 font-medium mt-1">
                            {segment.text}
                          </p>
                        </div>
                        <ChevronDown
                          className={`w-4 h-4 text-gray-600 transition ${
                            expandedSegment === idx ? 'rotate-180' : ''
                          }`}
                        />
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stats */}
              <div className="bg-blue-50 p-4 rounded-lg text-sm text-gray-700">
                <p className="font-semibold mb-2">Estatísticas:</p>
                <ul className="space-y-1 text-xs">
                  <li>
                    ⚡ Tempo de processamento:{' '}
                    {result.processingTimeSeconds.toFixed(1)}s
                  </li>
                  <li>🔤 Total de palavras: {result.transcriptionStats.wordCount}</li>
                  <li>📊 Segmentos: {result.segments.length}</li>
                  <li>🎯 Idioma: {result.metadata.language.toUpperCase()}</li>
                </ul>
              </div>

              {/* Back Button */}
              <button
                onClick={() => setResult(null)}
                className="w-full py-2 bg-gray-200 text-gray-900 font-semibold rounded-lg hover:bg-gray-300"
              >
                ← Transcrever Outro Vídeo
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
```

---

## 3. Enviar do Modal para Transcrição

```typescript
// Dentro do seu componente modal
const handleSendToTranscription = async (audioUrl: string) => {
  // A URL do áudio já está disponível!
  // Você pode:
  
  // Opção 1: Enviar para outro componente
  setSelectedAudioUrl(audioUrl);
  
  // Opção 2: Fazer POST direto para transcrição adicional
  const transcriptionResponse = await fetch('/api/mastra/transcribe', {
    method: 'POST',
    body: JSON.stringify({
      audioUrl: audioUrl, // URL pública do MP3
      language: 'pt',
      backend: 'groq', // ou 'custom_whisper'
    }),
  });
};
```

---

## 4. Configuração de Ambiente

```bash
# .env.local
NEXT_PUBLIC_API_URL=http://localhost:3000

# Para transcrição via Modal (recomendado - melhor qualidade)
CUSTOM_WHISPER_URL=https://seu-usuario--unoduno-transcriber.modal.run

# Opcional: Vercel Blob para armazenar áudios
BLOB_READ_WRITE_TOKEN=your_token_here
```

---

## 5. Fluxo Recomendado

```
┌─────────────────────────────────────┐
│   1. Modal Aberto                   │
│   Input: URL do YouTube             │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   2. POST /api/mastra/youtube...    │
│   - Valida URL                      │
│   - Download áudio (Cobalt API)     │
│   - Transcreve (Groq/Modal)         │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   3. Resposta com:                  │
│   - audioUrl (MP3 público)          │
│   - transcript (texto completo)     │
│   - segments (timestamps)           │
│   - metadata (título, autor, etc)   │
└──────────────┬──────────────────────┘
               │
               ▼
┌─────────────────────────────────────┐
│   4. Renderizar Resultados          │
│   - Mostra transcrição              │
│   - Botão download de áudio         │
│   - Timeline de segmentos           │
│   - Copia transcript para clipboard │
└─────────────────────────────────────┘
```

---

## 6. Tratamento de Erros

```typescript
const handleError = (error: any) => {
  if (error.message.includes('YouTube')) {
    alert('Link do YouTube inválido ou inacessível');
  } else if (error.message.includes('transcrição')) {
    alert('Erro ao transcrever áudio. Tente novamente.');
  } else if (error.message.includes('timeout')) {
    alert('Vídeo muito longo. Tente um vídeo menor.');
  } else {
    alert('Erro desconhecido. Entre em contato com suporte.');
  }
};
```

---

## 7. Performance e Benchmarks

| Ação | Tempo Típico | Backend |
|------|--------------|---------|
| Validação URL | <100ms | Browser |
| Download áudio | 2-10s | Cobalt API |
| Transcrição 10min | 25-45s | Modal |
| Resposta Total | 30-60s | Modal |

---

## 8. Próximas Melhorias

- [ ] Armazenar transcrições em cache
- [ ] Suporte a múltiplos idiomas
- [ ] Edição de transcrição inline
- [ ] Export para docx/pdf
- [ ] Sincronização com vídeo
- [ ] Busca dentro da transcrição
