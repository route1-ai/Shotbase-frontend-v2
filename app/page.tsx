"use client"

import React, { useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useLenis } from "lenis/react"
import { Copy, Check } from "lucide-react"
import Hero from "@/components/ui/animated-shader-hero"
import { WebGLShader } from "@/components/ui/web-gl-shader"
import IntegrationsMarquee from "@/components/ui/integrations-marquee"

const CODE_SNIPPETS: Record<string, string> = {
  js: `// npm install @shotbase/sdk
import { Shotbase } from '@shotbase/sdk';

const sb = new Shotbase({ apiKey: 'sk-live-...' });

const { url, tookMs } = await sb.screenshot({
  url: 'https://stripe.com',
  width: 1440,
  format: 'png',
  removePopups: true,
});

// → cdn.shotbase.io/sc/k9xp... — 142ms`,
  py: `# pip install shotbase
from shotbase import Shotbase

sb = Shotbase(api_key="sk-live-...")
result = sb.screenshot(
  url="https://stripe.com",
  width=1440,
  format="png",
  remove_popups=True,
)
# result.url → cdn.shotbase.io/sc/k9xp...`,
  cu: `curl -X POST \\
  -H "Authorization: Bearer sk-live-..." \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://stripe.com",
    "width": 1440,
    "format": "png",
    "remove_popups": true
  }' \\
  https://api.shotbase.io/v1/screenshot`,
}

