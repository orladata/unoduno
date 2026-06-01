# Cloudflare R2 Setup Guide

## O que é Cloudflare R2?

Cloudflare R2 é um serviço de armazenamento de objetos (bucket storage) S3-compatível que oferece:
- **80% mais barato** que AWS S3
- **Egress grátis** (economia em banda de download)
- **Performance global** com rede Cloudflare
- **Integração fácil** com qualquer app que usa S3

Para o Unoduno, usamos R2 para:
- Armazenar arquivos de áudio MP3 baixados do YouTube
- Servir áudios com cache global
- Reduzir carga no servidor principal

## Setup Step-by-Step

### 1. Criar Conta Cloudflare (se não tiver)

1. Acesse: https://dash.cloudflare.com/sign-up
2. Complete o cadastro com email e senha
3. Confirme o email

### 2. Acessar Cloudflare R2

1. Log in: https://dash.cloudflare.com/
2. Menu esquerdo → "R2"
3. Clique em "Create bucket"

### 3. Criar um Bucket

1. **Bucket name**: Digite um nome único (ex: `unoduno-audios`)
   - Deve ser único globalmente em toda Cloudflare
   - Use letras minúsculas e hífens
   
2. **Region**: Selecione a região mais próxima (pode deixar automático)

3. Clique em "Create bucket"

### 4. Obter Account ID

1. Em R2, clique em "Settings"
2. Procure por "Account ID"
3. Copie o ID (parece: `9a1c7e4d6f2b8c0e3a5f7b9d1e4c6a8f`)

### 5. Criar API Token para R2

1. Em R2, clique em "Settings"
2. Procure por "API Tokens"
3. Clique em "Create API token"

Configurações recomendadas:
```
Token name: unoduno-r2-token
Permissions: Admin - R2 (ou Custom: Read, Write, Delete)
TTL: Custom - Set expiration (escolha 90 dias)
```

4. Clique em "Create Token"
5. Você verá:
   - Access Key ID (ex: `f4dac4c13ac04e3e88c9c90fbe1c7e6a`)
   - Secret Access Key (ex: `9f8e7d6c5b4a3f2e1d0c9b8a7f6e...`)

**⚠️ IMPORTANTE**: Copie o Secret Access Key agora! Você não poderá ver novamente.

### 6. Configurar Variáveis de Ambiente

No seu `.env.local` ou Vercel Dashboard, adicione:

```env
# Cloudflare R2
CLOUDFLARE_R2_ACCOUNT_ID=9a1c7e4d6f2b8c0e3a5f7b9d1e4c6a8f
CLOUDFLARE_R2_ACCESS_KEY_ID=f4dac4c13ac04e3e88c9c90fbe1c7e6a
CLOUDFLARE_R2_SECRET_ACCESS_KEY=9f8e7d6c5b4a3f2e1d0c9b8a7f6e5d4c3b2a1f0e9d8c7b6a5f4e3d2c1b0a9f
CLOUDFLARE_R2_BUCKET_NAME=unoduno-audios
```

### 7. Configurar em Vercel (Production)

1. Acesse https://vercel.com/dashboard
2. Selecione projeto "unoduno"
3. Settings → Environment Variables
4. Adicione as 4 variáveis acima
5. Environment: Production
6. Clique "Add"

## APIs Disponíveis

### 1. Upload de Arquivo

```bash
curl -X POST http://localhost:3000/api/r2/files \
  -H "Content-Type: application/json" \
  -d '{
    "fileBase64": "SUQzBAAAI1NUSTIAAAAMAAAAVEFMQi...",
    "fileName": "audio/video123/audio.mp3",
    "contentType": "audio/mpeg"
  }'
```

Resposta:
```json
{
  "success": true,
  "file": {
    "key": "audio/video123/audio.mp3",
    "etag": "\"abc123def456\"",
    "url": "https://unoduno-audios.abc123.r2.cloudflarestorage.com/audio/video123/audio.mp3"
  }
}
```

### 2. Listar Arquivos

```bash
# Listar todos os arquivos
curl http://localhost:3000/api/r2/files

# Listar apenas arquivos com prefix "audio/"
curl http://localhost:3000/api/r2/files?prefix=audio/
```

Resposta:
```json
{
  "success": true,
  "count": 5,
  "files": [
    {
      "key": "audio/video123/audio.mp3",
      "size": 2097152,
      "lastModified": "2024-06-01T10:30:45.000Z",
      "url": "https://unoduno-audios.abc123.r2.cloudflarestorage.com/audio/video123/audio.mp3"
    }
  ]
}
```

