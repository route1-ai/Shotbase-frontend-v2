"use client"

import React, { useState, useEffect, useRef } from "react"
import { createPortal } from "react-dom"
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
    { id: 'health', label: 'GET /health' },
  ]},
  { section: 'MCP', items: [
    { id: 'mcp', label: 'MCP Server' },
  ]},
  { section: 'Guides', items: [
    { id: 'caching', label: 'Caching' },
    { id: 'rate-limits', label: 'Rate limits' },
    { id: 'billing', label: 'Plans & billing' },
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
      <p style={{ fontSize: 17, color: '#f0f0f0', marginBottom: 24, lineHeight: 1.6 }}>Browser infrastructure for AI and automation developers. Render any webpage and get back a screenshot, its page content, and structured extracted data — over REST or MCP.</p>
      <p>Shotbase runs real Chromium browsers (via Playwright) so you don't have to. A single call handles the browser lifecycle and JS rendering, then returns a screenshot and — when you ask for it — the page's text and structured data extracted from it.</p>
      <p>There are two ways to call Shotbase: a <strong>REST</strong> endpoint (<code>POST /screenshot</code>) and a native <strong>MCP</strong> server (<code>POST /api/mcp</code>) exposing the <code>shotbase_capture</code> tool.</p>
      <h2>Base URL</h2>
      <CodeBlock lang="text" code={`https://api.shotbase.dev`}/>
      <h2>Quick example</h2>
      <CodeBlock lang="bash" code={`curl -X POST https://api.shotbase.dev/screenshot \\
  -H "Authorization: Bearer sk_YOUR_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{"url":"https://example.com"}' \\
  --output shot.png`}/>
      <p>By default the response body is the rendered image. Add <code>include_text</code> or <code>ai_extract</code> to get a JSON response with the page&apos;s text and extracted data instead.</p>
      <Callout type="tip">Start with the <strong>Quickstart</strong> guide for a step-by-step walkthrough, or jump straight to the <strong>API reference</strong> — both are in the sidebar.</Callout>
    </div>
  ),
  quickstart: () => (
    <div>
      <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#00e87b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Getting Started</div>
      <h1>Quickstart</h1>
      <p>Get your first screenshot in under 5 minutes.</p>
      <h2>1. Get your API key</h2>
      <p>Sign up at the <Link href="/dashboard">dashboard</Link>. Create an API key and copy it from the <strong>API Keys</strong> tab.</p>
      <Callout type="warning">Never expose your API key in client-side code. Use it server-side only, or via environment variables.</Callout>
      <h2>2. Make your first request</h2>
      <p>There is no SDK to install — Shotbase is a plain HTTP endpoint. Call it with your language&apos;s native HTTP client:</p>
      <CodeBlock lang="javascript" code={`// Native fetch — no SDK required\nconst res = await fetch("https://api.shotbase.dev/screenshot", {\n  method: "POST",\n  headers: {\n    "Authorization": "Bearer sk_YOUR_KEY",\n    "Content-Type": "application/json",\n  },\n  body: JSON.stringify({ url: "https://stripe.com", format: "png" }),\n});\n\n// Default response is the binary image\nconst bytes = await res.arrayBuffer();`}/>
      <h2>3. Ask for text and data</h2>
      <p>Add <code>include_text</code> and/or <code>ai_extract</code> and the response comes back as JSON containing the page&apos;s text and extracted fields instead of a raw image.</p>
      <CodeBlock lang="bash" code={`curl -X POST https://api.shotbase.dev/screenshot \\\n  -H "Authorization: Bearer sk_YOUR_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "url": "https://stripe.com",\n    "include_text": true,\n    "ai_extract": { "headings": true, "prices": true }\n  }'`}/>
    </div>
  ),
  auth: () => (
    <div>
      <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#00e87b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Getting Started</div>
      <h1>Authentication</h1>
      <p>All API requests require a valid API key sent in the <code>Authorization</code> header as a Bearer token. Keys are prefixed with <code>sk_</code> and created in the dashboard.</p>
      <CodeBlock lang="bash" code={`Authorization: Bearer sk_YOUR_API_KEY`}/>
      <p>The same key authenticates both the REST endpoint and the MCP server.</p>
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
      <CodeBlock lang="bash" code={`POST https://api.shotbase.dev/screenshot`}/>
      <h2>Request body</h2>
      <table>
        <thead><tr><th>Parameter</th><th>Type</th><th>Default</th><th>Description</th></tr></thead>
        <tbody>
          {[
            ['url', 'string', 'required', 'The URL to capture. Must include protocol (http/https).'],
            ['format', 'string', '"png"', 'Output format: png, jpeg, webp, or pdf.'],
            ['full_page', 'boolean', 'false', 'Capture the entire scrollable page height.'],
            ['width', 'integer', '1440', 'Viewport width in pixels.'],
            ['height', 'integer', '900', 'Viewport height in pixels.'],
            ['include_text', 'boolean', 'false', 'Return the page’s rendered text. Switches the response to JSON.'],
            ['ai_extract', 'object', 'null', 'Request structured data, e.g. { "headings": true, "prices": true, "ctas": true, "page_type": true }. Switches the response to JSON.'],
          ].map(([p, t, d, desc]) => (
            <tr key={p}><td>{p}</td><td>{t}</td><td style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 12, color: '#444' }}>{d}</td><td style={{ fontSize: 13, color: '#888' }}>{desc}</td></tr>
          ))}
        </tbody>
      </table>
      <h2>Response</h2>
      <p>By default the response body is the <strong>rendered image bytes</strong> with the matching <code>Content-Type</code> (e.g. <code>image/png</code>). An <code>X-Cache</code> header indicates <code>HIT</code> or <code>MISS</code>.</p>
      <p>When you pass <code>include_text</code> or <code>ai_extract</code>, the response is <strong>JSON</strong> instead:</p>
      <CodeBlock lang="json" code={`{\n  "screenshot_url": null,\n  "format": "png",\n  "width": 1440,\n  "height": 900,\n  "render_time_ms": 1840,\n  "cached": false,\n  "text": "Pricing — simple, transparent…",\n  "ai_data": {\n    "page_type": "pricing",\n    "headings": ["Pricing", "Enterprise"],\n    "ctas": ["Get Started", "Contact Sales"],\n    "prices": ["$29/mo", "$99/mo"]\n  }\n}`}/>
      <Callout type="info">In JSON mode the image is not embedded (<code>screenshot_url</code> is <code>null</code>). Request without <code>include_text</code>/<code>ai_extract</code> to receive the binary image.</Callout>
      <h2>Graceful AI degradation</h2>
      <p>If you request <code>ai_extract</code> but the extraction provider is temporarily unavailable, the capture still succeeds with <code>200</code>. The response returns <code>ai_data: null</code> and a generic <code>ai_error</code> so your integration can proceed:</p>
      <CodeBlock lang="json" code={`{\n  "format": "png",\n  "cached": false,\n  "render_time_ms": 1720,\n  "ai_data": null,\n  "ai_error": "AI extraction temporarily unavailable"\n}`}/>
      <h2>Request size</h2>
      <p>Request bodies are limited to <strong>1 MiB</strong> by default. Larger payloads are rejected before rendering.</p>
      <h2>Example</h2>
      <CodeBlock lang="bash" code={`curl -X POST https://api.shotbase.dev/screenshot \\\n  -H "Authorization: Bearer sk_YOUR_KEY" \\\n  -H "Content-Type: application/json" \\\n  -d '{\n    "url": "https://stripe.com",\n    "format": "png",\n    "full_page": false\n  }' \\\n  --output shot.png`}/>
    </div>
  ),
  health: () => (
    <div>
      <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#00e87b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>API Reference</div>
      <h1 style={{ display: 'flex', alignItems: 'center' }}><METHOD type="GET"/> /health</h1>
      <p>Unauthenticated health check. Returns the service status and which subsystems are connected.</p>
      <CodeBlock lang="bash" code={`curl https://api.shotbase.dev/health`}/>
      <h2>Response</h2>
      <CodeBlock lang="json" code={`{\n  "status": "ok",\n  "service": "shotbase"\n}`}/>
    </div>
  ),
  mcp: () => (
    <div>
      <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#00e87b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>MCP</div>
      <h1>MCP Server</h1>
      <p>Shotbase ships a native <a href="https://modelcontextprotocol.io" target="_blank" rel="noreferrer">Model Context Protocol</a> (MCP) server over streamable HTTP at <code>POST /api/mcp</code>. It gives MCP-compatible agents one tool, <code>shotbase_capture</code>, that renders a page and returns the screenshot plus structured intelligence.</p>
      <h2>Install (Claude Code / Claude Desktop / Cursor)</h2>
      <CodeBlock lang="bash" code={`claude mcp add --transport http shotbase https://api.shotbase.dev/api/mcp \\\n  --header "Authorization: Bearer sk_your_key"`}/>
      <h2>Available tool</h2>
      <table>
        <thead><tr><th>Tool</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td>shotbase_capture</td><td style={{ fontSize: 13, color: '#888' }}>Render a URL and return the screenshot plus extracted JSON (page type, headings, CTAs, prices). Args: url (required), extract, format, full_page, viewport.</td></tr>
        </tbody>
      </table>
      <Callout type="tip">Works with any MCP-compatible host: Claude Code, Claude Desktop, Cursor, and custom agent frameworks.</Callout>
    </div>
  ),
  errors: () => (
    <div>
      <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#00e87b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Getting Started</div>
      <h1>Error handling</h1>
      <p>Shotbase uses standard HTTP status codes. Error responses return a JSON body with an <code>error</code> field (and sometimes a <code>detail</code> field).</p>
      <table>
        <thead><tr><th>Status</th><th>Meaning</th><th>Description</th></tr></thead>
        <tbody>
          {[
            ['400', 'Bad request', 'Missing/invalid parameters, or a blocked (private/internal) URL'],
            ['401', 'Unauthorized', 'Missing or invalid API key'],
            ['413', 'Payload too large', 'Request body exceeds the 1 MiB limit'],
            ['429', 'Rate limited', 'Too many requests for your plan — back off and retry'],
            ['500', 'Capture failed', 'The page failed to render or an internal error occurred'],
            ['503', 'Server busy', 'Renderer temporarily overloaded — check the Retry-After header'],
          ].map(([s, c, d]) => (
            <tr key={s}><td>{s}</td><td>{c}</td><td style={{ fontSize: 13, color: '#888' }}>{d}</td></tr>
          ))}
        </tbody>
      </table>
      <h2>Retry logic</h2>
      <p>Retry <code>429</code> and <code>5xx</code> responses with exponential backoff. A <code>503 Server busy</code> includes a <code>Retry-After</code> header (in seconds) — wait that long before retrying. On a <code>429</code>, slow down to stay within your plan&apos;s per-minute rate limit.</p>
      <CodeBlock lang="json" code={`// Example error body\n{ "error": "Server busy", "detail": "Renderer overloaded" }`}/>
    </div>
  ),
  caching: () => (
    <div>
      <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#00e87b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Guides</div>
      <h1>Caching</h1>
      <p>Identical image requests are served from a short-lived cache, so repeated captures of the same page return faster.</p>
      <h2>Cache key</h2>
      <p>The cache key is derived from <code>url</code> + <code>format</code> + <code>full_page</code> + <code>width</code> × <code>height</code>. Changing any of these — including the viewport dimensions — produces a fresh capture. Requests that ask for <code>include_text</code> or <code>ai_extract</code> are not served from the image cache.</p>
      <h2>Checking cache status</h2>
      <p>Image responses include an <code>X-Cache</code> header set to <code>HIT</code> or <code>MISS</code>. JSON responses include a <code>cached</code> boolean.</p>
      <CodeBlock lang="text" code={`X-Cache: HIT`}/>
    </div>
  ),
  'rate-limits': () => (
    <div>
      <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#00e87b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Guides</div>
      <h1>Rate limits</h1>
      <p>Requests are rate limited per API key, per minute, based on your plan. Exceeding the limit returns <code>429</code>.</p>
      <table>
        <thead><tr><th>Plan</th><th>Requests / minute</th></tr></thead>
        <tbody>
          {[['Free', '10'], ['Starter', '60'], ['Pro', '300'], ['Scale', '1,000']].map(([p, r]) => (
            <tr key={p}><td>{p}</td><td style={{ fontSize: 13, color: '#888' }}>{r}</td></tr>
          ))}
        </tbody>
      </table>
      <Callout type="tip">On a <code>429</code>, back off and retry. Monthly capture quotas are separate from the per-minute rate limit — see Plans &amp; billing.</Callout>
    </div>
  ),
  billing: () => (
    <div>
      <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#00e87b', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: 12 }}>Guides</div>
      <h1>Plans &amp; billing</h1>
      <p>Each plan includes a monthly screenshot quota. Manage your plan and usage in the <Link href="/dashboard">dashboard</Link>.</p>
      <table>
        <thead><tr><th>Plan</th><th>Screenshots / month</th></tr></thead>
        <tbody>
          {[['Free', '10,000'], ['Starter', '50,000'], ['Pro', '250,000'], ['Scale', '1,500,000']].map(([p, q]) => (
            <tr key={p}><td>{p}</td><td style={{ fontSize: 13, color: '#888' }}>{q}</td></tr>
          ))}
        </tbody>
      </table>
      <Callout type="info">See the <Link href="/#pricing">pricing section</Link> for current plan prices.</Callout>
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

  // ----- Mobile docs drawer (≤767px) -----
  const [menuOpen, setMenuOpen] = useState(false)
  const menuBtnRef = useRef<HTMLButtonElement>(null)
  const drawerRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const mq = window.matchMedia("(min-width: 768px)")
    const onC = () => { if (mq.matches) setMenuOpen(false) }
    mq.addEventListener("change", onC)
    return () => mq.removeEventListener("change", onC)
  }, [])
  useEffect(() => {
    if (!menuOpen) return
    const prev = document.body.style.overflow
    document.body.style.overflow = "hidden"
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") { setMenuOpen(false); return }
      if (e.key === "Tab" && drawerRef.current) {
        const f = Array.from(drawerRef.current.querySelectorAll<HTMLElement>('a[href], button:not([disabled]), input, [tabindex]:not([tabindex="-1"])')).filter((el) => el.offsetParent !== null)
        if (!f.length) return
        const first = f[0], last = f[f.length - 1]
        if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus() }
        else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus() }
      }
    }
    document.addEventListener("keydown", onKey)
    const t = window.setTimeout(() => drawerRef.current?.querySelector<HTMLElement>("button, a[href], input")?.focus(), 40)
    return () => {
      document.body.style.overflow = prev
      document.removeEventListener("keydown", onKey)
      window.clearTimeout(t)
      menuBtnRef.current?.focus?.()
    }
  }, [menuOpen])
  const openSection = (id: string) => { setActive(id); setSearch(""); setMenuOpen(false) }

  // Deep-link support: /docs?s=<section> lands directly on that section (used by
  // the API Explorer and Integrations "Docs" buttons). Read once on mount.
  useEffect(() => {
    const s = new URLSearchParams(window.location.search).get('s')
    if (s && CONTENT[s]) setActive(s)
  }, [])

  const Content = CONTENT[active] || (() => DEFAULT_CONTENT(active))

  return (
    <div className={styles.container}>
      {/* Docs mobile shell (≤767px): hide the sidebar, expose it via a "Docs
          menu" hamburger + off-canvas drawer; article uses full width. */}
      <style>{`
        .docs-hamburger { display: none; }
        /* Long headings, inline code and tables must never force page-level
           horizontal scroll; code/tables scroll inside their own box. */
        .docs-article pre { max-width: 100%; overflow-x: auto; }
        .docs-article table { display: block; width: 100%; overflow-x: auto; }
        .docs-article h1, .docs-article h2, .docs-article h3, .docs-article p, .docs-article li, .docs-article code { overflow-wrap: anywhere; }
        @media (max-width: 767px) {
          .docs-sidebar { display: none !important; }
          .docs-hamburger { display: inline-flex !important; }
          .docs-topnav { padding: 0 14px !important; }
          .docs-article { padding: 28px 18px !important; }
        }
        @media (max-width: 430px) { .docs-topnav-pg { display: none !important; } }
      `}</style>
      <nav className="docs-topnav" style={{ height: 56, borderBottom: '1px solid rgba(255,255,255,0.07)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '0 28px', flexShrink: 0, background: 'rgba(5,5,5,0.85)', backdropFilter: 'blur(20px)', position: 'sticky', top: 0, zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12, minWidth: 0 }}>
          <button
            ref={menuBtnRef}
            className="docs-hamburger"
            onClick={() => setMenuOpen(true)}
            aria-label="Open docs menu"
            aria-expanded={menuOpen}
            aria-controls="docs-mobile-nav"
            style={{ alignItems: 'center', justifyContent: 'center', width: 36, height: 36, borderRadius: 8, background: 'none', border: '1px solid rgba(255,255,255,0.1)', color: '#f0f0f0', cursor: 'pointer', flexShrink: 0 }}
          >
            <svg width="17" height="17" viewBox="0 0 18 18" fill="none"><path d="M2.5 4.5h13M2.5 9h13M2.5 13.5h13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
          </button>
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
          <Link className="docs-topnav-pg" href="/dashboard/playground" style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 12, color: '#888', border: '1px solid rgba(255,255,255,0.07)', padding: '6px 12px', borderRadius: 6, textDecoration: 'none' }}>Playground</Link>
          <Link href="/dashboard" style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 12, fontWeight: 600, color: '#000', background: '#00e87b', padding: '6px 14px', borderRadius: 6, textDecoration: 'none', whiteSpace: 'nowrap' }}>Dashboard →</Link>
        </div>
      </nav>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div className="docs-sidebar" style={{ width: 260, borderRight: '1px solid rgba(255,255,255,0.07)', background: '#0a0a0a', display: 'flex', flexDirection: 'column', flexShrink: 0, overflow: 'auto', position: 'sticky', top: 56, height: 'calc(100vh - 56px)' }}>
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
          <div className="docs-article" style={{ maxWidth: 780, padding: '48px 60px', margin: '0 auto' }}>
            <Content/>
            <div style={{ marginTop: 64, paddingTop: 32, borderTop: '1px solid rgba(255,255,255,0.07)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 11, color: '#444' }}>Last updated Apr 23, 2026</span>
              <div style={{ display: 'flex', gap: 12 }}>
                <Link href="/dashboard/playground" style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 12, color: '#00e87b' }}>Try in Playground →</Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile docs drawer — conditionally mounted so its links are NOT
          keyboard-focusable when closed. Slides in via keyframes. */}
      {menuOpen && createPortal(
        <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }}>
          <style>{`@keyframes docsFade{from{opacity:0}to{opacity:1}}@keyframes docsSlide{from{transform:translateX(-100%)}to{transform:translateX(0)}}`}</style>
          <div onClick={() => setMenuOpen(false)} style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(2px)', animation: 'docsFade 0.2s ease' }} />
          <div ref={drawerRef} id="docs-mobile-nav" role="dialog" aria-modal="true" aria-label="Docs navigation"
            style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: 292, maxWidth: '86vw', background: '#0a0a0a', borderRight: '1px solid rgba(255,255,255,0.07)', display: 'flex', flexDirection: 'column', animation: 'docsSlide 0.24s cubic-bezier(0.16,1,0.3,1)', boxShadow: '0 0 40px rgba(0,0,0,0.6)' }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 12px 12px 16px', borderBottom: '1px solid rgba(255,255,255,0.07)' }}>
              <span style={{ fontFamily: 'var(--font-ibm-plex)', fontWeight: 600, fontSize: 15, color: '#f0f0f0' }}>Docs</span>
              <button onClick={() => setMenuOpen(false)} aria-label="Close docs menu" style={{ width: 38, height: 38, display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'none', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 8, color: '#888', cursor: 'pointer' }}>
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none"><path d="M3 3l10 10M13 3L3 13" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" /></svg>
              </button>
            </div>
            <div style={{ padding: '12px 12px 6px' }}>
              <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Search docs…" style={{ width: '100%', boxSizing: 'border-box', fontFamily: 'var(--font-ibm-plex)', fontSize: 13, background: '#111', border: '1px solid rgba(255,255,255,0.07)', borderRadius: 7, padding: '10px 12px', color: '#f0f0f0', outline: 'none' }} />
            </div>
            <nav style={{ padding: '4px 10px 20px', overflowY: 'auto', flex: 1, overscrollBehavior: 'contain', WebkitOverflowScrolling: 'touch' }}>
              {NAV.map(group => {
                const filtered = group.items.filter(item => !search || item.label.toLowerCase().includes(search.toLowerCase()))
                if (!filtered.length) return null
                return (
                  <div key={group.section} style={{ marginBottom: 16 }}>
                    <div style={{ fontFamily: 'var(--font-ibm-plex)', fontSize: 10, textTransform: 'uppercase', letterSpacing: '0.1em', color: '#444', padding: '0 10px', marginBottom: 6 }}>{group.section}</div>
                    {filtered.map(item => (
                      <button key={item.id} onClick={() => openSection(item.id)} style={{ display: 'flex', alignItems: 'center', width: '100%', padding: '11px 12px', background: active === item.id ? 'rgba(0,232,123,0.08)' : 'none', border: 'none', borderRadius: 7, cursor: 'pointer', color: active === item.id ? '#00e87b' : '#c8c8c8', fontFamily: 'var(--font-inter)', fontSize: 15, textAlign: 'left', marginBottom: 1 }}>
                        {item.label}
                      </button>
                    ))}
                  </div>
                )
              })}
            </nav>
          </div>
        </div>,
        document.body
      )}
    </div>
  )
}
