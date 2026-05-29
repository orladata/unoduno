# Guia de Deployment - Unoduno Mastra Enhancement

## Status Atual

✅ **Todas as mudanças estão commitadas e fazidas push para a branch `ai-tool-research`**

## Opção 1: Deploy via Vercel Dashboard (Recomendado)

1. Acesse: https://vercel.com/dashboard
2. Vá para o projeto: **unoduno**
3. Verifique se a branch **ai-tool-research** foi detectada
4. Clique em "Deploy" para fazer deploy em produção
5. Confirme quando solicitado

### O que será deployado:
- ✅ Sistema de System Prompts avançados (7 prompts)
- ✅ 6 agents especializados (incluindo YouTube Audio)
- ✅ 7 ferramentas especializadas
- ✅ Schemas de validação com Zod
- ✅ Error handling robusto
- ✅ Workflow orchestration pipeline
- ✅ API routes completas para análise e transcrição
- ✅ 1.500+ linhas de documentação

## Opção 2: Deploy via CLI com Token

```bash
# 1. Obtenha seu VERCEL_TOKEN em: https://vercel.com/account/tokens
# 2. Execute:
VERCEL_TOKEN=your_token_here vercel deploy --prod
```

## Opção 3: Deploy Automático via GitHub

O repositório `orladata/unoduno` está conectado ao Vercel. Para deploy automático:

1. Acesse: https://github.com/orladata/unoduno/settings/deployment
2. Verifique se a integração Vercel está ativa
3. Faça um push para `master` ou use o Vercel Dashboard

## Arquivos Principais Adicionados

```
src/mastra/
├── prompts/
│   └── system-prompts.ts          # 7 prompts avançados
├── agents/
│   ├── contentStrategist.ts        # Novo agent
│   ├── viralAnalyst.ts             # Novo agent
│   ├── researchOrchestrator.ts     # Novo agent
│   ├── youtubeAudioAgent.ts        # NOVO: YouTube Audio
│   └── [agentes modificados]       # Com prompts avançados
├── schemas/
│   └── analysis.ts                 # Schemas com YouTube
├── utils/
│   └── error-handler.ts            # Error handling robusto
├── workflows/
│   └── analysis-pipeline.ts        # Pipeline orchestration
└── docs/
    └── [múltiplos guias]           # Documentação completa

lib/mastra/tools/
├── demographics.ts                 # Ferramenta demográfica
├── competitor.ts                   # Análise de competitors
├── performance.ts                  # Métricas de performance
├── trends-advanced.ts              # Análise de trends
└── youtube-audio-downloader.ts     # NOVO: Download de áudio

app/api/mastra/
├── analyze-enhanced/route.ts       # API análise melhorada
└── youtube-to-transcript/route.ts  # NOVO: API YouTube
```

## Endpoints Disponíveis Após Deploy

### 1. Transcrição de YouTube
```bash
POST /api/mastra/youtube-to-transcript
Content-Type: application/json

{
  "videoUrl": "https://youtube.com/watch?v=...",
  "transcriptionBackend": "groq" or "modal"
}

Response:
{
  "success": true,
  "videoId": "...",
  "audioUrl": "...",
  "transcript": "...",
  "segments": [...],
  "metadata": {...},
  "transcriptionStats": {...}
}
```

### 2. Análise Completa
```bash
POST /api/mastra/analyze-enhanced
Content-Type: application/json

{
  "videoUrl": "https://youtube.com/watch?v=...",
  "analysisType": "expert",
  "includeYouTubeAnalysis": true
}
```

## Documentação Gerada

Após deploy, acesse os documentos:
- `YOUTUBE_AUDIO_SUMMARY.md` - Overview executivo
- `YOUTUBE_AUDIO_SOLUCAO_COMPLETA.md` - Solução completa
- `PROJECT_COMPLETION_REPORT.md` - Relatório técnico
- `MASTRA_COMPLETE.md` - Documentação Mastra

## Verificação Pós-Deploy

Após fazer o deploy, teste os endpoints:

```bash
# Test health check
curl https://your-deployment-url/api/mastra/youtube-to-transcript

# Test YouTube transcription
curl -X POST https://your-deployment-url/api/mastra/youtube-to-transcript \
  -H "Content-Type: application/json" \
  -d '{"videoUrl": "https://youtube.com/watch?v=dQw4w9WgXcQ"}'
```

## Variáveis de Ambiente Necessárias

No Vercel Dashboard, adicione:

```
GROQ_API_KEY=gsk_xxxxx
CUSTOM_WHISPER_URL=https://modal-endpoint.modal.run
GOOGLE_API_KEY=xxxxx (opcional)
```

## Git Info

- **Repo**: https://github.com/orladata/unoduno
- **Branch**: ai-tool-research
- **Vercel Project**: prj_AewbAwuSETzWvZCPm92n0R7N8wxr
- **Team**: sonarycorporation-5932s-projects

## Troubleshooting

### Se o deploy falhar:
1. Verifique as environment variables no Vercel Dashboard
2. Confirme que todas as dependências estão em `package.json`
3. Verifique os logs: `vercel logs <url>`

### Se os endpoints não responderem:
1. Verifique se as variáveis de ambiente foram adicionadas
2. Teste localmente: `npm run dev`
3. Verifique os build logs no Vercel Dashboard

## Próximos Passos

Após deploy bem-sucedido:
1. Teste todos os endpoints em produção
2. Configure webhooks se necessário
3. Monitore performance no Vercel Dashboard
4. Adicione alertas para erros críticos

---

**Status**: ✅ Pronto para Deploy
**Última atualização**: 2024
**Autor**: v0 AI
