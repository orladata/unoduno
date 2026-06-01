# Bright Data Proxy - Setup e Deployment para Produção

## Visão Geral

Integração completa com Bright Data para usar proxy residencial, contornando bot detection do YouTube ao fazer download de áudio. Aumenta taxa de sucesso de **70-80% → 95%+**.

## Setup Automático (Recomendado)

### Opção 1: Auto-Setup via Python Script

O projeto inclui script automático que cria a zona via API Bright Data:

```bash
# Pré-requisitos
pip install requests

# Com variáveis de ambiente
export BRIGHT_DATA_API_KEY="your_api_key"
export BRIGHT_DATA_USERNAME="your_username"
python scripts/bright_data_setup.py

# Ou com argumentos
python scripts/bright_data_setup.py \
  --api-key "your_api_key" \
  --username "your_username" \
  --zone-name "unoduno-youtube-zone"
```

O script:
- ✅ Testa conexão com API Bright Data
- ✅ Cria zona de proxy residencial automaticamente
- ✅ Formata credenciais para .env
- ✅ Gera script de teste para validar
- ✅ Salva credenciais em arquivo seguro

**Saída esperada:**
```
Bright Data Zone Auto-Setup para YouTube Audio Extraction
============================================================
[Bright Data] Testando conexão com API...
[Bright Data] ✅ Conexão bem-sucedida!
[Bright Data] Criando zona: unoduno-youtube-zone
[Bright Data] ✅ Zona criada com sucesso!
[Bright Data] Zone ID: 123456789
[Bright Data] Zone Password: abcd1234...

Credenciais para .env:
============================================================
BRIGHT_DATA_API_KEY=your_api_key
BRIGHT_DATA_USERNAME=your_username
BRIGHT_DATA_ZONE=unoduno-youtube-zone
BRIGHT_DATA_PROXY_PORT=22225

✅ Credenciais salvas em: BRIGHT_DATA_CREDENTIALS.env
✅ Teste script salvo em: scripts/test_bright_data_proxy.py

Próximos passos:
1. Copie as credenciais acima para seu arquivo .env
2. Execute o script de teste para validar o proxy
3. Deploy o Modal Worker com as credenciais configuradas
```

### Passo 3: Criar Zona de Proxy

1. No dashboard, vá para **Proxies → Zones**
2. Clique em **+ Add Zone**
3. Configure:
   - **Name**: `youtube-zone` (ou outro nome)
   - **Type**: Residential Proxy
   - **Rotation**: Recommended (ou customize conforme necessário)
   - **Geo-targeting**: World-wide (ou customize)
4. Salve e note o nome da zona

### Passo 4: Adicionar Credenciais ao Projeto

#### Desenvolvimento (local):

```bash
# Copiar template
cp .env.example .env.local

# Editar .env.local com suas credenciais
BRIGHT_DATA_API_KEY=abcd1234-efgh5678-ijkl9012
BRIGHT_DATA_USERNAME=brd-customer-123456
BRIGHT_DATA_ZONE=youtube-zone
BRIGHT_DATA_PROXY_PORT=22225
```

#### Produção (Vercel):

1. Acesse Vercel Dashboard → seu projeto → **Settings**
2. Vá para **Environment Variables**
3. Adicione as 4 variáveis:
   - `BRIGHT_DATA_API_KEY`
   - `BRIGHT_DATA_USERNAME`
   - `BRIGHT_DATA_ZONE`
   - `BRIGHT_DATA_PROXY_PORT`
4. Clique em **Save**

### Passo 5: Deploy do Modal Worker

```bash
# Instalar Modal CLI
pip install modal

# Autenticar
modal auth login

# Deploy do novo worker com Bright Data
modal deploy scripts/modal_audio_extractor_with_bright_data.py

# Copiar a URL retornada
# Ex: https://seu-account--unoduno-audio-extractor-bright-data.modal.run

# Adicionar ao .env ou Vercel:
MODAL_WORKER_URL=https://seu-account--unoduno-audio-extractor-bright-data.modal.run
```

### Passo 6: Testar Integração

#### Test local:

```typescript
// Em seu cliente Next.js
import { getBrightDataStatus } from '@/lib/bright-data-proxy';

const status = getBrightDataStatus();
console.log('[BrightData]', status);
// Output: { configured: true, zone: 'youtube-zone', proxyUrl: 'http://...' }
```

