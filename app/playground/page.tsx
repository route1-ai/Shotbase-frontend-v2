"use client"

import React, { useState, useEffect, useCallback, useId } from "react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { useSearchParams, useRouter } from "next/navigation"

// Customer-facing API endpoint shown in code samples. Defaults to api.shotbase.dev
// so we never leak the Railway internal hostname into customer-visible curl/JS/Python.
const PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.shotbase.dev/v1/screenshot'

const PRESETS = [
  { label: 'Stripe', url: 'https://stripe.com' },
  { label: 'Vercel', url: 'https://vercel.com' },
  { label: 'Linear', url: 'https://linear.app' },
  { label: 'GitHub', url: 'https://github.com' },
  { label: 'HN', url: 'https://news.ycombinator.com' },
] as const

const ACTIVE_BG = 'rgba(0,232,123,0.1)'
const ACTIVE_BORDER = 'rgba(0,232,123,0.25)'
const HOVER_BG = 'rgba(255,255,255,0.06)'
const HOVER_BORDER = 'rgba(255,255,255,0.14)'
const IDLE_BG = '#111'
const IDLE_BORDER = 'rgba(255,255,255,0.07)'

// ---------- Reusable bits ----------

function PillButton({
  active,
  onClick,
  children,
  fontSize = 11,
  padding = '6px 12px',
  title,
}: {
  active?: boolean
  onClick: () => void
  children: React.ReactNode
  fontSize?: number
  padding?: string
  title?: string
}) {
  const [hover, setHover] = useState(false)
  const bg = active ? ACTIVE_BG : hover ? HOVER_BG : IDLE_BG
  const border = active ? ACTIVE_BORDER : hover ? HOVER_BORDER : IDLE_BORDER
  const color = active ? '#00e87b' : hover ? '#f0f0f0' : '#888'
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={title}
      aria-pressed={active}
      style={{
        fontFamily: 'var(--font-ibm-plex)',
        fontSize,
        padding,
        background: bg,
        border: `1px solid ${border}`,
        borderRadius: 6,
        color,
        cursor: 'pointer',
        transition: 'all 0.15s',
      }}
    >
      {children}
    </button>
  )
}

function Toggle({
  value,
  onChange,
  label,
  sub,
}: {
  value: boolean
  onChange: (v: boolean) => void
  label: string
  sub?: string
}) {
  // Whole row is clickable, not just the pill.
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      aria-label={label}
      onClick={() => onChange(!value)}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '12px 0',
        borderBottom: `1px solid ${IDLE_BORDER}`,
        background: 'none',
        border: 'none',
        borderBottomWidth: 1,
        borderBottomStyle: 'solid',
        borderBottomColor: IDLE_BORDER,
        cursor: 'pointer',
        textAlign: 'left',
        width: '100%',
        color: 'inherit',
      }}
    >
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2, color: '#f0f0f0' }}>{label}</div>
        {sub && (
          <div style={{ fontSize: 11, color: '#444', fontFamily: 'var(--font-ibm-plex)' }}>{sub}</div>
        )}
      </div>
      <div
        style={{
          width: 40,
          height: 22,
          borderRadius: 11,
          background: value ? '#00e87b' : '#1a1a1a',
          position: 'relative',
          transition: 'background 0.2s',
          flexShrink: 0,
          marginTop: 2,
        }}
      >
        <div
          style={{
            width: 16,
            height: 16,
            borderRadius: 8,
            background: '#fff',
            position: 'absolute',
            top: 3,
            left: value ? 21 : 3,
            transition: 'left 0.2s',
            boxShadow: '0 1px 3px rgba(0,0,0,0.4)',
          }}
        />
      </div>
    </button>
  )
}

function SelectGroup({
  value,
  onChange,
  options,
  label,
}: {
  value: string
  onChange: (v: string) => void
  options: { label: string; value: string }[]
  label: string
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div
        style={{
          fontFamily: 'var(--font-ibm-plex)',
          fontSize: 11,
          color: '#444',
          textTransform: 'uppercase',
          letterSpacing: '0.08em',
          marginBottom: 8,
        }}
      >
        {label}
      </div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {options.map((o) => (
          <PillButton key={o.value} active={value === o.value} onClick={() => onChange(o.value)}>
            {o.label}
          </PillButton>
        ))}
      </div>
    </div>
  )
}

