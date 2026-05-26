# Diagrama Visual: Variáveis de Ambiente - Unoduno

## 1. Arquitetura Geral

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                        UNODUNO APP - ENV VARS FLOW                          │
└─────────────────────────────────────────────────────────────────────────────┘

                              ┌──────────────────────┐
                              │   .env.example       │
                              │   (Template)         │
                              └──────────────────────┘
                                        │
                    ┌───────────────────┼───────────────────┐
                    │                   │                   │
                    ▼                   ▼                   ▼
          ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
          │  .env.local      │  │ .env.vercel.prod │  │  env.d.ts        │
          │  (Development)   │  │  (Production)    │  │  (Type Defs)     │
          └──────────────────┘  └──────────────────┘  └──────────────────┘
                    │                   │                   │
                    └───────────────────┼───────────────────┘
                                        ▼
                              ┌──────────────────────┐
                              │   process.env.*      │
                              │   (Runtime)          │
                              └──────────────────────┘
```

---

## 2. Fluxo de Integração

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          INTEGRATION LAYERS                                 │
└─────────────────────────────────────────────────────────────────────────────┘

TIER 1: AUTHENTICATION & DATABASE
┌────────────────────────────────────────────────────────────────────────┐
│ Supabase                                                               │
├────────────────────────────────────────────────────────────────────────┤
│ NEXT_PUBLIC_SUPABASE_URL           ──→  Client-side connection       │
│ NEXT_PUBLIC_SUPABASE_ANON_KEY      ──→  Browser authentication       │
│ SUPABASE_SERVICE_ROLE_KEY          ──→  Server-side elevated perms   │
│                                                                        │
│ Used in:                                                               │
│  • utils/supabase/server.ts                                           │
│  • utils/supabase/client.ts                                           │
│  • utils/supabase/middleware.ts                                       │
│  • app/api/chat/route.ts                                              │
└────────────────────────────────────────────────────────────────────────┘

TIER 2: PAYMENT PROCESSING
┌────────────────────────────────────────────────────────────────────────┐
│ Stripe                                                                 │
├────────────────────────────────────────────────────────────────────────┤
│ STRIPE_SECRET_KEY                  ──→  Server-side payments         │
│ STRIPE_WEBHOOK_SECRET              ──→  Webhook verification         │
│ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY ──→  Client-side form token      │
│                                                                        │
│ Used in:                                                               │
│  • app/api/checkout/route.ts                                          │
│  • app/api/webhook/stripe/route.ts                                    │
│  • components/pricing-actions.ts                                      │
└────────────────────────────────────────────────────────────────────────┘

TIER 3: AI & ANALYSIS
┌────────────────────────────────────────────────────────────────────────┐
│ Google Gemini API                                                      │
├────────────────────────────────────────────────────────────────────────┤
│ GOOGLE_GENERATIVE_AI_API_KEY       ──→  Video analysis & AI insights │
│                                                                        │
│ Used in:                                                               │
│  • app/api/chat/route.ts (main analysis)                              │
│  • lib/mastra/agent.ts (agent configuration)                          │
│  • app/api/repurpose/route.ts (content repurposing)                   │
└────────────────────────────────────────────────────────────────────────┘

TIER 4: DATA SOURCES
┌────────────────────────────────────────────────────────────────────────┐
│ YouTube Data API                                                       │
├────────────────────────────────────────────────────────────────────────┤
│ YOUTUBE_API_KEY                    ──→  Video data & metadata         │
│                                                                        │
│ Used in:                                                               │
│  • app/actions/youtube-trends.ts (trend analysis)                     │
│  • lib/mastra/tools/youtube.ts (transcript extraction)                │
└────────────────────────────────────────────────────────────────────────┘

TIER 5: STORAGE & CACHING
┌────────────────────────────────────────────────────────────────────────┐
│ Redis & Blob Storage                                                   │
├────────────────────────────────────────────────────────────────────────┤
│ REDIS_URL / KV_REST_API_*          ──→  Distributed caching          │
│ BLOB_READ_WRITE_TOKEN              ──→  File storage                 │
│                                                                        │
│ Optional but recommended for production                                │
└────────────────────────────────────────────────────────────────────────┘
```

---

## 3. Mapa de Componentes → Variáveis

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     COMPONENT TO ENV VAR MAPPING                            │
└─────────────────────────────────────────────────────────────────────────────┘

