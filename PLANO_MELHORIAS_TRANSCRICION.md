# 📝 Plano de Melhorias: Sistema de Transcrição do Unoduno

## Status Atual: ✅ ESTRUTURA JÁ EXISTE

O Unoduno **já possui uma arquitetura robusta de transcrição**. O trabalho agora é:
1. Melhorar e otimizar
2. Adicionar funcionalidades avançadas
3. Integrar com o design neon green
4. Melhorar UX/Performance

---

## 📊 O Que Já Existe

### Backend APIs
```
✅ /api/transcription/route.ts
   - Busca transcricoes do R2 (Cloudflare)
   - Valida video IDs do YouTube
   - Múltiplas estratégias de fallback
   - Auth via Clerk

✅ /api/transcription/refine/route.ts
   - Refina transcricoes com Gemini AI
   - Streaming de resposta
   - Suporta português brasileiro

✅ /api/mastra/youtube-to-transcript/route.ts
   - Outra forma de obter transcrições
```

### Frontend Components
```
✅ app/dashboard/transcrever/page.tsx (567 linhas)
   - Upload URL do YouTube
   - Preview de thumbnails
   - Display de transcrição original
   - Botão para refinar com Gemini
   - Copy to clipboard
   - Auto-scroll inteligente

✅ components/TranscriptionChat.tsx
   - Chat interface alternativa
   - Mastra integration

✅ components/transcription-analyzer.tsx
   - Análise de transcrição
   - Themes, chapters, insights
```

### Storage & Database
```
✅ Cloudflare R2 (S3-compatible)
   - Armazena transcrições processadas
   - Cache inteligente com múltiplas chaves
   - Fallback automático

✅ Supabase
   - Users, profiles, subscriptions
   - Histórico de análises
```

---

## 🎯 Melhorias Necessárias (Por Prioridade)

### FASE 1: CRÍTICAS (Implementar Agora - 2-3 dias)

#### 1.1 Atualizar Colors para Neon Green
**Status:** 30% feito (frontend está 90%, backend precisa sincronização)

**O que fazer:**
- [ ] Atualizar gradientes violeta → neon green em `transcrever/page.tsx`
- [ ] Mudar botão "Corrigir com Gemini" de violeta → neon green
- [ ] Atualizar labels (TRANSCRIÇÃO BRUTA, TRANSCRIÇÃO REFINADA) cores
- [ ] Sincronizar spinners/loaders com neon green

**Arquivo:** `app/dashboard/transcrever/page.tsx` linhas 236-449

**Mudanças:**
```tsx
// ANTES
gradient-text-violet    → text-transparent bg-clip-text bg-gradient-to-r from-[#00ff41] to-[#00dd3d]
bg-gradient-to-r from-violet-600 to-blue-600  → bg-gradient-to-r from-[#00ff41] to-[#00dd3d]
border-cyan-500/20      → border-[#00ff41]/20
bg-cyan-500/15          → bg-[#00ff41]/15
text-cyan-400           → text-[#00ff41]
```

---

#### 1.2 Melhorar Layout Mobile
**Status:** 80% pronto (precisa pequenos ajustes)

**O que fazer:**
- [ ] Testar em iPhone 14/15 (375px width)
- [ ] Verificar scroll behavior em pequenas telas
- [ ] Melhorar spacing vertical em mobile
- [ ] Aumentar touch targets para 44px mínimo

**Arquivo:** `app/dashboard/transcrever/page.tsx` (responsivo)

---

#### 1.3 Suporte a Upload de Arquivo Local
**Status:** 0% (NÃO EXISTE)

**O que adicionar:**
Usuários podem não querer usar YouTube. Precisamos de:

1. Upload de MP3/WAV/M4A local
2. Backend processing com Whisper AI
3. Upload para R2
4. Retornar transcrição

**Implementação:**

```bash
Instalar: npm install ffmpeg-static
```

**Novo arquivo:** `app/api/transcription/upload/route.ts`

