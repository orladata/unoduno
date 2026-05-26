# Mapa Completo de Variáveis de Ambiente - Unoduno

> Última atualização: 26/05/2026

## 📋 Índice Rápido

1. [Arquivos de Configuração](#arquivos-de-configuração)
2. [Variáveis Definidas](#variáveis-definidas)
3. [Mapa de Uso no Código](#mapa-de-uso-no-código)
4. [Integrations & Services](#integrations--services)
5. [Variáveis Vercel](#variáveis-vercel)
6. [Variáveis Externas (Storage)](#variáveis-externas-storage)

---

## Arquivos de Configuração

### 1. `.env.example`
**Localização:** `/vercel/share/v0-project/.env.example`
**Propósito:** Template de variáveis de ambiente para desenvolvimento local
**Status:** ✅ Público (Safe to commit)
**Descrição:** Este arquivo serve como guia para desenvolvedores configurarem `.env.local`

### 2. `.env.vercel.prod`
**Localização:** `/vercel/share/v0-project/.env.vercel.prod`
**Propósito:** Configuração de produção no Vercel
**Status:** 🔴 Privado (Secrets)
**Descrição:** Contém todas as variáveis secrets para ambiente de produção

### 3. `env.d.ts`
**Localização:** `/vercel/share/v0-project/env.d.ts`
**Propósito:** Type definitions para variáveis de ambiente
**Status:** ✅ Público
**Descrição:** Define tipos TypeScript para todas as variáveis esperadas

---

## Variáveis Definidas

### 🔐 Server-Only Variables (Não expostas ao cliente)

| Variável | Arquivo | Tipo | Obrigatória | Descrição |
|----------|---------|------|-------------|-----------|
| `NODE_ENV` | `.env.example` | `string` | ✅ | Ambiente: `development` \| `production` \| `test` |
| `SESSION_SECRET` | `.env.example` | `string` | ✅ (prod) | Secret para encriptação de sessão (min 32 chars) |
| `CSRF_SECRET` | `.env.example` | `string` | ✅ (prod) | Secret para proteção CSRF (min 32 chars) |
| `DATABASE_URL` | `.env.example` | `string` | ❌ | Connection string do banco de dados |
| `REDIS_URL` | `.env.example` | `string` | ❌ | URL de conexão Redis (recomendado em prod) |
| `GOOGLE_GENERATIVE_AI_API_KEY` | `.env.example`, `.env.vercel.prod` | `string` | ✅ | API key do Google Gemini para análise de vídeos |
| `YOUTUBE_API_KEY` | `.env.example` | `string` | ❌ | API key do YouTube Data API |
| `STRIPE_SECRET_KEY` | `.env.example`, `.env.vercel.prod` | `string` | ❌ | Chave secreta do Stripe |
| `STRIPE_WEBHOOK_SECRET` | `.env.example`, `.env.vercel.prod` | `string` | ❌ | Secret para webhooks do Stripe |
| `EMAIL_API_KEY` | `.env.example` | `string` | ❌ | API key para serviço de email |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.vercel.prod` | `string` | ✅ (prod) | Chave de serviço do Supabase (server-side) |
| `CI` | `playwright.config.ts` | `boolean` | ❌ | Indica se está rodando em CI/CD |
| `PLAYWRIGHT_BASE_URL` | `playwright.config.ts` | `string` | ❌ | URL base para testes Playwright |

---

### 🌐 Public Variables (Expostas ao navegador)

| Variável | Arquivo | Tipo | Obrigatória | Descrição |
|----------|---------|------|-------------|-----------|
| `NEXT_PUBLIC_SITE_URL` | `.env.example`, `.env.vercel.prod` | `string` | ✅ | URL pública do site (SEO, social sharing) |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | `.env.example`, `.env.vercel.prod` | `string` | ❌ | Chave pública do Stripe (safe) |
| `NEXT_PUBLIC_ANALYTICS_ID` | `.env.example` | `string` | ❌ | ID do serviço de analytics |
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.vercel.prod` | `string` | ✅ | URL do projeto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.vercel.prod` | `string` | ✅ | Chave anônima do Supabase (client-side) |

---

## Mapa de Uso no Código

### Por Arquivo

#### `app/api/chat/route.ts`
```
- process.env.GOOGLE_GENERATIVE_AI_API_KEY ← Google Gemini API
- process.env.NEXT_PUBLIC_SUPABASE_URL ← Supabase connection
- process.env.SUPABASE_SERVICE_ROLE_KEY ← Supabase auth
- process.env.NODE_ENV ← Conditional error details
```

#### `app/api/checkout/route.ts`
```
- process.env.STRIPE_SECRET_KEY ← Stripe payment processing
- process.env.NEXT_PUBLIC_SITE_URL ← Redirect URL after payment
```

#### `app/api/webhook/stripe/route.ts`
```
- process.env.STRIPE_SECRET_KEY ← Stripe client initialization
- process.env.STRIPE_WEBHOOK_SECRET ← Webhook signature verification
```

#### `app/actions/youtube-trends.ts`
```
- process.env.YOUTUBE_API_KEY ← YouTube Data API calls
```

#### `app/layout.tsx`
```
- process.env.NODE_ENV ← Conditional Analytics component rendering
```

#### `app/error.tsx`
```
- process.env.NODE_ENV ← Conditional error detail exposure
```

#### `utils/supabase/server.ts`
```
- process.env.NEXT_PUBLIC_SUPABASE_URL ← Supabase server client
- process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ← Supabase auth
```

#### `utils/supabase/middleware.ts`
```
- process.env.NEXT_PUBLIC_SUPABASE_URL ← Middleware auth
- process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ← Middleware auth
```

#### `utils/supabase/client.ts`
```
- process.env.NEXT_PUBLIC_SUPABASE_URL ← Client-side Supabase
- process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ← Client-side auth
```

#### `utils/supabase/admin.ts`
```
- process.env.NEXT_PUBLIC_SUPABASE_URL ← Admin client init
- process.env.SUPABASE_SERVICE_ROLE_KEY ← Elevated permissions
```

#### `components/pricing-actions.ts`
```
- process.env.STRIPE_SECRET_KEY ← Stripe initialization
```

#### `next.config.mjs`
```
- process.env.NODE_ENV ← Conditional build optimization
```

#### `playwright.config.ts`
```
- process.env.CI ← CI/CD detection for test config
- process.env.PLAYWRIGHT_BASE_URL ← Test base URL
```

---

## Integrations & Services

### Supabase (Database + Auth)
**Variáveis Necessárias:**
```
NEXT_PUBLIC_SUPABASE_URL          ← URL do projeto
NEXT_PUBLIC_SUPABASE_ANON_KEY    ← Chave pública (client-side)
SUPABASE_SERVICE_ROLE_KEY        ← Chave privada (server-side)
```

**Usado em:**
- `utils/supabase/server.ts`
- `utils/supabase/client.ts`
- `utils/supabase/middleware.ts`
- `utils/supabase/admin.ts`
- `app/api/chat/route.ts`

**Localização:** https://supabase.com/dashboard/projects

---

### Google Gemini AI
**Variáveis Necessárias:**
```
GOOGLE_GENERATIVE_AI_API_KEY     ← API key para análise de vídeos
```

**Usado em:**
- `app/api/chat/route.ts` - Análise de conteúdo com IA

**Localização:** https://aistudio.google.com/apikey

---

### YouTube Data API
**Variáveis Necessárias:**
```
YOUTUBE_API_KEY                   ← API key para dados do YouTube
```

**Usado em:**
- `app/actions/youtube-trends.ts` - Buscas de tendências

**Localização:** https://console.cloud.google.com/apis/credentials

---

### Stripe (Payments)
**Variáveis Necessárias:**
```
STRIPE_SECRET_KEY                 ← Chave secreta (server-side)
STRIPE_WEBHOOK_SECRET            ← Secret para webhooks
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ← Chave pública (client-side)
```

**Usado em:**
- `app/api/checkout/route.ts` - Processamento de pagamentos
- `app/api/webhook/stripe/route.ts` - Webhook de pagamentos
- `components/pricing-actions.ts` - Inicialização do Stripe

**Localização:** https://dashboard.stripe.com/apikeys

---

### Analytics
**Variáveis Necessárias:**
```
NEXT_PUBLIC_ANALYTICS_ID          ← ID do serviço analytics
```

**Usado em:**
- `app/layout.tsx` - Carregamento condicional em produção

---

## Variáveis Vercel

### Automáticas (Geradas pelo Vercel)

| Variável | Propósito | Exemplo |
|----------|-----------|---------|
| `VERCEL` | Indica que está em Vercel | `"1"` |
| `VERCEL_ENV` | Ambiente Vercel | `"production"` \| `"preview"` |
| `VERCEL_URL` | URL da deployment | `"unoduno-main.vercel.app"` |
| `VERCEL_OIDC_TOKEN` | JWT para OpenID Connect | Token JWT |
| `VERCEL_TARGET_ENV` | Ambiente alvo | `"production"` |

### Git Context (Preenchidas automaticamente)

| Variável | Descrição |
|----------|-----------|
| `VERCEL_GIT_COMMIT_SHA` | SHA do commit |
| `VERCEL_GIT_COMMIT_REF` | Branch/ref do commit |
| `VERCEL_GIT_COMMIT_MESSAGE` | Mensagem do commit |
| `VERCEL_GIT_COMMIT_AUTHOR_NAME` | Autor do commit |
| `VERCEL_GIT_COMMIT_AUTHOR_LOGIN` | Login do autor |
| `VERCEL_GIT_PROVIDER` | Provider Git (github, gitlab, etc) |
| `VERCEL_GIT_REPO_OWNER` | Owner do repositório |
| `VERCEL_GIT_REPO_SLUG` | Slug do repositório |
| `VERCEL_GIT_REPO_ID` | ID do repositório |
| `VERCEL_GIT_PULL_REQUEST_ID` | ID do PR |
| `VERCEL_GIT_PREVIOUS_SHA` | SHA anterior |

---

## Variáveis Externas (Storage)

### Blob Storage
**Variáveis Necessárias:**
```
BLOB_READ_WRITE_TOKEN            ← Token para Vercel Blob
```

---

### Upstash Redis Cache
**Variáveis Necessárias:**
```
KV_REST_API_URL                   ← URL da API Redis
KV_REST_API_TOKEN                ← Token de acesso
cache_KV_REST_API_URL            ← URL alternativa para cache
cache_KV_REST_API_TOKEN          ← Token alternativo
cache_KV_REST_API_READ_ONLY_TOKEN ← Token read-only
cache_REDIS_URL                   ← URL direta Redis
```

---

### Storage Supabase (Alternate)
**Variáveis Necessárias:**
```
NEXT_PUBLIC_storage_SUPABASE_URL
NEXT_PUBLIC_storage_SUPABASE_ANON_KEY
NEXT_PUBLIC_storage_SUPABASE_PUBLISHABLE_KEY
storage_SUPABASE_SECRET_KEY
storage_SUPABASE_SERVICE_ROLE_KEY
storage_SUPABASE_JWT_SECRET
```

---

### Storage PostgreSQL (Direct)
**Variáveis Necessárias:**
```
storage_POSTGRES_URL              ← URL de conexão principal
storage_POSTGRES_URL_NON_POOLING  ← URL sem connection pooling
storage_POSTGRES_PRISMA_URL       ← URL para Prisma
storage_POSTGRES_HOST             ← Host do banco
storage_POSTGRES_DATABASE         ← Nome da database
storage_POSTGRES_USER             ← Usuário PostgreSQL
storage_POSTGRES_PASSWORD         ← Senha PostgreSQL
```

---

### Stripe MCP (Stripe Integration)
**Variáveis Necessárias:**
```
STRIPE_MCP_KEY                    ← Chave para Stripe MCP
```

---

### Build & Deploy
**Variáveis Necessárias:**
```
TURBO_CACHE                       ← Cache strategy (remote:rw)
TURBO_REMOTE_ONLY                ← Use remote cache only
TURBO_DOWNLOAD_LOCAL_ENABLED     ← Download local cache
TURBO_RUN_SUMMARY                ← Log run summary
NX_DAEMON                         ← Disable daemon (false para CI)
```

---

## 🔒 Segurança & Checklist

### Development Setup
```bash
# 1. Copiar template
cp .env.example .env.local

# 2. Preencher valores locais
# - SESSION_SECRET: openssl rand -hex 32
# - CSRF_SECRET: openssl rand -hex 32
# - Google API key
# - Stripe publishable key (apenas dev)

# 3. NUNCA commitar .env.local
echo ".env.local" >> .gitignore
```

### Production Setup
```
✅ VERCEL project settings → Vars
✅ Add all .env.vercel.prod variables
✅ Never commit secrets to git
✅ Rotate secrets regularly
✅ Use strong, unique values (32+ chars)
✅ Enable branch protection
```

### Verificação de Integridade
```bash
# Verificar se todas variáveis necessárias estão configuradas
npm run validate:env

# Listar variáveis usadas no código
npm run list:env-vars

# Testar conexões
npm run test:integrations
```

---

## 📊 Resumo de Contagem

| Tipo | Quantidade |
|------|-----------|
| Variáveis Server-Only | 11 |
| Variáveis Public | 5 |
| Variáveis Vercel (automáticas) | 6 |
| Variáveis Git Context | 11 |
| Variáveis Storage/External | 28 |
| **TOTAL** | **61** |

**Variáveis obrigatórias em produção:** 7
**Variáveis opcionais:** 54

---

## 🔗 Links Rápidos

| Serviço | Link |
|---------|------|
| Supabase Dashboard | https://supabase.com/dashboard |
| Google API Keys | https://aistudio.google.com/apikey |
| YouTube API Console | https://console.cloud.google.com/apis/credentials |
| Stripe Dashboard | https://dashboard.stripe.com/apikeys |
| Vercel Environment Variables | https://vercel.com/dashboard |
| Upstash Console | https://console.upstash.com |
| Vercel Blob Dashboard | https://vercel.com/dashboard/stores |

---

## 📝 Notas Finais

- **Prefixo `NEXT_PUBLIC_`**: Apenas variáveis deste tipo são expostas ao cliente. Nunca coloque secrets aqui.
- **Prefixo `storage_`**: Variáveis relacionadas a serviços de storage/banco de dados
- **Prefixo `cache_`**: Variáveis relacionadas a cache (Redis, KV stores)
- **Vercel automáticas**: Nunca precisam ser configuradas manualmente
- **CI/CD**: Use environment variables UI do Vercel, não `.env.local`

---

**Documentação gerada em:** 26/05/2026
**Versão do projeto:** v1.36 Mastra + Next.js 16
