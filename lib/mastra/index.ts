// Mastra Core Configuration with Google Gemini API
// This file initializes the Mastra framework with proper API key handling

import { Mastra } from '@mastra/core';

// Initialize Mastra (agents are defined separately in agent.ts)
export const mastra = new Mastra({
  // Agents and tools are registered per-agent
  // See: lib/mastra/agent.ts
});

// Type-safe export for TypeScript
export type MastraInstance = typeof mastra;

// Utility function to verify Mastra is initialized
export async function initializeMastra() {
  try {
    if (!process.env.GOOGLE_GENERATIVE_AI_API_KEY) {
      throw new Error('GOOGLE_GENERATIVE_AI_API_KEY is not configured');
    }
    
    console.log('[Mastra] Initialized with Google Gemini API');
    console.log('[Mastra] API Key prefix:', process.env.GOOGLE_GENERATIVE_AI_API_KEY?.substring(0, 10));
    return { success: true, message: 'Mastra initialized successfully' };
  } catch (error) {
    console.error('[Mastra] Initialization failed:', error);
    return { success: false, error: String(error) };
  }
}

export default mastra;