```typescript
// Pseudocode
export async function POST(req: Request) {
  const formData = await req.formData()
  const file = formData.get('file') as File
  
  // Validar tipo MIME
  if (!['audio/mpeg', 'audio/wav', 'audio/m4a'].includes(file.type)) {
    return Response.json({ error: 'Formato não suportado' }, { status: 400 })
  }
  
  // Converter para WAV se necessário
  const buffer = await file.arrayBuffer()
  const wavBuffer = await convertToWav(buffer)
  
  // Enviar para Whisper
  const transcription = await whisperTranscribe(wavBuffer)
  
  // Salvar em R2
  await saveToR2(`user-uploads/${userId}/${Date.now()}.json`, transcription)
  
  return Response.json({ transcript: transcription.text })
}
```

**UI Changes:** `app/dashboard/transcrever/page.tsx`

```tsx
// Adicionar area de drag-drop para upload
<div className="mt-4 border-2 border-dashed border-[#00ff41]/30 rounded-xl p-8">
  <input type="file" accept="audio/*" onChange={handleFileUpload} />
</div>
```

---

#### 1.4 Histórico de Transcrições
**Status:** 50% (existe page, precisa melhoria visual)

**O que fazer:**
- [ ] Lister todas transcrições do usuário (ja no DB?)
- [ ] Adicionar search/filter
- [ ] Mostrar data, duração, palavra-count
- [ ] Botão para re-refinar antigas
- [ ] Deletar transcrições
- [ ] Exportar para PDF/DOCX

**Arquivo:** `app/dashboard/historico/historico-client.tsx`

---

### FASE 2: MODERADAS (Implementar Depois - 3-5 dias)

#### 2.1 Suporte a Múltiplos Idiomas
**Status:** 10% (Gemini suporta, UI não)

**Adicionar:**
```tsx
// Language selector antes de transcrever
<select value={language} onChange={setLanguage}>
  <option value="pt-BR">Português (Brasil)</option>
  <option value="en">English</option>
  <option value="es">Español</option>
  <option value="fr">Français</option>
</select>

// Enviar para refine
const res = await fetch('/api/transcription/refine', {
  body: JSON.stringify({ transcript, language })
})
```

---

#### 2.2 Exportar para Múltiplos Formatos
**Status:** 0% (só tem copy-to-clipboard)

**Adicionar:**
- [ ] Download como TXT
- [ ] Download como PDF (com formatação)
- [ ] Download como DOCX (editable)
- [ ] Export para SRT (subtitles)
- [ ] Copy as Markdown
- [ ] Copy com timestamps

**Instalar:**
```bash
npm install jspdf pdfkit docx
```

**Novo arquivo:** `lib/export-transcript.ts`

```typescript
export async function exportAsPDF(transcript: string, title: string) {
  const doc = new jsPDF()
  doc.text(title, 10, 10)
  doc.text(transcript, 10, 20)
  doc.save(`${title}.pdf`)
}

export async function exportAsDOCX(transcript: string, title: string) {
  const doc = new Document({
    sections: [{
      children: [
        new Paragraph({ text: title, bold: true, size: 32 }),
        new Paragraph({ text: transcript })
      ]
    }]
  })
  Packer.toBuffer(doc).then(buffer => {
    // Download file
  })
}
```

---

#### 2.3 Análise de Sentimento
**Status:** 0% (não existe)

**Adicionar após refinar:**
- Detect sentimentos (positivo, negativo, neutro)
- Highlight frases-chave
- Extrair entidades (nomes, lugares, datas)
- Sugerir próximas ações

**Usar:** Gemini's text analysis ou nlp library

---

#### 2.4 Timecodes / Timestamps
**Status:** 5% (YouTube tem, mas não mostramos)

**Adicionar:**
```tsx
// Mostrar timestamps próximas de cada parágrafo
// Usar data do YouTube transcript
// Clickable para abrir vídeo em timestamp

[00:00] Olá, bem vindo
[00:15] Hoje vamos falar sobre...
[00:45] Primeiro ponto importante...

// Click em "[00:45]" abre YouTube com start=45
```

---

