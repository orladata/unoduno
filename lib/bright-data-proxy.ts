/**
 * Bright Data Proxy Configuration Module
 * 
 * Integração com Bright Data para usar proxy residencial
 * Contorna bot detection do YouTube ao fazer download de áudio
 */

interface BrightDataConfig {
  apiKey: string;
  username: string;
  zone: string;
  proxyPort: number;
}

export function getBrightDataConfig(): BrightDataConfig {
  const apiKey = process.env.BRIGHT_DATA_API_KEY;
  const username = process.env.BRIGHT_DATA_USERNAME;
  const zone = process.env.BRIGHT_DATA_ZONE;
  const proxyPort = parseInt(process.env.BRIGHT_DATA_PROXY_PORT || '22225', 10);

  if (!apiKey || !username || !zone) {
    console.warn('[BrightData] Credenciais incompletas - proxy residencial desabilitado');
    return null as any;
  }

  return { apiKey, username, zone, proxyPort };
}

/**
 * Gera URL do proxy Bright Data em formato http://username:password@host:port
 * 
 * Formato do proxy Bright Data:
 * http://brd-customer-<CUSTOMER_ID>-zone-<ZONE>:<ZONE_PASSWORD>@brd.superproxy.io:22225
 * 
 * Para autenticação mais simples, usar:
 * http://<USERNAME>:<PASSWORD>@<PROXY_HOST>:<PROXY_PORT>
 */
export function getBrightDataProxyUrl(): string {
  const config = getBrightDataConfig();
  if (!config) return null as any;

  // Formato: http://username:api_key@brd.superproxy.io:22225
  return `http://${config.username}:${config.apiKey}@brd.superproxy.io:${config.proxyPort}`;
}

/**
 * Gera configuração de proxy para usar com yt-dlp
 * yt-dlp suporta --proxy <proxy_url>
 */
export function getYtDlpProxyConfig(): string {
  const proxyUrl = getBrightDataProxyUrl();
  if (!proxyUrl) return '';
  return `--proxy "${proxyUrl}"`;
}

/**
 * Gera configuração de proxy para HTTP requests
 * Para uso com fetch() ou bibliotecas HTTP
 */
export function getHttpProxyConfig(): {
  http: string;
  https: string;
} {
  const proxyUrl = getBrightDataProxyUrl();
  if (!proxyUrl) {
    return {
      http: '',
      https: '',
    };
  }

  return {
    http: proxyUrl,
    https: proxyUrl,
  };
}

/**
 * Valida se as credenciais Bright Data estão configuradas
 */
export function isBrightDataConfigured(): boolean {
  try {
    const config = getBrightDataConfig();
    return !!config && !!config.apiKey && !!config.username && !!config.zone;
  } catch {
    return false;
  }
}

/**
 * Informações de status do Bright Data para logging
 */
export function getBrightDataStatus(): {
  configured: boolean;
  zone: string;
  proxyUrl: string;
} {
  const configured = isBrightDataConfigured();
  const config = configured ? getBrightDataConfig() : null;

  return {
    configured,
    zone: config?.zone || 'NOT_CONFIGURED',
    proxyUrl: configured ? getBrightDataProxyUrl() : 'NOT_CONFIGURED',
  };
}
