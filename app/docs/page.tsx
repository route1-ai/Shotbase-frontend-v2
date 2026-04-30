"use client"

import React, { useState } from "react"
import Link from "next/link"
import styles from "./docs.module.css"

const NAV = [
  { section: 'Getting Started', items: [
    { id: 'intro', label: 'Introduction' },
    { id: 'quickstart', label: 'Quickstart' },
    { id: 'auth', label: 'Authentication' },
    { id: 'errors', label: 'Error handling' },
  ]},
  { section: 'API Reference', items: [
    { id: 'screenshot', label: 'POST /screenshot' },
    { id: 'batch', label: 'POST /batch' },
    { id: 'status', label: 'GET /status/:id' },
    { id: 'webhooks', label: 'Webhooks' },
  ]},
  { section: 'SDKs', items: [
    { id: 'sdk-js', label: 'JavaScript / TypeScript' },
    { id: 'sdk-python', label: 'Python' },
    { id: 'sdk-go', label: 'Go' },
    { id: 'mcp', label: 'MCP Server' },
  ]},
  { section: 'Guides', items: [
    { id: 'popup-removal', label: 'Popup removal' },
    { id: 'caching', label: 'Caching & TTL' },
    { id: 'rate-limits', label: 'Rate limits' },
    { id: 'billing', label: 'Billing' },
  ]},
]

const METHOD = ({ type }: { type: string }) => {
  const colors: Record<string, { bg: string, color: string, border: string }> = { 
    POST: { bg: 'rgba(0,232,123,0.12)', color: '#00e87b', border: 'rgba(0,232,123,0.25)' }, 
    GET: { bg: 'rgba(90,180,255,0.12)', color: '#5ab4ff', border: 'rgba(90,180,255,0.25)' }, 
    DELETE: { bg: 'rgba(255,80,80,0.12)', color: '#ff6060', border: 'rgba(255,80,80,0.25)' } 
  }
  const c = colors[type] || colors.GET
  return <span style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4, background: c.bg, color: c.color, border: `1px solid ${c.border}`, letterSpacing: '0.05em', marginRight: 10 }}>{type}</span>
}

const CodeBlock = ({ lang, code }: { lang: string, code: string }) => {
  const [copied, setCopied] = useState(false)
  const copy = () => { navigator.clipboard?.writeText(code); setCopied(true); setTimeout(() => setCopied(false), 1500); }
  return (
    <div style={{ background: '#0d0d0d', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 10, overflow: 'hidden', marginBottom: 20 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 14px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
        <span style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#444' }}>{lang}</span>
        <button onClick={copy} style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: copied ? '#00e87b' : '#444', background: 'none', border: 'none', cursor: 'pointer' }}>{copied ? 'Copied!' : 'Copy'}</button>
      </div>
      <pre style={{ padding: 18, fontFamily: 'var(--font-ibm-plex)', fontSize: 12.5, lineHeight: 1.8, overflow: 'auto', color: '#888', whiteSpace: 'pre' }}><code>{code}</code></pre>
    </div>
  )
}

const Callout = ({ type = 'info', children }: { type?: string, children: React.ReactNode }) => {
  const stylesObj: Record<string, { bg: string, border: string, icon: string, color: string }> = {
    info: { bg: 'rgba(90,180,255,0.05)', border: 'rgba(90,180,255,0.15)', icon: 'ℹ', color: '#5ab4ff' },
    warning: { bg: 'rgba(255,180,0,0.06)', border: 'rgba(255,180,0,0.2)', icon: '⚠', color: '#ffb400' },
    tip: { bg: 'rgba(0,232,123,0.1)', border: 'rgba(0,232,123,0.2)', icon: '→', color: '#00e87b' },
  }
  const s = stylesObj[type] || stylesObj.info
  return <div style={{ background: s.bg, border: `1px solid ${s.border}`, borderRadius: 8, padding: '14px 16px', marginBottom: 18, display: 'flex', gap: 12 }}><span style={{ color: s.color, fontFamily: 'var(--font-ibm-plex)', fontSize: 14, flexShrink: 0 }}>{s.icon}</span><div style={{ fontSize: 13, color: '#888', lineHeight: 1.7 }}>{children}</div></div>
}

