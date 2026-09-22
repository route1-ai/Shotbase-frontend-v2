"use client"

import React, { Suspense, useState, useEffect, useCallback, useId } from "react"
import Link from "next/link"
import { useUser } from "@clerk/nextjs"
import { useSearchParams, useRouter } from "next/navigation"

// Customer-facing API endpoint shown in code samples. Defaults to api.shotbase.dev
// so we never leak the Railway internal hostname into customer-visible curl/JS/Python.
const PUBLIC_API_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL || 'https://api.shotbase.dev/screenshot'

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
  // Keep IDLE_BG as a solid base; hover BRIGHTENS the border + text, not lightens
  // the background. Earlier the hover used a near-transparent rgba which let the
  // underlying screenshot bleed through and looked overlapping.
  const bg = active ? ACTIVE_BG : IDLE_BG
  const border = active ? ACTIVE_BORDER : hover ? HOVER_BORDER : IDLE_BORDER
  const color = active ? '#00e87b' : hover ? '#f0f0f0' : '#888'
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      title={title}
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
  disabled = false,
  lockedReason,
}: {
  value: boolean
  onChange: (v: boolean) => void
  label: string
  sub?: string
  disabled?: boolean
  lockedReason?: string
}) {
  const [isFocused, setIsFocused] = useState(false)
  // Whole row is clickable, not just the pill.
  return (
    <button
      type="button"
      role="switch"
      aria-checked={value}
      onClick={() => { if (!disabled) onChange(!value) }}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      disabled={disabled}
      title={disabled ? lockedReason : undefined}
      style={{
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'space-between',
        padding: '12px 8px',
        margin: '0 -8px',
        borderRadius: 8,
        background: isFocused ? 'rgba(0, 232, 123, 0.05)' : 'none',
        border: 'none',
        borderBottom: `1px solid ${IDLE_BORDER}`,
        outline: isFocused ? '1px solid #00e87b' : 'none',
        outlineOffset: -1,
        cursor: disabled ? 'not-allowed' : 'pointer',
        textAlign: 'left',
        width: 'calc(100% + 16px)',
        color: 'inherit',
        opacity: disabled ? 0.55 : 1,
        transition: 'all 0.15s',
      }}
    >
      <div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2 }}>
          <div style={{ fontSize: 13, fontWeight: 500, color: '#f0f0f0' }}>{label}</div>
          {disabled && (
            <span
              style={{
                fontFamily: 'var(--font-ibm-plex)',
                fontSize: 9,
                background: '#1a1a1a',
                color: '#666',
                padding: '2px 6px',
                borderRadius: 4,
                textTransform: 'uppercase',
                letterSpacing: '0.05em',
                fontWeight: 600,
              }}
            >
              Locked
            </span>
          )}
        </div>
        {sub && (
          <div style={{ fontSize: 11, color: disabled ? '#666' : '#444', fontFamily: 'var(--font-ibm-plex)' }}>
            {disabled && lockedReason ? lockedReason : sub}
          </div>
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

type AiFields = { page_type: boolean; headings: boolean; ctas: boolean; prices: boolean }

const AI_FIELD_LABELS: { key: keyof AiFields; label: string }[] = [
  { key: 'page_type', label: 'Page type' },
  { key: 'headings', label: 'Headings' },
  { key: 'ctas', label: 'CTAs' },
  { key: 'prices', label: 'Prices' },
]

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
  includeText: boolean
  aiExtractEnabled: boolean
  aiFields: AiFields
}

// Which AI facets are selected — used both to build the payload and to guard
// against ever sending an all-false ai_extract (a no-op that still counts).
function selectedAiFields(fields: AiFields): (keyof AiFields)[] {
  return (Object.keys(fields) as (keyof AiFields)[]).filter((k) => fields[k])
}

// True when the request asks for data (page text and/or AI extraction), which
// makes the backend answer with application/json instead of a binary capture.
function isDataMode(c: Config) {
  return c.includeText || (c.aiExtractEnabled && selectedAiFields(c.aiFields).length > 0)
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
  // Page text — a plain boolean flag when on; omitted entirely when off.
  if (c.includeText) payload.include_text = true
  // AI extraction — only when enabled AND at least one facet is selected. An
  // all-false ai_extract is never sent: it would still consume an AI credit
  // while asking for nothing.
  if (c.aiExtractEnabled) {
    const selected = selectedAiFields(c.aiFields)
    if (selected.length > 0) {
      payload.ai_extract = selected.reduce(
        (acc, k) => {
          acc[k] = true
          return acc
        },
        {} as Record<string, boolean>
      )
    }
  }
  return payload
}

// Re-indent a JSON.stringify block so nested continuation lines line up under a
// leading token (curl's `-d '` / a JS variable). Handles nested objects +
// booleans for free, unlike the old flat formatter.
function indentJson(obj: Record<string, unknown>, pad: string) {
  return JSON.stringify(obj, null, 2)
    .split('\n')
    .map((line, i) => (i === 0 ? line : pad + line))
    .join('\n')
}

// Serialize a payload value as a Python literal (True/False, nested dicts).
function toPyLiteral(v: unknown, indent: string): string {
  if (v === true) return 'True'
  if (v === false) return 'False'
  if (typeof v === 'string') return `"${v}"`
  if (v && typeof v === 'object') {
    const entries = Object.entries(v as Record<string, unknown>)
    const inner = entries
      .map(([k, val], i) => `${indent}    "${k}": ${toPyLiteral(val, indent + '    ')}${i < entries.length - 1 ? ',' : ''}`)
      .join('\n')
    return `{\n${inner}\n${indent}}`
  }
  return String(v)
}

function generateCode(lang: 'curl' | 'js' | 'python', config: Config, apiKey: string) {
  const payload = buildPayload(config)
  const keyDisplay = apiKey || 'YOUR_API_KEY'
  // In data mode the response is JSON, so we don't save a binary file — we parse
  // and read the returned page text / structured data instead.
  const dataMode = isDataMode(config)

  if (lang === 'curl') {
    const body = indentJson(payload, '    ')
    const base = `curl -X POST '${PUBLIC_API_URL}' \\\n  -H 'Authorization: Bearer ${keyDisplay}' \\\n  -H 'Content-Type: application/json' \\\n  -d '${body}'`
    // Binary capture → write to a file; data mode → let the JSON print to stdout.
    return dataMode ? base : `${base} \\\n  --output screenshot.${config.format}`
  }
  if (lang === 'js') {
    const body = indentJson(payload, '  ')
    const head = `const res = await fetch('${PUBLIC_API_URL}', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${keyDisplay}',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify(${body}),
})

if (!res.ok) throw new Error(\`Request failed: \${res.status}\`)`
    return dataMode
      ? `${head}
// Data mode returns JSON: { text, ai_data, ...metadata }
const data = await res.json()
console.log(data.text)
console.log(data.ai_data)`
      : `${head}
const blob = await res.blob()
const imageUrl = URL.createObjectURL(blob)`
  }
  // python
  const pyBody = Object.entries(payload)
    .map(([k, v], i, arr) => `        "${k}": ${toPyLiteral(v, '        ')}${i < arr.length - 1 ? ',' : ''}`)
    .join('\n')
  const pyHead = `import httpx

r = httpx.post(
    '${PUBLIC_API_URL}',
    headers={'Authorization': 'Bearer ${keyDisplay}'},
    json={
${pyBody}
    },
    timeout=60.0,
)
r.raise_for_status()`
  return dataMode
    ? `${pyHead}
# Data mode returns JSON: { "text", "ai_data", ...metadata }
data = r.json()
print(data["text"])
print(data["ai_data"])`
    : `${pyHead}
with open('screenshot.${config.format}', 'wb') as f:
    f.write(r.content)`
}

// ---------- Page ----------

const STORAGE_KEYS = ['url', 'width', 'height', 'format', 'wait', 'delay', 'popups', 'full', 'ads', 'dark', 'dpr'] as const

function PlaygroundInner() {
  const { user } = useUser()
  const searchParams = useSearchParams()
  const router = useRouter()

  const urlId = useId()
  const widthId = useId()
  const heightId = useId()
  const delayId = useId()

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
  const [waitFor, setWaitFor] = useState(() => getInitial('wait', 'load'))
  const [delay, setDelay] = useState<string | number>(() => getInitial('delay', 0 as number | string))
  const [blockAds, setBlockAds] = useState(() => getInitial('ads', false, (v) => v === '1'))
  const [darkMode, setDarkMode] = useState(() => getInitial('dark', false, (v) => v === '1'))
  const [deviceScaleFactor, setDeviceScaleFactor] = useState(() => getInitial('dpr', 1, (v) => Number(v) || 1))

  // Output / data extraction. AI is available on every plan (usage-metered, not
  // gated) — so no plan check here. Fields default to all-selected; the `fields`
  // param only appears in the URL when the user narrows the selection.
  const [includeText, setIncludeText] = useState(() => getInitial('text', false, (v) => v === '1'))
  const [aiExtractEnabled, setAiExtractEnabled] = useState(() => getInitial('ai', false, (v) => v === '1'))
  const [aiFields, setAiFields] = useState<AiFields>(() => {
    const raw = getInitial('fields', '', (v) => v)
    if (!raw) return { page_type: true, headings: true, ctas: true, prices: true }
    const set = new Set(raw.split(',').map((s) => s.trim()))
    return {
      page_type: set.has('page_type'),
      headings: set.has('headings'),
      ctas: set.has('ctas'),
      prices: set.has('prices'),
    }
  })

  // PDF output is always a multi-page document — every printed page is the
  // viewport-width capture of the scroll position. Until the renderer learns
  // to clip a PDF to a single page, we force `fullPage` on when format is PDF
  // and lock the toggle so users don't see a "viewport-only PDF" option that
  // doesn't behave as expected.
  useEffect(() => {
    if (format === 'pdf' && !fullPage) setFullPage(true)
  }, [format, fullPage])

  const [codeLang, setCodeLang] = useState<'curl' | 'js' | 'python'>('curl')
  const [loading, setLoading] = useState(false)
  // A capture returns an image/PDF (kind:'image'); page-text / AI mode returns
  // structured JSON (kind:'data'). Discriminated union so the render paths and
  // the lightbox/download (image-only) can't touch the wrong shape.
  const [result, setResult] = useState<
    | {
        kind: 'image'
        screenshotUrl: string
        tookMs: number
        cached: boolean
        width: number
        height: number
        size: number
      }
    | {
        kind: 'data'
        tookMs: number
        cached: boolean
        text: string | null
        aiData: Record<string, unknown> | null
        aiError: string | null
        format?: string
        width?: number
        height?: number
        renderTimeMs?: number
        fallbackUsed?: boolean
      }
    | null
  >(null)
  const [hasRun, setHasRun] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState(false)
  const [expanded, setExpanded] = useState(false)

  // ESC closes the lightbox
  useEffect(() => {
    if (!expanded) return
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setExpanded(false)
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [expanded])

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
    includeText,
    aiExtractEnabled,
    aiFields,
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
    if (includeText) params.set('text', '1')
    if (aiExtractEnabled) {
      params.set('ai', '1')
      const sel = selectedAiFields(aiFields)
      // Only serialize the facet list when it's been narrowed from the default
      // (all four); the shorter URL is nicer to share.
      if (sel.length > 0 && sel.length < 4) params.set('fields', sel.join(','))
    }
    const qs = params.toString()
    router.replace(`/dashboard/playground${qs ? `?${qs}` : ''}`, { scroll: false })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [url, width, height, format, waitFor, delay, removePopups, fullPage, blockAds, darkMode, deviceScaleFactor, includeText, aiExtractEnabled, aiFields])

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
        const ct = res.headers.get('content-type') || ''
        const j = ct.includes('application/json') ? await res.json().catch(() => null) : null
        // Quota rejections (429) tell the user which meter was hit. Captures and
        // AI extractions have separate monthly quotas — surface the right one.
        if (res.status === 429 && j) {
          const isAi = j.quota_type === 'ai_extractions'
          const meter = isAi ? 'AI extraction' : 'capture'
          const detail =
            typeof j.used === 'number' && typeof j.limit === 'number' ? ` (${j.used}/${j.limit} used)` : ''
          setError(
            `Monthly ${meter} quota reached${detail}. Usage resets on the 1st (UTC), or upgrade your plan for more.`
          )
          return
        }
        const message =
          (j && typeof j.error === 'string' && j.error) ||
          (!j ? await res.text().catch(() => '') : '') ||
          `Request failed (${res.status})`
        throw new Error(message)
      }

      const tookMs = Date.now() - startTime
      const cached = res.headers.get('x-cache') === 'HIT'
      const contentType = res.headers.get('content-type') || ''

      // Data mode: page text and/or structured AI extraction come back as JSON.
      if (contentType.includes('application/json')) {
        const data = (await res.json().catch(() => null)) as Record<string, unknown> | null
        const aiData =
          data && typeof data.ai_data === 'object' ? (data.ai_data as Record<string, unknown> | null) : null
        setResult({
          kind: 'data',
          tookMs,
          cached,
          text: data && typeof data.text === 'string' ? data.text : null,
          aiData,
          // ai_error surfaces only when AI was requested but produced no data;
          // it's a soft/partial failure, never a hard error for the whole call.
          aiError:
            aiExtractEnabled && !aiData && data && typeof data.ai_error === 'string'
              ? data.ai_error
              : aiExtractEnabled && !aiData
                ? 'AI extraction temporarily unavailable'
                : null,
          format: data && typeof data.format === 'string' ? data.format : undefined,
          width: data && typeof data.width === 'number' ? data.width : undefined,
          height: data && typeof data.height === 'number' ? data.height : undefined,
          renderTimeMs: data && typeof data.render_time_ms === 'number' ? data.render_time_ms : undefined,
          fallbackUsed: data && typeof data.fallback_used === 'boolean' ? data.fallback_used : undefined,
        })
        return
      }

      // Capture mode: binary image / PDF.
      const blob = await res.blob()
      const imageUrl = URL.createObjectURL(blob)
      const sizeKb = Math.round(blob.size / 1024)
      setResult({
        kind: 'image',
        screenshotUrl: imageUrl,
        tookMs,
        cached,
        width: typeof width === 'string' ? parseInt(width) || 1440 : width,
        height: parseInt(String(height)) || 900,
        size: sizeKb,
      })
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Request failed. Please try again.'
      setError(message)
    } finally {
      setLoading(false)
    }
  }, [user, config, width, height, aiExtractEnabled])

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

  // Copy state for the data-mode panels (page text / AI JSON), keyed so the
  // "Copied" flash lands on the right button.
  const [copiedField, setCopiedField] = useState<string | null>(null)
  const copyField = async (text: string, field: string) => {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedField(field)
      setTimeout(() => setCopiedField(null), 1500)
    } catch {
      // Best-effort; clipboard can be blocked. No crash, no fake success.
    }
  }

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

  // Toggling an AI facet, but never below one selected facet (an empty
  // selection would send nothing while still costing an AI credit).
  const toggleAiField = (key: keyof AiFields) => {
    setAiFields((prev) => {
      const next = { ...prev, [key]: !prev[key] }
      if (selectedAiFields(next).length === 0) return prev
      return next
    })
  }

  const downloadResult = () => {
    if (!result || result.kind !== 'image') return
    const a = document.createElement('a')
    a.href = result.screenshotUrl
    a.download = `shotbase-${Date.now()}.${format}`
    document.body.appendChild(a)
    a.click()
    document.body.removeChild(a)
  }

  return (
    <div className="pg-root" style={{ display: 'flex', flexDirection: 'column', height: 'calc(100vh - 56px)', background: '#050505', color: '#f0f0f0', overflow: 'hidden' }}>
      {/* Mobile (≤767px): stack config over result and let the dashboard <main>
          scroll vertically instead of squeezing a 360px column into the phone. */}
      <style>{`
        @media (max-width: 767px) {
          .pg-root { height: auto !important; min-height: calc(100vh - 56px); overflow: visible !important; }
          /* minmax(0,1fr) lets the track shrink below its content's min-content
             width; min-width:0 on the children stops a wide input/code block
             from forcing horizontal overflow. */
          .pg-grid { grid-template-columns: minmax(0, 1fr) !important; }
          .pg-config, .pg-result { min-width: 0 !important; }
          .pg-config { border-right: none !important; border-bottom: 1px solid rgba(255,255,255,0.07) !important; overflow: visible !important; }
          .pg-result { min-height: 78vh; }
          .pg-preview { min-height: 44vh; padding: 14px !important; }
          .pg-preview img, .pg-preview iframe, .pg-preview > div { max-height: 60vh !important; }
        }
      `}</style>
      <div className="pg-grid" style={{ flex: 1, display: 'grid', gridTemplateColumns: '360px 1fr', minHeight: 0 }}>
        {/* ---------- Left: options ---------- */}
        <div
          className="pg-config"
          data-lenis-prevent
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
              htmlFor={urlId}
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
                id={urlId}
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
                  <label htmlFor={widthId} style={{ display: 'block', fontFamily: 'var(--font-ibm-plex)', fontSize: 10, color: '#444', marginBottom: 4 }}>
                    Width
                  </label>
                  <input
                    id={widthId}
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
                  <label htmlFor={heightId} style={{ display: 'block', fontFamily: 'var(--font-ibm-plex)', fontSize: 10, color: '#444', marginBottom: 4 }}>
                    Height (auto)
                  </label>
                  <input
                    id={heightId}
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
                htmlFor={delayId}
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
                id={delayId}
                type="number"
                min={0}
                max={10000}
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

            <Toggle label="Remove popups" sub="Hides cookie banners and popups" value={removePopups} onChange={setRemovePopups} />
            <Toggle label="Block ads & trackers" sub="Blocks known ad and tracker requests" value={blockAds} onChange={setBlockAds} />
            <Toggle label="Dark mode" sub="prefers-color-scheme: dark" value={darkMode} onChange={setDarkMode} />
            <Toggle
              label="Full page"
              sub="Capture entire scrollable height"
              value={fullPage}
              onChange={setFullPage}
              disabled={format === 'pdf'}
              lockedReason="PDF always captures the full scrollable document"
            />

            {/* ---------- Output / data extraction ---------- */}
            <div
              style={{
                fontFamily: 'var(--font-ibm-plex)',
                fontSize: 11,
                color: '#444',
                textTransform: 'uppercase',
                letterSpacing: '0.08em',
                margin: '22px 0 4px',
              }}
            >
              Data extraction
            </div>
            <Toggle
              label="Page text"
              sub="Return the page's extracted text"
              value={includeText}
              onChange={setIncludeText}
            />
            <Toggle
              label="AI extraction"
              sub="Structured data via AI — available on every plan"
              value={aiExtractEnabled}
              onChange={setAiExtractEnabled}
            />
            {aiExtractEnabled && (
              <div style={{ padding: '14px 2px 4px' }}>
                <div
                  style={{
                    fontFamily: 'var(--font-ibm-plex)',
                    fontSize: 10,
                    color: '#555',
                    textTransform: 'uppercase',
                    letterSpacing: '0.08em',
                    marginBottom: 10,
                  }}
                >
                  Fields to extract
                </div>
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                  {AI_FIELD_LABELS.map(({ key, label }) => {
                    const on = aiFields[key]
                    // The last remaining field can't be turned off — an empty
                    // selection is invalid, so it renders as a disabled pill.
                    const isLast = on && selectedAiFields(aiFields).length === 1
                    return (
                      <PillButton
                        key={key}
                        active={on}
                        onClick={() => toggleAiField(key)}
                        title={isLast ? 'Keep at least one field selected' : undefined}
                      >
                        {on ? '✓ ' : ''}
                        {label}
                      </PillButton>
                    )
                  })}
                </div>
                <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#444', marginTop: 10 }}>
                  Counts toward your monthly capture quota.
                </div>
              </div>
            )}
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
              ) : isDataMode(config) ? (
                '▶ Run extraction'
              ) : (
                '▶ Run screenshot'
              )}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>

        {/* ---------- Right: preview + code ---------- */}
        <div className="pg-result" style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div
            className="pg-preview"
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
                  {isDataMode(config) ? 'Extracting data…' : 'Capturing screenshot…'}
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
            {result && result.kind === 'image' && !loading && (
              <React.Fragment>
                {/* PDF format renders in an iframe (native PDF viewer); image formats use <img>.
                    Either way, the preview is always contained — full size lives in the lightbox. */}
                {format === 'pdf' ? (
                  <div
                    style={{
                      position: 'relative',
                      width: '100%',
                      maxWidth: 720,
                      height: 'calc(100vh - 56px - 280px)',
                      borderRadius: 8,
                      border: `1px solid ${IDLE_BORDER}`,
                      boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                      overflow: 'hidden',
                      background: '#1a1a1a',
                    }}
                  >
                    <iframe
                      src={result.screenshotUrl}
                      title="PDF preview"
                      style={{ width: '100%', height: '100%', border: 'none', background: '#fff' }}
                    />
                    <button
                      onClick={() => setExpanded(true)}
                      title="Open full-size PDF view"
                      aria-label="Expand PDF to full size"
                      style={{
                        position: 'absolute',
                        inset: 0,
                        background: 'transparent',
                        border: 'none',
                        cursor: 'zoom-in',
                        // Click-overlay only catches the top portion so the inner PDF
                        // controls (scroll, page nav) remain interactive.
                        pointerEvents: 'none',
                      }}
                    />
                  </div>
                ) : (
                  <button
                    onClick={() => setExpanded(true)}
                    title="Click to view full size"
                    aria-label="Expand screenshot to full size"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '100%',
                      background: 'transparent',
                      border: 'none',
                      padding: 0,
                      cursor: 'zoom-in',
                      display: 'inline-block',
                      lineHeight: 0,
                    }}
                  >
                    <img
                      src={result.screenshotUrl}
                      alt="Screenshot — click to expand"
                      style={{
                        maxWidth: '100%',
                        maxHeight: 'calc(100vh - 56px - 280px)',
                        objectFit: 'contain',
                        borderRadius: 8,
                        border: `1px solid ${IDLE_BORDER}`,
                        boxShadow: '0 20px 60px rgba(0,0,0,0.5)',
                        display: 'block',
                      }}
                    />
                  </button>
                )}
                <div
                  style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    display: 'flex',
                    gap: 6,
                    alignItems: 'center',
                    // Glass-pill background so badges stay readable even when the
                    // screenshot extends behind them. Fixes the hover-overlap bug.
                    background: 'rgba(5, 5, 5, 0.55)',
                    backdropFilter: 'blur(10px)',
                    WebkitBackdropFilter: 'blur(10px)',
                    border: `1px solid ${IDLE_BORDER}`,
                    borderRadius: 8,
                    padding: 4,
                  }}
                >
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
                  <PillButton onClick={() => setExpanded(true)} title="Open full-size view (press F)">
                    ⤢ Expand
                  </PillButton>
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
            {result && result.kind === 'data' && !loading && (
              <div
                data-lenis-prevent
                style={{
                  alignSelf: 'stretch',
                  width: '100%',
                  height: '100%',
                  overflow: 'auto',
                  padding: 4,
                  textAlign: 'left',
                }}
              >
                {/* Result metadata line */}
                <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap', alignItems: 'center', marginBottom: 16 }}>
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
                    style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, background: IDLE_BG, border: `1px solid ${IDLE_BORDER}`, color: '#888', padding: '4px 10px', borderRadius: 6 }}
                    title="Total round-trip time"
                  >
                    {result.tookMs}ms
                  </span>
                  {typeof result.renderTimeMs === 'number' && (
                    <span
                      style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, background: IDLE_BG, border: `1px solid ${IDLE_BORDER}`, color: '#888', padding: '4px 10px', borderRadius: 6 }}
                      title="Backend render time"
                    >
                      render {result.renderTimeMs}ms
                    </span>
                  )}
                  {result.cached && (
                    <span style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, background: IDLE_BG, border: `1px solid ${IDLE_BORDER}`, color: '#888', padding: '4px 10px', borderRadius: 6 }}>
                      cached
                    </span>
                  )}
                  {(result.width || result.height || result.format) && (
                    <span style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, background: IDLE_BG, border: `1px solid ${IDLE_BORDER}`, color: '#888', padding: '4px 10px', borderRadius: 6 }}>
                      {result.width && result.height ? `${result.width}×${result.height}` : ''}
                      {result.format ? ` ${result.format.toUpperCase()}` : ''}
                    </span>
                  )}
                  {result.fallbackUsed && (
                    <span
                      style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, background: IDLE_BG, border: `1px solid rgba(255,144,96,0.3)`, color: '#ff9060', padding: '4px 10px', borderRadius: 6 }}
                      title="A rendering fallback was used for this request"
                    >
                      fallback used
                    </span>
                  )}
                </div>

                {/* Page text */}
                {result.text !== null && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f0' }}>Page text</div>
                      <button
                        onClick={() => copyField(result.text || '', 'text')}
                        style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: copiedField === 'text' ? '#00e87b' : '#888', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
                        aria-live="polite"
                      >
                        {copiedField === 'text' ? '✓ Copied' : 'Copy'}
                      </button>
                    </div>
                    <pre
                      data-lenis-prevent
                      style={{
                        fontFamily: 'var(--font-ibm-plex)',
                        fontSize: 12,
                        lineHeight: 1.6,
                        color: '#c0c0c0',
                        background: IDLE_BG,
                        border: `1px solid ${IDLE_BORDER}`,
                        borderRadius: 8,
                        padding: 14,
                        margin: 0,
                        maxHeight: 300,
                        overflow: 'auto',
                        whiteSpace: 'pre-wrap',
                        wordBreak: 'break-word',
                      }}
                    >
                      {result.text || '(no text extracted)'}
                    </pre>
                  </div>
                )}

                {/* AI structured extraction */}
                {aiExtractEnabled && (
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                      <div style={{ fontSize: 13, fontWeight: 600, color: '#f0f0f0' }}>AI extraction</div>
                      {result.aiData && (
                        <button
                          onClick={() => copyField(JSON.stringify(result.aiData, null, 2), 'ai')}
                          style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: copiedField === 'ai' ? '#00e87b' : '#888', background: 'none', border: 'none', cursor: 'pointer', padding: '4px 8px' }}
                          aria-live="polite"
                        >
                          {copiedField === 'ai' ? '✓ Copied' : 'Copy JSON'}
                        </button>
                      )}
                    </div>
                    {result.aiData ? (
                      <React.Fragment>
                        {/* Human-readable rendering */}
                        <div
                          style={{
                            fontFamily: 'var(--font-ibm-plex)',
                            fontSize: 12,
                            color: '#c0c0c0',
                            background: IDLE_BG,
                            border: `1px solid ${IDLE_BORDER}`,
                            borderRadius: 8,
                            padding: 14,
                            marginBottom: 10,
                          }}
                        >
                          <AiDataView data={result.aiData} />
                        </div>
                        {/* Raw JSON */}
                        <details>
                          <summary style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#666', cursor: 'pointer', marginBottom: 6 }}>
                            Raw JSON
                          </summary>
                          <pre
                            data-lenis-prevent
                            style={{
                              fontFamily: 'var(--font-ibm-plex)',
                              fontSize: 12,
                              lineHeight: 1.6,
                              color: '#c0c0c0',
                              background: IDLE_BG,
                              border: `1px solid ${IDLE_BORDER}`,
                              borderRadius: 8,
                              padding: 14,
                              margin: 0,
                              maxHeight: 300,
                              overflow: 'auto',
                              whiteSpace: 'pre-wrap',
                              wordBreak: 'break-word',
                            }}
                          >
                            {JSON.stringify(result.aiData, null, 2)}
                          </pre>
                        </details>
                      </React.Fragment>
                    ) : (
                      // ai_data === null → soft, non-fatal notice. The capture /
                      // page text still succeeded; only the AI facet is degraded.
                      <div
                        style={{
                          fontFamily: 'var(--font-ibm-plex)',
                          fontSize: 12,
                          color: '#ff9060',
                          background: IDLE_BG,
                          border: `1px solid rgba(255,144,96,0.3)`,
                          borderRadius: 8,
                          padding: 14,
                        }}
                      >
                        {result.aiError || 'AI extraction temporarily unavailable'}
                      </div>
                    )}
                  </div>
                )}
              </div>
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
              <div style={{ display: 'flex' }} role="tablist" aria-label="Code language selection">
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
              data-lenis-prevent
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

      {/* ---------- Lightbox: full-size scrollable view of the screenshot ---------- */}
      {expanded && result && result.kind === 'image' && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Full-size screenshot"
          onClick={() => setExpanded(false)}
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.92)',
            backdropFilter: 'blur(4px)',
            zIndex: 9999,
            display: 'flex',
            flexDirection: 'column',
            animation: 'lightbox-fade 0.15s ease-out',
          }}
        >
          <style>{`@keyframes lightbox-fade { from { opacity: 0; } to { opacity: 1; } }`}</style>

          {/* Header (sticky over the scroll area) */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '12px 20px',
              borderBottom: `1px solid ${IDLE_BORDER}`,
              background: 'rgba(5,5,5,0.85)',
              backdropFilter: 'blur(20px)',
              flexShrink: 0,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
              <span style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 13, color: '#f0f0f0', fontWeight: 500 }}>
                Full-size view
              </span>
              <span style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#666' }}>
                {result.width}×{result.height} · {result.size} KB · {format.toUpperCase()}
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <button
                onClick={downloadResult}
                style={{
                  fontFamily: 'var(--font-ibm-plex)',
                  fontSize: 12,
                  color: '#000',
                  background: '#00e87b',
                  border: 'none',
                  padding: '7px 14px',
                  borderRadius: 6,
                  cursor: 'pointer',
                  fontWeight: 600,
                }}
              >
                ↓ Download
              </button>
              <a
                href={result.screenshotUrl}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontFamily: 'var(--font-ibm-plex)',
                  fontSize: 12,
                  color: '#888',
                  background: 'transparent',
                  border: `1px solid ${IDLE_BORDER}`,
                  padding: '7px 14px',
                  borderRadius: 6,
                  textDecoration: 'none',
                }}
              >
                Open in new tab ↗
              </a>
              <button
                onClick={() => setExpanded(false)}
                aria-label="Close full-size view"
                title="Close (Esc)"
                style={{
                  fontFamily: 'var(--font-ibm-plex)',
                  fontSize: 16,
                  color: '#888',
                  background: 'transparent',
                  border: `1px solid ${IDLE_BORDER}`,
                  width: 32,
                  height: 32,
                  borderRadius: 6,
                  cursor: 'pointer',
                  lineHeight: 1,
                }}
              >
                ×
              </button>
            </div>
          </div>

          {/* Scrollable area — image for raster formats, iframe for PDFs */}
          <div
            data-lenis-prevent
            onClick={() => setExpanded(false)}
            style={{
              flex: 1,
              overflow: 'auto',
              padding: 24,
              display: 'flex',
              justifyContent: 'center',
              alignItems: format === 'pdf' ? 'stretch' : 'flex-start',
            }}
          >
            {format === 'pdf' ? (
              <iframe
                src={result.screenshotUrl}
                title="Full-size PDF"
                onClick={(e) => e.stopPropagation()}
                onMouseDown={(e) => e.stopPropagation()}
                style={{
                  width: '100%',
                  maxWidth: 1200,
                  height: '100%',
                  minHeight: 600,
                  border: `1px solid ${IDLE_BORDER}`,
                  borderRadius: 8,
                  background: '#fff',
                  boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
                }}
              />
            ) : (
              <img
                src={result.screenshotUrl}
                alt="Screenshot — full size"
                onClick={(e) => e.stopPropagation()}
                style={{
                  maxWidth: '100%',
                  height: 'auto',
                  borderRadius: 8,
                  border: `1px solid ${IDLE_BORDER}`,
                  boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
                  cursor: 'default',
                }}
              />
            )}
          </div>

          {/* Hint footer */}
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              padding: '10px 20px',
              borderTop: `1px solid ${IDLE_BORDER}`,
              fontFamily: 'var(--font-ibm-plex)',
              fontSize: 11,
              color: '#444',
              textAlign: 'center',
              background: 'rgba(5,5,5,0.85)',
              backdropFilter: 'blur(20px)',
              flexShrink: 0,
            }}
          >
            Scroll inside the image · click outside or press <kbd style={{ background: IDLE_BG, border: `1px solid ${IDLE_BORDER}`, padding: '1px 6px', borderRadius: 4, color: '#888' }}>Esc</kbd> to close
          </div>
        </div>
      )}
    </div>
  )
}

