import { createGoogleGenerativeAI } from "@ai-sdk/google"
import { streamText } from "ai"

export const maxDuration = 60
export const dynamic = "force-dynamic"

export async function POST(req: Request) {
  // Validate API key first
  const apiKey = process.env.GOOGLE_GENERATIVE_AI_API_KEY?.trim()
  
  if (!apiKey) {
    console.error("[API] Google Generative AI API key is not configured")
    return Response.json(
      { 
        error: "Configuração de API não disponível. Entre em contato com o suporte.",
        code: "API_KEY_MISSING" 
      },
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }

  try {
    const body = await req.json()
    const messages = body.messages || []
    
    // Validate messages exist
    if (!Array.isArray(messages) || messages.length === 0) {
      return Response.json(
        { 
          error: "Nenhuma mensagem fornecida.",
          code: "EMPTY_MESSAGES" 
        },
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }
    
    // Get last user message
    const lastUserMessage = messages[messages.length - 1]
    
    if (!lastUserMessage?.content || typeof lastUserMessage.content !== "string") {
      return Response.json(
        { 
          error: "Formato de mensagem inválido.",
          code: "INVALID_MESSAGE_FORMAT" 
        },
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }
    
    const messageText = lastUserMessage.content.trim()
    
    // Extract YouTube URL with comprehensive regex
    const urlMatch = messageText.match(
      /(https?:\/\/(?:www\.|m\.|music\.)?(?:youtube\.com|youtu\.be)\/(?:watch\?v=|embed\/|v\/)?([a-zA-Z0-9_-]{11})[^\s\)>]*)/i
    )
    const youtubeUrl = urlMatch?.[1] ?? ""
    
    if (!youtubeUrl) {
      return Response.json(
        { 
          error: "URL do YouTube não encontrada ou inválida. Certifique-se de usar um link válido.",
          code: "INVALID_YOUTUBE_URL" 
        },
        { status: 400, headers: { "Content-Type": "application/json" } }
      )
    }

    // Initialize Google AI with explicit error handling
    let google
    try {
      google = createGoogleGenerativeAI({ 
        apiKey,
        baseURL: "https://generativelanguage.googleapis.com/v1beta/openai/"
      })
    } catch (error) {
      console.error("[API] Failed to initialize Google AI:", error)
      return Response.json(
        { 
          error: "Falha ao inicializar serviço de IA.",
          code: "AI_INIT_FAILED" 
        },
        { status: 500, headers: { "Content-Type": "application/json" } }
      )
    }

    // Call streamText with proper error handling
    const result = await streamText({
      model: google("gemini-2.5-pro"),
      temperature: 0.7,
      system: `Você é um Engenheiro de Aprendizado Audiovisual especialista em análise de conteúdo. Sua tarefa é analisar vídeos do YouTube e fornecer uma "Camada de Aprendizado" estruturada.

IMPORTANTE: Responda APENAS com JSON válido, sem explicações adicionais.

Estrutura obrigatória:
{
  "videoTitle": "Título do vídeo",
  "algorithm": {
    "clickAttraction": "Análise de atração visual/textual",
    "retentionEngagement": "Estratégia de retenção",
    "keyQuote": "Citação principal"
  },
  "introduction": {
    "strategy": "Estratégia de primeiros segundos",
    "targetAudience": "Público-alvo",
    "identification": "Identificação com audiência"
  },
  "narrativeStructure": [
    {"moment": "Nome", "description": "O que acontece", "timeframe": "Quando"}
  ],
  "practicalFramework": {
    "hook": "Gancho",
    "context": "Contexto",
    "tension": "Conflito",
    "progression": "Evolução",
    "transformation": "Resultado final"
  },
  "productionPower": {
    "audioVisualTools": "Ferramentas usadas",
    "atmosphereDetails": "Detalhes de atmosfera"
  },
  "keyLearning": "Lição principal (2-3 linhas)"
}

Requisitos:
1. Analise o vídeo profundamente
2. Mantenha foco em aplicabilidade prática
3. Retorne APENAS JSON válido
4. Se educativo, adapte para jornada de aprendizado`,
      prompt: `Analise este vídeo do YouTube e retorne a análise em JSON estruturado:\n\nURL: ${youtubeUrl}`,
    })

    // Convert to streaming response with proper headers
    return result.toUIMessageStreamResponse()
    
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Erro desconhecido"
    
    console.error("[API] Error during streamText:", errorMessage)
    
    // Detect specific error types
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
        details: process.env.NODE_ENV === "development" ? errorMessage : undefined
      },
      { status: 500, headers: { "Content-Type": "application/json" } }
    )
  }
}