const CONTENT: Record<string, () => React.ReactNode> = {
  intro: () => (
    <div>
      <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#00e87b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Introduction</div>
      <h1>Shotbase API</h1>
      <p style={{ fontSize: 17, color: '#f0f0f0', marginBottom: 24, lineHeight: 1.6 }}>The fastest way to capture screenshots programmatically. No browser, no DevOps, no cold starts.</p>
      <p>Shotbase is a REST API that captures pixel-perfect screenshots of any URL. Pass a URL, get back a CDN-hosted image. Our infrastructure handles browser lifecycle, JS rendering, cookie banner removal, and caching — so you don't have to.</p>
      <p>The API is designed around three principles: <strong>simplicity</strong> (one endpoint for 90% of use cases), <strong>reliability</strong> (you're only charged for successful captures), and <strong>speed</strong> (median response under 200ms with caching).</p>
      <h2>Base URL</h2>
      <CodeBlock lang="text" code={`https://api.shotbase.io/v1`}/>
      <h2>Quick example</h2>
      <CodeBlock lang="bash" code={`curl -X POST \\
  -H "Authorization: Bearer sk-live-YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://example.com"}' \\
  https://api.shotbase.io/v1/screenshot`}/>
      <p>Returns a JSON object with a <code>screenshot_url</code> field pointing to a permanent CDN URL.</p>
      <Callout type="tip">Start with the <Link href="/">Quickstart guide</Link> for a step-by-step walkthrough, or jump straight to the <Link href="/">API reference</Link>.</Callout>
    </div>
  ),
  quickstart: () => (
    <div>
      <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#00e87b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Getting Started</div>
      <h1>Quickstart</h1>
      <p>Get your first screenshot in under 5 minutes.</p>
      <h2>1. Get your API key</h2>
      <p>Sign up at <Link href="/dashboard">shotbase.io/dashboard</Link>. Your first API key is created automatically. Copy it from the <strong>API Keys</strong> tab.</p>
      <Callout type="warning">Never expose your API key in client-side code. Use it server-side only, or via environment variables.</Callout>
      <h2>2. Install the SDK (optional)</h2>
      <CodeBlock lang="bash" code={`# JavaScript / TypeScript\nnpm install @shotbase/sdk\n\n# Python\npip install shotbase\n\n# Go\ngo get github.com/route1ai/shotbase-go`}/>
      <h2>3. Make your first request</h2>
      <CodeBlock lang="javascript" code={`import { Shotbase } from '@shotbase/sdk';\n\nconst sb = new Shotbase({ apiKey: process.env.SHOTBASE_API_KEY });\n\nconst { url, tookMs } = await sb.screenshot({\n  url: 'https://stripe.com',\n  width: 1440,\n  format: 'png',\n  removePopups: true,\n});\n\nconsole.log(\`Done in \${tookMs}ms!\`);\nconsole.log(url); // https://cdn.shotbase.io/sc/k9xp2q8m...`}/>
      <h2>4. Use the CDN URL</h2>
      <p>The returned URL is permanent and globally cached. Use it anywhere — <code>&lt;img&gt;</code> tags, PDFs, AI inputs, email previews, etc.</p>
      <Callout type="tip">URLs are immutable. The same URL will always return the same screenshot. To recapture, set <code>cache: false</code> or use <code>bust_cache: true</code>.</Callout>
    </div>
  ),
  auth: () => (
    <div>
      <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#00e87b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Getting Started</div>
      <h1>Authentication</h1>
      <p>All API requests require a valid API key sent in the <code>Authorization</code> header as a Bearer token.</p>
      <CodeBlock lang="bash" code={`Authorization: Bearer sk-live-YOUR_API_KEY`}/>
      <h2>Key types</h2>
      <table>
        <thead><tr><th>Prefix</th><th>Type</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td>sk-live-</td><td>Live</td><td>Production key. Charges apply after free tier.</td></tr>
          <tr><td>sk-test-</td><td>Test</td><td>Test mode. Returns mock screenshots, never charges.</td></tr>
        </tbody>
      </table>
      <h2>Security</h2>
      <ul>
        <li>Keys are shown only once at creation time</li>
        <li>Rotate keys any time from the dashboard</li>
        <li>Revocation takes effect immediately (no grace period)</li>
        <li>We recommend separate keys per environment</li>
      </ul>
      <Callout type="warning">If you believe a key has been compromised, revoke it immediately from the Dashboard → API Keys page.</Callout>
    </div>
  ),
  screenshot: () => (
    <div>
      <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#00e87b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>API Reference</div>
      <h1 style={{ display: 'flex', alignItems: 'center' }}><METHOD type="POST"/> /screenshot</h1>
      <p>Captures a screenshot of the specified URL. This is the primary endpoint for the Shotbase API.</p>
      <CodeBlock lang="bash" code={`POST https://api.shotbase.io/v1/screenshot`}/>
      <h2>Request body</h2>
      <table>
        <thead><tr><th>Parameter</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
        <tbody>
          {[
            ['url', 'string', 'required', 'The URL to screenshot. Must include protocol.'],
            ['width', 'integer', '1440', 'Viewport width in pixels. Max: 3840.'],
            ['height', 'integer', 'auto', 'Viewport height. If omitted, captures full viewport.'],
            ['format', 'string', '"png"', 'Output format: png, jpeg, webp, or pdf.'],
            ['quality', 'integer', '90', 'JPEG/WebP compression quality.'],
            ['full_page', 'boolean', 'false', 'Capture entire scrollable page height.'],
            ['remove_popups', 'boolean', 'true', 'AI-powered popup and cookie banner removal.'],
            ['wait_for', 'string', '"networkidle"', 'Wait condition: networkidle, domloaded, or load.'],
            ['delay_ms', 'integer', '0', 'Additional delay in ms after wait_for condition.'],
            ['cache', 'boolean', 'true', 'Serve from cache if available.'],
            ['cache_ttl', 'integer', '3600', 'Cache TTL in seconds.'],
            ['bust_cache', 'boolean', 'false', 'Force a fresh capture, bypassing cache.'],
            ['js_injection', 'string', 'null', 'JavaScript to inject before capture (Pro+).'],
            ['clip', 'object', 'null', 'Clip region: { x, y, width, height }.'],
            ['dark_mode', 'boolean', 'false', 'Emulate prefers-color-scheme: dark.'],
            ['device_scale', 'number', '1', 'Device pixel ratio (1, 1.5, or 2).'],
          ].map(([p, t, d, desc]) => (
            <tr key={p}><td>{p}</td><td>{t}</td><td style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 12, color: '#444' }}>{d}</td><td style={{ fontSize: 13, color: '#888' }}>{desc}</td></tr>
          ))}
        </tbody>
      </table>
      <h2>Response</h2>
      <CodeBlock lang="json" code={`{\n  "id": "req_9xkp2q8mnt3rLp",\n  "screenshot_url": "https://cdn.shotbase.io/sc/k9xp2q8m...",\n  "width": 1440,\n  "height": 900,\n  "format": "png",\n  "size_bytes": 291041,\n  "took_ms": 142,\n  "cached": true,\n  "popups_removed": 2,\n  "created_at": "2026-04-23T14:22:01Z"\n}`}/>
      <h2>Example</h2>
      <CodeBlock lang="bash" code={`curl -X POST \\\n  -H "Authorization: Bearer sk-live-..." \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "url": "https://stripe.com",\n    "width": 1440,\n    "format": "png",\n    "remove_popups": true,\n    "full_page": false\n  }' \\\n  https://api.shotbase.io/v1/screenshot`}/>
    </div>
  ),
  batch: () => (
    <div>
      <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#00e87b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>API Reference</div>
      <h1 style={{ display: 'flex', alignItems: 'center' }}><METHOD type="POST"/> /batch</h1>
      <p>Submit up to 100 screenshot jobs in a single request. Jobs are processed asynchronously and results are delivered via webhook or polled via <code>GET /status/:id</code>.</p>
      <CodeBlock lang="json" code={`{\n  "requests": [\n    { "url": "https://stripe.com", "format": "png" },\n    { "url": "https://vercel.com", "format": "jpeg" },\n    { "url": "https://linear.app", "width": 1280 }\n  ],\n  "webhook_url": "https://yourapp.com/webhooks/shots",\n  "idempotency_key": "batch-2026-04-23-001"\n}`}/>
      <h2>Response</h2>
      <CodeBlock lang="json" code={`{\n  "batch_id": "bat_3mnb7qxp2k8r",\n  "status": "queued",\n  "total": 3,\n  "estimated_ms": 3200,\n  "created_at": "2026-04-23T14:22:01Z"\n}`}/>
      <Callout type="tip">Use <code>idempotency_key</code> to safely retry failed batch submissions without duplicate captures.</Callout>
    </div>
  ),
  'sdk-js': () => (
    <div>
      <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#00e87b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>SDKs</div>
      <h1>JavaScript / TypeScript SDK</h1>
      <p>Full TypeScript support with type-safe responses and request builders.</p>
      <h2>Installation</h2>
      <CodeBlock lang="bash" code={`npm install @shotbase/sdk\n# or\npnpm add @shotbase/sdk\nyarn add @shotbase/sdk`}/>
      <h2>Initialization</h2>
      <CodeBlock lang="typescript" code={`import { Shotbase } from '@shotbase/sdk';\n\nconst sb = new Shotbase({\n  apiKey: process.env.SHOTBASE_API_KEY!, // sk-live-...\n  timeout: 30_000, // ms, default 30s\n  retries: 2,      // auto-retry on 5xx\n});`}/>
      <h2>screenshot()</h2>
      <CodeBlock lang="typescript" code={`const result = await sb.screenshot({\n  url: 'https://stripe.com',\n  width: 1440,\n  format: 'png',       // 'png' | 'jpeg' | 'webp' | 'pdf'\n  removePopups: true,\n  fullPage: false,\n  waitFor: 'networkidle',\n  delayMs: 0,\n  cacheTtl: 3600,\n  darkMode: false,\n  deviceScale: 1,\n});\n\n// result is fully typed:\nresult.url          // string — CDN URL\nresult.tookMs       // number\nresult.cached       // boolean\nresult.width        // number\nresult.height       // number\nresult.popupsRemoved // number`}/>
      <h2>batch()</h2>
      <CodeBlock lang="typescript" code={`const { batchId, status } = await sb.batch({\n  requests: [\n    { url: 'https://stripe.com' },\n    { url: 'https://vercel.com', format: 'jpeg' },\n  ],\n  webhookUrl: 'https://yourapp.com/hook',\n});`}/>
    </div>
  ),
  mcp: () => (
    <div>
      <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#00e87b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>SDKs</div>
      <h1>MCP Server</h1>
      <p>Shotbase ships a native <a href="https://modelcontextprotocol.io" target="_blank" rel="noreferrer">Model Context Protocol</a> (MCP) server. Give your AI agents the ability to browse and screenshot any URL with zero setup.</p>
      <h2>Installation</h2>
      <CodeBlock lang="bash" code={`npx @shotbase/mcp-server --api-key sk-live-...`}/>
      <h2>Claude Desktop config</h2>
      <CodeBlock lang="json" code={`{\n  "mcpServers": {\n    "shotbase": {\n      "command": "npx",\n      "args": ["@shotbase/mcp-server"],\n      "env": {\n        "SHOTBASE_API_KEY": "sk-live-... "\n      }\n    }\n  }\n}`}/>
      <h2>Available tools</h2>
      <table>
        <thead><tr><th>Tool</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td>screenshot_url</td><td style={{ fontSize: 13, color: '#888' }}>Capture a screenshot of any URL and return a CDN link</td></tr>
          <tr><td>batch_screenshot</td><td style={{ fontSize: 13, color: '#888' }}>Capture multiple URLs in parallel</td></tr>
          <tr><td>get_screenshot_status</td><td style={{ fontSize: 13, color: '#888' }}>Check the status of an async batch job</td></tr>
        </tbody>
      </table>
      <Callout type="tip">Works with any MCP-compatible host: Claude Desktop, Cursor, Continue, and custom agent frameworks.</Callout>
    </div>
  ),
  errors: () => (
    <div>
      <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#00e87b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Getting Started</div>
      <h1>Error handling</h1>
      <p>Shotbase uses standard HTTP status codes. Errors return a JSON body with <code>code</code> and <code>message</code> fields.</p>
      <table>
        <thead><tr><th>Status</th><th>Code</th><th>Description</th></tr></thead>
        <tbody>
          {[
            ['400', 'invalid_request', 'Missing or invalid parameters'],
            ['401', 'unauthorized', 'Missing or invalid API key'],
            ['402', 'payment_required', 'Quota exceeded, billing issue'],
            ['422', 'capture_failed', 'Page load failed or timed out'],
            ['429', 'rate_limited', 'Too many requests — back off and retry'],
            ['500', 'internal_error', 'Server error — not charged'],
          ].map(([s, c, d]) => (
            <tr key={s}><td>{s}</td><td>{c}</td><td style={{ fontSize: 13, color: '#888' }}>{d}</td></tr>
          ))}
        </tbody>
      </table>
      <h2>Retry logic</h2>
      <p>Retry <code>429</code> and <code>5xx</code> errors with exponential backoff. The SDK handles this automatically with the <code>retries</code> option. You are never charged for <code>4xx</code> or <code>5xx</code> failures.</p>
      <CodeBlock lang="javascript" code={`// SDK handles retries automatically\nconst sb = new Shotbase({ apiKey: '...', retries: 3 });\n\n// Or handle manually:\ntry {\n  const result = await sb.screenshot({ url: '...' });\n} catch (err) {\n  if (err.status === 429) {\n    // retry after err.retryAfter seconds\n  }\n  if (err.status >= 500) {\n    // server error, safe to retry\n  }\n}`}/>
    </div>
  ),
  caching: () => (
    <div>
      <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#00e87b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Guides</div>
      <h1>Caching & TTL</h1>
      <p>Shotbase caches screenshots at the edge. Cached responses return in under 200ms from 30+ global PoPs.</p>
      <h2>Cache keys</h2>
      <p>The cache key is a hash of: <code>url</code> + <code>width</code> + <code>height</code> + <code>format</code> + <code>full_page</code> + <code>dark_mode</code> + <code>device_scale</code>. Changing any parameter produces a new cache key.</p>
      <h2>TTL</h2>
      <p>Default TTL is 3600 seconds (1 hour). Override per request:</p>
      <CodeBlock lang="json" code={`{ "url": "...", "cache_ttl": 86400 }`}/>
      <p>Set <code>cache_ttl: 0</code> to disable caching entirely, or <code>bust_cache: true</code> to force a fresh capture and update the cache.</p>
      <Callout type="info">Cached screenshots are still billed as 1 request against your quota, but at the <strong>cached rate</strong> — which is 50% cheaper than a fresh capture on Starter and above.</Callout>
    </div>
  ),
}

