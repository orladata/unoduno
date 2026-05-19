import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { streamText } from "ai"
import { YoutubeTranscript } from "youtube-transcript"
import { put } from '@vercel/blob'
import { kv } from '@vercel/kv'
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/utils/supabase/server'
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

/** Fetch official views count from YouTube metadata with strict 2.5s timeout */
async function fetchYouTubeViews(videoId: string): Promise<string | null> {
  const fetchPromise = (async () => {
    try {
      const res = await fetch(`https://www.youtube.com/watch?v=${videoId}`, { 
        headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36' }
      })
      const html = await res.text()
      // Extract exact views from schema.org metadata
      const match = html.match(/<meta itemprop="interactionCount" content="(\d+)"/)
      return match ? match[1] : null
    } catch {
      return null
    }
  })()

  const timeoutPromise = new Promise<null>((resolve) => {
    setTimeout(() => resolve(null), 2500)
  })

  return Promise.race([fetchPromise, timeoutPromise])
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
    if (!videoId) {
      return Response.json(
        { error: "ID do vídeo não pôde ser extraído." },
        { status: 400 }
      )
    }

    const normalizedUrl = `https://www.youtube.com/watch?v=${videoId}`

    // ── PHASE 0: KV Idempotency & Auth Check ─────────────────────────────────
    const cachedStatus = await kv.get(`video:${videoId}`);
    if (cachedStatus === 'processing') {
      return Response.json(
        { error: 'Este vídeo já está sendo processado por outro usuário.', code: 'ALREADY_PROCESSING' }, 
        { status: 409 }
      );
    }

    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Check if we already have a completed analysis for this video to avoid duplicate AI costs
    const { data: existingVideo } = await supabaseAdmin
      .from('processed_videos')
      .select('script_blob_url')
      .eq('video_id', videoId)
      .eq('status', 'completed')
      .maybeSingle()

    if (existingVideo?.script_blob_url) {
      console.log(`[API] Serving cached analysis for video: ${videoId}`)
      try {
        const cachedRes = await fetch(existingVideo.script_blob_url)
        if (cachedRes.ok) {
          const cachedText = await cachedRes.text()
          // Ensure KV status is completed
          await kv.set(`video:${videoId}`, 'completed', { ex: 86400 })
          return new Response(cachedText, {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'X-Cached-Response': 'true'
            }
          })
        }
      } catch (cacheError) {
        console.error(`[API] Failed to fetch cached blob for ${videoId}, re-processing:`, cacheError)
      }
    }
    
    // Lock in KV (5 mins TTL)
    await kv.set(`video:${videoId}`, 'processing', { ex: 300 });

    const supabaseAuth = await createServerClient()
    const { data: { user } } = await supabaseAuth.auth.getUser()
    const userId = user?.id || null

    // ── PHASE 1: Fetch real YouTube transcript ──────────────────────────────
    console.log(`[API] Fetching transcript for video: ${videoId}`)
    const realTranscript = await fetchYouTubeTranscript(videoId)

    const transcriptStatus = realTranscript
      ? `✅ Transcrição real obtida das legendas do YouTube (${realTranscript.length} caracteres).`
      : `⚠️ Legendas não disponíveis — o Gemini deve transcrever diretamente pelo áudio do vídeo.`

    console.log(`[API] ${transcriptStatus}`)

    console.log(`[API] Fetching official views for video: ${videoId}`)
    const realViews = await fetchYouTubeViews(videoId)
    const formattedViews = realViews ? new Intl.NumberFormat('pt-BR').format(Number(realViews)) : "Indisponível"
    console.log(`[API] Official views: ${formattedViews}`)

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

    const viewsSection = realViews 
      ? `\n=== DADOS OFICIAIS DE ENGAJAMENTO ===\nNúmero exato e oficial de visualizações: ${formattedViews}\nVocê DEVE usar este valor exato (${formattedViews}) em vez de tentar estimar ou chutar as visualizações.\n`
      : ""

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
        text: `Analise este vídeo do YouTube e gere o blueprint viral completo.\n\nURL: ${normalizedUrl}\n\n${viewsSection}\n${transcriptSection}`,
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
      async onFinish({ text }) {
        try {
          console.log(`[API] Uploading payloads to Vercel Blob for ${videoId}...`)
          const transcriptData = realTranscript || "Transcrição via áudio (multimodal)..."
          
          const [transcriptionBlob, scriptBlob] = await Promise.all([
            put(`transcriptions/${videoId}.txt`, transcriptData, {
              access: 'public',
              addRandomSuffix: false,
            }),
            put(`scripts/${videoId}.json`, text, {
              access: 'public',
              contentType: 'application/json',
              addRandomSuffix: false,
            })
          ])

          console.log(`[API] Saving metadata to Supabase for ${videoId}...`)
          const supabaseAdmin = createSupabaseClient(
            process.env.NEXT_PUBLIC_SUPABASE_URL!,
            process.env.SUPABASE_SERVICE_ROLE_KEY!
          )

          await supabaseAdmin.from('processed_videos').insert([
            {
              user_id: userId,
              youtube_url: normalizedUrl,
              video_id: videoId,
              title: "Análise " + videoId, // Título pode ser atualizado posteriormente
              transcription_blob_url: transcriptionBlob.url,
              script_blob_url: scriptBlob.url,
              status: 'completed'
            }
          ])

          await kv.set(`video:${videoId}`, 'completed', { ex: 86400 });
          console.log(`[API] Finished processing ${videoId}.`)
        } catch (bgError) {
          console.error(`[API] Background processing error for ${videoId}:`, bgError)
          await kv.del(`video:${videoId}`);
        }
      }
    })

    return result.toTextStreamResponse()

  } catch (error) {
    const body = await req.clone().json().catch(() => ({}))
    const msgText = body.messages?.[body.messages.length - 1]?.content || ""
    const yUrl = extractYoutubeUrl(msgText)
    const vId = yUrl ? extractVideoId(yUrl) : null
    
    if (vId) await kv.del(`video:${vId}`);

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
