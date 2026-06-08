import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { streamText } from "ai"
import { YoutubeTranscript } from "youtube-transcript"
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3"
import { createClient as createSupabaseClient } from '@supabase/supabase-js'
import { createClient as createServerClient } from '@/utils/supabase/server'
import { auth, currentUser } from '@clerk/nextjs/server'
import { deductCredits } from '@/utils/credits'
import { z } from "zod"

export const maxDuration = 300
export const dynamic = "force-dynamic"

// Strict Input Validation Schema (Anti-Injection & Payload Limiting)
const ChatPayloadSchema = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant", "system", "data"]),
      content: z.string().min(1).max(5000, "Mensagem muito longa"),
    })
  ).min(1, "Nenhuma mensagem fornecida").max(50, "Muitas mensagens no histórico")
}).strict() // Rejeita propriedades extras no JSON (Anti-Pollution)

// ─── Helpers ──────────────────────────────────────────────────────────────────

const s3Client = new S3Client({
  region: "auto",
  endpoint: process.env.R2_ENDPOINT_URL || "https://auto.r2.cloudflarestorage.com",
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY_ID || "",
    secretAccessKey: process.env.R2_SECRET_ACCESS_KEY || "",
  },
});

async function uploadToR2(key: string, body: string, contentType: string) {
  if (!process.env.R2_ENDPOINT_URL || !process.env.R2_ACCESS_KEY_ID) {
    console.warn("[API] Credenciais do R2 não configuradas, pulando upload.");
    return null;
  }
  const bucketName = process.env.R2_BUCKET_NAME || "whispercore";
  try {
    await s3Client.send(new PutObjectCommand({
      Bucket: bucketName,
      Key: key,
      Body: body,
      ContentType: contentType,
    }));
    return `https://texto.unoduno.com/${key}`;
  } catch (error) {
    console.error(`[API] Erro ao fazer upload para R2 (${key}):`, error);
    return null;
  }
}

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
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim() || process.env.GEMINI_API_KEY?.trim()

  if (!apiKey) {
    console.error("[API] Google Generative AI API key is not configured")
    return Response.json(
      { error: "Erro de configuração do servidor: Chave de API não configurada", code: "SERVER_ERROR" },
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }

  try {
    const rawBody = await req.json()
    
    // Strict Zod Validation (Extendendo schema localmente de forma segura)
    const ExtendedSchema = ChatPayloadSchema.extend({
      directAudioUrl: z.string().url().optional()
    });

    const validationResult = ExtendedSchema.safeParse(rawBody)
    if (!validationResult.success) {
      return Response.json(
        { error: "Payload inválido ou malformado.", code: "INVALID_PAYLOAD", details: validationResult.error.issues },
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }
    
    const messages = validationResult.data.messages
    const directAudioUrl = validationResult.data.directAudioUrl
    const lastUserMessage = messages[messages.length - 1]

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

    const { userId } = await auth()

    if (!userId) {
      return Response.json(
        { error: 'Não autorizado. Por favor, faça login.', code: 'UNAUTHORIZED' },
        { status: 401 }
      )
    }

    const user = await currentUser()
    const userEmail = user?.emailAddresses[0]?.emailAddress || ''
    const isDeveloper = userEmail === 'sonarycorporation@gmail.com'

    // ── SEC-OP: Strict API Rate Limiting ───────────────────────────────────
    if (!isDeveloper) {
      // Nota: Rate Limiting distribuído (antigo Vercel KV) foi removido temporariamente
      // Podemos readicioná-lo usando Supabase ou Upstash no futuro se necessário.
    }

    // ── PHASE 0: Supabase Cache & Idempotency ────────────────────────────────
    const supabaseAdmin = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // Verificando Supabase por análises pré-processadas
    const { data: existingVideo } = await supabaseAdmin
      .from('processed_videos')
      .select('script_blob_url')
      .eq('video_id', videoId)
      .eq('status', 'completed')
      .maybeSingle()

    if (existingVideo?.script_blob_url) {
      console.log(`[API] Serving Supabase cached analysis for video: ${videoId}`)
      try {
        const cachedRes = await fetch(existingVideo.script_blob_url)
        if (cachedRes.ok) {
          const cachedText = await cachedRes.text()
          if (cachedText && cachedText.length > 500) { // Garantir que não está vazio/corrompido
            return new Response(cachedText, {
              headers: {
                'Content-Type': 'text/plain; charset=utf-8',
                'X-Cached-Response': 'true'
              }
            })
          } else {
            console.warn(`[API] Supabase cache invalid or empty for ${videoId}, reprocessing...`)
          }
        }
      } catch (cacheError) {
        console.error(`[API] Failed to fetch Supabase cached blob for ${videoId}:`, cacheError)
      }
    }

    // ── PHASE 0.5: PAYWALL (Cobrança de Créditos) ──────────────────────────────
    // Check if the user is a premium subscriber or developer to bypass
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('subscription_tier')
      .eq('id', userId)
      .maybeSingle()
    
    // ── STREAMING: Bypass Vercel Timeout with ReadableStream ──────────
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder()
        
        const sendLog = (msg: string) => {
          controller.enqueue(encoder.encode(`*⏳ ${msg}*\n\n`))
        }

        try {
          // ── PHASE 1: Fetch real YouTube transcript using Dedicated GPU (Cerebrium) ──
          sendLog("Iniciando extração de áudio e GPU dedicada (Cerebrium)...")
          let realTranscript: string | null = null

          const cerebriumUrl = process.env.CEREBRIUM_API_URL || "https://api.aws.us-east-1.cerebrium.ai/v4/p-2cd4cd4c/unoduno-transcriber/run"

          if (cerebriumUrl) {
            try {
              const audioUrlToProcess = directAudioUrl || normalizedUrl
              sendLog(`Enviando áudio para processamento: ${videoId}...`)
              
              const whisperRes = await fetch(cerebriumUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ video_url: audioUrlToProcess })
              })
              
              if (whisperRes.ok) {
                sendLog("Áudio recebido! Extraindo legendas (Whisper GPU)...")
                const rawResponse = await whisperRes.json()
                const cerebriumData = rawResponse.result
                
                if (cerebriumData && cerebriumData.success && cerebriumData.transcript) {
                  realTranscript = String(cerebriumData.transcript)
                  sendLog(`Transcrição concluída com sucesso! (${realTranscript.length} caracteres)`)
                  controller.enqueue(encoder.encode(`\n*TRANSCRICAO_START*\n${realTranscript}\n*TRANSCRICAO_END*\n\n`))
                } else {
                  sendLog("Aviso: Cerebrium retornou sem transcrição. Tentando backup do YouTube...")
                }
              } else {
                sendLog(`Aviso: Falha de conexão com GPU (HTTP ${whisperRes.status}). Tentando backup...`)
              }
            } catch (error) {
              sendLog("Aviso: Erro na pipeline da GPU. Tentando backup...")
            }
          }

          if (!realTranscript) {
            sendLog("Buscando legendas nativas do YouTube...")
            realTranscript = await fetchYouTubeTranscript(videoId)
            if (realTranscript) {
               sendLog(`✅ Transcrição nativa obtida com sucesso.`)
               controller.enqueue(encoder.encode(`\n*TRANSCRICAO_START*\n${realTranscript}\n*TRANSCRICAO_END*\n\n`))
            }
          }

          if (!realTranscript) {
            throw new Error("Não foi possível obter a transcrição do vídeo por nenhum método.")
          }

          sendLog("Buscando metadados oficiais de engajamento...")
          const realViews = await fetchYouTubeViews(videoId)
          const formattedViews = realViews ? new Intl.NumberFormat('pt-BR').format(Number(realViews)) : "Indisponível"

          // ── PHASE 2: Initialize Gemini ──────────────────────────────────────────
          let google
          try {
            google = createGoogleGenerativeAI({ apiKey })
          } catch (error) {
            throw new Error("Falha ao inicializar serviço de IA do Google.")
          }

          sendLog("Analisando roteiro e gerando Blueprint Viral com Gemini...")

          // ── PHASE 3: Build Gemini prompt ──────────────────────────────────────────
          const transcriptionUrl = `https://texto.unoduno.com/transcriptions/${videoId}.txt`
          
          const transcriptSection = `=== TRANSCRIÇÃO REAL DO VÍDEO (obtida diretamente das legendas do YouTube ou Cerebrium) ===\n\n${realTranscript}\n\n=== FIM DA TRANSCRIÇÃO ===\n\nNÃO tente copiar toda essa transcrição no JSON. Faça apenas um resumo dos principais pontos falados.`
          
          const systemPrompt = `Você é um Engenheiro de Viralidade Audiovisual de nível mundial e Analista de Conteúdo Digital.

Sua missão:
1. Usar a transcrição fornecida como base de todas as análises.
2. Analisar profundamente o que foi dito e como foi dito.
3. Construir um blueprint prático para recriar o vídeo de forma viral.

REGRAS CRÍTICAS:
- Responda APENAS com JSON válido. Sem markdown, sem texto fora do JSON.
- Todos os campos de análise DEVEM referenciar trechos reais da transcrição.

Estrutura JSON obrigatória:
{
  "videoTitle": "Título descritivo e viral do vídeo analisado em português",
  "originalVideoDetails": {
    "originalTitle": "Título REAL e exato do vídeo no YouTube",
    "youtubeVideoId": "${videoId}",
    "approximateViews": "Contagem aproximada de views (ex: 3.7M visualizações)",
    "fullWordForWordTranscript": "Breve resumo da transcrição (máximo 500 palavras). NÃO copie o texto integral para não exceder o limite do sistema.",
    "transcriptionDownloadUrl": "Insira EXATAMENTE esta URL: ${transcriptionUrl}",
    "topComments": [
      { "author": "@usuario", "likes": "1.4K likes", "content": "Comentário mais curtido ou representativo" }
    ]
  },
  "transcriptBreakdown": [
    {
      "segmentName": "Nome do segmento (ex: Gancho, Desenvolvimento, Virada, CTA)",
      "timeframe": "Tempo aproximado (ex: 0:00 - 0:45)",
      "keyDialogueSummary": "Trecho literal da transcrição",
      "emotionalTone": "Tom emocional"
    }
  ],
  "originalEssence": {
    "coreMessage": "Mensagem central",
    "psychologicalTriggers": "Gatilhos mentais identificados",
    "pacingAndDelivery": "Ritmo, velocidade e energia vocal",
    "visualStyle": "Enquadramento, ritmo de corte e estilo"
  },
  "audienceInsights": {
    "viewsAndEngagementAnalysis": "Por que viralizou?",
    "publicObjections": "Objeções prováveis",
    "praiseAndConnectionPoints": "Momentos de conexão emocional",
    "audiencePainPoints": "Dores da audiência"
  },
  "recreationBlueprint": {
    "stepByStepAdaptation": "Guia de adaptação narrativa",
    "hookAdaptationExamples": [
      { "niche": "Finanças", "suggestedHook": "Gancho adaptado" }
    ],
    "recreationRules": "Regras inegociáveis do viral",
    "suggestedScenes": "Instruções práticas de gravação"
  },
  "keyLearning": "Segredo de viralidade em 2 linhas"
}`

          const viewsSection = realViews 
            ? `\n=== DADOS OFICIAIS DE ENGAJAMENTO ===\nNúmero exato e oficial de visualizações: ${formattedViews}\nVocê DEVE usar este valor exato (${formattedViews}) em vez de tentar estimar ou chutar as visualizações.\n`
            : ""

          const userContent: Array<any> = [
            {
              type: "text",
              text: `Analise este vídeo do YouTube e gere o blueprint viral completo.\n\nURL: ${normalizedUrl}\n\n${viewsSection}\n${transcriptSection}`,
            },
          ]

          const result = await streamText({
            model: google("gemini-1.5-flash"),
            temperature: 0.35,
            system: systemPrompt,
            messages: [{ role: "user", content: userContent }],
          })

          let finalJsonText = ""
          
          for await (const textPart of result.textStream) {
            controller.enqueue(encoder.encode(textPart))
            finalJsonText += textPart
          }

          // ── PHASE 4: Background Uploads & Supabase ────────────────────────────
          try {
            console.log(`[API] Uploading payloads to Cloudflare R2 for ${videoId}...`)
            await uploadToR2(`transcriptions/${videoId}.txt`, realTranscript, 'text/plain')
            const scriptUrl = await uploadToR2(`scripts/${videoId}.json`, finalJsonText, 'application/json')

            console.log(`[API] Saving metadata to Supabase for ${videoId}...`)
            await supabaseAdmin.from('processed_videos').insert([
              {
                user_id: userId,
                youtube_url: normalizedUrl,
                video_id: videoId,
                title: "Análise " + videoId,
                transcription_blob_url: transcriptionUrl,
                script_blob_url: scriptUrl,
                status: 'completed'
              }
            ])
            console.log(`[API] Finished processing ${videoId}.`)
          } catch (bgError) {
            console.error(`[API] Background processing error for ${videoId}:`, bgError)
          }

          controller.close()

        } catch (error: any) {
          console.error("[API Stream Error]", error)
          controller.enqueue(encoder.encode(`\n\n{"error": "Falha no pipeline: ${error?.message || 'Erro desconhecido'}"}`))
          controller.close()
        }
      }
    })

    return new Response(stream, {
      headers: {
        "Content-Type": "text/plain; charset=utf-8",
        "Cache-Control": "no-cache, no-transform",
        "Connection": "keep-alive"
      }
    })

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
