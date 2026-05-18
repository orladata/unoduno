"use client"

import { useState, useCallback, useRef, useEffect } from "react"
import { youtubeUrlSchema, sanitizeTextContent } from "@/lib/validations"

// ============================================================================
// TYPES
// ============================================================================

export type AnalysisStatus = "idle" | "validating" | "creating" | "processing" | "completed" | "error"

export interface AnalysisResult {
  readonly id: string
  readonly videoId: string
  readonly status: "pending" | "processing" | "completed" | "failed"
  readonly result?: {
    readonly hook: string
    readonly introduction: string
    readonly development: string
    readonly cta: string
    readonly viralScore: number
    readonly adaptationLevel: "baixa" | "média" | "alta"
  }
  readonly createdAt: number
}

export interface UseAnalysisState {
  readonly status: AnalysisStatus
  readonly data: AnalysisResult | null
  readonly error: string | null
  readonly rateLimitInfo: {
    readonly remaining: number
    readonly resetAt: number
  } | null
}

export interface UseAnalysisReturn extends UseAnalysisState {
  readonly startAnalysis: (url: string) => Promise<void>
  readonly pollStatus: (id: string) => Promise<void>
  readonly reset: () => void
}

// ============================================================================
// CONSTANTS
// ============================================================================

const API_BASE = "/api/analysis"
const POLL_INTERVAL = 2000 // 2 seconds
const MAX_POLL_ATTEMPTS = 30 // 1 minute max polling

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function parseRateLimitHeaders(headers: Headers): { remaining: number; resetAt: number } | null {
  const remaining = headers.get("X-RateLimit-Remaining")
  const reset = headers.get("X-RateLimit-Reset")
  
  if (remaining === null || reset === null) return null
  
  return {
    remaining: parseInt(remaining, 10),
    resetAt: parseInt(reset, 10),
  }
}

async function handleApiError(response: Response): Promise<string> {
  try {
    const data = await response.json()
    return typeof data.error === "string" ? sanitizeTextContent(data.error) : "Erro desconhecido"
  } catch {
    switch (response.status) {
      case 400:
        return "Requisição inválida"
      case 401:
        return "Não autenticado"
      case 403:
        return "Acesso negado"
      case 404:
        return "Recurso não encontrado"
      case 429:
        return "Muitas requisições. Aguarde um momento."
      case 500:
        return "Erro interno do servidor"
      default:
        return `Erro ${response.status}`
    }
  }
}

// ============================================================================
// HOOK
// ============================================================================

export function useAnalysis(): UseAnalysisReturn {
  const [state, setState] = useState<UseAnalysisState>({
    status: "idle",
    data: null,
    error: null,
    rateLimitInfo: null,
  })
  
  const abortControllerRef = useRef<AbortController | null>(null)
  const pollCountRef = useRef<number>(0)
  const pollTimeoutRef = useRef<NodeJS.Timeout | null>(null)
  
  // Cleanup on unmount
  useEffect(() => {
    return () => {
      abortControllerRef.current?.abort()
      if (pollTimeoutRef.current) {
        clearTimeout(pollTimeoutRef.current)
      }
    }
  }, [])
  
  const reset = useCallback((): void => {
    abortControllerRef.current?.abort()
    if (pollTimeoutRef.current) {
      clearTimeout(pollTimeoutRef.current)
    }
    pollCountRef.current = 0
    setState({
      status: "idle",
      data: null,
      error: null,
      rateLimitInfo: null,
    })
  }, [])
  
  const startAnalysis = useCallback(async (url: string): Promise<void> => {
    // Step 1: Client-side validation
    setState((prev) => ({ ...prev, status: "validating", error: null }))
    
    const validation = youtubeUrlSchema.safeParse(url)
    
    if (!validation.success) {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: validation.error.errors[0]?.message ?? "URL inválida",
      }))
      return
    }
    
    // Step 2: Create new AbortController for this request
    abortControllerRef.current?.abort()
    abortControllerRef.current = new AbortController()
    
    // Step 3: Create analysis via API
    setState((prev) => ({ ...prev, status: "creating" }))
    
    try {
      const response = await fetch(API_BASE, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ url: validation.data }),
        signal: abortControllerRef.current.signal,
      })
      
      const rateLimitInfo = parseRateLimitHeaders(response.headers)
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response)
        setState((prev) => ({
          ...prev,
          status: "error",
          error: errorMessage,
          rateLimitInfo,
        }))
        return
      }
      
      const responseData = await response.json()
      
      if (!responseData.success || !responseData.data?.id) {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: "Resposta inválida do servidor",
          rateLimitInfo,
        }))
        return
      }
      
      // Step 4: Update state and start polling
      setState((prev) => ({
        ...prev,
        status: "processing",
        data: {
          id: responseData.data.id,
          videoId: "",
          status: "pending",
          createdAt: Date.now(),
        },
        rateLimitInfo,
      }))
      
      // Start polling for results
      pollCountRef.current = 0
      pollStatus(responseData.data.id)
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return // Request was cancelled, don't update state
      }
      
      setState((prev) => ({
        ...prev,
        status: "error",
        error: err instanceof Error ? err.message : "Erro de conexão",
      }))
    }
  }, [])
  
  const pollStatus = useCallback(async (id: string): Promise<void> => {
    // Check poll limit
    if (pollCountRef.current >= MAX_POLL_ATTEMPTS) {
      setState((prev) => ({
        ...prev,
        status: "error",
        error: "Tempo limite de processamento excedido",
      }))
      return
    }
    
    pollCountRef.current++
    
    try {
      const response = await fetch(`${API_BASE}?id=${encodeURIComponent(id)}`, {
        method: "GET",
        signal: abortControllerRef.current?.signal,
      })
      
      const rateLimitInfo = parseRateLimitHeaders(response.headers)
      
      if (!response.ok) {
        const errorMessage = await handleApiError(response)
        setState((prev) => ({
          ...prev,
          status: "error",
          error: errorMessage,
          rateLimitInfo,
        }))
        return
      }
      
      const responseData = await response.json()
      
      if (!responseData.success || !responseData.data) {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: "Resposta inválida do servidor",
          rateLimitInfo,
        }))
        return
      }
      
      const analysis = responseData.data as AnalysisResult
      
      // Check if analysis is complete
      if (analysis.status === "completed" || analysis.status === "failed") {
        setState((prev) => ({
          ...prev,
          status: analysis.status === "completed" ? "completed" : "error",
          data: analysis,
          error: analysis.status === "failed" ? "Falha no processamento" : null,
          rateLimitInfo,
        }))
        return
      }
      
      // Continue polling
      setState((prev) => ({
        ...prev,
        data: analysis,
        rateLimitInfo,
      }))
      
      pollTimeoutRef.current = setTimeout(() => {
        pollStatus(id)
      }, POLL_INTERVAL)
    } catch (err) {
      if (err instanceof Error && err.name === "AbortError") {
        return
      }
      
      // Retry on network errors
      if (pollCountRef.current < MAX_POLL_ATTEMPTS) {
        pollTimeoutRef.current = setTimeout(() => {
          pollStatus(id)
        }, POLL_INTERVAL * 2) // Double interval on error
      } else {
        setState((prev) => ({
          ...prev,
          status: "error",
          error: "Erro de conexão durante processamento",
        }))
      }
    }
  }, [])
  
  return {
    ...state,
    startAnalysis,
    pollStatus,
    reset,
  }
}
