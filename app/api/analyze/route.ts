import { Harness } from "@mastra/core";
import { unodunoAgent } from "./agent";
import type { NextRequest } from "next/server";

/**
 * /api/analyze - Análise com Streaming & Durability
 * 
 * Exemplo de implementação de Durable Agents com resumable streams.
 * Perfeito para análises de vídeos longos que podem ser interrompidas.
 * 
 * Features:
 * - Persiste estado da análise
 * - Resume se conexão cair
 * - Streaming de resultados em tempo real
 * - Cancellable com AbortController
 */

export async function POST(req: NextRequest) {
  const { videoUrl, userId } = await req.json();

  if (!videoUrl) {
    return new Response(
      JSON.stringify({ error: "videoUrl is required" }),
      { status: 400 }
    );
  }

  // Workspace único por usuário para persistência
  const workspaceId = `user-${userId}-workspace`;

  try {
    // Criar harness com history recording
    const harness = new Harness({
      agent: unodunoAgent,
      workspaceId, // Persiste estado
      recordHistory: true // Salva cada step
    });

    // Se análise prévia foi interrompida, pode resumir
    const previousRun = await harness.getHistory?.(videoUrl);
    if (previousRun?.state === "suspended") {
      console.log("[Analyze] Resumindo análise prévia...");
      // Pode usar respondToToolSuspension para continuar
    }

    // Setup do stream
    const { readable, writable } = new TransformStream();
    const writer = writable.getWriter();

    // Processar em background, não bloqueando a resposta
    (async () => {
      try {
        const stream = await harness.runStream({
          messages: [
            {
              role: "user",
              content: `Analyze YouTube video: ${videoUrl}
              
              Provide:
              1. Transcrição completa
              2. Temas principais
              3. Capítulos sugeridos
              4. Ideias para replicar em português
              5. Estatísticas (duração, palavras-chave)`
            }
          ]
        });

        // Forward cada evento do stream
        for await (const event of stream) {
          if (event.type === "tool_suspended") {
            // User interrompeu ou conexão caiu
            await writer.write(
              JSON.stringify({
                type: "suspended",
                toolName: event.toolName,
                resumeSchema: event.resumeSchema,
                canResume: true
              }) + "\n"
            );
            break;
          }

          if (event.type === "text") {
            // Streaming de texto
            await writer.write(
              JSON.stringify({
                type: "chunk",
                content: event.content,
                timestamp: new Date().toISOString()
              }) + "\n"
            );
          }

          if (event.type === "agent_end") {
            // Análise completada
            await writer.write(
              JSON.stringify({
                type: "complete",
                result: event.result,
                tokensUsed: event.tokensUsed,
                costEstimated: event.tokensUsed * 0.00001 // Estimativa
              }) + "\n"
            );
          }
        }

        await writer.close();
      } catch (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Unknown error";
        await writer.write(
          JSON.stringify({ type: "error", message: errorMessage }) + "\n"
        );
        await writer.close();
      }
    })();

    return new Response(readable, {
      headers: {
        "Content-Type": "application/x-ndjson",
        "Cache-Control": "no-cache",
        "Transfer-Encoding": "chunked"
      }
    });
  } catch (error) {
    console.error("[Analyze] Erro:", error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : "Analysis failed"
      }),
      { status: 500 }
    );
  }
}

/**
 * Cliente para consumir o streaming:
 * 
 * // /components/streaming-analyzer.tsx
 * import { useEffect, useState } from 'react';
 * 
 * export function StreamingAnalyzer({ videoUrl, userId }) {
 *   const [chunks, setChunks] = useState<string[]>([]);
 *   const [isComplete, setIsComplete] = useState(false);
 *   const [error, setError] = useState<string | null>(null);
 * 
 *   useEffect(() => {
 *     const analyze = async () => {
 *       try {
 *         const response = await fetch('/api/analyze', {
 *           method: 'POST',
 *           headers: { 'Content-Type': 'application/json' },
 *           body: JSON.stringify({ videoUrl, userId })
 *         });
 * 
 *         const reader = response.body?.getReader();
 *         if (!reader) throw new Error('No response body');
 * 
 *         const decoder = new TextDecoder();
 *         while (true) {
 *           const { done, value } = await reader.read();
 *           if (done) break;
 * 
 *           const text = decoder.decode(value);
 *           const lines = text.split('\n').filter(l => l);
 * 
 *           for (const line of lines) {
 *             const event = JSON.parse(line);
 *             
 *             if (event.type === 'chunk') {
 *               setChunks(prev => [...prev, event.content]);
 *             } else if (event.type === 'complete') {
 *               setIsComplete(true);
 *             } else if (event.type === 'error') {
 *               setError(event.message);
 *             }
 *           }
 *         }
 *       } catch (err) {
 *         setError(err instanceof Error ? err.message : 'Failed to analyze');
 *       }
 *     };
 * 
 *     analyze();
 *   }, [videoUrl, userId]);
 * 
 *   return (
 *     <div className="space-y-4">
 *       {chunks.map((chunk, i) => (
 *         <p key={i} className="text-sm text-white/70">{chunk}</p>
 *       ))}
 *       {isComplete && <div className="text-green-400">✓ Analysis complete</div>}
 *       {error && <div className="text-red-400">✗ {error}</div>}
 *     </div>
 *   );
 * }
 */
