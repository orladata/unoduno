/**
 * Error Handler & Resilience System
 * Implementa graceful degradation e recovery automático
 * Baseado em best practices de tools como v0, Cursor, Claude
 */

import { z } from 'zod';

/**
 * Error Types - Tipagem clara de erros
 */
export enum ErrorType {
  TOOL_FAILURE = 'TOOL_FAILURE',
  VALIDATION_ERROR = 'VALIDATION_ERROR',
  RATE_LIMIT = 'RATE_LIMIT',
  NETWORK_ERROR = 'NETWORK_ERROR',
  AUTHENTICATION_ERROR = 'AUTHENTICATION_ERROR',
  INVALID_INPUT = 'INVALID_INPUT',
  TIMEOUT = 'TIMEOUT',
  UNKNOWN = 'UNKNOWN',
}

/**
 * Error Severity - Níveis de severidade
 */
export enum ErrorSeverity {
  LOW = 'low',      // Não afeta análise, apenas um tool
  MEDIUM = 'medium', // Degrada qualidade mas continua
  HIGH = 'high',     // Limita significativamente funcionalidade
  CRITICAL = 'critical', // Falha total
}

/**
 * MastraError - Classe de erro estruturada
 */
export class MastraError extends Error {
  constructor(
    public type: ErrorType,
    public severity: ErrorSeverity,
    public message: string,
    public originalError?: Error,
    public context?: Record<string, any>
  ) {
    super(message);
    this.name = 'MastraError';
  }

  toJSON() {
    return {
      type: this.type,
      severity: this.severity,
      message: this.message,
      originalError: this.originalError?.message,
      context: this.context,
      timestamp: new Date().toISOString(),
    };
  }
}

/**
 * Error Recovery Strategy - Como recuperar de diferentes erros
 */
interface RecoveryStrategy {
  type: ErrorType;
  strategies: {
    immediate?: () => Promise<any>;  // Ação imediata
    fallback?: () => Promise<any>;   // Fallback value
    notify: (error: MastraError) => void; // Notificar usuário
  };
}

/**
 * Error Handler - Orquestrador central de erros
 */
export class ErrorHandler {
  private static recoveryStrategies: Map<ErrorType, RecoveryStrategy['strategies']> = new Map([
    [ErrorType.TOOL_FAILURE, {
      fallback: async () => ({ success: false, data: null, degradedMode: true }),
      notify: (error) => {
        console.warn(`[ErrorHandler] Tool falhou: ${error.message}. Continuando com dados disponíveis.`);
      },
    }],
    [ErrorType.NETWORK_ERROR, {
      immediate: async () => new Promise(resolve => setTimeout(resolve, 1000)),
      fallback: async () => ({ cached: true, usedCache: true }),
      notify: (error) => {
        console.warn(`[ErrorHandler] Erro de rede: ${error.message}. Tentando novamente.`);
      },
    }],
    [ErrorType.RATE_LIMIT, {
      immediate: async () => new Promise(resolve => setTimeout(resolve, 5000)),
      notify: (error) => {
        console.warn(`[ErrorHandler] Rate limit atingido. Aguardando...`);
      },
    }],
    [ErrorType.VALIDATION_ERROR, {
      fallback: async () => ({ validated: false, original: true }),
      notify: (error) => {
        console.error(`[ErrorHandler] Erro de validação: ${error.message}`);
      },
    }],
    [ErrorType.TIMEOUT, {
      fallback: async () => ({ timedOut: true, partial: true }),
      notify: (error) => {
        console.warn(`[ErrorHandler] Timeout na operação. Retornando resultado parcial.`);
      },
    }],
  ]);

  /**
   * Processa um erro e retorna estratégia de recovery
   */
  static async handle(error: Error, errorType: ErrorType): Promise<{
    action: 'retry' | 'fallback' | 'fail';
    data?: any;
    message: string;
    shouldContinue: boolean;
  }> {
    const strategy = this.recoveryStrategies.get(errorType);

    if (!strategy) {
      return {
        action: 'fail',
        message: `Erro desconhecido: ${error.message}`,
        shouldContinue: false,
      };
    }

    const mastraError = new MastraError(
      errorType,
      this.determineSeverity(errorType),
      error.message,
      error
    );

    // Notificar
    strategy.notify(mastraError);

    // Tentar ação imediata (ex: retry com delay)
    if (strategy.immediate) {
      try {
        await strategy.immediate();
        return {
          action: 'retry',
          message: `Retentando após tratamento de ${errorType}`,
          shouldContinue: true,
        };
      } catch (retryError) {
        console.error(`[ErrorHandler] Retry falhou: ${retryError}`);
      }
    }

    // Tentar fallback
    if (strategy.fallback) {
      const fallbackData = await strategy.fallback();
      return {
        action: 'fallback',
        data: fallbackData,
        message: `Usando fallback para ${errorType}`,
        shouldContinue: true,
      };
    }

    return {
      action: 'fail',
      message: `Não há estratégia de recuperação para ${errorType}`,
      shouldContinue: false,
    };
  }

