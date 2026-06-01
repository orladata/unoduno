'use client';

import { useState } from 'react';

interface CookieData {
  [key: string]: string;
}

interface YouTubeTranscriptionResponse {
  success: boolean;
  transcript?: string;
  segments?: Array<{ start: number; end: number; text: string }>;
  metadata?: Record<string, any>;
  error?: string;
  details?: string;
}

/**
 * Hook para extrair cookies do navegador e enviar requisições de transcrição
 * com autenticação do YouTube via cookies frescos do usuário
 */
export function useYoutubeCookies() {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Extrai todos os cookies do navegador em formato de objeto
   */
  const getCookies = (): CookieData => {
    const cookies: CookieData = {};
    
    if (typeof document === 'undefined') {
      console.warn('[useYoutubeCookies] Document not available (SSR context)');
      return cookies;
    }

    document.cookie.split(';').forEach((cookie) => {
      const trimmed = cookie.trim();
      if (!trimmed) return;

      const [name, ...valueParts] = trimmed.split('=');
      const value = valueParts.join('='); // Handle values with '='

      if (name) {
        try {
          cookies[name] = decodeURIComponent(value);
        } catch (e) {
          console.warn(`[useYoutubeCookies] Failed to decode cookie: ${name}`);
          cookies[name] = value;
        }
      }
    });

    return cookies;
  };

  /**
   * Envia requisição de transcrição com cookies do navegador
   */
  const sendTranscriptionRequest = async (
    videoUrl: string
  ): Promise<YouTubeTranscriptionResponse> => {
    setIsLoading(true);
    setError(null);

    try {
      // Validar URL
      if (!videoUrl.trim()) {
        throw new Error('URL do YouTube é obrigatória');
      }

      // Extrair cookies frescos do navegador
      const cookies = getCookies();
      
      if (Object.keys(cookies).length === 0) {
        console.warn('[useYoutubeCookies] No cookies found in browser');
      }

      console.log(`[useYoutubeCookies] Enviando request com ${Object.keys(cookies).length} cookies`);

      // Fazer requisição com cookies
      const response = await fetch('/api/mastra/youtube-to-transcript', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          videoUrl,
          cookies, // Cookies frescos do navegador
        }),
      });

      const data = (await response.json()) as YouTubeTranscriptionResponse;

      if (!response.ok) {
        throw new Error(data.error || `Erro HTTP ${response.status}`);
      }

      if (!data.success) {
        throw new Error(data.error || 'Transcrição falhou');
      }

      setIsLoading(false);
      return data;

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro desconhecido';
      setError(errorMessage);
      setIsLoading(false);
      
      console.error('[useYoutubeCookies] Error:', err);
      
      return {
        success: false,
        error: errorMessage,
      };
    }
  };

  return {
    getCookies,
    sendTranscriptionRequest,
    isLoading,
    error,
  };
}