// ---------- Code-sample generation ----------

type Config = {
  url: string
  width: number | string
  height: number | string
  format: string
  removePopups: boolean
  fullPage: boolean
  waitFor: string
  delay: number | string
  blockAds: boolean
  darkMode: boolean
  deviceScaleFactor: number
}

function buildPayload(c: Config) {
  const payload: Record<string, unknown> = {
    url: c.url,
    width: typeof c.width === 'string' ? parseInt(c.width) || 1280 : c.width,
    format: c.format,
    full_page: c.fullPage,
    remove_popups: c.removePopups,
  }
  if (c.height) {
    const h = typeof c.height === 'string' ? parseInt(c.height) : c.height
    if (h && !Number.isNaN(h)) payload.height = h
  }
  if (c.waitFor) payload.wait_until = c.waitFor
  const d = typeof c.delay === 'string' ? parseInt(c.delay) : c.delay
  if (d && !Number.isNaN(d) && d > 0) payload.delay_ms = d
  if (c.blockAds) payload.block_ads = true
  if (c.darkMode) payload.dark_mode = true
  if (c.deviceScaleFactor && c.deviceScaleFactor !== 1) payload.device_scale_factor = c.deviceScaleFactor
  return payload
}

function formatJson(obj: Record<string, unknown>, indent: string) {
  const entries = Object.entries(obj)
  if (entries.length === 0) return '{}'
  const lines = entries.map(([k, v], i) => {
    const value = typeof v === 'string' ? `"${v}"` : String(v)
    const comma = i < entries.length - 1 ? ',' : ''
    return `${indent}  "${k}": ${value}${comma}`
  })
  return `{\n${lines.join('\n')}\n${indent}}`
}

function generateCode(lang: 'curl' | 'js' | 'python', config: Config, apiKey: string) {
  const payload = buildPayload(config)
  const keyDisplay = apiKey || 'YOUR_API_KEY'

  if (lang === 'curl') {
    const body = formatJson(payload, '    ')
    return `curl -X POST '${PUBLIC_API_URL}' \\\n  -H 'Authorization: Bearer ${keyDisplay}' \\\n  -H 'Content-Type: application/json' \\\n  -d '${body}' \\\n  --output screenshot.${config.format}`
  }
  if (lang === 'js') {
    const body = formatJson(payload, '  ')
    return `const res = await fetch('${PUBLIC_API_URL}', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${keyDisplay}',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(${body}),
})

if (!res.ok) throw new Error(\`Screenshot failed: \${res.status}\`)
const blob = await res.blob()
const imageUrl = URL.createObjectURL(blob)`
  }
  // python
  const pyBody = Object.entries(payload)
    .map(([k, v], i, arr) => {
      const value = typeof v === 'string' ? `"${v}"` : v === true ? 'True' : v === false ? 'False' : String(v)
      return `        "${k}": ${value}${i < arr.length - 1 ? ',' : ''}`
    })
    .join('\n')
  return `import httpx

r = httpx.post(
    '${PUBLIC_API_URL}',
    headers={'Authorization': 'Bearer ${keyDisplay}'},
    json={
${pyBody}
    },
    timeout=60.0,
)
r.raise_for_status()
with open('screenshot.${config.format}', 'wb') as f:
    f.write(r.content)`
}

// ---------- Page ----------

const STORAGE_KEYS = ['url', 'width', 'height', 'format', 'wait', 'delay', 'popups', 'full', 'ads', 'dark', 'dpr'] as const

