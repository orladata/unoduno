import { Mastra } from "@mastra/core"
import { Agent } from "@mastra/core/agent"
import { google } from "@ai-sdk/google"

/**
 * ==============================================================================
 * UNODUNO NEURAL ENGINE
 * (Wrapper arquitetural em cima do Framework Mastra AI)
 * ==============================================================================
 *
 * CONFIGURAÇÃO: 100% Google Gemini API — Modelos de Última Geração
 *
 * Modelo Rápido:   gemini-3.5-flash         (Gen 3.5 — Thinking nativo, ultra-rápido)
 * Modelo Premium:  gemini-3.1-pro-preview   (Gen 3.1 — Raciocínio máximo)
 * Modelo Lite:     gemini-3.1-flash-lite    (Gen 3.1 — Ultra-barato para tarefas leves)
 *
 * Autenticação: GOOGLE_GENERATIVE_AI_API_KEY (lida automaticamente do .env.local)
 *
 * Para o resto da aplicação, nós chamamos apenas "UnodunoEngine".
 * Isso permite white-labeling e controle total sobre como a IA responde.
 */

// ─── MODELOS DISPONÍVEIS ─────────────────────────────────────────────────────
// Centralizados aqui para trocar em um único lugar se necessário.
export const MODELS = {
  /** Gen 3.5 — O mais novo e rápido. Thinking nativo. Ideal para roteiros do dia-a-dia. */
  fast: google("gemini-3.5-flash"),

  /** Gen 3.1 — O mais inteligente disponível. Para roteiros premium e raciocínio complexo. */
  pro: google("gemini-3.1-pro-preview"),

  /** Gen 3.1 — Ultra-barato. Para tarefas leves como resumos, changelog, recapitulações. */
  lite: google("gemini-3.1-flash-lite"),

  /** Gen 2.5 — Fallback estável caso os previews apresentem instabilidade. */
  fallbackFlash: google("gemini-2.5-flash"),
  fallbackPro: google("gemini-2.5-pro"),
} as const

// ─── AGENTES ─────────────────────────────────────────────────────────────────

// 1. Agente Roteirista (Core do Produto) — Gemini 3.5 Flash
const scriptArchitectAgent = new Agent({
  id: "unoduno-script-architect",
  name: "Unoduno Script Architect",
  instructions: `
    Você é um roteirista viral especialista no mercado brasileiro (TikTok, YouTube Shorts, Reels).
    Seu objetivo é pegar transcrições cruas e criar roteiros altamente retentivos.
    Você não usa termos robóticos. Você pensa como um Copywriter de elite.
    Você escreve em português brasileiro coloquial e envolvente.
    Sempre estruture com: GANCHO → DESENVOLVIMENTO → CTA.
  `,
  model: MODELS.fast,
})

// 2. Agente Revisor (Qualidade) — Gemini 3.5 Flash
const qualityReviewerAgent = new Agent({
  id: "unoduno-quality-reviewer",
  name: "Unoduno Quality Reviewer",
  instructions: `
    Você é um revisor implacável de roteiros virais para o mercado brasileiro.
    Seu trabalho é receber um roteiro e apontar:
    - Ganchos fracos (os primeiros 3 segundos precisam prender)
    - Frases longas demais para vídeo curto
    - CTAs genéricos
    - Tom robótico ou artificial
    Você responde em JSON com { score: number, issues: string[], improved: string }.
  `,
  model: MODELS.fast,
})

// 3. Agente Premium (Agências) — Gemini 3.1 Pro
const premiumArchitectAgent = new Agent({
  id: "unoduno-premium-architect",
  name: "Unoduno Premium Architect",
  instructions: `
    Você é um roteirista viral de elite para o mercado brasileiro.
    Crie roteiros cinematográficos, com ganchos emocionais devastadores.
    Use técnicas de storytelling avançadas.
    Estrutura obrigatória: GANCHO EMOCIONAL → TENSÃO → VIRADA → CTA IRRESISTÍVEL.
    Pense profundamente antes de escrever. Analise o tom, o público e o objetivo.
  `,
  model: MODELS.pro,
})

// 4. Agente de Ganchos (Hook Generator) — Gemini 3.5 Flash
const hookGeneratorAgent = new Agent({
  id: "unoduno-hook-generator",
  name: "Unoduno Hook Generator",
  instructions: `
    Você é um gênio da retenção. Seu trabalho é criar 10 ganchos virais irresistíveis 
    (os primeiros 3 segundos do vídeo) para o tema fornecido.
    Use números, gatilhos de curiosidade, quebra de padrão ou polêmica leve.
    Responda APENAS com um JSON válido contendo um array de strings. Exemplo:
    ["Você sabia que...", "O maior erro que você comete..."]
  `,
  model: MODELS.fast,
})

// 5. Agente de Re-aproveitamento (Content Repurposer) — Gemini 3.1 Pro
const contentRepurposerAgent = new Agent({
  id: "unoduno-content-repurposer",
  name: "Unoduno Content Repurposer",
  instructions: `
    Você é um estrategista de conteúdo. Receberá a transcrição de um vídeo longo (ex: podcast).
    Seu trabalho é encontrar os 3 momentos mais impactantes e transformá-los em 
    3 roteiros curtos separados para TikTok/Reels (máximo 60s cada).
    Estruture cada um com Gancho forte e CTA.
    Responda em formato markdown estruturado.
  `,
  model: MODELS.pro,
})

// ─── MOTOR PRINCIPAL ─────────────────────────────────────────────────────────

export const UnodunoEngine = new Mastra({
  agents: {
    scriptArchitectAgent,
    qualityReviewerAgent,
    premiumArchitectAgent,
    hookGeneratorAgent,
    contentRepurposerAgent,
  },
})

// ─── FACADES (API Pública) ───────────────────────────────────────────────────

export async function generateViralScript(transcription: string) {
  const agent = UnodunoEngine.getAgent("scriptArchitectAgent")
  const response = await agent.generate([
    { role: "user", content: `Transforme esta transcrição em um roteiro viral para TikTok/Reels:\n\n${transcription}` },
  ])
  return response.text
}

export async function generatePremiumScript(transcription: string) {
  const agent = UnodunoEngine.getAgent("premiumArchitectAgent")
  const response = await agent.generate([
    { role: "user", content: `Crie um roteiro viral PREMIUM a partir desta transcrição:\n\n${transcription}` },
  ])
  return response.text
}

export async function reviewScript(script: string) {
  const agent = UnodunoEngine.getAgent("qualityReviewerAgent")
  const response = await agent.generate([
    { role: "user", content: `Revise este roteiro viral e retorne um JSON com score, issues e versão improved:\n\n${script}` },
  ])
  return response.text
}

export async function generateHooks(topic: string) {
  const agent = UnodunoEngine.getAgent("hookGeneratorAgent")
  const response = await agent.generate([
    { role: "user", content: `Gere 10 ganchos virais para este tema: ${topic}` },
  ])
  return response.text
}

export async function repurposeContent(longTranscription: string) {
  const agent = UnodunoEngine.getAgent("contentRepurposerAgent")
  const response = await agent.generate([
    { role: "user", content: `Crie 3 cortes virais a partir deste podcast/vídeo longo:\n\n${longTranscription}` },
  ])
  return response.text
}
