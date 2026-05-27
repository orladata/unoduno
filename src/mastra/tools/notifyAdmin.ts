import { createTool } from '@mastra/core/tools';
import { z } from 'zod';

/**
 * Ferramenta utilizada por Agentes para notificar o administrador do sistema
 * sobre falhas críticas, como a expiração de cookies do YouTube.
 */
export const notifyAdminTool = createTool({
  id: 'notifyAdmin',
  description: 'Notifica o administrador do sistema sobre falhas críticas na infraestrutura de extração ou cookies.',
  inputSchema: z.object({
    severity: z.enum(['warning', 'critical']).describe('A severidade do alerta.'),
    message: z.string().describe('A mensagem detalhada sobre a falha, orientando o administrador sobre como resolver.'),
  }),
  execute: async ({ severity, message }) => {
    console.log(`\n\n======================================`);
    console.log(`🚨 [MASTRA AGENT ALERT - ${severity.toUpperCase()}] 🚨`);
    console.log(`======================================`);
    console.error(message);
    console.log(`======================================\n\n`);

    // Aqui no futuro poderia ser implementada uma integração com Resend, Twilio, Slack ou Discord.
    
    return {
      success: true,
      delivered: true,
      method: 'console_log',
    };
  }
});
