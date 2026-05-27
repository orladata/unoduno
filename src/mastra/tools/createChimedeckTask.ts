import { createTool } from '@mastra/core';
import { z } from 'zod';

export const createChimedeckTask = createTool({
  id: 'createChimedeckTask',
  description: 'Cria uma tarefa (card) no painel do Chimedeck para acompanhar o processo de transcrição do usuário.',
  inputSchema: z.object({
    title: z.string().describe('O título do card de transcrição, ex: "Transcrição do vídeo Aula 1".'),
    description: z.string().describe('Os detalhes coletados pelo agente sobre o que precisa ser transcrito.'),
    language: z.string().describe('O idioma desejado para a transcrição.'),
    priority: z.enum(['low', 'medium', 'high']).describe('Prioridade da tarefa.'),
  }),
  execute: async ({ context }) => {
    console.log('--- MOCK: CHIMEDECK TASK CREATION ---');
    console.log('Title:', context.title);
    console.log('Description:', context.description);
    console.log('Language:', context.language);
    console.log('Priority:', context.priority);
    
    // TODO: Implement actual Chimedeck API call here once board IDs are known.
    // e.g., fetch('http://localhost:3000/api/v1/cards', { ... })
    
    return {
      success: true,
      message: 'Tarefa criada com sucesso no Chimedeck.',
      cardId: 'mock-card-id-1234',
    };
  },
});
