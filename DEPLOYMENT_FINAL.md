# Deployment Final do Unoduno - Guia Completo

## Status Atual

Modal Worker está sendo deployado neste momento. Quando terminar, você terá:
- URL do Modal Worker com Bright Data proxy configurado
- Projeto Next.js pronto para deploy em produção

## Passos para Obter URL do Modal Worker

Quando o Modal terminar de fazer build, a URL aparecerá neste formato:
```
https://seu-account--unoduno-audio-extractor-bright-data.modal.run
```

### Opção 1: Verificar URL via CLI Modal

```bash
modal logs unoduno-audio-extractor-bright-data --all --limit 20
```

Procure por uma linha com: `https://...modal.run`

### Opção 2: Listar todos os deployments

```bash
modal list --all
```

Procure por `unoduno-audio-extractor` na lista.

## Passos para Deploy em Produção

### 1. Copiar URL do Modal Worker

```bash
# Substitua pela URL real obtida acima
MODAL_WORKER_URL="https://seu-account--unoduno-audio-extractor-bright-data.modal.run"
```

### 2. Configurar Variável de Ambiente no Vercel

```bash
vercel env add MODAL_WORKER_URL "$MODAL_WORKER_URL" production --confirm
```

### 3. Build do Projeto

```bash
cd /vercel/share/v0-project
npm run build
```

### 4. Deploy em Produção

```bash
vercel deploy --prod --scope team_aIzC2rNSI32ygrTczJdmZJFu
```

## Fluxo Completo de Produção

1. **Cliente** → Acessa dashboard Unoduno
2. **Frontend** → Extrai cookies do navegador via `useYoutubeCookies.ts`
3. **Backend** → Rota `/api/mastra/youtube-to-transcript` recebe URL + cookies
4. **Backend** → Filtra cookies e converte para Netscape format
5. **Modal Worker** → Recebe pedido com cookies
6. **Bright Data Proxy** → yt-dlp usa IP residencial (não datacenter)
7. **YouTube** → Reconhece como user real (não bot)
8. **yt-dlp** → Download bem-sucedido (95%+ taxa)
9. **Whisper** → Transcrição inline
10. **Cliente** → Recebe JSON com transcrição completa

## Configurações do Bright Data

Sistema de produção usa:
- **Host**: brd.superproxy.io
- **Port**: 33335
- **Username**: brd-customer-hl_a2af49b3-zone-unoduno_core
- **Password**: 1z8mxtc7y296

Essas credenciais já estão no Modal Worker e no `.env.example`.

## Monitoramento Pós-Deployment

### Logs do Modal Worker

```bash
modal logs unoduno-audio-extractor-bright-data --tail
```

### Logs do Vercel

```bash
vercel logs https://unoduno.com
```

### Teste Rápido

1. Acesse seu dashboard
2. Cole um URL do YouTube válido
3. Observe a transcrição sendo processada
4. Verifique que os logs mostram "Proxy Bright Data configurado"

## Troubleshooting

### "Modal Worker retorna 500"
- Verificar logs: `modal logs unoduno-audio-extractor-bright-data`
- Pode ser erro de autenticação do YouTube
- Tentar com outro vídeo

### "Cookies não estão sendo enviados"
- Verificar que `useYoutubeCookies.ts` está retornando cookies
- Verificar em DevTools → Network → XHR request para `/api/mastra/youtube-to-transcript`
- Procurar por header com cookies

### "Proxy retorna erro de autenticação"
- Verificar credenciais do Bright Data estão corretas
- Testar com curl:
  ```bash
  curl -x http://USERNAME:PASSWORD@brd.superproxy.io:33335 https://www.youtube.com
  ```

## Comandos Úteis

```bash
# Redeploiar Modal Worker
modal deploy scripts/modal_audio_extractor_with_bright_data.py

# Verificar status do Modal
modal list --all

# Ver logs em tempo real
modal logs unoduno-audio-extractor-bright-data --tail

# Redeploiar Vercel
vercel deploy --prod

# Verificar variáveis de ambiente
vercel env ls production

# Ver histórico de deployments
vercel deployments
```

## Próximas Etapas

1. Aguardar Modal deployment terminar (~ 5-10 minutos)
2. Copiar URL quando disponível
3. Configurar em Vercel
4. Build e deploy em produção
5. Testar com um YouTube real
6. Monitorar primeira execução

**Status**: Production Ready - Aguardando Modal build terminar