export default function Playground() {
  const { user } = useUser()
  const searchParams = useSearchParams()
  const router = useRouter()

  const urlInputId = useId()
  const widthInputId = useId()
  const heightInputId = useId()
  const delayInputId = useId()

  // Initialize from query params (so configs are shareable + survive refresh)
  const getInitial = useCallback(
    <T,>(key: string, fallback: T, parse?: (v: string) => T): T => {
      if (typeof window === 'undefined') return fallback
      const v = searchParams.get(key)
      if (v === null) return fallback
      if (parse) return parse(v)
      return v as unknown as T
    },
    [searchParams]
  )

  const [url, setUrl] = useState(() => getInitial('url', 'https://stripe.com'))
  const [width, setWidth] = useState<string | number>(() => getInitial('width', 1440 as number | string))
  const [height, setHeight] = useState<string>(() => getInitial('height', ''))
  const [format, setFormat] = useState(() => getInitial('format', 'png'))
  const [removePopups, setRemovePopups] = useState(() => getInitial('popups', true, (v) => v !== '0'))
  const [fullPage, setFullPage] = useState(() => getInitial('full', false, (v) => v === '1'))
  const [waitFor, setWaitFor] = useState(() => getInitial('wait', 'networkidle'))
  const [delay, setDelay] = useState<string | number>(() => getInitial('delay', 0 as number | string))
  const [blockAds, setBlockAds] = useState(() => getInitial('ads', false, (v) => v === '1'))
  const [darkMode, setDarkMode] = useState(() => getInitial('dark', false, (v) => v === '1'))
  const [deviceScaleFactor, setDeviceScaleFactor] = useState(() => getInitial('dpr', 1, (v) => Number(v) || 1))

  const [codeLang, setCodeLang] = useState<'curl' | 'js' | 'python'>('curl')
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<{
    screenshotUrl: string
    tookMs: number
    cached: boolean
    width: number
    height: number
    size: number
  } | null>(null)
  const [hasRun, setHasRun] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)

  // For now we don't fetch the user's real API key — the public endpoint isn't
  // shipped yet. When `/api/keys/list` is exposed for the active key, fill this in.
  const [apiKey] = useState<string>('')

  const config: Config = {
    url,
    width,
    height,
    format,
    removePopups,
    fullPage,
    waitFor,
    delay,
    blockAds,
    darkMode,
    deviceScaleFactor,
  }

  // Persist config to URL search params (debounced via URL update)
  useEffect(() => {
    const params = new URLSearchParams()
    params.set('url', url)
    params.set('width', String(width))
    if (height) params.set('height', String(height))
    params.set('format', format)
    params.set('wait', waitFor)
    if (Number(delay) > 0) params.set('delay', String(delay))
    if (!removePopups) params.set('popups', '0')
    if (fullPage) params.set('full', '1')
    if (blockAds) params.set('ads', '1')
    if (darkMode) params.set('dark', '1')
    if (deviceScaleFactor !== 1) params.set('dpr', String(deviceScaleFactor))
    const qs = params.toString()
    router.replace(`/playground${qs ? `?${qs}` : ''}`, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, width, height, format, waitFor, delay, removePopups, fullPage, blockAds, darkMode, deviceScaleFactor])

  const run = useCallback(async () => {
    if (!user) return
    setLoading(true)
    setResult(null)
    setError(null)
    setHasRun(true)
    const startTime = Date.now()
    try {
      const res = await fetch('/api/playground/screenshot', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(buildPayload(config)),
      })
      if (!res.ok) {
        const text = await res.text().catch(() => '')
        throw new Error(text || `Request failed (${res.status})`)
      }
      const blob = await res.blob()
      const imageUrl = URL.createObjectURL(blob)
      const tookMs = Date.now() - startTime
      const cached = res.headers.get('x-cache') === 'HIT'
      const sizeKb = Math.round(blob.size / 1024)
      setResult({
        screenshotUrl: imageUrl,
        tookMs,
        cached,
        width: typeof width === 'string' ? parseInt(width) || 1440 : width,
        height: parseInt(String(height)) || 900,
        size: sizeKb,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Screenshot failed. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [user, config, width, height])

  // Cmd/Ctrl+Enter triggers run from anywhere on the page
  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault()
        run()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [run])

  const code = generateCode(codeLang, config, apiKey)

  const copyCode = async () => {
    try {
      await navigator.clipboard.writeText(code)
      setCopied(true)
      setTimeout(() => setCopied(false), 1500)
    } catch {
      // Fallback for browsers that block the clipboard API
      const ta = document.createElement('textarea')
      ta.value = code
      document.body.appendChild(ta)
      ta.select()
      try {
        document.execCommand('copy')
        setCopied(true)
        setTimeout(() => setCopied(false), 1500)
      } catch {}
      document.body.removeChild(ta)
    }
  }

  const downloadResult = () => {
    if (!result) return
    const a = document.createElement('a')
    a.href = result.screenshotUrl
    a.download = `shotbase-${Date.now()}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#050505', color: '#f0f0f0' }}>
      <nav
        style={{
          height: 56,
          borderBottom: `1px solid ${IDLE_BORDER}`,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          padding: '0 28px',
          flexShrink: 0,
          background: 'rgba(5,5,5,0.85)',
          backdropFilter: 'blur(20px)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div
              style={{
                width: 26,
                height: 26,
                background: '#00e87b',
                borderRadius: 6,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
                <rect x="1" y="1" width="14" height="10" rx="2" stroke="#000" strokeWidth="1.5" />
                <path d="M4 14h8M8 11v3" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
              </svg>
            </div>
            <span style={{ fontFamily: 'var(--font-ibm-plex)', fontWeight: 600, fontSize: 14, color: '#f0f0f0' }}>
              shotbase
            </span>
          </Link>
          <span style={{ color: '#444', fontSize: 14 }}>/</span>
          <span style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 13, color: '#888' }}>Playground</span>
        </div>
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <span
            style={{
              fontFamily: 'var(--font-ibm-plex)',
              fontSize: 10,
              color: '#444',
              border: `1px solid ${IDLE_BORDER}`,
              padding: '4px 8px',
              borderRadius: 5,
            }}
            title="Press Cmd+Enter (or Ctrl+Enter) anywhere to run"
          >
            ⌘ + ↵
          </span>
          <Link
            href="/docs"
            style={{
              fontFamily: 'var(--font-ibm-plex)',
              fontSize: 12,
              color: '#888',
              background: 'none',
              border: `1px solid ${IDLE_BORDER}`,
              padding: '6px 12px',
              borderRadius: 6,
              textDecoration: 'none',
            }}
          >
            Docs
          </Link>
          <Link
            href="/dashboard"
            style={{
              fontFamily: 'var(--font-ibm-plex)',
              fontSize: 12,
              fontWeight: 600,
              color: '#000',
              background: '#00e87b',
              padding: '6px 14px',
              borderRadius: 6,
              textDecoration: 'none',
            }}
          >
            Dashboard →
          </Link>
        </div>
      </nav>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '360px 1fr', minHeight: 0 }}>
        {/* ---------- Left: options ---------- */}
        <div
          style={{
            borderRight: `1px solid ${IDLE_BORDER}`,
            display: 'flex',
            flexDirection: 'column',
            overflow: 'auto',
            background: '#0a0a0a',
          }}
        >
          <div style={{ padding: '20px 20px 0', borderBottom: `1px solid ${IDLE_BORDER}`, paddingBottom: 16 }}>
            <label
              htmlFor={urlInputId}
              style={{
                display: 'block',
                fontFamily: 'var(--font-ibm-plex)',
                fontSize: 11,
                color: '#444',
                textTransform: 'uppercase',
                letterSpacing: '0.1em',
                marginBottom: 10,
              }}
            >
              Target URL
            </label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input
                id={urlInputId}
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && !e.shiftKey && run()}
                placeholder="https://..."
                style={{
                  flex: 1,
                  fontFamily: 'var(--font-ibm-plex)',
                  fontSize: 12,
                  background: IDLE_BG,
                  border: `1px solid ${IDLE_BORDER}`,
                  borderRadius: 7,
                  padding: '9px 12px',
                  color: '#f0f0f0',
                  outline: 'none',
                }}
              />
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {PRESETS.map((p) => (
                <PillButton
                  key={p.label}
                  active={url === p.url}
                  onClick={() => setUrl(p.url)}
                  fontSize={10}
                  padding="4px 9px"
                >
                  {p.label}
                </PillButton>
              ))}
            </div>
          </div>

          <div style={{ padding: 20, flex: 1 }}>
            <SelectGroup
              label="Format"
              value={format}
              onChange={setFormat}
              options={[
                { label: 'PNG', value: 'png' },
                { label: 'JPEG', value: 'jpeg' },
                { label: 'WebP', value: 'webp' },
                { label: 'PDF', value: 'pdf' },
              ]}
            />

            <div style={{ marginBottom: 16 }}>
              <div
                style={{
                  fontFamily: 'var(--font-ibm-plex)',
                  fontSize: 11,
                  color: '#444',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 8,
                }}
              >
                Viewport
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label
                    htmlFor={widthInputId}
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-ibm-plex)',
                      fontSize: 10,
                      color: '#444',
                      marginBottom: 4,
                    }}
                  >
                    Width
                  </label>
                  <input
                    id={widthInputId}
                    type="number"
                    min={100}
                    max={3840}
                    value={width}
                    onChange={(e) => setWidth(e.target.value)}
                    style={{
                      width: '100%',
                      fontFamily: 'var(--font-ibm-plex)',
                      fontSize: 12,
                      background: IDLE_BG,
                      border: `1px solid ${IDLE_BORDER}`,
                      borderRadius: 7,
                      padding: '8px 10px',
                      color: '#f0f0f0',
                      outline: 'none',
                    }}
                  />
                </div>
                <div style={{ flex: 1 }}>
                  <label
                    htmlFor={heightInputId}
                    style={{
                      display: 'block',
                      fontFamily: 'var(--font-ibm-plex)',
                      fontSize: 10,
                      color: '#444',
                      marginBottom: 4,
                    }}
                  >
                    Height (auto)
                  </label>
                  <input
                    id={heightInputId}
                    type="number"
                    min={100}
                    max={2160}
                    value={height}
                    onChange={(e) => setHeight(e.target.value)}
                    placeholder="auto"
                    style={{
                      width: '100%',
                      fontFamily: 'var(--font-ibm-plex)',
                      fontSize: 12,
                      background: IDLE_BG,
                      border: `1px solid ${IDLE_BORDER}`,
                      borderRadius: 7,
                      padding: '8px 10px',
                      color: '#f0f0f0',
                      outline: 'none',
                    }}
                  />
                </div>
              </div>
            </div>

            <SelectGroup
              label="Retina"
              value={String(deviceScaleFactor)}
              onChange={(v) => setDeviceScaleFactor(Number(v) || 1)}
              options={[
                { label: '1×', value: '1' },
                { label: '2×', value: '2' },
                { label: '3×', value: '3' },
              ]}
            />

            <SelectGroup
              label="Wait for"
              value={waitFor}
              onChange={setWaitFor}
              options={[
                { label: 'networkidle', value: 'networkidle' },
                { label: 'domcontentloaded', value: 'domcontentloaded' },
                { label: 'load', value: 'load' },
              ]}
            />

            <div style={{ marginBottom: 16 }}>
              <label
                htmlFor={delayInputId}
                style={{
                  display: 'block',
                  fontFamily: 'var(--font-ibm-plex)',
                  fontSize: 11,
                  color: '#444',
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  marginBottom: 8,
                }}
              >
                Delay (ms)
              </label>
              <input
                id={delayInputId}
                type="number"
                min={0}
                max={30000}
                value={delay}
                onChange={(e) => setDelay(e.target.value)}
                style={{
                  width: '100%',
                  fontFamily: 'var(--font-ibm-plex)',
                  fontSize: 12,
                  background: IDLE_BG,
                  border: `1px solid ${IDLE_BORDER}`,
                  borderRadius: 7,
                  padding: '8px 10px',
                  color: '#f0f0f0',
                  outline: 'none',
                }}
              />
            </div>

            <Toggle label="Remove popups" sub="AI popup removal" value={removePopups} onChange={setRemovePopups} />
            <Toggle label="Block ads & trackers" sub="20K+ rules applied" value={blockAds} onChange={setBlockAds} />
            <Toggle label="Dark mode" sub="prefers-color-scheme: dark" value={darkMode} onChange={setDarkMode} />
            <Toggle label="Full page" sub="Capture entire scrollable height" value={fullPage} onChange={setFullPage} />
          </div>

          <div style={{ padding: 20, borderTop: `1px solid ${IDLE_BORDER}` }}>
            {!user && (
              <div
                style={{
                  fontFamily: 'var(--font-ibm-plex)',
                  fontSize: 11,
                  color: '#ff6b6b',
                  marginBottom: 10,
                  textAlign: 'center',
                }}
              >
                Sign in to run the playground.{' '}
                <Link href="/signin" style={{ color: '#00e87b' }}>
                  Sign in →
                </Link>
              </div>
            )}
            <button
              onClick={run}
              disabled={loading || !user}
              style={{
                width: '100%',
                fontFamily: 'var(--font-ibm-plex)',
                fontSize: 13,
                fontWeight: 600,
                color: '#000',
                background: loading ? '#009950' : !user ? '#333' : '#00e87b',
                border: 'none',
                padding: '13px',
                borderRadius: 8,
                cursor: loading || !user ? 'not-allowed' : 'pointer',
                transition: 'all 0.15s',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: 8,
              }}
            >
              {loading ? (
                <React.Fragment>
                  <svg
                    width="14"
                    height="14"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="#000"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    style={{ animation: 'spin 0.8s linear infinite' }}
                  >
                    <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
                  </svg>
                  Capturing…
                </React.Fragment>
              ) : (
                '▶ Run screenshot'
              )}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>

        {/* ---------- Right: preview + code ---------- */}
        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              background: '#050505',
              borderBottom: `1px solid ${IDLE_BORDER}`,
              position: 'relative',
              minHeight: 0,
              overflow: 'hidden',
              padding: 24,
            }}
          >
            {!hasRun && !error && (
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 64,
                    height: 64,
                    borderRadius: 16,
                    background: IDLE_BG,
                    border: `1px solid ${IDLE_BORDER}`,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    margin: '0 auto 16px',
                  }}
                >
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5">
                    <rect x="2" y="3" width="20" height="14" rx="2" />
                    <path d="M8 21h8M12 17v4" />
                  </svg>
                </div>
                <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 13, color: '#888', marginBottom: 6 }}>
                  No screenshot yet
                </div>
                <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#444' }}>
                  Configure options and press{' '}
                  <kbd
                    style={{
                      fontFamily: 'var(--font-ibm-plex)',
                      background: IDLE_BG,
                      border: `1px solid ${IDLE_BORDER}`,
                      padding: '2px 6px',
                      borderRadius: 4,
                      color: '#888',
                    }}
                  >
                    ⌘ + ↵
                  </kbd>
                </div>
              </div>
            )}
            {loading && (
              <div style={{ textAlign: 'center' }}>
                <div
                  style={{
                    width: 48,
                    height: 48,
                    border: `2px solid ${IDLE_BORDER}`,
                    borderTopColor: '#00e87b',
                    borderRadius: 24,
                    animation: 'spin 0.8s linear infinite',
                    margin: '0 auto 16px',
                  }}
                />
                <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 13, color: '#888' }}>
                  Capturing screenshot…
                </div>
                <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#444', marginTop: 4 }}>
                  Loading page, waiting for {waitFor}
                </div>
              </div>
            )}
            {error && !loading && (
              <div style={{ textAlign: 'center', maxWidth: 480, padding: 24 }}>
                <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 13, color: '#ff6b6b', marginBottom: 8 }}>
                  {error}
                </div>
                <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#444' }}>
                  No credits charged for failed requests
                </div>
              </div>
            )}
            {result && !loading && (
              <React.Fragment>
                <img
                  src={result.screenshotUrl}
                  alt="Screenshot"
                  style={{
                    maxWidth: '100%',
                    maxHeight: '100%',
                    objectFit: 'contain',
                    borderRadius: 8,
                    border: `1px solid ${IDLE_BORDER}`,
                    boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                  }}
                />
                <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6 }}>
                  <span
                    style={{
                      fontFamily: 'var(--font-ibm-plex)',
                      fontSize: 11,
                      background: ACTIVE_BG,
                      border: `1px solid ${ACTIVE_BORDER}`,
                      color: '#00e87b',
                      padding: '4px 10px',
                      borderRadius: 6,
                    }}
                  >
                    200 OK
                  </span>
                  <span
                    style={{
                      fontFamily: 'var(--font-ibm-plex)',
                      fontSize: 11,
                      background: IDLE_BG,
                      border: `1px solid ${IDLE_BORDER}`,
                      color: '#888',
                      padding: '4px 10px',
                      borderRadius: 6,
                    }}
                  >
                    {result.tookMs}ms
                  </span>
                  {result.cached && (
                    <span
                      style={{
                        fontFamily: 'var(--font-ibm-plex)',
                        fontSize: 11,
                        background: IDLE_BG,
                        border: `1px solid ${IDLE_BORDER}`,
                        color: '#888',
                        padding: '4px 10px',
                        borderRadius: 6,
                      }}
                    >
                      cached
                    </span>
                  )}
                  <PillButton onClick={downloadResult} title="Download as file">
                    ↓ Download
                  </PillButton>
                </div>
                <div
                  style={{
                    position: 'absolute',
                    bottom: 12,
                    left: 12,
                    fontFamily: 'var(--font-ibm-plex)',
                    fontSize: 10,
                    color: '#444',
                  }}
                >
                  {result.width}×{result.height} · {result.size} KB · {format.toUpperCase()}
                </div>
              </React.Fragment>
            )}
          </div>

          <div style={{ flexShrink: 0, borderTop: `1px solid ${IDLE_BORDER}`, background: '#0a0a0a' }}>
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                borderBottom: `1px solid ${IDLE_BORDER}`,
                padding: '0 16px',
              }}
            >
              <div style={{ display: 'flex' }} role="tablist">
                {(['curl', 'js', 'python'] as const).map((l) => (
                  <CodeTab key={l} active={codeLang === l} onClick={() => setCodeLang(l)}>
                    {l === 'js' ? 'JavaScript' : l === 'python' ? 'Python' : 'cURL'}
                  </CodeTab>
                ))}
              </div>
              <button
                onClick={copyCode}
                style={{
                  fontFamily: 'var(--font-ibm-plex)',
                  fontSize: 11,
                  color: copied ? '#00e87b' : '#888',
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '6px 10px',
                  transition: 'color 0.15s',
                  fontWeight: copied ? 600 : 400,
                }}
                aria-live="polite"
              >
                {copied ? '✓ Copied' : 'Copy'}
              </button>
            </div>
            <pre
              style={{
                fontFamily: 'var(--font-ibm-plex)',
                fontSize: 12,
                lineHeight: 1.7,
                padding: '16px',
                overflow: 'auto',
                maxHeight: 240,
                color: '#888',
                whiteSpace: 'pre',
                wordBreak: 'normal',
              }}
            >
              {code}
            </pre>
          </div>
        </div>
      </div>
    </div>
  )
}

function CodeTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  const [hover, setHover] = useState(false)
  const color = active ? '#00e87b' : hover ? '#f0f0f0' : '#444'
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      role="tab"
      aria-selected={active}
      style={{
        fontFamily: 'var(--font-ibm-plex)',
        fontSize: 12,
        padding: '11px 16px',
        background: 'none',
        border: 'none',
        borderBottom: `2px solid ${active ? '#00e87b' : 'transparent'}`,
        color,
        cursor: 'pointer',
        marginBottom: -1,
        transition: 'color 0.15s',
      }}
    >
      {children}
    </button>
  )
}
