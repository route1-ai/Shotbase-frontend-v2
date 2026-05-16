"use client"

import React, { useState, useId } from "react"
import Link from "next/link"

const PRESETS = [
  { label: 'Stripe', url: 'https://stripe.com' },
  { label: 'Vercel', url: 'https://vercel.com' },
  { label: 'Linear', url: 'https://linear.app' },
  { label: 'GitHub', url: 'https://github.com' },
  { label: 'HN', url: 'https://news.ycombinator.com' },
]

const DEMO_IMGS: Record<string, string> = {
  'https://stripe.com': 'https://placehold.co/1440x900/0a192f/00e87b?text=stripe.com+%E2%80%94+captured',
  'https://vercel.com': 'https://placehold.co/1440x900/000/fff?text=vercel.com+%E2%80%94+captured',
  'https://linear.app': 'https://placehold.co/1440x900/1a1a2e/5e6ad2?text=linear.app+%E2%80%94+captured',
  'https://github.com': 'https://placehold.co/1440x900/0d1117/58a6ff?text=github.com+%E2%80%94+captured',
  'https://news.ycombinator.com': 'https://placehold.co/1440x900/f6f6ef/ff6600?text=news.ycombinator.com+%E2%80%94+captured',
}

interface PlaygroundConfig {
  url: string; width: string | number; height: string; format: string
  removePopups: boolean; fullPage: boolean; waitFor: string; delay: string | number
}

function Toggle({ value, onChange, label, sub }: { value: boolean, onChange: (v: boolean) => void, label: string, sub?: string }) {
  return (
    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', padding: '12px 0', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
      <div>
        <div style={{ fontSize: 13, fontWeight: 500, marginBottom: 2 }}>{label}</div>
        {sub && <div style={{ fontSize: 11, color: '#444', fontFamily: 'var(--font-ibm-plex)' }}>{sub}</div>}
      </div>
      <button role="switch" aria-checked={value} aria-label={label} onClick={() => onChange(!value)} style={{ width: 40, height: 22, borderRadius: 11, background: value ? '#00e87b' : '#1a1a1a', border: 'none', cursor: 'pointer', position: 'relative', transition: 'background 0.2s', flexShrink: 0, marginTop: 2 }}>
        <div style={{ width: 16, height: 16, borderRadius: 8, background: '#fff', position: 'absolute', top: 3, left: value ? 21 : 3, transition: 'left 0.2s', boxShadow: '0 1px 3px rgba(0,0,0,0.4)' }}/>
      </button>
    </div>
  )
}