// Recursively render an AI-extraction value (string / number / boolean / array
// / nested object) as readable text. Kept generic so it survives whatever facet
// shape the backend returns — we never assume specific keys.
function renderAiValue(value: unknown): React.ReactNode {
  if (value === null || value === undefined || value === '') return <span style={{ color: '#555' }}>—</span>
  if (Array.isArray(value)) {
    if (value.length === 0) return <span style={{ color: '#555' }}>(none)</span>
    return (
      <ul style={{ margin: '4px 0 0', paddingLeft: 18 }}>
        {value.map((v, i) => (
          <li key={i} style={{ marginBottom: 3 }}>
            {renderAiValue(v)}
          </li>
        ))}
      </ul>
    )
  }
  if (typeof value === 'object') {
    return (
      <div style={{ marginTop: 4 }}>
        {Object.entries(value as Record<string, unknown>).map(([k, v]) => (
          <div key={k} style={{ marginBottom: 4 }}>
            <span style={{ color: '#888' }}>{k}: </span>
            {renderAiValue(v)}
          </div>
        ))}
      </div>
    )
  }
  return <span style={{ color: '#e0e0e0' }}>{String(value)}</span>
}

function AiDataView({ data }: { data: Record<string, unknown> }) {
  const entries = Object.entries(data)
  if (entries.length === 0) return <span style={{ color: '#555' }}>No fields returned.</span>
  return (
    <div>
      {entries.map(([key, value]) => (
        <div key={key} style={{ marginBottom: 12 }}>
          <div
            style={{
              fontFamily: 'var(--font-ibm-plex)',
              fontSize: 10,
              color: '#00e87b',
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
              marginBottom: 4,
            }}
          >
            {key.replace(/_/g, ' ')}
          </div>
          <div>{renderAiValue(value)}</div>
        </div>
      ))}
    </div>
  )
}