### FASE 3: OTIMIZAÇÕES (Semana 2)

#### 3.1 Performance Optimization
- [ ] Lazy-load transcripts grandes (>10K palavras)
- [ ] Virtual scrolling para transcrições muito longas
- [ ] Compression antes de enviar para API
- [ ] Cache local com Service Workers

#### 3.2 Inteligência Artificial Avançada
- [ ] Resumo automático (5 linhas, 1 parágrafo)
- [ ] Extração de ação itens (TODOs)
- [ ] Detectar duplicatas (mesma transcrição re-feita)
- [ ] Sugerir melhorias na leitura/dicção

#### 3.3 Colaboração
- [ ] Compartilhar transcrição com link
- [ ] Comentários em transcrição
- [ ] Versioning/tracking de mudanças

---

## 💾 Estrutura de Dados

### Banco de Dados (Supabase)
```sql
-- Ja deve existir algo assim:
CREATE TABLE transcriptions (
  id UUID PRIMARY KEY,
  user_id UUID NOT NULL,
  video_id VARCHAR(11),
  title VARCHAR(255),
  original_transcript TEXT,
  refined_transcript TEXT,
  language VARCHAR(10),
  word_count INT,
  file_source VARCHAR(50), -- 'youtube' | 'upload'
  file_url VARCHAR(255),
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW(),
  metadata JSONB
);

CREATE INDEX idx_transcriptions_user_id ON transcriptions(user_id);
CREATE INDEX idx_transcriptions_created_at ON transcriptions(created_at DESC);
```

### R2 Bucket Structure
```
whispercore/
├─ transcricoes/         (Cerebrium format)
│  └─ {videoId}.json
├─ user-uploads/         (New - para uploads locais)
│  └─ {userId}/
│     └─ {timestamp}.json
└─ exports/              (New - para PDFs/DOCXs)
   └─ {userId}/
      └─ {transcriptionId}.pdf
```

---

## 🚀 Implementação Step-by-Step

### Semana 1: Essencial
```
Day 1-2: Atualizar colors → neon green
Day 2-3: Suporte a upload local (MP3/WAV)
Day 3: Melhorar histórico de transcrições
Day 4-5: Exportar em múltiplos formatos
```

### Semana 2: Avançado
```
Day 1-2: Timestamps/timecodes
Day 2-3: Multi-language support
Day 3-4: Sentiment analysis
Day 5: Performance optimizations
```

---

## 📦 Dependências Necessárias

### A Instalar
```bash
npm install ffmpeg-static             # Audio processing
npm install jspdf                      # PDF export
npm install pdfkit                     # PDF creation
npm install docx                       # DOCX export
npm install express-fileupload         # File upload (if needed)
```

### Já Tem
```
✅ @ai-sdk/google (Gemini)
✅ framer-motion (animations)
✅ zod (validation)
✅ @clerk/nextjs (auth)
✅ sonner (notifications)
✅ youtube-transcript (get transcripts)
```

---

## ✅ Checklist para Implementação

### FASE 1: CRÍTICA
- [ ] Cor neon green em transcrever page
- [ ] Upload local de arquivos de áudio
- [ ] Melhorar histórico com busca
- [ ] Exportar TXT/PDF básico

### FASE 2: MODERADA
- [ ] Multi-idioma
- [ ] Timestamps do vídeo
- [ ] Exportar DOCX
- [ ] Análise de sentimento

### FASE 3: OTIMIZAÇÃO
- [ ] Performance (lazy-load, virtual scroll)
- [ ] Resumo automático
- [ ] Colaboração/compartilhamento
- [ ] Detecção de duplicatas

---

## 🎯 Recomendação

**Comece com FASE 1** (2-3 dias de trabalho):
1. Atualizar cores neon green (30 min)
2. Upload local de áudio (4 horas)
3. Histórico melhorado (3 horas)
4. Exports básicos (4 horas)

Isso **30-40% de melhoria visível** e pronto para produção.

Depois, escalona para FASE 2 e 3 baseado em feedback dos usuários.