### 3. Download de Arquivo

```bash
# URL direta do R2 (usar URL retornada pelo upload)
curl https://unoduno-audios.abc123.r2.cloudflarestorage.com/audio/video123/audio.mp3 -o audio.mp3

# Ou via API endpoint
curl http://localhost:3000/api/r2/audio/video123
```

### 4. Deletar Arquivo

```bash
curl -X DELETE http://localhost:3000/api/r2/files?fileName=audio/video123/audio.mp3
```

Resposta:
```json
{
  "success": true,
  "message": "Arquivo audio/video123/audio.mp3 deletado"
}
```

## Integração com YouTube Download

O endpoint `/api/youtube/download` foi atualizado para:

1. Fazer download do YouTube com yt-dlp + Bright Data proxy
2. Converter para base64
3. **Fazer upload automático para R2** (se configurado)
4. Retornar ambos: audioBase64 + r2Url

Resposta:
```json
{
  "success": true,
  "videoId": "dQw4w9WgXcQ",
  "audioBase64": "SUQzBAAAI1NUSTIAAAAMAAAAVEFMQi...",
  "audioSizeBytes": 2097152,
  "r2Url": "https://unoduno-audios.abc123.r2.cloudflarestorage.com/audio/dQw4w9WgXcQ/1717254645000.mp3",
  "storageMethod": "cloudflare_r2",
  "processingTimeSeconds": 15.3
}
```

## Customizar Domínio do R2

Por padrão, os arquivos são servidos de:
```
https://unoduno-audios.abc123.r2.cloudflarestorage.com/...
```

Para usar um domínio customizado (ex: `audios.seudominio.com`):

1. Em R2 → Settings → Custom Domains
2. Clique em "Connect Domain"
3. Selecione seu domínio (já registrado em Cloudflare)
4. Configure o DNS automático
5. Após conectar, adicione em `.env`:
   ```
   CLOUDFLARE_R2_CUSTOM_DOMAIN=https://audios.seudominio.com
   ```

## Preços (Estimado)

Para 100 vídeos/mês com áudio 48kbps (~2MB cada):

| Item | Preço |
|------|-------|
| Armazenamento (200MB) | $0.015 |
| Requisições de escrita (100) | $0.005 |
| Requisições de leitura (100) | $0.004 |
| Egress (200MB) | **GRÁTIS** |
| **Total** | **~$0.024/mês** |

Vs AWS S3:
- Armazenamento S3: $0.023/GB → $4.60/mês (100GB)
- Egress S3: $0.09/GB → $18/mês (200GB)
- **Total S3: ~$22.60/mês** ❌

## Troubleshooting

### "Cloudflare R2 não configurado"
- Verificar se todas as 4 variáveis estão configuradas
- Se em local: adicionar ao `.env.local`
- Se em produção: verificar Vercel Settings → Environment Variables

### "Access denied" ou "InvalidAccessKeyId"
- Verificar se Access Key ID está correto
- Verificar se Secret Access Key está correto
- Se redefiniu o token, precisa criar um novo (não pode recuperar)

### Arquivo não encontrado após upload
- R2 precisa de alguns segundos de propagação
- Tentar novamente em alguns segundos
- Verificar se o nome do bucket está correto

### "Bucket not found"
- Verificar se CLOUDFLARE_R2_BUCKET_NAME está correto
- Verificar se bucket existe em Cloudflare R2
- Certificar-se de que o token tem permissão neste bucket

## Arquivos Modificados

```
✓ lib/cloudflare-r2.ts
  └─ Novo serviço com upload, download, list, delete

✓ app/api/r2/files/route.ts
  └─ Endpoints GET (list), POST (upload), DELETE

✓ app/api/r2/audio/[videoId]/route.ts
  └─ Endpoint para download de áudio

✓ app/api/youtube/download/route.ts
  └─ Integrado: agora faz upload automático para R2

✓ .env.example
  └─ Adicionadas variáveis do Cloudflare R2

✓ CLOUDFLARE_R2_SETUP.md
  └─ Este arquivo
```

## Próximos Passos

1. ✓ Instalar dependências (@aws-sdk/client-s3)
2. ✓ Criar serviço lib/cloudflare-r2.ts
3. ✓ Criar endpoints /api/r2/*
4. ✓ Integrar com /api/youtube/download
5. ⏳ Setup Cloudflare R2 (você está aqui)
6. ⏳ Configurar variáveis em produção
7. ⏳ Testar upload/download
8. ⏳ Deploy

