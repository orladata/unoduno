# DEPLOYMENT GUIDE - Unoduno Production

## Overview

Este guia descreve como fazer deploy automático do Unoduno com:
- Bright Data proxy residencial (setup automático via API)
- Modal Worker (yt-dlp + Whisper)
- Frontend com extração de cookies
- Vercel em produção

**Tempo estimado: 30-45 minutos**
**Taxa de sucesso esperada: 95%+**

## Pré-requisitos

### 1. Contas Necessárias

- ✅ **Bright Data** - https://www.brightdata.com
  - API Key e Username (solicitadas durante deploy)
  - Conta com acesso a proxy residencial

- ✅ **Modal** - https://modal.com
  - Conta com Vercel (automático se usar vercel)
  - `modal` CLI autenticado

- ✅ **Vercel** - https://vercel.com
  - Projeto conectado ao GitHub
  - `vercel` CLI autenticado

### 2. Ferramentas Instaladas

```bash
# Modal CLI
pip install modal
modal setup  # Autenticar

# Vercel CLI
npm install -g vercel
vercel login  # Autenticar

# Python 3.8+
python3 --version
```

### 3. Variáveis de Ambiente

Antes de rodar o script:

```bash
export BRIGHT_DATA_API_KEY="your_api_key_here"
export BRIGHT_DATA_USERNAME="your_username_here"
```

Ou será pedido durante a execução.

## Deployment Automático (Recomendado)

### Opção 1: Script Bash (Todos os passos automáticos)

```bash
chmod +x scripts/deploy_production.sh
./scripts/deploy_production.sh
```

O script:
1. ✅ Valida ambiente (CLIs, dependências)
2. ✅ Faz setup Bright Data via API
3. ✅ Deploy Modal Worker
4. ✅ Compila TypeScript
5. ✅ Deploy Vercel produção
6. ✅ Testa endpoints

**Output esperado:**
```
========================================
PASSO 1: Validando Ambiente
========================================
✅ Diretório do projeto validado
✅ modal CLI encontrado
✅ vercel CLI encontrado
✅ python3 encontrado
✅ Variáveis de ambiente validadas

========================================
PASSO 2: Setup Bright Data (Auto)
========================================
Executando script de auto-setup...
[Bright Data] Testando conexão com API...
[Bright Data] ✅ Conexão bem-sucedida!
[Bright Data] Criando zona: unoduno-youtube-zone
[Bright Data] ✅ Zona criada com sucesso!

========================================
PASSO 3: Deploy Modal Worker
========================================
Fazendo deploy do Modal Worker...
✅ Modal Worker deployado com sucesso
Cole a URL do Modal Worker: https://seu-account--unoduno-audio-extractor.modal.run

========================================
PASSO 4: Build Local
========================================
✅ Build completado com sucesso

========================================
PASSO 5: Deploy Vercel Produção
========================================
✅ Deploy em produção completado!

========================================
PASSO 6: Validação Final
========================================
✅ Health check passed

========================================
DEPLOYMENT COMPLETO
========================================
✅ Sistema em produção com:
  ✅ Bright Data proxy residencial
  ✅ Modal Worker com yt-dlp + Whisper
  ✅ Frontend cookies extraction
  ✅ Backend authentication

Taxa de sucesso esperada: 95%+
```

## Deployment Manual (Passo a Passo)

### Passo 1: Setup Bright Data

```bash
python3 scripts/bright_data_setup.py \
  --api-key YOUR_KEY \
  --username YOUR_USERNAME
```

Copie as credenciais retornadas para `.env.local`:

```bash
BRIGHT_DATA_API_KEY=...
BRIGHT_DATA_USERNAME=...
BRIGHT_DATA_ZONE=unoduno-youtube-zone
BRIGHT_DATA_PROXY_PORT=22225
```

### Passo 2: Deploy Modal Worker

```bash
modal deploy scripts/modal_audio_extractor_with_bright_data.py
```

Copie a URL retornada:

```bash
https://seu-account--unoduno-audio-extractor.modal.run
```

Adicione ao `.env.local`:

```bash
MODAL_WORKER_URL=https://seu-account--unoduno-audio-extractor.modal.run
```

### Passo 3: Build Local

```bash
npm run build
```

Verifique se compila sem erros.

### Passo 4: Deploy Vercel

```bash
vercel deploy --prod
```

Ou use a UI do Vercel.

### Passo 5: Validar

```bash
# Health check
curl https://seu-app.vercel.app/api/mastra/youtube-to-transcript

# Testar transcrição
curl -X POST https://seu-app.vercel.app/api/mastra/youtube-to-transcript \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "cookies": {}
  }'
```

## Troubleshooting

### "modal: command not found"

```bash
pip install modal
modal setup
```

### "vercel: command not found"

```bash
npm install -g vercel
vercel login
```

### "Bright Data zone creation failed"

- Verifique API Key e Username
- Confirme acesso a proxy residencial na conta
- Tente criar zona manualmente no dashboard

### "Modal Worker deploy timeout"

- Verifique conexão de internet
- Tente novamente: `modal deploy scripts/modal_audio_extractor_with_bright_data.py`

### "Vercel deploy falhou"

- Execute `vercel login` novamente
- Certifique-se que `.env.local` tem todas as variáveis
- Verifique TypeScript: `npm run build`

## Verificação Pós-Deploy

### 1. Verificar Environment Variables

No dashboard Vercel (Settings → Environment Variables):
- ✅ `MODAL_WORKER_URL` presente
- ✅ `BRIGHT_DATA_API_KEY` presente (oculto)
- ✅ `BRIGHT_DATA_USERNAME` presente (oculto)
- ✅ `BRIGHT_DATA_ZONE` presente
- ✅ `BRIGHT_DATA_PROXY_PORT` = 22225

### 2. Testar Modal Worker

```bash
python3 scripts/test_bright_data_proxy.py
```

Deve retornar:
```
[Test] Modal Worker URL: https://seu-account--unoduno-audio-extractor.modal.run
[Test] Testando conexão...
[Test] ✅ Conexão OK
[Test] Testando Bright Data proxy...
[Test] ✅ Proxy funciona
```

### 3. Testar Fluxo Completo

1. Abrir https://seu-app.vercel.app
2. Ir para página de transcrição
3. Colar URL do YouTube
4. Aguardar transcrição
5. Verificar se retornou com sucesso

## Monitoramento

### Logs Modal Worker

```bash
modal logs YOUR_DEPLOYMENT_NAME
```

### Logs Vercel

```bash
vercel logs seu-projeto
```

### Verificar Uso Bright Data

Dashboard Bright Data → Usage → Residential Proxy

## Rollback

### Se algo der errado:

```bash
# Rollback Vercel
vercel rollback

# Re-deploy Modal
modal deploy scripts/modal_audio_extractor.py  # versão sem Bright Data
```

## Próximos Passos

1. Monitorar logs por 24h
2. Testar com várias URLs do YouTube
3. Validar taxa de sucesso (esperar 95%+)
4. Adicionar alertas/monitoring
5. Documentar métricas de sucesso

## Suporte

- **Modal Issues**: https://modal.com/support
- **Bright Data Issues**: https://support.brightdata.com
- **Vercel Issues**: https://vercel.com/help

---

**Status**: Production Ready  
**Última atualização**: 31/05/2026  
**Versão**: 1.0
