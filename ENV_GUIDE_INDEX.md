# 📖 Índice Completo - Variáveis de Ambiente Unoduno

> **Data:** 26/05/2026  
> **Status:** ✅ Completo e pronto para uso  
> **Tamanho total:** ~59 KB de documentação + ferramentas

---

## 🎯 Por Onde Começar?

### ⭐ Se você tem 5 minutos
→ Leia: **`ENV_QUICK_REFERENCE.md`**  
✨ Resumo executivo com essenciais + links

### 📚 Se você tem 20 minutos
→ Leia: **`ENV_QUICK_REFERENCE.md`** + **`ENVIRONMENT_VARIABLES_MAP.md`**  
✨ Referência completa com todas as variáveis

### 🎨 Se você aprende melhor com diagramas
→ Leia: **`ENVIRONMENT_VARIABLES_DIAGRAM.md`**  
✨ Arquitetura visual, fluxos e diagramas ASCII

### 🤖 Se você precisa processar programaticamente
→ Use: **`env.json`**  
✨ Formato JSON estruturado para parsing

---

## 📁 Estrutura de Arquivos

```
Project Root/
│
├─ 📄 ENV_QUICK_REFERENCE.md           (5.6 KB) ⭐ START HERE
│  └─ Resumo 1 página com essenciais
│
├─ 📄 ENVIRONMENT_VARIABLES_MAP.md     (13 KB)  📚 COMPLETO
│  └─ Referência detalhada de todas as vars
│
├─ 📄 ENVIRONMENT_VARIABLES_DIAGRAM.md (21 KB)  🎨 VISUAL
│  └─ Diagramas ASCII + arquitetura
│
├─ 📄 env.json                         (9.2 KB) 🤖 MACHINE
│  └─ Formato JSON estruturado
│
├─ 📄 ENV_GUIDE_INDEX.md               (Esta)   📖 VOCÊ ESTÁ AQUI
│
├─ .env.example                        (Existente) 📋 TEMPLATE
│  └─ Cópia para .env.local
│
├─ env.d.ts                            (Existente) 📘 TYPES
│  └─ TypeScript definitions
│
└─ scripts/
   ├─ validate-env.js                 (5.6 KB) ✅ VALIDAR
   │  └─ Verifica variáveis obrigatórias
   │
   └─ list-env-vars.js                (4.7 KB) 📋 LISTAR
      └─ Lista vars usadas no código
```

---

## 📊 Conteúdo por Arquivo

### 1. `ENV_QUICK_REFERENCE.md` ⭐ **COMECE AQUI**
**Tamanho:** 5.6 KB | **Tempo de leitura:** 5 min

**Contém:**
- Resumo executivo (1 página)
- File locations
- Essenciais (4 vars críticas)
- Payments, YouTube, Production setup
- Mapa rápido de serviços
- Setup rápido (dev vs prod)
- How to find actual values
- Validation checklist
- Security rules
- Common issues

**👉 Ideal para:** Primeira leitura, quick lookup

---

### 2. `ENVIRONMENT_VARIABLES_MAP.md` 📚 **REFERÊNCIA COMPLETA**
**Tamanho:** 13 KB | **Tempo de leitura:** 20 min

**Contém:**
- Arquivos de configuração (3 arquivos descritos)
- Variáveis definidas (16 server-only, 5 public)
- Mapa de uso no código (por arquivo)
- Integrations & Services (6 serviços)
- Variáveis Vercel (automáticas + git context)
- Variáveis Externas (storage, cache, database)
- Security & Checklist
- Links rápidos (7 dashboards)

**👉 Ideal para:** Referência durante implementação

---

### 3. `ENVIRONMENT_VARIABLES_DIAGRAM.md` 🎨 **VISUAL + ARQUITETURA**
**Tamanho:** 21 KB | **Tempo de leitura:** 15 min

**Contém:**
- Arquitetura geral (fluxo .env → process.env)
- Fluxo de integração (5 tiers)
- Mapa de componentes → variáveis
- Environment isolation (dev/staging/prod)
- Security layers (4 camadas)
- Checklist de setup (dev/staging/prod)
- Debugging guide (problemas comuns)
- File locations quick ref
- Diagramas ASCII visuais

**👉 Ideal para:** Entender arquitetura, debugging visual

