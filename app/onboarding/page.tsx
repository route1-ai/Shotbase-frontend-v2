"use client"

import React, { useEffect, useMemo, useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useUser } from "@clerk/nextjs"
import { ThemeToggle } from "@/components/theme-toggle"

// ----- Design tokens -----
const BORDER = "rgba(255,255,255,0.07)"
const BORDER_STRONG = "rgba(255,255,255,0.14)"
const ACTIVE_BG = "rgba(0,232,123,0.08)"
const ACTIVE_BORDER = "rgba(0,232,123,0.35)"
const HOVER_BG = "rgba(255,255,255,0.04)"
const STORAGE_KEY = "shotbase_onboarding"

// ----- Step 1: segments -----
type SegmentId = "ai_agent" | "web_app" | "backend" | "internal" | "exploring"
const SEGMENTS: { id: SegmentId; emoji: string; label: string; sub: string; suggest: IntegrationId }[] = [
  { id: "ai_agent",  emoji: "🤖", label: "AI agent / LLM app",        sub: "Building autonomous agents or copilots", suggest: "mcp" },
  { id: "web_app",   emoji: "🌐", label: "Web app",                   sub: "Next.js, React, Vue — fetch from browser or server", suggest: "js" },
  { id: "backend",   emoji: "⚙️", label: "Backend / cron / scraper", sub: "Python, Node, Go — server-side jobs",     suggest: "python" },
  { id: "internal",  emoji: "🧩", label: "Internal tool / no-code",  sub: "Call the REST API from any HTTP client",  suggest: "curl" },
  { id: "exploring", emoji: "🔭", label: "Just exploring",            sub: "Show me the easy way",                    suggest: "curl" },
]

// ----- Step 2: integrations -----
// Shotbase exposes a REST API and an MCP server (tool: shotbase_capture). Use
// plain HTTP from any language plus MCP for agents — no bespoke SDK required.
type IntegrationId = "mcp" | "curl" | "js" | "python"
const INTEGRATIONS: { id: IntegrationId; label: string; tag: string; initial: string }[] = [
  { id: "mcp",           label: "MCP Server",     tag: "AI agents",    initial: "M"  },
  { id: "curl",          label: "cURL",           tag: "Any shell",    initial: "$_"  },
  { id: "js",            label: "fetch() / JS",   tag: "Native fetch", initial: "Js" },
  { id: "python",        label: "Python (httpx)", tag: "Python 3.10+", initial: "Py" },
]

// ----- Snippet generator (key is interpolated into the displayed code) -----
function buildSnippet(integration: IntegrationId, apiKey: string): { lang: string; code: string } {
  const key = apiKey || "YOUR_API_KEY"
  switch (integration) {
    case "curl":
      return {
        lang: "bash",
        code:
`curl -X POST 'https://api.shotbase.dev/screenshot' \\
  -H 'Authorization: Bearer ${key}' \\
  -H 'Content-Type: application/json' \\
  -d '{"url": "https://stripe.com"}' \\
  --output screenshot.png`,
      }
    case "js":
      return {
        lang: "javascript",
        code:
`const res = await fetch('https://api.shotbase.dev/screenshot', {
  method: 'POST',
  headers: {
    'Authorization': 'Bearer ${key}',
    'Content-Type': 'application/json',
  },
  body: JSON.stringify({ url: 'https://stripe.com' }),
})
const blob = await res.blob()
const imageUrl = URL.createObjectURL(blob)`,
      }
    case "python":
      return {
        lang: "python",
        code:
`import httpx

r = httpx.post(
    'https://api.shotbase.dev/screenshot',
    headers={'Authorization': 'Bearer ${key}'},
    json={'url': 'https://stripe.com'},
    timeout=60.0,
)
r.raise_for_status()
with open('screenshot.png', 'wb') as f:
    f.write(r.content)`,
      }
    case "mcp":
      return {
        lang: "bash",
        code:
`# Add Shotbase's hosted MCP server to your agent (HTTP transport).
# Works with Claude Code, Claude Desktop, and Cursor:
claude mcp add --transport http shotbase https://api.shotbase.dev/api/mcp \\
  --header "Authorization: Bearer ${key}"

# Exposes the "shotbase_capture" tool to your agent.`,
      }
  }
}

