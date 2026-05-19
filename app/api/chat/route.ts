import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { streamText } from "ai"
import { YoutubeTranscript } from "youtube-transcript"

export const maxDuration = 120
export const dynamic = "force-dynamic"

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractVideoId(url: string): string | null {
  try {
    const cleanUrl = url.trim()
    const u = new URL(cleanUrl)
    const host = u.hostname.replace(/^(www\.|m\.|music\.)/, "")

    if (host === "youtu.be") {
      const id = u.pathname.slice(1).split("/")[0]
      return /^[a-zA-Z0-9_-]{11}$/.test(id) ? id : null
    }

    if (host === "youtube.com") {
      // /watch?v=ID
      const vParam = u.searchParams.get("v")
      if (vParam && /^[a-zA-Z0-9_-]{11}$/.test(vParam)) return vParam

      // /shorts/ID  |  /embed/ID  |  /v/ID  |  /live/ID  |  /e/ID
      const segmentMatch = u.pathname.match(
        /^\/(shorts|embed|v|live|e)\/([a-zA-Z0-9_-]{11})/
      )
      if (segmentMatch) return segmentMatch[2]
    }
  } catch {
    // Failover to regex if URL parsing throws
  }

  // Fallback regex match for any 11-char sequence after typical prefixes
  const fallbackMatch = url.match(/(?:v=|youtu\.be\/|embed\/|v\/|shorts\/|live\/|e\/)([a-zA-Z0-9_-]{11})/)
  return fallbackMatch?.[1] ?? null
}

function extractYoutubeUrl(text: string): string | null {
  // Matches any http/https URL containing youtube.com or youtu.be up to a space, closing paren/bracket
  const match = text.match(
    /(https?:\/\/(?:[a-zA-Z0-9_-]+\.)?(?:youtube\.com|youtu\.be)\/[^\s\)>]*)/i
  )
  return match?.[1] ?? null
}

/** Fetch real transcript from YouTube captions. Returns null on failure. */
async function fetchYouTubeTranscript(videoId: string): Promise<string | null> {
  try {
    const segments = await YoutubeTranscript.fetchTranscript(videoId, {
      lang: "pt",
    }).catch(() =>
      YoutubeTranscript.fetchTranscript(videoId, { lang: "en" }).catch(() =>
        YoutubeTranscript.fetchTranscript(videoId)
      )
    )

    if (!segments || segments.length === 0) return null

    // Join all segments into a single text block, preserving natural flow
    const fullText = segments
      .map((s) => s.text.replace(/\n/g, " ").trim())
      .filter(Boolean)
      .join(" ")

    return fullText.length > 50 ? fullText : null
  } catch {
    return null
  }
}

// ─── Route Handler ─────────────────────────────────────────────────────────────