  /**
   * Determina severidade baseado no tipo de erro
   */
  private static determineSeverity(errorType: ErrorType): ErrorSeverity {
    const severityMap: Record<ErrorType, ErrorSeverity> = {
      [ErrorType.TOOL_FAILURE]: ErrorSeverity.MEDIUM,
      [ErrorType.VALIDATION_ERROR]: ErrorSeverity.MEDIUM,
      [ErrorType.RATE_LIMIT]: ErrorSeverity.MEDIUM,
      [ErrorType.NETWORK_ERROR]: ErrorSeverity.MEDIUM,
      [ErrorType.AUTHENTICATION_ERROR]: ErrorSeverity.HIGH,
      [ErrorType.INVALID_INPUT]: ErrorSeverity.LOW,
      [ErrorType.TIMEOUT]: ErrorSeverity.MEDIUM,
      [ErrorType.UNKNOWN]: ErrorSeverity.HIGH,
    };
    return severityMap[errorType] || ErrorSeverity.UNKNOWN;
  }

  /**
   * Valida com schema Zod e trata erros
   */
  static validateWithSchema<T>(
    data: unknown,
    schema: z.ZodSchema,
    context?: string
  ): { valid: true; data: T } | { valid: false; error: string; original: unknown } {
    try {
      const validated = schema.parse(data);
      return { valid: true, data: validated as T };
    } catch (error) {
      const message = error instanceof z.ZodError
        ? `Validação falhou em ${context || 'schema'}: ${error.errors.map(e => e.message).join(', ')}`
        : `Erro de validação desconhecido`;

      console.error(`[ErrorHandler] ${message}`);
      return {
        valid: false,
        error: message,
        original: data,
      };
    }
  }
}

/**
 * Retry Logic - Implementa retry com exponential backoff
 */
export class RetryLogic {
  private static readonly DEFAULT_MAX_RETRIES = 3;
  private static readonly DEFAULT_BACKOFF = 1000; // ms

  /**
   * Executa função com retry automático
   */
  static async executeWithRetry<T>(
    fn: () => Promise<T>,
    options?: {
      maxRetries?: number;
      initialBackoff?: number;
      exponentialBase?: number;
      onRetry?: (attempt: number, error: Error) => void;
    }
  ): Promise<T> {
    const {
      maxRetries = this.DEFAULT_MAX_RETRIES,
      initialBackoff = this.DEFAULT_BACKOFF,
      exponentialBase = 2,
      onRetry,
    } = options || {};

    let lastError: Error | null = null;

    for (let attempt = 0; attempt <= maxRetries; attempt++) {
      try {
        return await fn();
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));

        if (attempt < maxRetries) {
          const backoff = initialBackoff * Math.pow(exponentialBase, attempt);
          const jitter = Math.random() * backoff * 0.1; // Add 10% jitter
          const delay = backoff + jitter;

          if (onRetry) {
            onRetry(attempt + 1, lastError);
          }

          console.log(`[RetryLogic] Retry ${attempt + 1}/${maxRetries} em ${delay.toFixed(0)}ms`);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
    }

    throw lastError;
  }
}

/**
 * Graceful Degradation - Continua com dados parciais quando possível
 */
export class GracefulDegradation {
  /**
   * Combina múltiplos resultados, descartando falhas
   */
  static combineResults(
    results: Array<{ success: boolean; data?: any; error?: any }>
  ): { data: any; degradedMode: boolean; failedTools: number } {
    const successful = results.filter(r => r.success).map(r => r.data);
    const failedCount = results.filter(r => !r.success).length;

    return {
      data: successful.length > 0 ? Object.assign({}, ...successful) : {},
      degradedMode: failedCount > 0,
      failedTools: failedCount,
    };
  }

  /**
   * Fornece valor padrão quando tool falha
   */
  static getDefaultValue(toolName: string): any {
    const defaults: Record<string, any> = {
      'fetch-youtube-transcript': { transcript: '', wordCount: 0 },
      'fetch-youtube-metadata': { title: 'Unknown', author: 'Unknown', thumbnail: '' },
      'search-web-trends': { trends: [], success: false },
      'analyze-demographics': { segments: [], success: false },
    };
    return defaults[toolName] || { success: false, data: null };
  }

  /**
   * Retorna resposta parcial com dados disponíveis
   */
  static providePartialResponse(availableData: any, missingTools: string[]): any {
    return {
      complete: false,
      degradedMode: true,
      availableData,
      missingTools,
      message: `Análise parcial fornecida. ${missingTools.length} ferramentas não disponíveis: ${missingTools.join(', ')}`,
    };
  }
}

export default ErrorHandler;