API Routes:
├─ app/api/chat/route.ts
│   ├─ GOOGLE_GENERATIVE_AI_API_KEY    (AI analysis)
│   ├─ NEXT_PUBLIC_SUPABASE_URL        (auth)
│   └─ SUPABASE_SERVICE_ROLE_KEY       (admin access)
│
├─ app/api/checkout/route.ts
│   ├─ STRIPE_SECRET_KEY               (payment processing)
│   └─ NEXT_PUBLIC_SITE_URL            (redirect URL)
│
├─ app/api/webhook/stripe/route.ts
│   ├─ STRIPE_SECRET_KEY               (client init)
│   └─ STRIPE_WEBHOOK_SECRET           (signature verification)
│
├─ app/api/analyze/route.ts
│   ├─ GOOGLE_GENERATIVE_AI_API_KEY    (streaming analysis)
│   └─ NODE_ENV                        (error handling)
│
└─ app/api/repurpose/route.ts
    └─ GOOGLE_GENERATIVE_AI_API_KEY    (content generation)

Utils:
├─ utils/supabase/server.ts
│   ├─ NEXT_PUBLIC_SUPABASE_URL
│   └─ NEXT_PUBLIC_SUPABASE_ANON_KEY
│
├─ utils/supabase/client.ts
│   ├─ NEXT_PUBLIC_SUPABASE_URL
│   └─ NEXT_PUBLIC_SUPABASE_ANON_KEY
│
├─ utils/supabase/middleware.ts
│   ├─ NEXT_PUBLIC_SUPABASE_URL
│   └─ NEXT_PUBLIC_SUPABASE_ANON_KEY
│
└─ utils/supabase/admin.ts
    ├─ NEXT_PUBLIC_SUPABASE_URL
    └─ SUPABASE_SERVICE_ROLE_KEY

Actions:
├─ app/actions/youtube-trends.ts
│   └─ YOUTUBE_API_KEY
│
└─ components/pricing-actions.ts
    └─ STRIPE_SECRET_KEY

Config:
├─ next.config.mjs
│   └─ NODE_ENV
│
└─ playwright.config.ts
    ├─ CI
    └─ PLAYWRIGHT_BASE_URL
```

---

## 4. Environment Isolation

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                         ENVIRONMENT ISOLATION                               │
└─────────────────────────────────────────────────────────────────────────────┘

┌──────────────────────┬──────────────────────┬──────────────────────┐
│   DEVELOPMENT        │      STAGING         │    PRODUCTION        │
├──────────────────────┼──────────────────────┼──────────────────────┤
│ .env.local           │ .env.preview         │ .env.vercel.prod     │
│ (Developer Machine)  │ (Vercel Preview)     │ (Vercel Production)  │
├──────────────────────┼──────────────────────┼──────────────────────┤
│ • Full API keys      │ • Full API keys      │ • Managed by Vercel  │
│ • Test DB            │ • Test DB            │ • Production DB      │
│ • Mock services ok   │ • Real services      │ • Real services      │
│ • No secrets in git  │ • No secrets in git  │ • UI-managed only    │
│ • Fast iteration     │ • Full testing       │ • Secure & monitored │
└──────────────────────┴──────────────────────┴──────────────────────┘

INFO FLOW:
┌─────────────────────┐
│ .env.example (git)  │ ──→ Template para todos os ambientes
└─────────────────────┘

┌─────────────────────┐
│ .env.local (local)  │ ──→ Development (não commit)
└─────────────────────┘

┌─────────────────────┐
│ env.d.ts (git)      │ ──→ Type definitions (público)
└─────────────────────┘

┌─────────────────────────────────────────┐
│ Vercel Project Settings → Vars (UI)     │ ──→ Production
└─────────────────────────────────────────┘
```

---

## 5. Security Layers

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          SECURITY LAYERS                                   │
└─────────────────────────────────────────────────────────────────────────────┘

LAYER 1: Source Control
├─ ✅ .env.example (public - no secrets)
├─ ✅ env.d.ts (public - types only)
├─ ❌ .env.local (git-ignored)
└─ ❌ .env.vercel.prod (git-ignored if local)

LAYER 2: Process Runtime
├─ Server-Only Access:
│  ├─ SESSION_SECRET         (32+ chars)
│  ├─ CSRF_SECRET            (32+ chars)
│  ├─ STRIPE_SECRET_KEY      (secret)
│  ├─ STRIPE_WEBHOOK_SECRET  (secret)
│  └─ SUPABASE_SERVICE_ROLE_KEY (secret)
│
└─ Client-Safe Variables:
   ├─ NEXT_PUBLIC_SUPABASE_URL
   ├─ NEXT_PUBLIC_SUPABASE_ANON_KEY
   ├─ NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
   └─ NEXT_PUBLIC_SITE_URL

LAYER 3: Vercel Security
├─ ✅ Environment variables UI (encrypted)
├─ ✅ Branch-specific overrides
├─ ✅ Automatic rotation on redeploy
└─ ✅ OIDC token for secure CI/CD