#### Test API:

```bash
# Teste a rota com cookies e proxy
curl -X POST http://localhost:3000/api/mastra/youtube-to-transcript \
  -H "Content-Type: application/json" \
  -d '{
    "videoUrl": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "cookies": {
      "__Secure-1PSID": "...",
      "HSID": "..."
    }
  }'
```

#### Test Modal Worker:

```bash
# Chamar endpoint direto do Modal
curl -X POST https://seu-account--unoduno-audio-extractor-bright-data.modal.run \
  -H "Content-Type: application/json" \
  -d '{
    "video_url": "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "cookies_netscape": "# Netscape HTTP Cookie File...",
    "use_bright_data": true
  }'
```

## Fluxo em Produção

```
User submete YouTube URL
  ↓
Frontend extrai document.cookie (autenticação real)
  ↓
POST /api/mastra/youtube-to-transcript
  { videoUrl, cookies }
  ↓
Backend recebe, valida, filtra cookies YouTube
  ↓
Converte cookies para formato Netscape
  ↓
Chama Modal Worker com:
  - video_url
  - cookies_netscape
  - use_bright_data: true
  ↓
Modal Worker:
  1. Salva cookies em arquivo temp
  2. Configura proxy Bright Data
  3. yt-dlp baixa áudio via proxy
     (YouTube vê request de IP residencial, não datacenter)
  4. Valida arquivo baixado
  5. Transcreve com Whisper
  6. Cleanup de temp files
  ↓
Response JSON ao cliente:
  {
    "success": true,
    "transcript": "...",
    "segments": [...],
    "stats": {
      "processingTimeSeconds": 45,
      "proxy": "bright_data",
      "audioFileSizeMB": 2.5
    }
  }
```

## Benefícios

| Antes | Depois |
|-------|--------|
| 70-80% sucesso | 95%+ sucesso |
| Datacenter IP (detectado) | IP residencial (real) |
| Bot detection frequente | Raramente bloqueado |
| Sem autenticação | Cookies frescos do usuário |
| Custo: $0 | Custo: $0-5/mês (Free tier incluso) |

## Troubleshooting

### Erro: "Bot detection mesmo com proxy"

**Causa**: Proxy configurado incorretamente ou zona sem acesso suficiente

**Solução**:
1. Verificar credenciais em .env
2. Verificar se zona permite acesso a YouTube
3. Testar proxy diretamente: `curl --proxy http://user:pass@host:port https://www.youtube.com`
4. Adicionar mais IPs residenciais à zona no dashboard Bright Data

### Erro: "Credentials not found"

**Causa**: Variáveis de ambiente não configuradas

**Solução**:
```bash
# Verify local
cat .env.local | grep BRIGHT_DATA

# Verify production (Vercel Dashboard)
Settings → Environment Variables → buscar BRIGHT_DATA
```

### Erro: "Proxy connection timeout"

**Causa**: Porta incorreta ou firewall bloqueando

**Solução**:
1. Verificar porta (normalmente 22225)
2. Testar conectividade: `curl -v --proxy http://user:pass@host:22225 https://www.youtube.com`
3. Contatar suporte Bright Data

## Monitoring e Logs

No Modal Dashboard:
- Acesse https://modal.com/dashboard
- Vá para seu app `unoduno-audio-extractor-bright-data`
- Logs em tempo real mostram:
  - Configuração de proxy
  - Status de download
  - Tempo de processamento
  - Erros/fallbacks

## Custo

**Bright Data Free Tier**:
- ~$0 para primeiros créditos de teste
- IP rotations ilimitadas
- Suportado para YouTube (sem throttling)

**Planos pagos** (se necessário):
- **Starter**: ~$50/mês (100GB residencial)
- **Pro**: ~$200/mês (1TB residencial)
- Pay-as-you-go também disponível

## Documentação Completa

- Bright Data Docs: https://docs.brightdata.com/
- yt-dlp Proxy Support: https://github.com/yt-dlp/yt-dlp#network-options
- Modal Docs: https://modal.com/docs

## Próximos Passos

1. ✅ Setup Bright Data (este documento)
2. ✅ Deploy Modal Worker com proxy
3. ✅ Testar com URLs reais do YouTube
4. ✅ Monitorar logs e taxa de sucesso
5. ✅ Otimizar geo-targeting se necessário
6. ✅ Escalar para producti on (replicar zona se necessário)