// ----- Subcomponents -----

function ProgressBar({ step }: { step: 1 | 2 | 3 }) {
  return (
    <div style={{ display: "flex", justifyContent: "center", gap: 8, marginBottom: 32 }}>
      {[1, 2, 3].map((n) => (
        <div
          key={n}
          style={{
            height: 4,
            width: 56,
            borderRadius: 2,
            background: n <= step ? "#00e87b" : BORDER,
            transition: "background 0.25s",
          }}
        />
      ))}
    </div>
  )
}

function ChoiceCard({
  active,
  onClick,
  children,
  ariaLabel,
}: {
  active: boolean
  onClick: () => void
  children: React.ReactNode
  ariaLabel: string
}) {
  const [hover, setHover] = useState(false)
  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setHover(true)}
      onMouseLeave={() => setHover(false)}
      aria-label={ariaLabel}
      aria-pressed={active}
      style={{
        width: "100%",
        textAlign: "left",
        background: active ? ACTIVE_BG : hover ? HOVER_BG : "#0a0a0a",
        border: `1px solid ${active ? ACTIVE_BORDER : hover ? BORDER_STRONG : BORDER}`,
        borderRadius: 10,
        padding: 16,
        color: "inherit",
        cursor: "pointer",
        transition: "all 0.15s",
        position: "relative",
      }}
    >
      {children}
      {active && (
        <div
          style={{
            position: "absolute",
            top: 14,
            right: 14,
            width: 18,
            height: 18,
            borderRadius: "50%",
            background: "#00e87b",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
            <path d="M2 5l2 2 4-4" stroke="#000" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
      )}
    </button>
  )
}

// ----- Page -----

