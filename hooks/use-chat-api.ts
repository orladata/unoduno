'use client'

import { useState, useCallback } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface UseChatReturn {
  messages: Message[]
  sendMessage: (options: { text: string; directAudioUrl?: string }) => Promise<void>
  status: 'idle' | 'streaming' | 'submitted' | 'error'
  error: { message: string; code?: string } | null
}

export function useChatAPI(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [status, setStatus] = useState<'idle' | 'streaming' | 'submitted' | 'error'>('idle')
  const [error, setError] = useState<{ message: string; code?: string } | null>(null)

  const sendMessage = useCallback(
    async (options: { text: string; directAudioUrl?: string }) => {
      try {
        setError(null)
        setStatus('submitted')

        const userMessage: Message = {
          role: 'user',
          content: options.text,
        }
        setMessages((prev) => [...prev, userMessage])

        const controller = new AbortController()
        const timeoutId = setTimeout(() => controller.abort(), 120000) // 2 minutes timeout

        try {
          const response = await fetch('/api/chat', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              messages: [...messages, userMessage],
              directAudioUrl: options.directAudioUrl, // Passa a URL direta (Client-Side Proxying)
            }),
            signal: controller.signal,
          })

          clearTimeout(timeoutId)

          if (!response.ok) {
            const errorData = await response.json().catch(() => ({
              error: `HTTP ${response.status}`,
              code: 'HTTP_ERROR'
            }))
            throw new Error(errorData.error || `Erro HTTP ${response.status}`)
          }

          setStatus('streaming')

          const reader = response.body?.getReader()
          if (!reader) {
            throw new Error('Resposta inválida do servidor')
          }

          let assistantContent = ''
          const decoder = new TextDecoder()

          // Add a placeholder message for the assistant that we'll stream into
          setMessages((prev) => [...prev, { role: 'assistant', content: '' }])

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            const chunk = decoder.decode(value, { stream: true })
            assistantContent += chunk

            // Update the assistant's message in real-time
            setMessages((prev) => {
              const updated = [...prev]
              if (updated.length > 0) {
                updated[updated.length - 1] = {
                  role: 'assistant',
                  content: assistantContent,
                }
              }
              return updated
            })
          }

          if (!assistantContent) {
            throw new Error('Nenhuma resposta recebida do servidor')
          }

          setStatus('idle')
        } catch (fetchError) {
          clearTimeout(timeoutId)
          if (fetchError instanceof Error && fetchError.name === 'AbortError') {
            throw new Error('Requisição expirou. Tente novamente.')
          }
          throw fetchError
        }
      } catch (err) {
        const message = err instanceof Error ? err.message : 'Erro desconhecido'
        setError({ message, code: 'CHAT_ERROR' })
        setStatus('error')

        // Catalog the error
        fetch('/api/log-error', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            message,
            code: 'CHAT_ERROR',
            url: window?.location?.href,
            timestamp: new Date().toISOString()
          })
        }).catch(() => {})
      }
    },
    [messages]
  )

  return { messages, sendMessage, status, error }
}
