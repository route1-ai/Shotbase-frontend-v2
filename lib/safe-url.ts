import { isIP } from 'net'

/**
 * SSRF guard for the screenshot/render proxy.
 *
 * A URL-to-screenshot service is the textbook SSRF target — attackers will
 * try to make our renderer fetch internal endpoints, cloud-metadata services,
 * file:// URIs, etc. This module validates the URL string before forwarding.
 *
 * What we block:
 *  - Non-http(s) schemes (file:, gopher:, javascript:, data:, blob:, ftp:, ...)
 *  - URLs with embedded credentials (user:pass@host)
 *  - Private + reserved IPv4 ranges (RFC 1918, loopback, link-local incl.
 *    169.254.169.254 — the AWS / OpenStack / DigitalOcean metadata endpoint)
 *  - Private + reserved IPv6 ranges (loopback, ULA fc00::/7, link-local
 *    fe80::/10, multicast ff00::/8, IPv4-mapped to private)
 *  - Internal hostnames (localhost, *.local, *.internal, *.cluster.local,
 *    metadata.google.internal, metadata.azure.internal)
 *
 * What we do NOT defend against here (must be handled in the render layer):
 *  - DNS rebinding (hostname resolves to a public IP at validation time, then
 *    to a private IP at fetch time). Defense lives in the renderer (Railway)
 *    which should re-validate the IP it actually connects to.
 *  - Time-of-check-to-time-of-use races. Same mitigation.
 */

const ALLOWED_SCHEMES = new Set(['http:', 'https:'])

const BLOCKED_HOSTNAMES = new Set([
  'localhost',
  'metadata.google.internal',
  'metadata.azure.internal',
  'metadata',
  'instance-data',
])

const BLOCKED_HOSTNAME_SUFFIXES = [
  '.local',
  '.internal',
  '.lan',
  '.localhost',
  '.cluster.local',
  '.svc.cluster.local',
  '.intranet',
  '.corp',
]

// Half-open ranges in canonical 32-bit unsigned form (lo <= ip < hi).
const PRIVATE_IPV4_RANGES: ReadonlyArray<readonly [number, number]> = [
  [0x00000000, 0x01000000], // 0.0.0.0/8         "this network"
  [0x0a000000, 0x0b000000], // 10.0.0.0/8        RFC 1918
  [0x7f000000, 0x80000000], // 127.0.0.0/8       loopback
  [0xa9fe0000, 0xa9ff0000], // 169.254.0.0/16    link-local (AWS metadata, etc.)
  [0xac100000, 0xac200000], // 172.16.0.0/12     RFC 1918
  [0xc0a80000, 0xc0a90000], // 192.168.0.0/16    RFC 1918
  [0xe0000000, 0xf0000000], // 224.0.0.0/4       multicast
  [0xf0000000, 0x100000000], // 240.0.0.0/4      reserved + broadcast
]

function ipv4ToInt(ip: string): number | null {
  const parts = ip.split('.')
  if (parts.length !== 4) return null
  let n = 0
  for (const p of parts) {
    // Reject leading zeros (could be octal) and out-of-range
    if (!/^\d{1,3}$/.test(p)) return null
    const v = Number(p)
    if (!Number.isInteger(v) || v < 0 || v > 255) return null
    n = n * 256 + v
  }
  return n >>> 0
}

function isPrivateIPv4(ip: string): boolean {
  const n = ipv4ToInt(ip)
  if (n === null) return false
  return PRIVATE_IPV4_RANGES.some(([lo, hi]) => n >= lo && n < hi)
}

function isPrivateIPv6(ip: string): boolean {
  const lower = ip.toLowerCase()
  if (lower === '::1' || lower === '::') return true
  // IPv4-mapped/translated: ::ffff:X.Y.Z.W or ::X.Y.Z.W
  const mapped = lower.match(/^(?:::ffff:|::)(\d+\.\d+\.\d+\.\d+)$/)
  if (mapped) return isPrivateIPv4(mapped[1])
  // Unique local fc00::/7
  if (/^f[cd][0-9a-f]{0,2}:/.test(lower) || lower.startsWith('fc') || lower.startsWith('fd')) return true
  // Link-local fe80::/10  -> fe80–febf
  if (/^fe[89ab][0-9a-f]?:/.test(lower)) return true
  // Multicast ff00::/8
  if (lower.startsWith('ff')) return true
  return false
}

export type SafeUrlError =
  | { ok: false; reason: 'invalid_url' }
  | { ok: false; reason: 'blocked_scheme'; scheme: string }
  | { ok: false; reason: 'blocked_hostname'; hostname: string }
  | { ok: false; reason: 'private_ip'; ip: string }
  | { ok: false; reason: 'credentials_in_url' }
  | { ok: false; reason: 'no_hostname' }

export type SafeUrlResult = { ok: true; url: URL } | SafeUrlError

export function validateSafeUrl(input: unknown): SafeUrlResult {
  if (typeof input !== 'string' || input.length === 0 || input.length > 2048) {
    return { ok: false, reason: 'invalid_url' }
  }

  let url: URL
  try {
    url = new URL(input)
  } catch {
    return { ok: false, reason: 'invalid_url' }
  }

  if (!ALLOWED_SCHEMES.has(url.protocol)) {
    return { ok: false, reason: 'blocked_scheme', scheme: url.protocol }
  }

  if (url.username !== '' || url.password !== '') {
    return { ok: false, reason: 'credentials_in_url' }
  }

  // Strip surrounding [] from IPv6 literals to test against net.isIP
  let hostname = url.hostname.toLowerCase()
  if (!hostname) return { ok: false, reason: 'no_hostname' }
  const bareHost = hostname.replace(/^\[|\]$/g, '')

  if (BLOCKED_HOSTNAMES.has(hostname) || BLOCKED_HOSTNAMES.has(bareHost)) {
    return { ok: false, reason: 'blocked_hostname', hostname }
  }
  for (const suffix of BLOCKED_HOSTNAME_SUFFIXES) {
    if (hostname.endsWith(suffix)) {
      return { ok: false, reason: 'blocked_hostname', hostname }
    }
  }

  const ipVersion = isIP(bareHost)
  if (ipVersion === 4 && isPrivateIPv4(bareHost)) {
    return { ok: false, reason: 'private_ip', ip: bareHost }
  }
  if (ipVersion === 6 && isPrivateIPv6(bareHost)) {
    return { ok: false, reason: 'private_ip', ip: bareHost }
  }

  return { ok: true, url }
}

export function safeUrlReasonToMessage(err: SafeUrlError): string {
  switch (err.reason) {
    case 'invalid_url':
      return 'URL is malformed or exceeds the 2048-character limit'
    case 'blocked_scheme':
      return `Scheme "${err.scheme}" is not allowed; only http and https are supported`
    case 'blocked_hostname':
      return `Hostname "${err.hostname}" targets an internal network and is not allowed`
    case 'private_ip':
      return `IP address ${err.ip} is in a private or reserved range`
    case 'credentials_in_url':
      return 'URLs with embedded user:password credentials are not allowed'
    case 'no_hostname':
      return 'URL must include a hostname'
  }
}