LAYER 4: API Key Rotation
├─ Emergency: Regenerate in provider dashboard
├─ Scheduled: Rotate monthly in production
├─ Monitoring: Alert on unusual usage
└─ Testing: Always test rotation in staging
```

---

## 6. Checklist de Setup

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                     ENVIRONMENT SETUP CHECKLIST                             │
└─────────────────────────────────────────────────────────────────────────────┘

DEVELOPMENT SETUP (15 min)
─────────────────────────────
□ cp .env.example .env.local
□ Create Supabase project → get URL & keys
□ Create Google API project → get Gemini API key
□ Optional: Get YouTube API key
□ Optional: Get Stripe keys
□ npm install
□ npm run dev
□ Test: npm run validate:env
□ Test: npm run list:env:vars

STAGING SETUP (Vercel Preview)
──────────────────────────────
□ Push to feature branch
□ Create Vercel preview deployment
□ In Vercel dashboard → Vars → set preview vars:
  □ NEXT_PUBLIC_SUPABASE_URL
  □ NEXT_PUBLIC_SUPABASE_ANON_KEY
  □ GOOGLE_GENERATIVE_AI_API_KEY
  □ STRIPE_SECRET_KEY (test mode)
  □ STRIPE_WEBHOOK_SECRET (test)
□ Test full workflow

PRODUCTION SETUP (Vercel Production)
──────────────────────────────────────
□ In Vercel dashboard → Vars → set production vars:
  □ NODE_ENV = "production"
  □ SESSION_SECRET (generate: openssl rand -hex 32)
  □ CSRF_SECRET (generate: openssl rand -hex 32)
  □ NEXT_PUBLIC_SUPABASE_URL (prod)
  □ NEXT_PUBLIC_SUPABASE_ANON_KEY (prod)
  □ SUPABASE_SERVICE_ROLE_KEY (prod)
  □ GOOGLE_GENERATIVE_AI_API_KEY
  □ STRIPE_SECRET_KEY (prod)
  □ STRIPE_WEBHOOK_SECRET (prod)
  □ NEXT_PUBLIC_SITE_URL (https://yourdomain.com)
  □ Optional: REDIS_URL
  □ Optional: BLOB_READ_WRITE_TOKEN
□ Enable branch protection
□ Test deployment

POST-DEPLOYMENT
──────────────
□ Verify analytics dashboard
□ Check API key usage in provider dashboards
□ Set up monitoring alerts
□ Schedule monthly rotation review
□ Document secrets location (password manager)
```

---

## 7. Debugging Guide

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                          DEBUGGING GUIDE                                    │
└─────────────────────────────────────────────────────────────────────────────┘

Problem: "GOOGLE_GENERATIVE_AI_API_KEY is undefined"
├─ Check: ls -la .env.local (arquivo existe?)
├─ Check: grep GOOGLE .env.local (value existe?)
├─ Check: npm run validate:env (reporta erro?)
└─ Fix: npm run dev (restart server após mudanças)

Problem: "Supabase connection failed"
├─ Check: NEXT_PUBLIC_SUPABASE_URL está correto?
├─ Check: NEXT_PUBLIC_SUPABASE_ANON_KEY está correto?
├─ Check: Projeto Supabase existe e está ativo?
└─ Fix: Copie URL/keys novamente do dashboard

Problem: "Stripe payment rejected"
├─ Check: npm run validate:env (keys completas?)
├─ Check: STRIPE_SECRET_KEY começa com sk_test_?
├─ Check: NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY começa com pk_test_?
├─ Check: Em produção, estão usando sk_live_ e pk_live_?
└─ Fix: Verifique modo test/live no Stripe dashboard

Problem: "Variables appear in browser console"
├─ ⚠️  CRITICAL SECURITY ISSUE!
├─ Check: Nenhuma variável NEXT_PUBLIC_* expõe SECRETS
├─ Check: Remova NEXT_PUBLIC_ do servidor secrets
├─ Fix: npm run validate:env detecta isso?
└─ Action: Regenere secrets imediatamente

Problem: "Build fails with 'env var not found'"
├─ Local dev: .env.local needs the variable
├─ Vercel preview: Set in Vars UI → Preview
├─ Vercel production: Set in Vars UI → Production
├─ Specific branch: Override in Vars UI → Branch selector
└─ Fix: Refresh deployment após adicionar Var
```

---

## 8. File Locations Quick Reference

```
Project Root:
├─ .env.example          ← Template (commit this)
├─ .env.local            ← Development (git-ignored)
├─ .env.vercel.prod      ← Reference only
├─ env.d.ts              ← Type definitions (commit)
│
└─ scripts/
   ├─ validate-env.js    ← Validação
   ├─ list-env-vars.js   ← Listagem
   └─ ...
```

---

**Diagrama criado:** 26/05/2026
**Para mais detalhes, veja:** ENVIRONMENT_VARIABLES_MAP.md