export default function Home() {
  const router = useRouter()
  const [activeTab, setActiveTab] = useState("js")
  const [copied, setCopied] = useState(false)

  const handleCopy = async () => {
    const text = CODE_SNIPPETS[activeTab]
    if (!text) return
    try {
      await navigator.clipboard.writeText(text)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch (err) {
      console.error("Failed to copy: ", err)
    }
  }

  // For scrub animations
  const statsRef = useRef<(HTMLDivElement | null)[]>([])
  const featureRefs = useRef<(HTMLDivElement | null)[]>([])
  const codeHeaderRef = useRef<HTMLDivElement>(null)
  const codePanelRef = useRef<HTMLDivElement>(null)
  const pricingHeaderRef = useRef<HTMLDivElement>(null)
  const pgRef = useRef<HTMLDivElement>(null)

  const smoothed = useRef(new Map<string, number>())

  useLenis((lenis) => {
    const scrollY = lenis.scroll

    const smooth = (key: string, raw: number, ease = 0.12) => {
      const prev = smoothed.current.get(key) || 0
      const next = prev + (raw - prev) * ease
      smoothed.current.set(key, next)
      return next
    }

    const VH = () => window.innerHeight

    const progress = (el: HTMLElement, trigger = 0.88) => {
      const rect = el.getBoundingClientRect()
      const top = rect.top + scrollY
      const height = rect.height || el.offsetHeight
      const start = top - VH() * trigger
      const end = top + height * 0.5
      return Math.max(0, Math.min(1, (scrollY - start) / (end - start)))
    }

    // Nav effect
    const nav = document.getElementById("nav")
    if (nav) nav.classList.toggle("s", scrollY > 40)

    // Stats Scrub
    statsRef.current.forEach((el, i) => {
      if (!el) return
      const raw = progress(el, 0.9)
      const delayed = Math.max(0, Math.min(1, raw * 1.4 - i * 0.1))
      const p = smooth(`stat-${i}`, delayed, 0.11)
      el.style.setProperty("--p", p.toString())
    })

    // Features Scrub
    featureRefs.current.forEach((el, i) => {
      if (!el) return
      const raw = progress(el, 0.88)
      const p = smooth(`frow-${i}`, raw, 0.11)
      el.style.setProperty("--p", p.toString())
    })

    // Code section scrub
    if (codeHeaderRef.current && codePanelRef.current) {
      const ch = codeHeaderRef.current
      const cp = codePanelRef.current
      // Start the fade-in earlier so the section is bright when it enters view.
      const pHeader = smooth("ch", progress(ch, 1.35), 0.11)
      const pPanel = smooth("cp", progress(cp, 1.35), 0.11)
      ch.style.opacity = `${0.7 + pHeader * 0.3}`
      ch.style.transform = `translateY(${(1 - pHeader) * 32}px)`
      cp.style.opacity = `${0.7 + pPanel * 0.3}`
      cp.style.transform = `translateY(${(1 - pPanel) * 28}px)`
    }

    // Pricing scrub
    if (pricingHeaderRef.current && pgRef.current) {
      const ph = pricingHeaderRef.current
      const pg = pgRef.current
      const p = smooth("ph", progress(ph, 0.88), 0.11)
      ph.style.opacity = `${0.1 + p * 0.9}`
      ph.style.transform = `translateY(${(1 - p) * 28}px)`

      const pPg = smooth("pg", progress(pg, 0.9), 0.11)
      pg.style.setProperty("--p", pPg.toString())
    }
  })

  return (
    <>
      <nav id="nav" className="navbar">
        <Link href="/" className="nlogo" aria-label="Shotbase Home">
          <svg width="28" height="28" viewBox="0 0 80 80" fill="none" aria-hidden="true">
            <path d="M14,44 L14,14 L44,14" stroke="#00e87b" strokeWidth="10" strokeLinecap="square" />
            <path d="M50,14 L66,14 L66,32" stroke="#00e87b" strokeWidth="10" strokeLinecap="square" />
            <path d="M66,48 L66,66 L36,66" stroke="#00e87b" strokeWidth="10" strokeLinecap="square" />
            <path d="M30,66 L14,66 L14,48" stroke="#00e87b" strokeWidth="10" strokeLinecap="square" />
          </svg>
          <span className="nw">shotbase</span>
        </Link>
        <ul className="nl">
          <li><Link href="/docs">Docs</Link></li>
          <li><Link href="/pricing">Pricing</Link></li>
          <li><Link href="/playground">Playground</Link></li>
          <li><Link href="/">Status&nbsp;<span role="img" aria-label="Online" style={{ color: "#00e87b", fontSize: "9px", verticalAlign: "middle" }}>●</span></Link></li>
        </ul>
        <div className="nr">
          <Link href="/signin" className="nbg">Sign in</Link>
          <Link href="/signup" className="np">Get API Key <span aria-hidden="true">→</span></Link>
        </div>
      </nav>

      <main className="sk-container" id="main-content">
        <Hero
          trustBadge={{
            text: "Trusted by forward-thinking teams.",
            icons: ["✨"]
          }}
          headline={{
            line1: "Screenshot any URL.",
            line2: "One API call."
          }}
          subtitle="No browser, no headless setup, no DevOps. Pass a URL, get a permanent screenshot back in milliseconds."
          buttons={{
            primary: {
              text: "Start building free",
              onClick: () => router.push("/signup")
            },
            secondary: {
              text: "Try the playground →",
              onClick: () => router.push("/playground")
            }
          }}
        />

        <IntegrationsMarquee integrations={[
          { name: "Linear" },
          { name: "Stripe" },
          { name: "Railway" },
          { name: "Framer" },
          { name: "Figma" },
        ]} />

        <div className="stats" id="stats">
          {[
            { num: "187", u: "ms", label: "Avg response", sub: "median with cache" },
            { num: "64", u: "%", label: "Cache hit rate", sub: "sub-200ms served" },
            { num: "99.9", u: "%", label: "Uptime SLA", sub: "30+ global PoPs" },
            { num: "500", u: "/mo", label: "Free forever", sub: "no credit card" },
          ].map((stat, i) => (
            <div
              className="stat-item"
              key={i}
              ref={(el) => { statsRef.current[i] = el }}
            >
              <div className="stat-num">{stat.num}<span className="u">{stat.u}</span></div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-sub">{stat.sub}</div>
            </div>
          ))}
        </div>

        <section className="features" id="features">
          {[
            { title: "AI Popup Removal", small: "Included on all plans", desc: "ML model detects and removes cookie banners, modals, and overlays before capture. Zero configuration — it just works." },
            { title: "Sub-200ms Cache", small: "Smart CDN edge network", desc: "Cached screenshots served from the nearest PoP in under 200ms. Set TTL globally or per-request." },
            { title: "MCP Server", small: "For AI agents & Claude", desc: "Native Model Context Protocol server. Give any AI agent the ability to screenshot and browse any URL." },
            { title: "Zero Failed Charges", small: "Pay for success only", desc: "If the capture fails, you're not charged. Built-in idempotency keys make safe retries trivial." },
            { title: "JS · Python · Go", small: "First-class typed SDKs", desc: "One install. Typed responses. Automatic retries, streaming batch support, and a full mock server for tests." },
            { title: "500/mo Free Forever", small: "No credit card to start", desc: "Every account starts with 500 screenshots per month, permanently. Upgrade when you're ready to scale." },
          ].map((feat, i) => (
            <div className="frow" key={i} ref={(el) => { featureRefs.current[i] = el }}>
              <div className="fnum">0{i + 1}</div>
              <div className="ftitle">
                {feat.title}
                <small>{feat.small}</small>
              </div>
              <div className="fdesc">
                {feat.desc}
                <span className="farrow" aria-hidden="true">↗</span>
              </div>
            </div>
          ))}
        </section>

        <div className="code-s" id="code-s">
          <div className="code-header" ref={codeHeaderRef}>
            <div className="s-label">Integration</div>
            <h2>One method.<br />Every platform.</h2>
            <p>Our SDKs wrap the REST API with typed interfaces and automatic retries. Or call the endpoint directly — no magic required.</p>
            <ul className="code-feats">
              <li>TypeScript types for every response field</li>
              <li>Automatic retry with exponential backoff</li>
              <li>Batch support & webhook delivery</li>
              <li>Full mock server for offline testing</li>
            </ul>
          </div>
          <div className="code-panel-wrap" ref={codePanelRef}>
            <div className="ctabs">
              <div className="ctab-list">
                <button className={`ctab ${activeTab === "js" ? "a" : ""}`} onClick={() => setActiveTab("js")}>JavaScript</button>
                <button className={`ctab ${activeTab === "py" ? "a" : ""}`} onClick={() => setActiveTab("py")}>Python</button>
                <button className={`ctab ${activeTab === "cu" ? "a" : ""}`} onClick={() => setActiveTab("cu")}>cURL</button>
              </div>
              <button
                className="ccopy"
                onClick={handleCopy}
                aria-label={copied ? "Copied!" : "Copy code to clipboard"}
                title={copied ? "Copied!" : "Copy code"}
              >
                {copied ? <Check size={14} /> : <Copy size={14} />}
                <span aria-live="polite">{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <div className="cblock">
              {activeTab === "js" && (
                <div className="cpanel a">
                  <span className="co">{"// npm install @shotbase/sdk"}</span><br />
                  <span className="cc">import</span> <span className="cs">{"{ Shotbase }"}</span> <span className="cc">from</span> <span className="cs">&apos;@shotbase/sdk&apos;</span>;<br /><br />
                  <span className="cc">const</span> sb = <span className="cc">new</span> <span className="cv">Shotbase</span>{"({ "} <span className="ck">apiKey</span>: <span className="cs">&apos;sk-live-...&apos;</span> {" });"}<br /><br />
                  <span className="cc">const</span> {"{ url, tookMs } = "} <span className="cc">await</span> sb.<span className="cv">screenshot</span>{"({"}<br />
                  &nbsp;&nbsp;<span className="ck">url</span>: <span className="cs">&apos;https://stripe.com&apos;</span>,<br />
                  &nbsp;&nbsp;<span className="ck">width</span>: <span className="cv">1440</span>,<br />
                  &nbsp;&nbsp;<span className="ck">format</span>: <span className="cs">&apos;png&apos;</span>,<br />
                  &nbsp;&nbsp;<span className="ck">removePopups</span>: <span className="cv">true</span>,<br />
                  {"});"}<br /><br />
                  <span className="co">{"// → cdn.shotbase.io/sc/k9xp... — 142ms"}</span>
                </div>
              )}
              {activeTab === "py" && (
                <div className="cpanel a">
                  <span className="co">{"# pip install shotbase"}</span><br />
                  <span className="cc">from</span> <span className="ck">shotbase</span> <span className="cc">import</span> <span className="cv">Shotbase</span><br /><br />
                  sb = <span className="cv">Shotbase</span>(<span className="ck">api_key</span>=&quot;sk-live-...&quot;)<br />
                  result = sb.<span className="cv">screenshot</span>(<br />
                  &nbsp;&nbsp;<span className="ck">url</span>=&quot;https://stripe.com&quot;,<br />
                  &nbsp;&nbsp;<span className="ck">width</span>=<span className="cv">1440</span>,<br />
                  &nbsp;&nbsp;<span className="ck">format</span>=&quot;png&quot;,<br />
                  &nbsp;&nbsp;<span className="ck">remove_popups</span>=<span className="cv">True</span>,<br />
                  )<br />
                  <span className="co">{"# result.url → cdn.shotbase.io/sc/k9xp..."}</span>
                </div>
              )}
              {activeTab === "cu" && (
                <div className="cpanel a">
                  <span className="cc">curl</span> <span className="cf">-X POST</span> \<br />
                  &nbsp;&nbsp;<span className="cf">-H</span> <span className="cs">&quot;Authorization: Bearer sk-live-...&quot;</span> \<br />
                  &nbsp;&nbsp;<span className="cf">-H</span> <span className="cs">&quot;Content-Type: application/json&quot;</span> \<br />
                  &nbsp;&nbsp;<span className="cf">-d</span> <span className="cs">&apos;{`\n    "url": "https://stripe.com",\n    "width": 1440,\n    "format": "png",\n    "remove_popups": true\n  `}&apos;</span> \<br />
                  &nbsp;&nbsp;https://api.shotbase.io/v1/screenshot
                </div>
              )}
            </div>
          </div>
        </div>

        <section className="pricing-s" id="pricing">
          <div className="pricing-header" ref={pricingHeaderRef}>
            <div className="s-label">Pricing</div>
            <h2>Start free.<br />Scale without friction.</h2>
          </div>
          <div className="pg" ref={pgRef}>
            <div className="plan">
              <div className="pn">Free</div>
              <div className="pp">$0</div>
              <div className="pper">forever</div>
              <div className="pdiv"></div>
              <ul className="pfl">
                <li><span className="pfc" aria-hidden="true">✓</span>500 screenshots/mo</li>
                <li><span className="pfc" aria-hidden="true">✓</span>PNG &amp; JPEG</li>
                <li><span className="pfc" aria-hidden="true">✓</span>CDN hosting</li>
                <li><span className="pfc" aria-hidden="true">✓</span>Community support</li>
              </ul>
              <Link href="/dashboard" className="pcta" aria-label="Get started with Free plan">Get started</Link>
            </div>
            <div className="plan">
              <div className="pn">Starter</div>
              <div className="pp">$9<span>/mo</span></div>
              <div className="pper">+ $0.012 per extra</div>
              <div className="pdiv"></div>
              <ul className="pfl">
                <li><span className="pfc" aria-hidden="true">✓</span>2,000 screenshots/mo</li>
                <li><span className="pfc" aria-hidden="true">✓</span>All formats incl. PDF</li>
                <li><span className="pfc" aria-hidden="true">✓</span>AI popup removal</li>
                <li><span className="pfc" aria-hidden="true">✓</span>7-day log retention</li>
              </ul>
              <Link href="/dashboard" className="pcta" aria-label="Get started with Starter plan">Get started</Link>
            </div>
            <div className="plan ft">
              <div className="pb">Most popular</div>
              <div className="pn">Pro</div>
              <div className="pp">$19<span>/mo</span></div>
              <div className="pper">+ $0.008 per extra</div>
              <div className="pdiv"></div>
              <ul className="pfl">
                <li><span className="pfc" aria-hidden="true">✓</span>10,000 screenshots/mo</li>
                <li><span className="pfc" aria-hidden="true">✓</span>MCP server access</li>
                <li><span className="pfc" aria-hidden="true">✓</span>Sub-200ms cache</li>
                <li><span className="pfc" aria-hidden="true">✓</span>Custom JS injection</li>
                <li><span className="pfc" aria-hidden="true">✓</span>Webhooks &amp; 30-day logs</li>
              </ul>
              <Link href="/dashboard" className="pcta" aria-label="Start Pro plan trial">Start Pro trial</Link>
            </div>
            <div className="plan">
              <div className="pn">Scale</div>
              <div className="pp">$49<span>/mo</span></div>
              <div className="pper">+ $0.004 per extra</div>
              <div className="pdiv"></div>
              <ul className="pfl">
                <li><span className="pfc" aria-hidden="true">✓</span>50,000 screenshots/mo</li>
                <li><span className="pfc" aria-hidden="true">✓</span>Dedicated instances</li>
                <li><span className="pfc" aria-hidden="true">✓</span>SLA guarantee</li>
                <li><span className="pfc" aria-hidden="true">✓</span>SSO &amp; teams</li>
              </ul>
              <Link href="/dashboard" className="pcta" aria-label="Get started with Scale plan">Get started</Link>
            </div>
          </div>
        </section>

        <footer className="relative overflow-hidden border-t border-white/5">
          <div className="absolute inset-0 z-0">
            <WebGLShader />
            <div className="absolute inset-0 bg-black/70 z-[1]" />
          </div>
          <div className="relative z-10 footer-main">
            <div className="fb" style={{ flex: 1 }}>
              <div className="flogo">
                <svg width="20" height="20" viewBox="0 0 80 80" fill="none">
                  <path d="M14,44 L14,14 L44,14" stroke="#00e87b" strokeWidth="10" strokeLinecap="square" />
                  <path d="M50,14 L66,14 L66,32" stroke="#00e87b" strokeWidth="10" strokeLinecap="square" />
                  <path d="M66,48 L66,66 L36,66" stroke="#00e87b" strokeWidth="10" strokeLinecap="square" />
                  <path d="M30,66 L14,66 L14,48" stroke="#00e87b" strokeWidth="10" strokeLinecap="square" />
                </svg>
                shotbase
              </div>
              <p>Screenshot any URL.<br />One API call.<br /><br />A Route1AI product</p>
            </div>
            <div className="fcols">
              <div className="fcol"><h4>Product</h4><ul><li><Link href="/docs">Docs</Link></li><li><Link href="/playground">Playground</Link></li><li><Link href="/pricing">Pricing</Link></li><li><Link href="/">Changelog</Link></li></ul></div>
              <div className="fcol"><h4>Developers</h4><ul><li><Link href="/docs">API Reference</Link></li><li><Link href="/">JS SDK</Link></li><li><Link href="/">Python SDK</Link></li><li><Link href="/">MCP Server</Link></li></ul></div>
              <div className="fcol"><h4>Company</h4><ul><li><Link href="/">Route1AI</Link></li><li><Link href="/">Blog</Link></li><li><Link href="/">GitHub</Link></li></ul></div>
            </div>
          </div>
          <div className="fbot relative z-10 !bg-transparent"><span>© 2026 Route1AI, Inc.</span><span>Privacy · Terms · Security</span></div>
        </footer>
      </main>
    </>
  )
}