---

### 4. `env.json` 🤖 **FORMATO ESTRUTURADO**
**Tamanho:** 9.2 KB | **Tempo de leitura:** N/A (programático)

**Contém:**
- Metadata (projeto, data, versão)
- File locations (4 arquivos com metadata)
- Variables (server, public, external, vercel)
- Services (6 serviços com configs)
- Usage (requerido por env)
- Tools (scripts disponíveis)
- Documentation (links internos)

**👉 Ideal para:** Scripting, validation, automation

---

### 5. `.env.example` 📋 **TEMPLATE**
**Localização:** Raiz do projeto | **Existente**

**Contém:**
- Template comentado com todas as vars
- Valores padrão para development
- Comments explicativos
- Instruções de segurança

**👉 Uso:** `cp .env.example .env.local`

---

### 6. `env.d.ts` 📘 **TYPE DEFINITIONS**
**Localização:** Raiz do projeto | **Existente**

**Contém:**
- TypeScript definitions
- ProcessEnv interface
- Tipos para cada variável
- Comments de segurança

**👉 Uso:** TypeScript intellisense

---

## 🛠️ Ferramentas (Scripts)

### `scripts/validate-env.js` ✅ VALIDAÇÃO
**Tamanho:** 5.6 KB | **Runtime:** <2 sec

**Verifica:**
1. Variáveis obrigatórias por ambiente
2. Variáveis recomendadas
3. Padrões de segurança (sem secrets em NEXT_PUBLIC_*)
4. Formato de valores críticos (min 32 chars)

**Uso:**
```bash
node scripts/validate-env.js
```

**Output:**
```
✓ NEXT_PUBLIC_SUPABASE_URL
✓ NEXT_PUBLIC_SUPABASE_ANON_KEY
✓ GOOGLE_GENERATIVE_AI_API_KEY
✓ NEXT_PUBLIC_SITE_URL
✓ SESSION_SECRET tem comprimento adequado
✓ CSRF_SECRET tem comprimento adequado

Validação PASSOU - Todas as variáveis obrigatórias estão configuradas
```

---

### `scripts/list-env-vars.js` 📋 LISTAGEM
**Tamanho:** 4.7 KB | **Runtime:** <5 sec

**Faz:**
1. Extrai `process.env.*` do código
2. Categoriza por serviço
3. Mostra arquivos que usam cada var
4. Colorized output

**Uso:**
```bash
node scripts/list-env-vars.js
```

**Output:**
```
Supabase (Database & Auth) (3)
  NEXT_PUBLIC_SUPABASE_URL → utils/supabase/server.ts, app/api/chat/route.ts
  NEXT_PUBLIC_SUPABASE_ANON_KEY → utils/supabase/client.ts
  SUPABASE_SERVICE_ROLE_KEY → utils/supabase/admin.ts

Google APIs (1)
  GOOGLE_GENERATIVE_AI_API_KEY → app/api/chat/route.ts

...
```

---

## 📍 Mapa de Navegação por Serviço

### 🔵 **Supabase** (Database + Auth)
**Documentação:**
- `ENV_QUICK_REFERENCE.md` → "Essentials"
- `ENVIRONMENT_VARIABLES_MAP.md` → "Integrations & Services" → "Supabase"
- `ENVIRONMENT_VARIABLES_DIAGRAM.md` → "Tier 1: Authentication & Database"

**Variáveis:**
```
NEXT_PUBLIC_SUPABASE_URL (public)
NEXT_PUBLIC_SUPABASE_ANON_KEY (public)
SUPABASE_SERVICE_ROLE_KEY (private)
```

**Arquivos:**
```
utils/supabase/server.ts
utils/supabase/client.ts
utils/supabase/middleware.ts
utils/supabase/admin.ts
app/api/chat/route.ts
```

**Dashboard:** https://supabase.com/dashboard

---

### 🔵 **Google Gemini** (AI Analysis)
**Documentação:**
- `ENV_QUICK_REFERENCE.md` → "Essentials"
- `ENVIRONMENT_VARIABLES_MAP.md` → "Integrations & Services" → "Google Gemini AI"
- `ENVIRONMENT_VARIABLES_DIAGRAM.md` → "Tier 3: AI & Analysis"

