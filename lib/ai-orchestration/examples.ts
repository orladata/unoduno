import { analyzeVideo, batchAnalysis } from "@/lib/ai-orchestration/unified-ai-engine";

/**
 * Unified AI Engine - Exemplos de Uso
 * Demonstra como usar Mastra + Vercel AI SDK + LangGraph
 */

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLO 1: Quick Analysis (Análise Rápida)
// Perfeito para: Dashboard, preview rápida
// Engine: Vercel AI SDK
// Duração esperada: 2-5 segundos
// ═══════════════════════════════════════════════════════════════════════════

export async function example1_quickAnalysis() {
  console.log("\n[EXEMPLO 1] Quick Analysis");
  console.log("─".repeat(60));

  const result = await analyzeVideo({
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    analysisType: "quick",
  });

  if (result.success) {
    console.log("✓ Análise concluída em:", result.metadata.duration, "ms");
    console.log("Resultado (primeiros 200 caracteres):");
    console.log(
      result.data?.analysis?.substring(0, 200),
      result.data?.analysis && "..."
    );
  } else {
    console.log("✗ Erro:", result.error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLO 2: Detailed Analysis (Análise Detalhada)
// Perfeito para: Análise profunda, relatórios
// Engine: Mastra Agent com Tools
// Duração esperada: 10-30 segundos
// ═══════════════════════════════════════════════════════════════════════════

export async function example2_detailedAnalysis() {
  console.log("\n[EXEMPLO 2] Detailed Analysis");
  console.log("─".repeat(60));

  const result = await analyzeVideo({
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    analysisType: "detailed",
  });

  if (result.success) {
    console.log("✓ Análise detalhada concluída em:", result.metadata.duration, "ms");
    console.log("Engine usado:", result.metadata.engine);
    console.log("Resultado (primeiros 300 caracteres):");
    console.log(
      result.data?.analysis?.substring(0, 300),
      result.data?.analysis && "..."
    );
  } else {
    console.log("✗ Erro:", result.error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLO 3: Interactive Analysis (Análise Interativa)
// Perfeito para: Fluxo completo, estado gerenciado
// Engine: LangGraph Workflow
// Duração esperada: 15-45 segundos
// ═══════════════════════════════════════════════════════════════════════════

export async function example3_interactiveAnalysis() {
  console.log("\n[EXEMPLO 3] Interactive Analysis");
  console.log("─".repeat(60));

  const result = await analyzeVideo({
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    analysisType: "interactive",
    returnStructured: true,
  });

  if (result.success) {
    console.log("✓ Análise interativa concluída em:", result.metadata.duration, "ms");
    console.log("Engine usado:", result.metadata.engine);

    if (result.data?.structured) {
      console.log("\nDados Estruturados:");
      console.log("  Hooks:", result.data.structured.hooks.slice(0, 2));
      console.log(
        "  Estratégias:",
        result.data.structured.strategies.slice(0, 2)
      );
      console.log("  Temas:", result.data.structured.themes);
      console.log(
        "  Potencial Viral:",
        result.data.structured.viral_potential + "%"
      );
      console.log(
        "  Duração Recomendada:",
        result.data.structured.recommended_duration
      );
    }

    console.log("\nAnálise (primeiros 250 caracteres):");
    console.log(
      result.data?.analysis?.substring(0, 250),
      result.data?.analysis && "..."
    );
  } else {
    console.log("✗ Erro:", result.error);
  }
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLO 4: Batch Analysis (Análise em Lote)
// Perfeito para: Múltiplos vídeos, comparação
// Duração esperada: 20-60 segundos (para 5 vídeos)
// ═══════════════════════════════════════════════════════════════════════════

export async function example4_batchAnalysis() {
  console.log("\n[EXEMPLO 4] Batch Analysis");
  console.log("─".repeat(60));

  const videoUrls = [
    "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    "https://www.youtube.com/watch?v=jNQXAC9IVRw",
    "https://www.youtube.com/watch?v=9bZkp7q19f0",
  ];

  console.log("Analisando", videoUrls.length, "vídeos em paralelo...");

  const results = await batchAnalysis(videoUrls, "quick");

  console.log("\n✓ Análise em lote concluída");
  results.forEach((result, index) => {
    const status = result.success ? "✓" : "✗";
    const duration = result.metadata.duration;
    console.log(`  ${status} Vídeo ${index + 1}: ${duration}ms`);
  });

  console.log(
    "\nTempo total (paralelo):",
    Math.max(...results.map((r) => r.metadata.duration)),
    "ms"
  );
}

// ═══════════════════════════════════════════════════════════════════════════
// EXEMPLO 5: Comparação de Engines
// Mostra diferenças entre Quick, Detailed e Interactive
// ═══════════════════════════════════════════════════════════════════════════

export async function example5_compareEngines() {
  console.log("\n[EXEMPLO 5] Comparação de Engines");
  console.log("─".repeat(60));

  const videoUrl = "https://www.youtube.com/watch?v=dQw4w9WgXcQ";

  console.log("Testando mesma URL com diferentes engines...\n");

  // Quick
  const quick = await analyzeVideo({
    videoUrl,
    analysisType: "quick",
  });

  // Detailed
  const detailed = await analyzeVideo({
    videoUrl,
    analysisType: "detailed",
  });

  // Interactive
  const interactive = await analyzeVideo({
    videoUrl,
    analysisType: "interactive",
    returnStructured: true,
  });

  console.log("RESULTADOS:");
  console.log("─".repeat(60));

  console.log("\n1. QUICK (Vercel AI SDK)");
  console.log("   Status:", quick.success ? "✓" : "✗");
  console.log("   Tempo:", quick.metadata.duration, "ms");
  console.log(
    "   Tamanho análise:",
    quick.data?.analysis?.length || 0,
    "caracteres"
  );

  console.log("\n2. DETAILED (Mastra Agent)");
  console.log("   Status:", detailed.success ? "✓" : "✗");
  console.log("   Tempo:", detailed.metadata.duration, "ms");
  console.log(
    "   Tamanho análise:",
    detailed.data?.analysis?.length || 0,
    "caracteres"
  );

  console.log("\n3. INTERACTIVE (LangGraph)");
  console.log("   Status:", interactive.success ? "✓" : "✗");
  console.log("   Tempo:", interactive.metadata.duration, "ms");
  console.log(
    "   Tamanho análise:",
    interactive.data?.analysis?.length || 0,
    "caracteres"
  );
  console.log(
    "   Estruturado:",
    interactive.data?.structured ? "✓" : "✗"
  );

  console.log("\n" + "═".repeat(60));
  console.log("CONCLUSÃO:");
  console.log("  • Quick: Mais rápida, ideal para preview");
  console.log("  • Detailed: Mais completa, usa tools do Mastra");
  console.log("  • Interactive: Fluxo gerenciado, estruturado");
}

// ═══════════════════════════════════════════════════════════════════════════
// MAIN: Rodar todos os exemplos
// ═══════════════════════════════════════════════════════════════════════════

export async function runAllExamples() {
  console.log("\n");
  console.log("╔" + "═".repeat(58) + "╗");
  console.log("║" + " ".repeat(58) + "║");
  console.log("║" + "  UNIFIED AI ENGINE - EXEMPLOS DE USO".padEnd(58) + "║");
  console.log("║" + "  Mastra + Vercel AI SDK + LangGraph".padEnd(58) + "║");
  console.log("║" + " ".repeat(58) + "║");
  console.log("╚" + "═".repeat(58) + "╝");

  try {
    await example1_quickAnalysis();
    await example2_detailedAnalysis();
    await example3_interactiveAnalysis();
    await example4_batchAnalysis();
    await example5_compareEngines();

    console.log("\n" + "═".repeat(60));
    console.log("✓ Todos os exemplos executados com sucesso!");
    console.log("═".repeat(60) + "\n");
  } catch (error) {
    console.error("\n✗ Erro ao executar exemplos:", error);
  }
}

// Export para uso em scripts
if (require.main === module) {
  runAllExamples();
}
