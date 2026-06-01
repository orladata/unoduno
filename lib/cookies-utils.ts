/**
 * Utilitário para converter cookies para formato Netscape
 * Usado pelo Modal Worker para autenticar com YouTube via yt-dlp
 */

export interface CookieData {
  [key: string]: string;
}

/**
 * Converte um objeto de cookies para formato Netscape (usado por yt-dlp)
 * 
 * Formato Netscape:
 * ```
 * # Netscape HTTP Cookie File
 * domain  flag  path  secure  expiration  name  value
 * .youtube.com  TRUE  /  TRUE  9999999999  COOKIE_NAME  cookie_value
 * ```
 */
export function convertToNetscapeCookies(cookieObj: CookieData): string {
  const header = '# Netscape HTTP Cookie File\n# This is a generated file!  Do not edit.\n\n';
  
  const lines = Object.entries(cookieObj)
    .filter(([name, value]) => name && value) // Remove empty entries
    .map(([name, value]) => {
      // Format: domain	flag	path	secure	expiration	name	value
      // Use tabs as separators (Netscape format requirement)
      const domain = '.youtube.com';
      const flag = 'TRUE';
      const path = '/';
      const secure = 'TRUE';
      const expiration = '9999999999'; // Far future
      
      return `${domain}\t${flag}\t${path}\t${secure}\t${expiration}\t${name}\t${value}`;
    })
    .join('\n');

  return header + lines + (lines ? '\n' : '');
}

/**
 * Valida se um string Netscape é válido
 */
export function isValidNetscapeCookies(netscapeStr: string): boolean {
  if (!netscapeStr || typeof netscapeStr !== 'string') {
    return false;
  }

  const lines = netscapeStr.split('\n').filter(line => !line.startsWith('#') && line.trim());
  
  return lines.length > 0;
}

/**
 * Extrai um cookie específico de um objeto de cookies
 */
export function extractCookie(
  cookieObj: CookieData,
  cookieName: string
): string | null {
  return cookieObj[cookieName] || null;
}

/**
 * Verifica se um objeto de cookies tem cookies críticas do YouTube
 */
export function hasYoutubeCriticalCookies(cookieObj: CookieData): boolean {
  const criticalCookies = [
    'HSID',
    'SSID',
    'APISID',
    '__Secure-1PSID',
    '__Secure-1PSIDTS',
  ];

  return criticalCookies.some(cookie => cookieObj[cookie]);
}

/**
 * Filtra cookies para incluir apenas os relacionados a YouTube
 */
export function filterYoutubeCookies(cookieObj: CookieData): CookieData {
  const youtubeCookiePatterns = [
    'youtube',
    'google',
    'PSID',
    'SID',
    'HSID',
    'SSID',
    'APISID',
    '__Secure',
  ];

  const filtered: CookieData = {};

  Object.entries(cookieObj).forEach(([name, value]) => {
    if (youtubeCookiePatterns.some(pattern => name.includes(pattern))) {
      filtered[name] = value;
    }
  });

  return filtered;
}