**Variáveis:**
```
GOOGLE_GENERATIVE_AI_API_KEY (private)
```

**Arquivos:**
```
app/api/chat/route.ts
lib/mastra/agent.ts
```

**Dashboard:** https://aistudio.google.com

---

### 🟠 **Stripe** (Payments)
**Documentação:**
- `ENV_QUICK_REFERENCE.md` → "Payments"
- `ENVIRONMENT_VARIABLES_MAP.md` → "Integrations & Services" → "Stripe"
- `ENVIRONMENT_VARIABLES_DIAGRAM.md` → "Tier 2: Payment Processing"

**Variáveis:**
```
STRIPE_SECRET_KEY (private)
STRIPE_WEBHOOK_SECRET (private)
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY (public)
```

**Arquivos:**
```
app/api/checkout/route.ts
app/api/webhook/stripe/route.ts
components/pricing-actions.ts
```

**Dashboard:** https://dashboard.stripe.com

---

### 🎥 **YouTube** (Data)
**Documentação:**
- `ENV_QUICK_REFERENCE.md` → "YouTube"
- `ENVIRONMENT_VARIABLES_MAP.md` → "Integrations & Services" → "YouTube Data API"
- `ENVIRONMENT_VARIABLES_DIAGRAM.md` → "Tier 4: Data Sources"

**Variáveis:**
```
YOUTUBE_API_KEY (private)
```

**Arquivos:**
```
app/actions/youtube-trends.ts
lib/mastra/tools/youtube.ts
```

**Dashboard:** https://console.cloud.google.com/apis

---

## ⏱️ Tempo de Leitura por Nível

| Nível | Arquivos | Tempo | Saída |
|-------|----------|-------|-------|
| **Quick** | Quick Ref | 5 min | Sabe essenciais |
| **Developer** | Quick Ref + Map | 20 min | Pode implementar |
| **Full** | Todos | 45 min | Expert completo |
| **Setup** | Diagrams + Scripts | 30 min | Pronto para deploy |

---

## 🔐 Segurança - Checklist

**Antes de commitar:**
```bash
# 1. Verificar que .env.local NÃO foi committed
git status | grep .env.local

# 2. Validar variáveis
node scripts/validate-env.js

# 3. Garantir que não há secrets em NEXT_PUBLIC_*
grep "NEXT_PUBLIC_.*SECRET" .env.local

# 4. Verificar comprimento de SESSION_SECRET e CSRF_SECRET
# Devem ser >= 32 caracteres
```

**Antes de deployment:**
```bash
# 1. Setup no Vercel UI (não git)
# 2. Validar em staging
# 3. Testar em preview deployment
# 4. Só então deployment em production
```

---

## 🚀 Workflow Recomendado

### Development
```bash
1. cp .env.example .env.local
2. Preencher com valores locais
3. npm run dev
4. node scripts/validate-env.js
```

### Staging (Preview)
```bash
1. Push branch para GitHub
2. Vercel cria preview deployment
3. Set vars em Vercel UI → Preview
4. Test full workflow
```

### Production
```bash
1. Merge para main/master
2. Set vars em Vercel UI → Production
3. Redeploy
4. Verificar metrics no dashboard
```

---

## 📞 Suporte

**Se tiver dúvidas:**

1. **Sobre uma variável específica:**
   → Busque em `ENVIRONMENT_VARIABLES_MAP.md`

2. **Sobre fluxo/arquitetura:**
   → Leia `ENVIRONMENT_VARIABLES_DIAGRAM.md`

3. **Sobre integração específica:**
   → Vá para seção em `ENVIRONMENT_VARIABLES_DIAGRAM.md` → "Mapa de Navegação"

4. **Para validar setup:**
   → Execute `node scripts/validate-env.js`

5. **Para encontrar onde var é usada:**
   → Execute `node scripts/list-env-vars.js`

---

## 📈 Próximos Passos

- [ ] Ler `ENV_QUICK_REFERENCE.md`
- [ ] Executar `node scripts/validate-env.js`
- [ ] Configurar `.env.local` para desenvolvimento
- [ ] Ler `ENVIRONMENT_VARIABLES_MAP.md` para entender cada serviço
- [ ] Testar com `npm run dev`

---

**Documentação criada:** 26/05/2026  
**Status:** ✅ Pronto para produção
