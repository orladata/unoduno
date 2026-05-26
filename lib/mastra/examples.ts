/**
 * Example: Using Unoduno Agent with Google Gemini
 * 
 * This file demonstrates how to use the Mastra agent integrated with
 * Google Gemini for video analysis and content strategy.
 */

import { unodunoAgent } from '@/lib/mastra/agent';

/**
 * Example 1: Basic video analysis
 */
export async function analyzeVideoBasic(videoUrl: string) {
  console.log('[v0] Starting video analysis for:', videoUrl);
  
  try {
    // The agent will automatically use the tools to analyze the video
    const result = await unodunoAgent.generate({
      prompt: `Analise este vídeo do YouTube e forneça insights estratégicos: ${videoUrl}`,
      system: `Você é um especialista em análise de conteúdo viral e estratégia de YouTube.`,
    });

    console.log('[v0] Analysis complete');
    return result;
  } catch (error) {
    console.error('[v0] Analysis failed:', error);
    throw error;
  }
}

/**
 * Example 2: Streaming analysis (real-time response)
 */
export async function analyzeVideoStreaming(videoUrl: string) {
  console.log('[v0] Starting streaming analysis for:', videoUrl);
  
  try {
    // Stream the response token by token
    const result = await unodunoAgent.generate({
      prompt: `Reescreva a estratégia de conteúdo deste vídeo para o público brasileiro: ${videoUrl}`,
    });

    // Return the complete result
    console.log('[v0] Streaming analysis complete');
    return result;
  } catch (error) {
    console.error('[v0] Streaming analysis failed:', error);
    throw error;
  }
}

/**
 * Example 3: Tool usage within agent
 */
export async function extractAndAnalyze(videoUrl: string) {
  console.log('[v0] Extracting transcript and analyzing');
  
  try {
    const result = await unodunoAgent.generate({
      prompt: `
        Para o vídeo: ${videoUrl}
        
        1. Extraia a transcrição completa
        2. Identifique os principais ganchos (hooks)
        3. Crie 3 variações brasileiras
        4. Forneça recomendações de otimização
      `,
    });

    return result;
  } catch (error) {
    console.error('[v0] Extraction failed:', error);
    throw error;
  }
}

/**
 * Example 4: Batch processing multiple videos
 */
export async function batchAnalyzeVideos(videoUrls: string[]) {
  console.log('[v0] Batch analyzing', videoUrls.length, 'videos');
  
  const results = await Promise.all(
    videoUrls.map(url => 
      analyzeVideoBasic(url).catch(error => ({
        url,
        error: error.message,
        success: false,
      }))
    )
  );

  return results;
}

/**
 * Example 5: Custom agent with specific instructions
 */
export async function analyzeWithCustomInstructions(
  videoUrl: string,
  customInstructions: string
) {
  console.log('[v0] Custom analysis with specific instructions');
  
  try {
    const result = await unodunoAgent.generate({
      prompt: videoUrl,
      system: `
        Base instructions: Você é especialista em análise de conteúdo.
        
        Custom requirements:
        ${customInstructions}
      `,
    });

    return result;
  } catch (error) {
    console.error('[v0] Custom analysis failed:', error);
    throw error;
  }
}

// Usage examples for testing
export const examples = {
  analyzeVideoBasic,
  analyzeVideoStreaming,
  extractAndAnalyze,
  batchAnalyzeVideos,
  analyzeWithCustomInstructions,
};
