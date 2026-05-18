'use client'

import { useState } from 'react'

export default function DebugPage() {
  const [output, setOutput] = useState('')

  const testAPI = async () => {
    setOutput('Testando API...')
    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            {
              role: 'user',
              text: 'Analise este vídeo do YouTube: https://youtu.be/-4OucENKV_k?si=_xoMqsboK6u8TJrB'
            }
          ]
        })
      })

      if (!response.ok) {
        const error = await response.json()
        setOutput(`Erro: ${JSON.stringify(error, null, 2)}`)
        return
      }

      // Para stream, precisamos ler os chunks
      const reader = response.body?.getReader()
      if (!reader) {
        setOutput('Erro: Sem reader de stream')
        return
      }

      let result = ''
      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        result += new TextDecoder().decode(value)
      }
      setOutput(`Sucesso:\n${result.substring(0, 500)}...`)
    } catch (e) {
      setOutput(`Exceção: ${e instanceof Error ? e.message : String(e)}`)
    }
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Debug API</h1>
      <button
        onClick={testAPI}
        className="px-4 py-2 bg-blue-600 text-white rounded"
      >
        Testar API
      </button>
      <pre className="mt-4 p-4 bg-gray-900 text-green-400 rounded overflow-auto max-h-96">
        {output}
      </pre>
    </div>
  )
}
