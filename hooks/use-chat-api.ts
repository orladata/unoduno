'use client'

import { useState, useCallback } from 'react'

interface Message {
  role: 'user' | 'assistant'
  content: string
}

interface UseChatReturn {
  messages: Message[]
  sendMessage: (options: { text: string }) => Promise<void>
  status: 'idle' | 'streaming' | 'submitted' | 'error'
  error: { message: string; code?: string } | null
}

export function useChatAPI(): UseChatReturn {
  const [messages, setMessages] = useState<Message[]>([])
  const [status, setStatus] = useState<'idle' | 'streaming' | 'submitted' | 'error'>('idle')
  const [error, setError] = useState<{ message: string; code?: string } | null>(null)

  const sendMessage = useCallback(
    async (options: { text: string }) => {
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
          let buffer = ''

          while (true) {
            const { done, value } = await reader.read()
            if (done) break

            buffer += decoder.decode(value, { stream: true })
            const lines = buffer.split('\n')
            buffer = lines.pop() || ''

            for (const line of lines) {
              if (line.startsWith('data: ')) {
                try {
                  const jsonStr = line.slice(6)
                  if (jsonStr && jsonStr !== '[DONE]') {
                    const chunk = JSON.parse(jsonStr)
                    if (chunk.choices?.[0]?.delta?.content) {
                      assistantContent += chunk.choices[0].delta.content
                    }
                  }
                } catch (e) {
                  // Silently ignore JSON parse errors
                }
              }
            }
          }

          // Process remaining buffer
          if (buffer.trim() && buffer.startsWith('data: ')) {
            try {
              const jsonStr = buffer.slice(6)
              if (jsonStr && jsonStr !== '[DONE]') {
                const chunk = JSON.parse(jsonStr)
                if (chunk.choices?.[0]?.delta?.content) {
                  assistantContent += chunk.choices[0].delta.content
                }
              }
            } catch (e) {
              // Silently ignore
            }
          }

          if (!assistantContent) {
            throw new Error('Nenhuma resposta recebida do servidor')
          }

          const assistantMessage: Message = {
            role: 'assistant',
            content: assistantContent,
          }
          setMessages((prev) => [...prev, assistantMessage])
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
      }
    },
    [messages]
  )

  return { messages, sendMessage, status, error }
}