export default function OnboardingPage() {
  const { user, isLoaded } = useUser()
  const router = useRouter()

  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [segment, setSegment] = useState<SegmentId | null>(null)
  const [integration, setIntegration] = useState<IntegrationId | null>(null)
  const [apiKey, setApiKey] = useState<string>("")
  const [creating, setCreating] = useState(false)
  const [copied, setCopied] = useState<"key" | "code" | null>(null)
  const [skipping, setSkipping] = useState(false)

  // Restore in-progress wizard state from localStorage
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY)
      if (raw) {
        const s = JSON.parse(raw)
        if (s.segment) setSegment(s.segment)
        if (s.integration) setIntegration(s.integration)
        if (s.step === 2) setStep(2)
      }
    } catch {}
  }, [])

  // Persist in-progress state
  useEffect(() => {
    if (typeof window === "undefined") return
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ segment, integration, step }))
    } catch {}
  }, [segment, integration, step])

  // If user has already onboarded, bounce them to the dashboard
  useEffect(() => {
    if (!isLoaded || !user) return
    if (user.unsafeMetadata?.onboarding_complete) {
      router.replace("/dashboard")
    }
  }, [isLoaded, user, router])

  // Pre-highlight integration when segment changes (if user hasn't picked one yet)
  useEffect(() => {
    if (segment && !integration) {
      const seg = SEGMENTS.find((s) => s.id === segment)
      if (seg) setIntegration(seg.suggest)
    }
  }, [segment, integration])

  // Step 2 → 3: create the API key
  const createKeyAndAdvance = async () => {
    setCreating(true)
    try {
      const res = await fetch("/api/keys/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: "Onboarding key" }),
      })
      const data = await res.json()
      if (data?.key) {
        setApiKey(data.key)
      }
      setStep(3)
    } catch (err) {
      console.error("Failed to create key", err)
      setStep(3) // proceed anyway; user can create one from /dashboard/keys
    } finally {
      setCreating(false)
    }
  }

  const finish = async (destination: "playground" | "dashboard") => {
    setSkipping(true)
    try {
      if (user) {
        await user.update({
          unsafeMetadata: {
            ...user.unsafeMetadata,
            onboarding_complete: true,
            onboarding_segment: segment ?? "exploring",
            onboarding_integration: integration ?? "curl",
            onboarding_completed_at: new Date().toISOString(),
          },
        })
      }
      if (typeof window !== "undefined") window.localStorage.removeItem(STORAGE_KEY)
    } catch (err) {
      console.error("Failed to save onboarding state", err)
    } finally {
      router.push(destination === "playground" ? "/dashboard/playground?url=https://stripe.com" : "/dashboard")
    }
  }

  const snippet = useMemo(() => buildSnippet(integration ?? "curl", apiKey), [integration, apiKey])

  const copySnippet = async () => {
    try {
      await navigator.clipboard.writeText(snippet.code)
      setCopied("code")
      setTimeout(() => setCopied(null), 1500)
    } catch {}
  }

  const copyKey = async () => {
    if (!apiKey) return
    try {
      await navigator.clipboard.writeText(apiKey)
      setCopied("key")
      setTimeout(() => setCopied(null), 1500)
    } catch {}
  }

  return (
    <div style={{ minHeight: "100vh", background: "#050505", color: "#f0f0f0", display: "flex", flexDirection: "column" }}>
      <header style={{ height: 56, borderBottom: `1px solid ${BORDER}`, display: "flex", alignItems: "center", padding: "0 28px", background: "rgba(5,5,5,0.85)", backdropFilter: "blur(20px)" }}>
        <Link href="/" style={{ display: "flex", alignItems: "center", gap: 8, textDecoration: "none" }}>
          <div style={{ width: 26, height: 26, background: "#00e87b", borderRadius: 6, display: "flex", alignItems: "center", justifyContent: "center" }}>
            <svg width="13" height="13" viewBox="0 0 16 16" fill="none">
              <rect x="1" y="1" width="14" height="10" rx="2" stroke="#000" strokeWidth="1.5" />
              <path d="M4 14h8M8 11v3" stroke="#000" strokeWidth="1.5" strokeLinecap="round" />
            </svg>
          </div>
          <span style={{ fontFamily: "var(--font-ibm-plex)", fontWeight: 600, fontSize: 14, color: "#f0f0f0" }}>shotbase</span>
        </Link>
        <div style={{ marginLeft: 16, fontFamily: "var(--font-ibm-plex)", fontSize: 13, color: "#444" }}>/ Welcome</div>
        <div style={{ marginLeft: "auto" }}>
          <ThemeToggle />
        </div>
      </header>

      <main style={{ flex: 1, display: "flex", alignItems: "flex-start", justifyContent: "center", padding: "56px 24px" }}>
        <div style={{ width: "100%", maxWidth: 640 }}>
          <ProgressBar step={step} />

          {/* ---- STEP 1 ---- */}
          {step === 1 && (
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 8, textAlign: "center" }}>
                What are you building?
              </h1>
              <p style={{ color: "#888", fontSize: 13, marginBottom: 28, textAlign: "center" }}>
                We'll set up your dashboard for your stack — no boilerplate to wade through.
              </p>

              <div style={{ display: "grid", gap: 10, marginBottom: 28 }}>
                {SEGMENTS.map((s) => (
                  <ChoiceCard key={s.id} active={segment === s.id} onClick={() => setSegment(s.id)} ariaLabel={s.label}>
                    <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
                      <div style={{ fontSize: 22, flexShrink: 0, width: 36, height: 36, background: "#111", border: `1px solid ${BORDER}`, borderRadius: 8, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {s.emoji}
                      </div>
                      <div style={{ flex: 1, minWidth: 0, paddingRight: 28 }}>
                        <div style={{ fontSize: 14, fontWeight: 500, marginBottom: 2 }}>{s.label}</div>
                        <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#666" }}>{s.sub}</div>
                      </div>
                    </div>
                  </ChoiceCard>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button
                  onClick={() => finish("dashboard")}
                  style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#666", background: "none", border: "none", cursor: "pointer", padding: "8px 12px" }}
                >
                  Skip — go to dashboard
                </button>
                <button
                  onClick={() => setStep(2)}
                  disabled={!segment}
                  style={{
                    fontFamily: "var(--font-ibm-plex)",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#000",
                    background: segment ? "#00e87b" : "#333",
                    border: "none",
                    padding: "10px 22px",
                    borderRadius: 8,
                    cursor: segment ? "pointer" : "not-allowed",
                  }}
                >
                  Continue →
                </button>
              </div>
            </div>
          )}

          {/* ---- STEP 2 ---- */}
          {step === 2 && (
            <div>
              <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 8, textAlign: "center" }}>
                Pick your integration
              </h1>
              <p style={{ color: "#888", fontSize: 13, marginBottom: 28, textAlign: "center" }}>
                We'll prefill code samples for {INTEGRATIONS.find((i) => i.id === integration)?.label || "the option you choose"}. You can switch later.
              </p>

              <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 10, marginBottom: 28 }}>
                {INTEGRATIONS.map((i) => (
                  <ChoiceCard key={i.id} active={integration === i.id} onClick={() => setIntegration(i.id)} ariaLabel={i.label}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12, paddingRight: 24 }}>
                      <div style={{ width: 32, height: 32, background: "#111", border: `1px solid ${BORDER}`, borderRadius: 7, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "var(--font-ibm-plex)", fontSize: 12, fontWeight: 600, color: "#00e87b", flexShrink: 0 }}>
                        {i.initial}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13, fontWeight: 500 }}>{i.label}</div>
                        <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#666" }}>{i.tag}</div>
                      </div>
                    </div>
                  </ChoiceCard>
                ))}
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <button
                  onClick={() => setStep(1)}
                  style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#666", background: "none", border: "none", cursor: "pointer", padding: "8px 12px" }}
                >
                  ← Back
                </button>
                <button
                  onClick={createKeyAndAdvance}
                  disabled={!integration || creating}
                  style={{
                    fontFamily: "var(--font-ibm-plex)",
                    fontSize: 13,
                    fontWeight: 600,
                    color: "#000",
                    background: !integration ? "#333" : creating ? "#009950" : "#00e87b",
                    border: "none",
                    padding: "10px 22px",
                    borderRadius: 8,
                    cursor: !integration || creating ? "not-allowed" : "pointer",
                    display: "flex",
                    alignItems: "center",
                    gap: 8,
                  }}
                >
                  {creating ? (
                    <>
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#000" strokeWidth="2.5" strokeLinecap="round" style={{ animation: "spin 0.8s linear infinite" }}>
                        <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4" />
                      </svg>
                      Creating key…
                    </>
                  ) : (
                    "Create my API key →"
                  )}
                </button>
              </div>
              <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
            </div>
          )}

          {/* ---- STEP 3 ---- */}
          {step === 3 && (
            <div>
              <div style={{ textAlign: "center", marginBottom: 28 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "rgba(0,232,123,0.1)", border: `1px solid ${ACTIVE_BORDER}`, margin: "0 auto 18px", display: "flex", alignItems: "center", justifyContent: "center" }}>
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#00e87b" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
                <h1 style={{ fontSize: 24, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 8 }}>
                  Your API key is ready
                </h1>
                <p style={{ color: "#888", fontSize: 13 }}>
                  Copy it now — we won't show it again. You can always create new keys in the dashboard.
                </p>
              </div>

              {/* API key reveal */}
              <div style={{ background: "#0a0a0a", border: `1px solid ${ACTIVE_BORDER}`, borderRadius: 10, padding: 16, marginBottom: 16 }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                  <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#00e87b", fontWeight: 600 }}>
                    Your secret key
                  </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  {/* Shown exactly once — same one-time semantics as the Keys page.
                      Never persisted; unrecoverable after leaving this screen. */}
                  <code
                    style={{
                      flex: 1,
                      fontFamily: "var(--font-ibm-plex)",
                      fontSize: 13,
                      color: "#f0f0f0",
                      background: "#050505",
                      padding: "10px 14px",
                      borderRadius: 6,
                      overflowX: "auto",
                      whiteSpace: "nowrap",
                      border: `1px solid ${BORDER}`,
                    }}
                  >
                    {apiKey || "—"}
                  </code>
                  <button
                    onClick={copyKey}
                    disabled={!apiKey}
                    style={{
                      fontFamily: "var(--font-ibm-plex)",
                      fontSize: 12,
                      fontWeight: 600,
                      color: copied === "key" ? "#00e87b" : "#000",
                      background: copied === "key" ? "transparent" : "#00e87b",
                      border: copied === "key" ? `1px solid ${ACTIVE_BORDER}` : "none",
                      padding: "9px 14px",
                      borderRadius: 6,
                      cursor: apiKey ? "pointer" : "not-allowed",
                      opacity: apiKey ? 1 : 0.4,
                    }}
                  >
                    {copied === "key" ? "✓ Copied" : "Copy key"}
                  </button>
                </div>
              </div>

              {/* Code snippet */}
              <div style={{ background: "#0a0a0a", border: `1px solid ${BORDER}`, borderRadius: 10, marginBottom: 20, overflow: "hidden" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 16px", borderBottom: `1px solid ${BORDER}` }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                    <span style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.08em", color: "#666" }}>
                      {INTEGRATIONS.find((i) => i.id === integration)?.label || "Code"}
                    </span>
                    <span style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: "#444", background: "#050505", padding: "2px 6px", borderRadius: 3 }}>
                      {snippet.lang}
                    </span>
                  </div>
                  <button
                    onClick={copySnippet}
                    style={{
                      fontFamily: "var(--font-ibm-plex)",
                      fontSize: 11,
                      color: copied === "code" ? "#00e87b" : "#666",
                      background: "transparent",
                      border: "none",
                      cursor: "pointer",
                      padding: "4px 8px",
                      fontWeight: copied === "code" ? 600 : 400,
                    }}
                  >
                    {copied === "code" ? "✓ Copied" : "Copy code"}
                  </button>
                </div>
                <pre style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, lineHeight: 1.65, padding: 16, overflow: "auto", maxHeight: 280, color: "#888", margin: 0, whiteSpace: "pre" }}>
                  {snippet.code}
                </pre>
              </div>

              {/* CTAs */}
              <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                <button
                  onClick={() => finish("playground")}
                  disabled={skipping}
                  style={{
                    fontFamily: "var(--font-ibm-plex)",
                    fontSize: 14,
                    fontWeight: 600,
                    color: "#000",
                    background: "#00e87b",
                    border: "none",
                    padding: "14px 22px",
                    borderRadius: 8,
                    cursor: skipping ? "not-allowed" : "pointer",
                    width: "100%",
                    opacity: skipping ? 0.7 : 1,
                  }}
                >
                  ▶ Run this now in Playground
                </button>
                <button
                  onClick={() => finish("dashboard")}
                  disabled={skipping}
                  style={{
                    fontFamily: "var(--font-ibm-plex)",
                    fontSize: 13,
                    color: "#888",
                    background: "transparent",
                    border: `1px solid ${BORDER}`,
                    padding: "12px 22px",
                    borderRadius: 8,
                    cursor: skipping ? "not-allowed" : "pointer",
                    width: "100%",
                  }}
                >
                  Skip to dashboard
                </button>
              </div>

              <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444", textAlign: "center", marginTop: 18, lineHeight: 1.7 }}>
                <span style={{ color: "#00e87b" }}>→</span> Secret keys are shown once. Store this somewhere safe.<br />
                <span style={{ color: "#00e87b" }}>→</span> Need to start over?{" "}
                <a href="/dashboard/keys" style={{ color: "#888", textDecoration: "underline" }}>Generate another key</a> any time.
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  )
}
