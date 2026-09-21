"use client"

import React, { useEffect, useRef, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { PLANS, BUSINESS, salesContactHref } from "@/lib/plans"
import { useLenis } from "lenis/react"
import gsap from "gsap"
import { ScrollTrigger } from "gsap/ScrollTrigger"
import { Copy, Check, Globe, FileText, Lock, Layers, MonitorCheck, Zap, Timer, ScanSearch, MousePointerClick, Brain, TrendingUp, ImageIcon, Bot, BarChart3, Menu, X } from "lucide-react"
import Hero from "@/components/ui/animated-shader-hero"
import { SmoothShaderBg } from "@/components/ui/smooth-shader-bg"
import IntegrationsMarquee from "@/components/ui/integrations-marquee"
import { MacbookScroll } from "@/components/ui/macbook-scroll"
import RadialOrbitalTimeline from "@/components/ui/radial-orbital-timeline"
import { ThemeToggle } from "@/components/theme-toggle"
import { ShotbaseMark } from "@/components/shotbase-mark"

const CODE_SNIPPETS: Record<string, string> = {
  js: `// Native fetch — no SDK required
const res = await fetch("https://api.shotbase.dev/screenshot", {
  method: "POST",
  headers: {
    "Authorization": "Bearer sk_your_key",
    "Content-Type": "application/json",
  },
  body: JSON.stringify({
    url: "https://stripe.com",
    format: "png",
    full_page: false,
  }),
});

// Binary image by default. Add include_text or
// ai_extract and the response comes back as JSON.
const png = await res.arrayBuffer();`,
  py: `# Standard requests — no SDK required
import requests

res = requests.post(
    "https://api.shotbase.dev/screenshot",
    headers={"Authorization": "Bearer sk_your_key"},
    json={
        "url": "https://stripe.com",
        "format": "png",
        "include_text": True,
        "ai_extract": {"headings": True, "prices": True},
    },
)

# include_text / ai_extract -> JSON with text + ai_data
data = res.json()`,
  cu: `curl -X POST https://api.shotbase.dev/screenshot \\
  -H "Authorization: Bearer sk_your_key" \\
  -H "Content-Type: application/json" \\
  -d '{
    "url": "https://stripe.com",
    "format": "png",
    "full_page": false
  }' \\
  --output shot.png`,
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

  // Mobile nav menu
  const [menuOpen, setMenuOpen] = useState(false)
  // Auth-aware nav. Until Clerk is loaded we render neither state, to avoid
  // flashing "Sign in" and then swapping it to "Dashboard".
  const { isLoaded, isSignedIn } = useUser()

  // Root of the marketing page — GSAP reveals are scoped here.
  const rootRef = useRef<HTMLDivElement>(null)

  // Keep ScrollTrigger in sync with Lenis' smoothed scroll position (so
  // triggers fire mid-tween instead of only on native scroll events). Lenis
  // drives the real window scroll, so ScrollTrigger's default window scroller
  // reads the correct value — this just refreshes it on every Lenis frame for
  // jitter-free reveals. (No-op under reduced-motion, where Lenis is disabled.)
  useLenis(() => {
    ScrollTrigger.update()
  })

  // Nav background on scroll. Uses a native scroll listener so it works both
  // with Lenis (which drives real window scroll) and under reduced-motion
  // (where Lenis is disabled and only native scroll fires).
  useEffect(() => {
    const nav = document.getElementById("nav")
    if (!nav) return
    const onScroll = () => nav.classList.toggle("s", window.scrollY > 40)
    onScroll()
    window.addEventListener("scroll", onScroll, { passive: true })
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  // Subtle, restrained scroll reveals (Linear/Vercel style): gentle fade +
  // upward translate as each block enters the viewport — as a PROGRESSIVE
  // ENHANCEMENT only. Content is visible by default (see the two invariants in
  // the effect): we never place a not-yet-triggered offscreen element into a
  // persistent opacity:0 state, so a full-page screenshot / crawler / slow-or-
  // failed JS still shows every section. Reveals play once and never reverse.
  // Fully disabled under prefers-reduced-motion via gsap.matchMedia.
  useEffect(() => {
    const root = rootRef.current
    if (!root) return

    gsap.registerPlugin(ScrollTrigger)

    // Elements to reveal — selected by their existing classes so no markup
    // changes are needed. Ordered roughly top-to-bottom down the page.
    const SELECTOR = [
      ".stat-item",
      ".cap-section > .s-label",
      ".cap-section > h2",
      ".cap-section > p",
      ".cap-grid",
      ".frow",
      ".detail-text",
      ".detail-visual",
      ".mockup-card",
      ".code-header",
      ".code-panel-wrap",
      ".compare-section .section-head",
      ".compare-scroll",
      ".usecases-section .section-head",
      ".uc-card",
      ".cta-banner > *",
      ".pricing-header",
      ".plan",
    ].join(", ")

    const ctx = gsap.context(() => {
      const mm = gsap.matchMedia()

      // Motion only when the user hasn't asked for reduced motion. When they
      // have, we create nothing — elements simply render in their final state.
      mm.add("(prefers-reduced-motion: no-preference)", () => {
        const els = gsap.utils.toArray<HTMLElement>(SELECTOR)
        const viewportH = window.innerHeight
        els.forEach((el) => {
          // Invariant 1: never animate an element that's already in (or above)
          // the first viewport — it just stays visible. This avoids an on-load
          // flash and keeps the first screen static/correct.
          if (el.getBoundingClientRect().top < viewportH) return

          gsap.from(el, {
            opacity: 0,
            y: 24,
            duration: 0.7,
            ease: "power2.out",
            // Invariant 2: immediateRender:false means GSAP does NOT apply the
            // hidden from-state at setup. Offscreen elements stay visible until
            // their trigger actually fires, so if it never fires (screenshot,
            // crawler, no scroll) the content is simply visible.
            immediateRender: false,
            scrollTrigger: {
              trigger: el,
              start: "top 88%",
              // Reveal exactly once and never reverse — once revealed (or if the
              // user scrolls back up) the section stays visible.
              once: true,
            },
          })
        })
      })

      return () => mm.revert()
    }, root)

    // Positions can shift once fonts load / layout settles.
    const refresh = () => ScrollTrigger.refresh()
    const raf = requestAnimationFrame(refresh)
    if (document.fonts?.ready) document.fonts.ready.then(refresh)

    return () => {
      cancelAnimationFrame(raf)
      ctx.revert()
    }
  }, [])

  return (
    <>
      <nav id="nav" className="navbar">
        <Link href="/" className="nlogo" aria-label="Shotbase Home">
          <ShotbaseMark size={28} fill="#00e87b" />
          <span className="nw">shotbase</span>
        </Link>
        <ul className="nl">
          <li><Link href="/docs">Docs</Link></li>
          <li><Link href="/dashboard/playground">Playground</Link></li>
        </ul>
        <div className="nr">
          <ThemeToggle />
          {isLoaded && (
            isSignedIn
              ? <Link href="/dashboard" className="nbg">Dashboard</Link>
              : <Link href="/signin" className="nbg">Sign in</Link>
          )}
          <Link href={isLoaded && isSignedIn ? "/dashboard/keys" : "/signup"} className="np">Get API Key <span aria-hidden="true">→</span></Link>
        </div>
        {/* Mobile controls — theme toggle stays inline, links live behind a menu */}
        <div className="nr-mobile">
          <ThemeToggle />
          <button
            type="button"
            className="nav-toggle"
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            aria-controls="mobile-menu"
            onClick={() => setMenuOpen((v) => !v)}
          >
            {menuOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        </div>
      </nav>

      {/* Mobile menu panel */}
      <div
        id="mobile-menu"
        className={`nav-mobile-panel ${menuOpen ? "open" : ""}`}
        hidden={!menuOpen}
      >
        <Link href="/docs" onClick={() => setMenuOpen(false)}>Docs</Link>
        <Link href="/dashboard/playground" onClick={() => setMenuOpen(false)}>Playground</Link>
        {isLoaded && (
          isSignedIn
            ? <Link href="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
            : <Link href="/signin" onClick={() => setMenuOpen(false)}>Sign in</Link>
        )}
        <Link href={isLoaded && isSignedIn ? "/dashboard/keys" : "/signup"} className="nav-mobile-cta" onClick={() => setMenuOpen(false)}>
          Get API Key <span aria-hidden="true">→</span>
        </Link>
      </div>

      <div className="sk-container" ref={rootRef}>
        <Hero
          headline={{
            line1: "Render any webpage.",
            line2: "Screenshot, content, data."
          }}
          subtitle="Browser infrastructure for AI and automation developers. One API and MCP call renders a real page and returns a screenshot, its content, and structured data — no browser, no headless setup, no DevOps."
          buttons={{
            primary: {
              text: "Start building free",
              onClick: () => router.push("/signup")
            },
            secondary: {
              text: "Try the playground →",
              onClick: () => router.push("/dashboard/playground")
            }
          }}
        />

        {/* ── MacBook Scroll Section ── */}
        <div className="w-full overflow-hidden bg-transparent">
          <MacbookScroll
            title={
              <>
                See your API response <br />
                <span style={{ color: '#00e87b' }}>come to life.</span>
              </>
            }
            showGradient={false}
          />
        </div>

        {/* ── Demo Bar + Feature Pills ── */}
        <div className="demo-bar-wrap">
          <div className="demo-bar">
            <input type="text" placeholder="Enter URL — e.g. https://stripe.com" readOnly />
            <button onClick={() => router.push("/dashboard/playground")}>Screenshot</button>
          </div>
          <div className="feature-pills">
            {["Rendered Page Capture", "PNG · JPEG · WebP", "Page Text & Content", "Structured Data Extraction", "URL to PDF", "Custom Viewport", "REST API", "MCP Server"].map((pill) => (
              <span className="fpill" key={pill}>
                <span className="fpill-dot" aria-hidden="true" />
                {pill}
              </span>
            ))}
          </div>
          <div className="dual-cta">
            <Link href="/dashboard/playground" className="dual-cta a cta-outline">Get a Demo →</Link>
            <Link href="/signup" className="dual-cta a cta-fill">Get Started For Free →</Link>
          </div>
        </div>

        <IntegrationsMarquee
          label=""
          integrations={[
            { name: "Linear" },
            { name: "Stripe" },
            { name: "Railway" },
            { name: "Framer" },
            { name: "Figma" },
            { name: "Vercel" },
            { name: "Supabase" },
            { name: "Raycast" },
            { name: "Mintlify" },
            { name: "Cloudflare" },
          ]}
        />

        <div className="stats" id="stats">
          {[
            { num: "4", u: "", label: "Output formats", sub: "PNG · JPEG · WebP · PDF" },
            { num: "1", u: " call", label: "Screenshot + text + data", sub: "render once, get all three" },
            { num: "MCP", u: "", label: "Native shotbase_capture", sub: "one tool for AI agents" },
            { num: "250", u: "/mo", label: "Free tier", sub: "captures included" },
          ].map((stat, i) => (
            <div
              className="stat-item"
              key={i}
            >
              <div className="stat-num">{stat.num}<span className="u">{stat.u}</span></div>
              <div className="stat-label">{stat.label}</div>
              <div className="stat-sub">{stat.sub}</div>
            </div>
          ))}
        </div>

        {/* ── Capability Orbital ── */}
        <section className="cap-section" id="capabilities">
          <div className="s-label">Capabilities</div>
          <h2>One browser API. Render, capture, extract.</h2>
          <p>Everything you need to render a real page and turn it into pixels, page content, or structured data — one endpoint plus a native MCP server, zero infrastructure.</p>
          <div className="cap-grid">
            <RadialOrbitalTimeline
              timelineData={[
                { id: 1, title: "URL to Screenshot", content: "Render any URL to a high-fidelity image with a single API call.", category: "Capture", icon: Globe, relatedIds: [2, 4], status: "completed", energy: 95 },
                { id: 2, title: "Image Formats", content: "PNG, JPEG, and WebP output from the same endpoint.", category: "Output", icon: ImageIcon, relatedIds: [1, 3], status: "completed", energy: 90 },
                { id: 3, title: "PDF Rendering", content: "Render the full page to a PDF instead of an image.", category: "Output", icon: FileText, relatedIds: [2, 4], status: "completed", energy: 88 },
                { id: 4, title: "Full-Page Capture", content: "Capture the entire scrollable page height, not just the viewport.", category: "Capture", icon: Layers, relatedIds: [1, 7], status: "completed", energy: 92 },
                { id: 5, title: "Page Text & Content", content: "Return the page's rendered text alongside the screenshot.", category: "Content", icon: ScanSearch, relatedIds: [6, 1], status: "completed", energy: 86 },
                { id: 6, title: "Structured Extraction", content: "Headings, prices, CTAs, and page type extracted as JSON.", category: "Content", icon: Brain, relatedIds: [5, 10], status: "completed", energy: 89 },
                { id: 7, title: "Custom Viewport", content: "Set the capture width and height to any size.", category: "Control", icon: MousePointerClick, relatedIds: [4, 8], status: "completed", energy: 80 },
                { id: 8, title: "Smart Wait", content: "Waits for the network to go idle before capturing.", category: "Control", icon: Timer, relatedIds: [7, 1], status: "completed", energy: 82 },
                { id: 9, title: "Response Caching", content: "Recent captures are served straight from cache.", category: "Performance", icon: Zap, relatedIds: [1, 11], status: "completed", energy: 84 },
                { id: 10, title: "MCP Server", content: "Native shotbase_capture tool for Claude, Cursor, and agents.", category: "Interface", icon: Bot, relatedIds: [6, 11], status: "completed", energy: 93 },
                { id: 11, title: "REST API", content: "One POST endpoint — JSON in, image or data out.", category: "Interface", icon: MonitorCheck, relatedIds: [10, 12], status: "completed", energy: 91 },
                { id: 12, title: "API-Key Auth", content: "Bearer API keys with per-plan rate limits.", category: "Access", icon: Lock, relatedIds: [11, 9], status: "completed", energy: 78 },
              ]}
            />
          </div>
        </section>

        <section className="features" id="features">
          {[
            { title: "Screenshot + Content + Data", small: "One call, three outputs", desc: "A single request returns the rendered screenshot, the page's text, and structured data — no extra round-trips." },
            { title: "Four Output Formats", small: "PNG · JPEG · WebP · PDF", desc: "Render any URL to the format you need, from a lightweight JPEG to a full-page PDF." },
            { title: "MCP Server", small: "For AI agents & Claude", desc: "Native Model Context Protocol server. The shotbase_capture tool lets any agent render and read a page in one call." },
            { title: "Structured Extraction", small: "JSON with your screenshot", desc: "Ask for ai_extract and get the page type, headings, CTAs, and prices back as JSON alongside the image." },
            { title: "REST API + MCP", small: "Call it your way", desc: "A simple REST endpoint for any stack, plus a native MCP server so AI agents can render and read any page with a single tool call." },
            { title: "250/mo Free Tier", small: "Free quota to start", desc: "Every account includes 250 captures per month on the free plan. Upgrade when you need more volume." },
          ].map((feat, i) => (
            <div className="frow" key={i}>
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

        {/* ── Detail Section 1: AI-Powered Content Extraction ── */}
        <section className="detail-section" id="ai-extraction">
          <div className="detail-text">
            <div className="s-label">Content extraction</div>
            <h2>Screenshots that come with data</h2>
            <p>You don&apos;t just get an image. Ask for extraction and you get structured data alongside it — page type, headings, CTAs, and prices — pulled from the rendered page.</p>
            <ul>
              <li>Structured JSON on the same request</li>
              <li>Extracts page type, headings, CTAs, prices</li>
              <li>Also returns the page&apos;s rendered text</li>
              <li>Feed directly into your data pipeline</li>
            </ul>
            <Link href="/docs" className="detail-cta">Read the docs <span aria-hidden="true">→</span></Link>
          </div>
          <div className="detail-visual">
            <div className="detail-visual-bar">
              <div className="detail-visual-dot" style={{ background: "#ff5f57" }} />
              <div className="detail-visual-dot" style={{ background: "#febc2e" }} />
              <div className="detail-visual-dot" style={{ background: "#28c840" }} />
              <span>api-response.json</span>
            </div>
            <div className="detail-visual-body">
              <span className="co">{"// POST /screenshot  (with ai_extract)"}</span><br />
              {"{ "}<br />
              &nbsp;&nbsp;<span className="ck">"format"</span>: <span style={{ color: "#c8a869" }}>"png"</span>,<br />
              &nbsp;&nbsp;<span className="ck">"cached"</span>: <span style={{ color: "#00e87b" }}>false</span>,<br />
              &nbsp;&nbsp;<span className="ck">"render_time_ms"</span>: <span style={{ color: "#00e87b" }}>1840</span>,<br />
              &nbsp;&nbsp;<span className="ck">"text"</span>: <span style={{ color: "#c8a869" }}>"Pricing — simple, transparent…"</span>,<br />
              &nbsp;&nbsp;<span className="ck">"ai_data"</span>: {"{ "}<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="ck">"page_type"</span>: <span style={{ color: "#c8a869" }}>"pricing"</span>,<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="ck">"headings"</span>: [<span style={{ color: "#c8a869" }}>"Pricing"</span>, <span style={{ color: "#c8a869" }}>"Enterprise"</span>],<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="ck">"ctas"</span>: [<span style={{ color: "#c8a869" }}>"Get Started"</span>, <span style={{ color: "#c8a869" }}>"Contact Sales"</span>],<br />
              &nbsp;&nbsp;&nbsp;&nbsp;<span className="ck">"prices"</span>: [<span style={{ color: "#c8a869" }}>"$29/mo"</span>, <span style={{ color: "#c8a869" }}>"$99/mo"</span>]<br />
              &nbsp;&nbsp;{"} "}<br />
              {"} "}
            </div>
          </div>
        </section>

        {/* ── Detail Section 2: Full Page & Viewport Screenshots ── */}
        <section className="detail-section reverse">
          <div className="detail-text">
            <div className="s-label">Capture anything</div>
            <h2>Take Viewport or Full Page Screenshots</h2>
            <p>Capture exactly what you need — a viewport-sized snapshot or a full scrolling page. Shotbase handles the browser, rendering, scrolling, and stitching.</p>
            <ul>
              <li>Viewport or full-page captures</li>
              <li>Custom capture width and height</li>
              <li>Waits briefly for the page to settle before capturing</li>
              <li>PNG, JPEG, WebP, and PDF output</li>
            </ul>
            <Link href="/dashboard/playground" className="detail-cta">Try the playground <span aria-hidden="true">→</span></Link>
          </div>
          <div className="mockup-card">
            <div className="mockup-browser-bar">
              <div className="dot" style={{ background: "#ff5f57" }} />
              <div className="dot" style={{ background: "#febc2e" }} />
              <div className="dot" style={{ background: "#28c840" }} />
              <div className="url-bar">https://stripe.com/pricing</div>
            </div>
            <div className="mockup-viewport">
              <div className="mv-header" />
              <div className="mv-text" />
              <div className="mv-text short" />
              <div className="mv-block" />
              <div className="mv-cols">
                <div className="mv-col" />
                <div className="mv-col" />
                <div className="mv-col" />
              </div>
              <div className="mv-text" />
            </div>
          </div>
        </section>

        <div className="code-s" id="code-s">
          <div className="code-header">
            <div className="s-label">Integration</div>
            <h2>One call.<br />REST or MCP.</h2>
            <p>Call a simple REST endpoint from any stack, or connect the native MCP server so AI agents can render and read pages directly. Same capability, your choice of interface.</p>
            <ul className="code-feats">
              <li>One endpoint: render, screenshot, content &amp; data</li>
              <li>API-key authentication</li>
              <li>Native MCP server — shotbase_capture</li>
              <li>JSON responses ready for your pipeline</li>
            </ul>
          </div>
          <div className="code-panel-wrap">
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
                <span>{copied ? "Copied" : "Copy"}</span>
              </button>
            </div>
            <div className="cblock">
              <pre className="cpanel a" style={{ margin: 0, whiteSpace: "pre", fontFamily: "inherit" }}>{CODE_SNIPPETS[activeTab]}</pre>
            </div>
          </div>
        </div>

        {/* ── Comparison Section ── */}
        <section className="compare-section" id="compare">
          <div className="section-head">
            <div className="s-label">Capabilities</div>
            <h2>What you get</h2>
            <p>Everything Shotbase does today — plainly, no asterisks.</p>
          </div>
          <div className="compare-scroll">
          <table className="compare-table">
            <thead>
              <tr>
                <th>Capability</th>
                <th className="highlight">What you get</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>Rendered capture</td>
                <td className="highlight"><span className="ct-check">✓</span> Real Chromium via Playwright</td>
              </tr>
              <tr>
                <td>Output formats</td>
                <td className="highlight"><span className="ct-check">✓</span> PNG · JPEG · WebP · PDF</td>
              </tr>
              <tr>
                <td>Full-page capture</td>
                <td className="highlight"><span className="ct-check">✓</span> Entire scrollable height</td>
              </tr>
              <tr>
                <td>Page text &amp; content</td>
                <td className="highlight"><span className="ct-check">✓</span> Returned with the capture</td>
              </tr>
              <tr>
                <td>Structured data</td>
                <td className="highlight"><span className="ct-check">✓</span> Page type, headings, CTAs, prices</td>
              </tr>
              <tr>
                <td>Interfaces</td>
                <td className="highlight"><span className="ct-check">✓</span> REST API + MCP (shotbase_capture)</td>
              </tr>
              <tr>
                <td>Authentication</td>
                <td className="highlight"><span className="ct-check">✓</span> API keys with per-plan rate limits</td>
              </tr>
            </tbody>
          </table>
          </div>
        </section>

        {/* ── Use Cases Section ── */}
        <section className="usecases-section" id="usecases">
          <div className="section-head">
            <div className="s-label">Use Cases</div>
            <h2>Who Uses Shotbase</h2>
          </div>
          <div className="uc-grid">
            <div className="uc-card">
              <div className="uc-icon"><TrendingUp size={20} /></div>
              <h3>Competitive Intelligence</h3>
              <p>Monitor competitor pricing pages, feature lists, and landing pages. Get structured data — not just pixels.</p>
            </div>
            <div className="uc-card">
              <div className="uc-icon"><ImageIcon size={20} /></div>
              <h3>OG Image Generation</h3>
              <p>Agencies and SaaS products generate OpenGraph preview images for client sites, blog posts, and social cards.</p>
            </div>
            <div className="uc-card">
              <div className="uc-icon"><Bot size={20} /></div>
              <h3>AI Agent Builders</h3>
              <p>Give your AI agents web visibility. Native MCP server for Claude, Cursor, and Windsurf — zero code needed.</p>
            </div>
            <div className="uc-card">
              <div className="uc-icon"><BarChart3 size={20} /></div>
              <h3>SaaS Monitoring</h3>
              <p>Capture pricing pages, dashboards, and partner portals on demand and diff the rendered output in your own monitoring pipeline.</p>
            </div>
          </div>
        </section>

        {/* ── CTA Banner ── */}
        <section className="cta-banner">
          <h2>Ready to capture<br />your first screenshot?</h2>
          <p>250 captures a month on the free plan. Start building in minutes.</p>
          <div className="dual-cta">
            <Link href="/dashboard/playground" className="cta-outline">Get a Demo →</Link>
            <Link href="/signup" className="cta-fill">Get Started For Free →</Link>
          </div>
        </section>

        <section className="pricing-s" id="pricing">
          <div className="pricing-header">
            <div className="s-label">Pricing</div>
            <h2>Start free.<br />Scale without friction.</h2>
          </div>
          <div className="pg">
            {[PLANS.free, PLANS.builder, PLANS.pro].map((p) => (
              <div key={p.id} className={`plan${p.id === "pro" ? " ft" : ""}`}>
                {p.id === "pro" && <div className="pb">For production</div>}
                <div className="pn">{p.name}</div>
                <div className="pp">{p.priceMonthly === 0 ? "$0" : <>${p.priceMonthly}<span>/mo</span></>}</div>
                <div className="pper">{p.priceMonthly === 0 ? "forever" : "no overage — upgrade when you need more"}</div>
                <div className="pdiv"></div>
                <ul className="pfl">
                  <li><span className="pfc" aria-hidden="true">✓</span>{p.captures.toLocaleString()} captures/mo</li>
                  <li><span className="pfc" aria-hidden="true">✓</span>{p.aiExtractions.toLocaleString()} AI extractions/mo</li>
                  <li><span className="pfc" aria-hidden="true">✓</span>{p.rpm} requests/min</li>
                  <li><span className="pfc" aria-hidden="true">✓</span>REST API + MCP</li>
                  <li><span className="pfc" aria-hidden="true">✓</span>Page text + structured extraction</li>
                  <li><span className="pfc" aria-hidden="true">✓</span>PNG · JPEG · WebP · PDF</li>
                  <li><span className="pfc" aria-hidden="true">✓</span>Full-page &amp; custom viewport</li>
                </ul>
                <Link href="/signup" className="pcta" aria-label={`Get started with ${p.name} plan`}>Get started</Link>
              </div>
            ))}
            <div className="plan">
              <div className="pn">{BUSINESS.name}</div>
              <div className="pp">{BUSINESS.priceLabel}</div>
              <div className="pper">contact sales</div>
              <div className="pdiv"></div>
              <ul className="pfl">
                <li><span className="pfc" aria-hidden="true">✓</span>Custom capture volume</li>
                <li><span className="pfc" aria-hidden="true">✓</span>Custom AI extraction volume</li>
                <li><span className="pfc" aria-hidden="true">✓</span>Custom throughput</li>
                <li><span className="pfc" aria-hidden="true">✓</span>REST API + MCP</li>
              </ul>
              <a href={salesContactHref()} className="pcta" aria-label="Contact sales about the Business plan">{BUSINESS.cta}</a>
            </div>
          </div>
        </section>

        {/* Always-dark showcase band (dark base + shader + dark scrim), matching
            the hero — never renders as a white block in light theme. Footer text
            is forced light via the `.footer-dark` rules in globals.css. */}
        <footer className="footer-dark relative overflow-hidden border-t border-[hsl(var(--border))] bg-[#05060a]">
          <div className="absolute inset-0 z-0">
            <SmoothShaderBg />
            <div className="absolute inset-0 bg-black/40 z-[1]" />
          </div>
          <div className="relative z-10 footer-main">
            <div className="fb" style={{ flex: 1 }}>
              <div className="flogo">
                <ShotbaseMark size={20} fill="#00e87b" />
                shotbase
              </div>
              <p>Browser infrastructure for AI &amp; automation.<br />Screenshot, content &amp; structured data.<br /><br />A Route1AI product</p>
            </div>
            <div className="fcols">
              <div className="fcol"><h4>Product</h4><ul><li><Link href="/docs">Docs</Link></li><li><Link href="/dashboard/playground">Playground</Link></li></ul></div>
              <div className="fcol"><h4>Developers</h4><ul><li><Link href="/docs">API Reference</Link></li><li><Link href="/docs">MCP Server</Link></li></ul></div>
            </div>
          </div>
          <div className="fbot relative z-10 !bg-transparent"><span>© 2026 Route1AI, Inc.</span><span>Privacy · Terms · Security</span></div>
        </footer>
      </div>
    </>
  )
}
