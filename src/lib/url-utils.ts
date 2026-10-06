export interface UrlIntelligence {
  original: string
  normalized: string
  protocol: string
  domain: string
  registrableDomain: string
  path: string
  query: string
  isLong: boolean
  isEncoded: boolean
  hasSuspiciousKeywords: boolean
}

const SUSPICIOUS_KEYWORDS = ['login', 'verify', 'update', 'secure', 'account', 'auth', 'billing', 'wallet', 'kyc']

export function analyzeUrl(rawUrl: string): UrlIntelligence | null {
  try {
    // Basic prefixing if missing
    let urlString = rawUrl.trim()
    if (!urlString.startsWith('http://') && !urlString.startsWith('https://')) {
      urlString = 'https://' + urlString
    }

    const url = new URL(urlString)
    const normalized = url.toString()
    const domain = url.hostname

    // Simple registrable domain extraction (last two parts, simplistic for this demo but works for typical cases)
    const parts = domain.split('.')
    let registrableDomain = domain
    if (parts.length > 2) {
      // Basic check: if it ends in co.uk, com.au, etc.
      const secondLevel = parts[parts.length - 2]
      if (['co', 'com', 'org', 'net', 'gov', 'edu'].includes(secondLevel)) {
        registrableDomain = parts.slice(-3).join('.')
      } else {
        registrableDomain = parts.slice(-2).join('.')
      }
    }

    const path = url.pathname
    const query = url.search

    // SSRF / Private IP safety check on domain
    const ipRegex = /^(?:[0-9]{1,3}\.){3}[0-9]{1,3}$/;
    if (ipRegex.test(domain)) {
      const parts = domain.split('.').map(Number);
      if (
        parts[0] === 10 ||
        (parts[0] === 172 && parts[1] >= 16 && parts[1] <= 31) ||
        (parts[0] === 192 && parts[1] === 168) ||
        parts[0] === 127 ||
        parts[0] === 0 ||
        parts[0] === 169
      ) {
        throw new Error('Private IP addresses are restricted.');
      }
    }
    
    if (domain === 'localhost' || domain.endsWith('.local') || domain.includes('::1')) {
      throw new Error('Local domains are restricted.');
    }

    const isLong = normalized.length > 75
    const isEncoded = rawUrl.includes('%20') || rawUrl.includes('%3D') || rawUrl.includes('%3F')
    
    const lowerUrl = normalized.toLowerCase()
    const hasSuspiciousKeywords = SUSPICIOUS_KEYWORDS.some(kw => lowerUrl.includes(kw))

    return {
      original: rawUrl,
      normalized,
      protocol: url.protocol.replace(':', ''),
      domain,
      registrableDomain,
      path,
      query,
      isLong,
      isEncoded,
      hasSuspiciousKeywords
    }
  } catch {
    return null
  }
}

export function extractUrlsFromText(text: string): string[] {
  const urlRegex = /(https?:\/\/[^\s]+)|([a-zA-Z0-9.-]+\.[a-zA-Z]{2,}\b(\/[^\s]*)?)/g
  const matches = text.match(urlRegex)
  return matches ? Array.from(new Set(matches)) : []
}