export async function POST(req: Request) {
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()

  if (!apiKey) {
    console.error("[API] Google Generative AI API key is not configured")
    return Response.json(
      {
        error: "Configuração de API não disponível. Entre em contato com o suporte.",
        code: "API_KEY_MISSING",
      },
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }

  try {
    const body = await req.json()
    const messages = body.messages || []

    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { error: "Nenhuma mensagem fornecida.", code: "EMPTY_MESSAGES" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const lastUserMessage = messages[messages.length - 1]

    if (!lastUserMessage?.content || typeof lastUserMessage.content !== "string") {
      return Response.json(
        { error: "Formato de mensagem inválido.", code: "INVALID_MESSAGE_FORMAT" },
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const messageText = lastUserMessage.content.trim()
    const youtubeUrl = extractYoutubeUrl(messageText)

    if (!youtubeUrl) {
      return Response.json(
        {
          error: "URL do YouTube não encontrada ou inválida. Certifique-se de usar um link válido.",
          code: "INVALID_YOUTUBE_URL",
        },
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    const videoId = extractVideoId(youtubeUrl) ?? ""
    const normalizedUrl = videoId
      ? `https://www.youtube.com/watch?v=${videoId}`
      : youtubeUrl

    // ── PHASE 1: Fetch real YouTube transcript ──────────────────────────────
    console.log(`[API] Fetching transcript for video: ${videoId}`)
    const realTranscript = await fetchYouTubeTranscript(videoId)

    const transcriptStatus = realTranscript
      ? `✅ Transcrição real obtida das legendas do YouTube (${realTranscript.length} caracteres).`
      : `⚠️ Legendas não disponíveis — o Gemini deve transcrever diretamente pelo áudio do vídeo.`

    console.log(`[API] ${transcriptStatus}`)

    // ── PHASE 2: Initialize Gemini ──────────────────────────────────────────
    let google
    try {
      google = createGoogleGenerativeAI({ apiKey })
    } catch (error) {
      console.error("[API] Failed to initialize Google AI:", error)
      return Response.json(
        { error: "Falha ao inicializar serviço de IA.", code: "AI_INIT_FAILED" },
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    // ── PHASE 3: Build Gemini prompt with or without real transcript ────────
    const transcriptSection = realTranscript
      ? `=== TRANSCRIÇÃO REAL DO VÍDEO (obtida diretamente das legendas do YouTube) ===

${realTranscript}

=== FIM DA TRANSCRIÇÃO ===

Use EXATAMENTE essa transcrição no campo "fullWordForWordTranscript". Não altere, não resuma, não parafraseie — copie o texto integral acima.`
      : `=== AVISO: legendas indisponíveis ===
Não foi possível obter as legendas deste vídeo. Você DEVE assistir ao vídeo fornecido e transcrever o áudio palavra por palavra com a máxima fidelidade possível, como um transcritor profissional. Inclua hesitações naturais, pausas e expressões coloquiais.`

    const systemPrompt = `Você é um Engenheiro de Viralidade Audiovisual de nível mundial e Analista de Conteúdo Digital.

Sua missão:
1. Usar a transcrição fornecida (ou gerar uma do vídeo) como base de todas as análises.
2. Analisar profundamente o que foi dito e como foi dito.
3. Construir um blueprint prático para recriar o vídeo de forma viral.

REGRAS CRÍTICAS:
- Responda APENAS com JSON válido. Sem markdown, sem texto fora do JSON.
- Todos os campos de análise DEVEM referenciar trechos reais da transcrição.
- Se a transcrição estiver em outro idioma, TRADUZA o conteúdo para português brasileiro nos campos de análise, mas preserve o original em "fullWordForWordTranscript".
- Vídeos longos devem ter transcrições longas — não corte.

Estrutura JSON obrigatória:
{
  "videoTitle": "Título descritivo e viral do vídeo analisado em português",
  "originalVideoDetails": {
    "originalTitle": "Título REAL e exato do vídeo no YouTube",
    "youtubeVideoId": "${videoId}",
    "approximateViews": "Contagem aproximada de views (ex: 3.7M visualizações)",
    "fullWordForWordTranscript": "TRANSCRIÇÃO COMPLETA palavra por palavra. Se as legendas foram fornecidas, use-as INTEGRALMENTE. Se não, transcreva do áudio. Este campo DEVE ser o mais longo do JSON.",
    "topComments": [
      { "author": "@usuario", "likes": "1.4K likes", "content": "Comentário mais curtido ou representativo" },
      { "author": "@usuario", "likes": "980 likes", "content": "Segundo comentário mais relevante" },
      { "author": "@usuario", "likes": "640 likes", "content": "Terceiro comentário mais relevante" }
    ]
  },
  "transcriptBreakdown": [
    {
      "segmentName": "Nome do segmento (ex: Gancho, Desenvolvimento, Virada, CTA)",
      "timeframe": "Tempo aproximado (ex: 0:00 - 0:45)",
      "keyDialogueSummary": "Trecho literal da transcrição correspondente a este segmento",
      "emotionalTone": "Tom emocional (ex: Urgência, Empatia, Autoridade, Curiosidade)"
    }
  ],
  "originalEssence": {
    "coreMessage": "Mensagem central do vídeo em palavras do apresentador, extraída da transcrição",
    "psychologicalTriggers": "Gatilhos mentais identificados com os trechos exatos onde aparecem",
    "pacingAndDelivery": "Ritmo, velocidade, pausas e energia vocal observados no áudio/vídeo",
    "visualStyle": "Enquadramento, iluminação, cenário, ritmo de corte e estilo de edição"
  },
  "audienceInsights": {
    "viewsAndEngagementAnalysis": "Por que este vídeo viralizou — análise baseada no conteúdo real da transcrição",
    "publicObjections": "Dúvidas e críticas que o público provavelmente levantou, baseadas no conteúdo falado",
    "praiseAndConnectionPoints": "Momentos da transcrição que mais geraram conexão emocional com a audiência",
    "audiencePainPoints": "Dores e desejos tocados pelo vídeo, evidenciados por trechos específicos"
  },
  "recreationBlueprint": {
    "stepByStepAdaptation": "Guia passo a passo para recriar este vídeo em outro nicho usando a estrutura narrativa real",
    "hookAdaptationExamples": [
      { "niche": "Finanças Pessoais / Investimentos", "suggestedHook": "Gancho usando a mesma técnica retórica da abertura real do vídeo" },
      { "niche": "Negócios / Empreendedorismo", "suggestedHook": "Gancho com a mesma cadência e estrutura psicológica do original" },
      { "niche": "Fitness / Saúde", "suggestedHook": "Gancho preservando o mesmo padrão de curiosidade/tensão do original" }
    ],
    "recreationRules": "Elementos narrativos inegociáveis extraídos da transcrição que são a espinha dorsal do viral",
    "suggestedScenes": "Instruções práticas de gravação baseadas no estilo visual real do vídeo"
  },
  "keyLearning": "O segredo de viralidade deste vídeo em 2 linhas, baseado no que foi realmente dito"
}`

    // Build the user message content — include video file only when no real transcript
    const userContent: Array<{
      type: "text"
      text: string
    } | {
      type: "file"
      data: string
      mediaType: string
    }> = [
      {
        type: "text",
        text: `Analise este vídeo do YouTube e gere o blueprint viral completo.\n\nURL: ${normalizedUrl}\n\n${transcriptSection}`,
      },
    ]

    // Attach video file for Gemini multimodal only when no transcript is available
    if (!realTranscript) {
      userContent.push({
        type: "file",
        data: normalizedUrl,
        mediaType: "video/mp4",
      })
    }

    // ── PHASE 4: Stream Gemini analysis ────────────────────────────────────
    const result = await streamText({
      model: google("gemini-2.5-flash"),
      temperature: 0.35,
      system: systemPrompt,
      messages: [
        { role: "user", content: userContent },
      ],
    })

    return result.toTextStreamResponse()

  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
    console.error("[API] Error:", errorMessage)

    let userMessage = "Erro ao processar vídeo. Tente novamente em alguns instantes."
    let errorCode = "PROCESSING_ERROR"

    if (errorMessage.includes("401") || errorMessage.includes("unauthorized")) {
      userMessage = "Erro de autenticação da API. Por favor, tente novamente."
      errorCode = "AUTH_ERROR"
    } else if (errorMessage.includes("429") || errorMessage.includes("rate limit")) {
      userMessage = "Limite de requisições atingido. Aguarde alguns momentos e tente novamente."
      errorCode = "RATE_LIMIT"
    } else if (errorMessage.includes("timeout")) {
      userMessage = "Análise está demorando. Tente com um vídeo mais curto."
      errorCode = "TIMEOUT"
    }

    return Response.json(
      {
        error: userMessage,
        code: errorCode,
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined,
      },
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