function Select({ value, onChange, options, label }: { value: string, onChange: (v: string) => void, options: {label: string, value: string}[], label: string }) {
  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>{label}</div>
      <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
        {options.map(o => (
          <button key={o.value} aria-pressed={value === o.value} onClick={() => onChange(o.value)} style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, padding: '6px 12px', background: value === o.value ? 'rgba(0,232,123,0.1)' : '#111', border: `1px solid ${value === o.value ? 'rgba(0,232,123,0.25)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 6, color: value === o.value ? '#00e87b' : '#888', cursor: 'pointer', transition: 'all 0.15s' }}>{o.label}</button>
        ))}
      </div>
    </div>
  )
}

function generateCode(lang: string, config: PlaygroundConfig) {
  const { url, width, height, format, removePopups, fullPage, waitFor, delay } = config
  if (lang === 'curl') return `curl -X POST \\\n  -H "Authorization: Bearer sk-live-..." \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "url": "${url}",\n    "width": ${width},\n    "height": ${height || 'null'},\n    "format": "${format}",\n    "remove_popups": ${removePopups},\n    "full_page": ${fullPage},\n    "wait_for": "${waitFor}",\n    "delay_ms": ${delay}\n  }' \\\n  https://api.shotbase.io/v1/screenshot`
  if (lang === 'js') return `import { Shotbase } from '@shotbase/sdk';\n\nconst sb = new Shotbase({ apiKey: 'sk-live-...' });\n\nconst { url: screenshotUrl, tookMs } = await sb.screenshot({\n  url: '${url}',\n  width: ${width},\n  format: '${format}',\n  removePopups: ${removePopups},\n  fullPage: ${fullPage},\n  waitFor: '${waitFor}',\n  delayMs: ${delay},\n});\n\nconsole.log(\`Captured in \${tookMs}ms: \${screenshotUrl}\`);`
  return `from shotbase import Shotbase\n\nsb = Shotbase(api_key="sk-live-...")\n\nresult = sb.screenshot(\n    url="${url}",\n    width=${width},\n    format="${format}",\n    remove_popups=${removePopups ? 'True' : 'False'},\n    full_page=${fullPage ? 'True' : 'False'},\n    wait_for="${waitFor}",\n    delay_ms=${delay},\n)\n\nprint(f"Captured in {result.took_ms}ms: {result.url}")`
}

interface ShotResult {
  screenshotUrl: string; tookMs: number; cached: boolean
  width: number; height: number; size: number; popupsRemoved: number
}

export default function Playground() {
  const [url, setUrl] = useState('https://stripe.com'), [width, setWidth] = useState<string | number>(1440)
  const [height, setHeight] = useState(''), [format, setFormat] = useState('png')
  const [removePopups, setRemovePopups] = useState(true), [fullPage, setFullPage] = useState(false)
  const [waitFor, setWaitFor] = useState('networkidle'), [delay, setDelay] = useState<string | number>(0)
  const [codeLang, setCodeLang] = useState('curl'), [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ShotResult | null>(null), [hasRun, setHasRun] = useState(false)
  const [copied, setCopied] = useState(false), urlId = useId(), widthId = useId(), heightId = useId(), delayId = useId()

  const config: PlaygroundConfig = { url, width, height, format, removePopups, fullPage, waitFor, delay }
  const run = () => {
    setLoading(true); setResult(null); setHasRun(true)
    setTimeout(() => {
      setLoading(false)
      setResult({
        screenshotUrl: DEMO_IMGS[url] || `https://placehold.co/${width}x${height || 900}/111/00e87b?text=${encodeURIComponent(url)}`,
        tookMs: Math.floor(100 + Math.random() * 900), cached: Math.random() > 0.6,
        width: typeof width === 'string' ? parseInt(width) : width, height: parseInt(height) || 900,
        size: Math.floor(120 + Math.random() * 600), popupsRemoved: removePopups ? Math.floor(Math.random() * 3) : 0,
      })
    }, 1200 + Math.random() * 800)
  }

  const handleCopy = () => {
    if (!navigator.clipboard) return
    navigator.clipboard.writeText(generateCode(codeLang, config)).then(() => {
      setCopied(true); setTimeout(() => setCopied(false), 2000)
    })
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh', background: '#050505', color: '#f0f0f0' }}>
      <nav style={{ height: 56, borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', flexShrink: 0, background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(20px)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 26, height: 26, background: '#00e87b', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="10" rx="2" stroke="#000" strokeWidth="1.5"/><path d="M4 14h8M8 11v3" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
            <span style={{ fontFamily: 'var(--font-ibm-plex)', fontWeight: 600, fontSize: 14, color: '#f0f0f0' }}>shotbase</span>
          </Link>
          <span style={{ color: '#444', fontSize: 14 }}>/</span>
          <span style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 13, color: '#888' }}>Playground</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/docs" style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 12, color: '#888', background: 'none', border: '1px solid rgba(255,255,255,0.07)', padding: '6px 12px', borderRadius: 6, textDecoration: 'none' }}>Docs</Link>
          <Link href="/dashboard" style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 12, fontWeight: 600, color: '#000', background: '#00e87b', padding: '6px 14px', borderRadius: 6, textDecoration: 'none' }}>Dashboard →</Link>
        </div>
      </nav>

      <div style={{ flex: 1, display: 'grid', gridTemplateColumns: '360px 1fr', minHeight: 0 }}>
        <div style={{ borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', overflow: 'auto', background: '#0a0a0a' }}>
          <div style={{ padding: '20px 20px 0', borderBottom: '1px solid rgba(255,255,255,0.07)', paddingBottom: 16 }}>
            <label htmlFor={urlId} style={{ display: 'block', fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#444', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 10 }}>Target URL</label>
            <div style={{ display: 'flex', gap: 8, marginBottom: 10 }}>
              <input id={urlId} value={url} onChange={e => setUrl(e.target.value)} onKeyDown={e => e.key === 'Enter' && run()}
                style={{ flex: 1, fontFamily: 'var(--font-ibm-plex)', fontSize: 12, background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7, padding: '9px 12px', color: '#f0f0f0', outline: 'none' }}
                placeholder="https://..."/>
            </div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
              {PRESETS.map(p => (
                <button key={p.label} onClick={() => setUrl(p.url)} style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 10, padding: '4px 9px', background: url === p.url ? 'rgba(0,232,123,0.1)' : '#111', border: `1px solid ${url === p.url ? 'rgba(0,232,123,0.2)' : 'rgba(255,255,255,0.07)'}`, borderRadius: 5, color: url === p.url ? '#00e87b' : '#444', cursor: 'pointer' }}>{p.label}</button>
              ))}
            </div>
          </div>

          <div style={{ padding: 20, flex: 1 }}>
            <Select label="Format" value={format} onChange={setFormat} options={[{label:'PNG',value:'png'},{label:'JPEG',value:'jpeg'},{label:'WebP',value:'webp'},{label:'PDF',value:'pdf'}]}/>
            <div style={{ marginBottom: 16 }}>
              <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Viewport</div>
              <div style={{ display: 'flex', gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <label htmlFor={widthId} style={{ display: 'block', fontFamily: 'var(--font-ibm-plex)', fontSize: 10, color: '#444', marginBottom: 4 }}>Width</label>
                  <input id={widthId} type="number" value={width} onChange={e => setWidth(e.target.value)} style={{ width: '100%', fontFamily: 'var(--font-ibm-plex)', fontSize: 12, background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7, padding: '8px 10px', color: '#f0f0f0', outline: 'none' }}/>
                </div>
                <div style={{ flex: 1 }}>
                  <label htmlFor={heightId} style={{ display: 'block', fontFamily: 'var(--font-ibm-plex)', fontSize: 10, color: '#444', marginBottom: 4 }}>Height (auto)</label>
                  <input id={heightId} type="number" value={height} onChange={e => setHeight(e.target.value)} placeholder="auto" style={{ width: '100%', fontFamily: 'var(--font-ibm-plex)', fontSize: 12, background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7, padding: '8px 10px', color: '#f0f0f0', outline: 'none' }}/>
                </div>
              </div>
            </div>
            <Select label="Wait for" value={waitFor} onChange={setWaitFor} options={[{label:'networkidle',value:'networkidle'},{label:'domloaded',value:'domloaded'},{label:'load',value:'load'}]}/>
            <div style={{ marginBottom: 16 }}>
              <label htmlFor={delayId} style={{ display: 'block', fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#444', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: 8 }}>Delay (ms)</label>
              <input id={delayId} type="number" value={delay} onChange={e => setDelay(e.target.value)} style={{ width: '100%', fontFamily: 'var(--font-ibm-plex)', fontSize: 12, background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7, padding: '8px 10px', color: '#f0f0f0', outline: 'none' }}/>
            </div>
            <Toggle label="Remove popups" sub="AI popup removal" value={removePopups} onChange={setRemovePopups}/>
            <Toggle label="Full page" sub="Capture entire scrollable height" value={fullPage} onChange={setFullPage}/>
          </div>
          <div style={{ padding: 20, borderTop: '1px solid rgba(255,255,255,0.07)' }}>
            <button onClick={run} disabled={loading} style={{ width: '100%', fontFamily: 'var(--font-ibm-plex)', fontSize: 13, fontWeight: 600, color: '#000', background: loading ? '#009950' : '#00e87b', border: 'none', padding: '13px', borderRadius: 8, cursor: loading ? 'not-allowed' : 'pointer', transition: 'all 0.15s', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8 }}>
              {loading ? <React.Fragment><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" style={{ animation: 'spin 0.8s linear infinite' }}><path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4"/></svg>Capturing…</React.Fragment> : '▶ Run screenshot'}
            </button>
            <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', minHeight: 0 }}>
          <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#050505', borderBottom: '1px solid rgba(255,255,255,0.07)', position: 'relative', minHeight: 0, overflow: 'hidden', padding: 24 }}>
            {!hasRun && <div style={{ textAlign: 'center' }}><div style={{ width: 64, height: 64, borderRadius: 16, background: '#111', border: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#444" strokeWidth="1.5"><rect x="2" y="3" width="20" height="14" rx="2"/><path d="M8 21h8M12 17v4"/></svg></div><div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 13, color: '#444', marginBottom: 6 }}>No screenshot yet</div><div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#444' }}>Configure options and press Run</div></div>}
            {loading && <div style={{ textAlign: 'center' }}><div style={{ width: 48, height: 48, border: '2px solid rgba(255,255,255,0.07)', borderTopColor: '#00e87b', borderRadius: 24, animation: 'spin 0.8s linear infinite', margin: '0 auto 16px' }}/><div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 13, color: '#888' }}>Capturing screenshot…</div><div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#444', marginTop: 4 }}>Loading page, waiting for {waitFor}</div></div>}
            {result && !loading && (
              <React.Fragment>
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={result.screenshotUrl} alt="Screenshot" style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', borderRadius: 8, border: '1px solid rgba(255,255,255,0.07)', boxShadow: '0 20px 60px rgba(0,0,0,0.5)' }}/>
                <div style={{ position: 'absolute', top: 12, right: 12, display: 'flex', gap: 6 }}>
                  <span style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, background: 'rgba(0,232,123,0.1)', border: '1px solid rgba(0,232,123,0.2)', color: '#00e87b', padding: '4px 10px', borderRadius: 6 }}>200 OK</span>
                  <span style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, background: '#111', border: '1px solid rgba(255,255,255,0.07)', color: '#888', padding: '4px 10px', borderRadius: 6 }}>{result.tookMs}ms</span>
                  {result.cached && <span style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, background: '#111', border: '1px solid rgba(255,255,255,0.07)', color: '#888', padding: '4px 10px', borderRadius: 6 }}>cached</span>}
                  {result.popupsRemoved > 0 && <span style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, background: '#111', border: '1px solid rgba(255,255,255,0.07)', color: '#888', padding: '4px 10px', borderRadius: 6 }}>{result.popupsRemoved} popup{result.popupsRemoved > 1 ? 's' : ''} removed</span>}
                </div><div style={{ position: 'absolute', bottom: 12, left: 12, fontFamily: 'var(--font-ibm-plex)', fontSize: 10, color: '#444' }}>{result.width}×{result.height} · {result.size} KB · {format.toUpperCase()}</div>
              </React.Fragment>
            )}
          </div>

          <div style={{ flexShrink: 0, borderTop: '1px solid rgba(255,255,255,0.07)', background: '#0a0a0a' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', borderBottom: '1px solid rgba(255,255,255,0.07)', padding: '0 16px' }}>
              <div style={{ display: 'flex' }}>
                {['curl','js','python'].map(l => (
                  <button key={l} aria-pressed={codeLang === l} onClick={() => setCodeLang(l)} style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 12, padding: '11px 16px', background: 'none', border: 'none', borderBottom: `2px solid ${codeLang === l ? '#00e87b' : 'transparent'}`, color: codeLang === l ? '#00e87b' : '#444', cursor: 'pointer', marginBottom: -1 }}>{l === 'js' ? 'JavaScript' : l === 'python' ? 'Python' : 'cURL'}</button>
                ))}
              </div>
              <button onClick={handleCopy} aria-label={copied ? "Copied code snippet" : "Copy code snippet"} style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: copied ? '#00e87b' : '#444', background: 'none', border: 'none', cursor: 'pointer', padding: '6px 8px', transition: 'color 0.2s' }}>{copied ? 'Copied!' : 'Copy'}</button>
            </div><pre style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 12, lineHeight: 1.7, padding: '16px', overflow: 'auto', maxHeight: 200, color: '#888', whiteSpace: 'pre-wrap', wordBreak: 'break-all' }}>{generateCode(codeLang, config)}</pre>
          </div>
        </div>
      </div>
    </div>
  )
}
