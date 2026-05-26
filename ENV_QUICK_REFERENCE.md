# Environment Variables - Quick Reference

## 📍 Arquivo Locations

```
📂 Project Root
├─ .env.example          ← Template (COMMIT THIS)
├─ .env.local            ← Development (git-ignored)
├─ env.d.ts             ← TypeScript types (COMMIT THIS)
├─ env.json             ← Machine-readable reference
├─ ENVIRONMENT_VARIABLES_MAP.md        ← Full documentation
├─ ENVIRONMENT_VARIABLES_DIAGRAM.md    ← Visual diagrams
└─ scripts/
   ├─ validate-env.js   ← Validation tool
   └─ list-env-vars.js  ← List tool
```

---

## 🎯 Resumo Rápido

| Categoria | Quantidade | Status |
|-----------|-----------|--------|
| **Server-Only Vars** | 11 | Privadas ✅ |
| **Public Vars** | 5 | Expostas (safe) ✅ |
| **Vercel Auto Vars** | 6+ | Auto-preenchidas |
| **Storage Vars** | 28 | Externas/Optional |
| **TOTAL** | **61+** | - |

---

## 🔐 Essentials (Deve ter em QUALQUER ambiente)

```javascript
// Supabase (Required para Database)
NEXT_PUBLIC_SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY

// Google AI (Required para Análise)
GOOGLE_GENERATIVE_AI_API_KEY

// Site URL (Required para SEO)
NEXT_PUBLIC_SITE_URL
```

---

## 💳 Payments (Optional - se usar checkout)

```javascript
STRIPE_SECRET_KEY
STRIPE_WEBHOOK_SECRET
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
```

---

## 📺 YouTube (Optional - se usar API)

```javascript
YOUTUBE_API_KEY
```

---

## 🏭 Production-Only

```javascript
NODE_ENV = "production"
SESSION_SECRET        // min 32 chars - openssl rand -hex 32
CSRF_SECRET           // min 32 chars - openssl rand -hex 32
SUPABASE_SERVICE_ROLE_KEY  // Elevated permissions
```

---

## 📊 Mapa por Serviço

### Supabase (Database + Auth)
- **Arquivos:** `utils/supabase/*`, `app/api/chat/route.ts`
- **Variáveis:**
  - `NEXT_PUBLIC_SUPABASE_URL` (client)
  - `NEXT_PUBLIC_SUPABASE_ANON_KEY` (client)
  - `SUPABASE_SERVICE_ROLE_KEY` (server - admin)

### Google Gemini (AI Analysis)
- **Arquivos:** `app/api/chat/route.ts`, `lib/mastra/agent.ts`
- **Variáveis:**
  - `GOOGLE_GENERATIVE_AI_API_KEY`

### Stripe (Payments)
- **Arquivos:** `app/api/checkout/route.ts`, `app/api/webhook/stripe/route.ts`
- **Variáveis:**
  - `STRIPE_SECRET_KEY` (server)
  - `STRIPE_WEBHOOK_SECRET` (server)
  - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` (client)

### YouTube (Data)
- **Arquivos:** `app/actions/youtube-trends.ts`, `lib/mastra/tools/youtube.ts`
- **Variáveis:**
  - `YOUTUBE_API_KEY`

---

## ⚙️ Setup Rápido

### Development (15 min)
```bash
# 1. Copy template
cp .env.example .env.local

# 2. Edit .env.local com valores:
# NEXT_PUBLIC_SUPABASE_URL=https://xxx.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJxxx...
# GOOGLE_GENERATIVE_AI_API_KEY=AIzaSyD4Ii2w...
# NEXT_PUBLIC_SITE_URL=http://localhost:3000

# 3. Validate
node scripts/validate-env.js

# 4. Run
npm run dev
```

### Production (via Vercel UI)
```
1. Go to Vercel Project Settings → Environment Variables
2. Add all required variables
3. Click "Deploy" to apply
4. Check: Settings → Deployment & Git
```

---

## 🔍 How to Find Actual Values

| Variável | Where to Get |
|----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | https://supabase.com/dashboard → Your Project → Settings → API |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Same location ↑ |
| `SUPABASE_SERVICE_ROLE_KEY` | Same location ↑ |
| `GOOGLE_GENERATIVE_AI_API_KEY` | https://aistudio.google.com/apikey |
| `YOUTUBE_API_KEY` | https://console.cloud.google.com/apis/credentials |
| `STRIPE_SECRET_KEY` | https://dashboard.stripe.com/apikeys |
| `STRIPE_WEBHOOK_SECRET` | https://dashboard.stripe.com/webhooks |
| `STRIPE_PUBLISHABLE_KEY` | https://dashboard.stripe.com/apikeys |

---

## ✅ Validation Checklist

```bash
# Run this to validate:
node scripts/validate-env.js

# Expected output:
# ✓ NEXT_PUBLIC_SUPABASE_URL
# ✓ NEXT_PUBLIC_SUPABASE_ANON_KEY
# ✓ GOOGLE_GENERATIVE_AI_API_KEY
# ✓ NEXT_PUBLIC_SITE_URL
```

---

## 🚨 Security Rules

1. **NEVER commit `.env.local`** - It's in .gitignore for a reason
2. **NEVER push secrets to git** - Use Vercel UI for production
3. **Server-Only vars** - Don't start with `NEXT_PUBLIC_`
4. **Session/CSRF secrets** - Min 32 characters, use `openssl rand -hex 32`
5. **Rotate regularly** - Monthly in production
6. **Use strong values** - At least 32 chars for secrets

---

## 📝 Files Reference

| File | Purpose | Git | Env |
|------|---------|-----|-----|
| `.env.example` | Template | ✅ COMMIT | All |
| `.env.local` | Development | ❌ IGNORE | Dev |
| `.env.vercel.prod` | Production ref | ❌ IGNORE | Prod |
| `env.d.ts` | TypeScript types | ✅ COMMIT | All |
| `env.json` | Machine reference | ✅ COMMIT | All |

---

## 🔗 Documentation

- **Full Map:** `ENVIRONMENT_VARIABLES_MAP.md` (detailed reference)
- **Diagrams:** `ENVIRONMENT_VARIABLES_DIAGRAM.md` (visual architecture)
- **JSON:** `env.json` (machine-readable)
- **Scripts:** `scripts/validate-env.js`, `scripts/list-env-vars.js`

---

## 🆘 Common Issues

**"Variable is undefined"**
- Check `.env.local` exists
- Run `node scripts/validate-env.js`
- Restart dev server after editing

**"Supabase connection failed"**
- Verify URL format: `https://xxxxxxxxxxxx.supabase.co`
- Check keys match project in dashboard
- Verify project is active

**"Stripe error"**
- Test mode: key should start with `sk_test_`
- Production: key should start with `sk_live_`
- Check mode matches environment

**"SECURITY: Variable exposed in browser"**
- Remove `NEXT_PUBLIC_` prefix immediately
- Regenerate secret if was session/csrf
- Verify no secrets in client-side code

---

**Para mais detalhes, veja os outros arquivos de documentação.**

Gerado: 26/05/2026
