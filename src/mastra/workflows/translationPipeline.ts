import { Workflow, Step } from '@mastra/core/workflows';
import { hookEngineerAgent } from '../agents/hookEngineer';
import { culturalTranslatorAgent } from '../agents/culturalTranslator';
import { z } from 'zod';

// Step 1: Hook Engineering
const generateHook = new Step({
  id: 'generateHook',
  description: 'Gera um hook viral em português baseado na transcrição',
  inputSchema: z.object({
    transcript: z.string(),
  }),
  outputSchema: z.object({
    hook: z.string(),
    transcript: z.string(),
  }),
  execute: async ({ context }) => {
    const { transcript } = context.machineContext.stepResults?.trigger?.payload || {};
    
    if (!transcript) throw new Error('Transcrição ausente');

    const prompt = `Analise a seguinte transcrição e crie um hook viral matador de 3 a 5 segundos para o público brasileiro:\n\n${transcript}`;
    
    const response = await hookEngineerAgent.generate(prompt);
    
    return {
      hook: response.text,
      transcript: transcript,
    };
  },
});

// Step 2: Cultural Translation
const translateContent = new Step({
  id: 'translateContent',
  description: 'Traduz o resto da transcrição adaptando para o Brasil',
  inputSchema: z.object({
    hook: z.string(),
    transcript: z.string(),
  }),
  outputSchema: z.object({
    finalScript: z.string(),
  }),
  execute: async ({ context }) => {
    // Pega o output do passo anterior
    const { hook, transcript } = context.machineContext.stepResults?.generateHook?.payload || {};
    
    if (!hook || !transcript) throw new Error('Dados do hook ausentes');

    const prompt = `Aqui está o novo HOOK: "${hook}"\n\nAgora, traduza o restante desta transcrição de forma natural para o Brasil, mantendo o fluxo contínuo logo após o hook:\n\n${transcript}`;
    
    const response = await culturalTranslatorAgent.generate(prompt);
    
    return {
      finalScript: `[HOOK VIRAL]\n${hook}\n\n[CORPO DO VÍDEO]\n${response.text}`,
    };
  },
});

// Criação do Workflow
export const translationPipeline = new Workflow({
  name: 'Viral Translation Pipeline',
  triggerSchema: z.object({
    transcript: z.string(),
  }),
})
  .step(generateHook)
  .then(translateContent)
  .commit();
