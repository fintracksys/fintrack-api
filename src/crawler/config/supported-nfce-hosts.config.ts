export const SUPPORTED_NFCE_HOSTS = [
  'sat.sef.sc.gov.br',
  'www.fazenda.pr.gov.br',
  'fazenda.pr.gov.br',
] as const;

export const MIN_NFCE_HTML_LENGTH = 5000;

const DEFAULT_USER_AGENT =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36';

export function getNfceRequestHeaders(): Record<string, string> {
  return { 'User-Agent': DEFAULT_USER_AGENT };
}

export function isSupportedNfceHost(url: string): boolean {
  try {
    const hostname = new URL(url).hostname.toLowerCase();
    return SUPPORTED_NFCE_HOSTS.some(
      (host) => hostname === host || hostname.endsWith(`.${host}`),
    );
  } catch {
    return false;
  }
}

export function assertSupportedNfceHost(url: string): void {
  if (!isSupportedNfceHost(url)) {
    throw new Error(
      'URL de NFCe não suportada. Estados habilitados: SC e PR.',
    );
  }
}