const DEFAULT_CONTENT = (id: string) => (
  <div>
    <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#00e87b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Docs</div>
    <h1 style={{ textTransform: 'capitalize' }}>{id.replace(/-/g, ' ')}</h1>
    <p>This section is coming soon. Check back shortly.</p>
  </div>
)

export default function Docs() {
  const [active, setActive] = useState('intro')
  const [search, setSearch] = useState('')

  const Content = CONTENT[active] || (() => DEFAULT_CONTENT(active))

  return (
    <div className={styles.container}>
      <nav style={{ height: 56, borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', flexShrink: 0, background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
          <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 8, textDecoration: 'none' }}>
            <div style={{ width: 26, height: 26, background: '#00e87b', borderRadius: 6, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <svg width="13" height="13" viewBox="0 0 16 16" fill="none"><rect x="1" y="1" width="14" height="10" rx="2" stroke="#000" strokeWidth="1.5"/><path d="M4 14h8M8 11v3" stroke="#000" strokeWidth="1.5" strokeLinecap="round"/></svg>
            </div>
            <span style={{ fontFamily: 'var(--font-ibm-plex)', fontWeight: 600, fontSize: 14, color: '#f0f0f0' }}>shotbase</span>
          </Link>
          <span style={{ color: '#444', fontSize: 14 }}>/</span>
          <span style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 13, color: '#888' }}>Docs</span>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/playground" style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 12, color: '#888', border: '1px solid rgba(255,255,255,0.07)', padding: '6px 12px', borderRadius: 6, textDecoration: 'none' }}>Playground</Link>
          <Link href="/dashboard" style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 12, fontWeight: 600, color: '#000', background: '#00e87b', padding: '6px 14px', borderRadius: 6, textDecoration: 'none' }}>Dashboard →</Link>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div style={{ width: 260, borderRight: '1px solid rgba(255,255,255,0.07)', background: '#0a0a0a', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'auto', position: 'sticky', top: 56, height: 'calc(100vh - 56px)' }}>
          <div style={{ padding: '16px 16px 8px' }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search docs…" style={{ width: '100%', fontFamily: 'var(--font-ibm-plex)', fontSize: 12, background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7, padding: '8px 12px', color: '#f0f0f0', outline: 'none' }}/>
          </div>
          <nav style={{ padding: '8px 10px', flex: 1 }}>
            {NAV.map(group => {
              const filtered = group.items.filter(item => !search || item.label.toLowerCase().includes(search.toLowerCase()))
              if (!filtered.length) return null
              return (
                <div key={group.section} style={{ marginBottom: 20 }}>
                  <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#444', padding: '0 8px', marginBottom: 6 }}>{group.section}</div>
                  {filtered.map(item => (
                    <button key={item.id} onClick={() => { setActive(item.id); setSearch(''); }} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '7px 10px', background: active === item.id ? 'rgba(0,232,123,0.08)' : 'none', border: 'none', borderRadius: 6, cursor: 'pointer', color: active === item.id ? '#00e87b' : '#888', fontFamily: 'var(--font-inter)', fontSize: 13, textAlign: 'left', transition: 'all 0.12s', marginBottom: 1 }}
                      onMouseEnter={e => { if (active !== item.id) { e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; e.currentTarget.style.color = '#f0f0f0'; }}}
                      onMouseLeave={e => { if (active !== item.id) { e.currentTarget.style.background = 'none'; e.currentTarget.style.color = '#888'; }}}>
                      {item.label}
                    </button>
                  ))}
                </div>
              )
            })}
          </nav>
        </div>

        <div style={{ flex: 1, overflow: 'auto', minWidth: 0 }}>
          <div style={{ maxWidth: 780, padding: '48px 60px', margin: '0 auto' }}>
            <Content/>
            <div style={{ marginTop: 64, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#444' }}>Last updated Apr 23, 2026</span>
              <div style={{ display: 'flex', gap: 12 }}>
                <Link href="/playground" style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 12, color: '#00e87b' }}>Try in Playground →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