function CodeTab({ active, onClick, children }: { active: boolean; onClick: () => void; children: React.ReactNode }) {
  const [hover, setHover] = useState(false)
  const [isFocused, setIsFocused] = useState(false)
  const color = active ? '#00e87b' : (hover || isFocused) ? '#f0f0f0' : '#444'
  return (
    <button
      role="tab"
      aria-selected={active}
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      onFocus={() => setIsFocused(true)}
      onBlur={() => setIsFocused(false)}
      style={{
        fontFamily: 'var(--font-ibm-plex)',
        fontSize: 12,
        padding: '11px 16px',
        background: isFocused ? 'rgba(0, 232, 123, 0.05)' : 'none',
        border: 'none',
        borderBottom: `2px solid ${active ? '#00e87b' : isFocused ? '#00e87b' : 'transparent'}`,
        color,
        cursor: 'pointer',
        marginBottom: -1,
        transition: 'all 0.15s',
        outline: 'none',
      }}
    >
      {children}
    </button>
  )
}

// Suspense-wrapped default export.
// PlaygroundInner uses `useSearchParams()` for URL-param persistence, which
// Next.js 15+ requires to be inside a Suspense boundary or it bails out of
// static prerendering with a build error. Wrapping here lets the rest of the
// shell render normally while the searchParams hydrate on the client.
export default function Playground() {
  return (
    <Suspense
      fallback={
        <div
          style={{
            minHeight: '100vh',
            background: '#050505',
            color: '#888',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontFamily: 'var(--font-ibm-plex)',
            fontSize: 13,
          }}
        >
          Loading playground…
        </div>
      }
    >
      <PlaygroundInner />
    </Suspense>
  )
}
