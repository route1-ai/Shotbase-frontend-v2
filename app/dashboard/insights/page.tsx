"use client"

import React, { useEffect, useState } from "react"
import Link from "next/link"

const BORDER = "rgba(255,255,255,0.07)"

const cardStyle: React.CSSProperties = {
  background: "#0a0a0a",
  border: `1px solid ${BORDER}`,
  borderRadius: 10,
  padding: 22,
}

type Insights = {
  available: true
  days: number
  totals: { captures: number; success_rate: number; cache_hit_rate: number }
  latency: { median_ms: number; p95_ms: number; sample: number }
  per_day: { date: string; count: number }[]
  top_domains: { domain: string; count: number }[]
  recent_errors: { ts: string | null; url: string | null; status: number | null }[]
}
type ApiResponse = Insights | { available: false; days: number }

const pct = (frac: number) => `${Math.round(frac * 100)}%`

// "Sep 21" from a yyyy-mm-dd (UTC) key, without pulling in a date library.
function shortDay(dateKey: string): string {
  const [y, m, d] = dateKey.split("-").map(Number)
  const dt = new Date(Date.UTC(y, (m || 1) - 1, d || 1))
  return dt.toLocaleDateString("en-US", { month: "short", day: "numeric", timeZone: "UTC" })
}

function whenLabel(ts: string | null): string {
  if (!ts) return "—"
  const dt = new Date(ts)
  if (Number.isNaN(dt.getTime())) return "—"
  return dt.toLocaleString("en-US", { month: "short", day: "numeric", hour: "numeric", minute: "2-digit" })
}

function Metric({ label, value, sub }: { label: string; value: string; sub?: string }) {
  return (
    <div style={{ ...cardStyle, padding: 18 }}>
      <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, textTransform: "uppercase", letterSpacing: "0.06em", color: "#888", marginBottom: 8 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, letterSpacing: "-0.02em", lineHeight: 1 }}>{value}</div>
      {sub && <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444", marginTop: 6 }}>{sub}</div>}
    </div>
  )
}

function RangeToggle({ days, onChange }: { days: number; onChange: (d: number) => void }) {
  return (
    <div style={{ display: "inline-flex", border: `1px solid ${BORDER}`, borderRadius: 7, overflow: "hidden" }}>
      {[7, 30].map((d) => (
        <button
          key={d}
          onClick={() => onChange(d)}
          style={{
            fontFamily: "var(--font-ibm-plex)",
            fontSize: 12,
            padding: "6px 14px",
            background: days === d ? "rgba(0,232,123,0.1)" : "transparent",
            color: days === d ? "#00e87b" : "#888",
            border: "none",
            cursor: "pointer",
          }}
          aria-pressed={days === d}
        >
          {d}d
        </button>
      ))}
    </div>
  )
}

export default function InsightsPage() {
  const [days, setDays] = useState(7)
  const [data, setData] = useState<ApiResponse | null>(null)

  // Fetch on range change. setState only inside the async continuation (never
  // synchronously in the effect body). `cancelled` guards against a stale
  // response landing after the user flips the range again.
  useEffect(() => {
    let cancelled = false
    fetch(`/api/insights?days=${days}`)
      .then((r) => r.json())
      .then((res: ApiResponse) => { if (!cancelled) setData(res) })
      .catch(() => { if (!cancelled) setData({ available: false, days }) })
    return () => { cancelled = true }
  }, [days])

  // Loading = nothing yet, or the loaded payload is for a different range than
  // the one currently selected (i.e. a range switch is in flight). Derived, so
  // there's no separate loading flag to set inside the effect.
  const loading = data === null || data.days !== days

  const maxDayCount =
    data && data.available ? Math.max(1, ...data.per_day.map((p) => p.count)) : 1
  const maxDomainCount =
    data && data.available ? Math.max(1, ...data.top_domains.map((p) => p.count)) : 1

  return (
    <div>
      {/* Phone width: metric grid collapses to two-up, then one-up; day bars stay
          in a horizontally-scrollable row so labels never overflow the viewport. */}
      <style>{`
        .ins-metrics { display: grid; grid-template-columns: repeat(5, 1fr); gap: 12px; }
        .ins-lower { display: grid; grid-template-columns: 1fr 1fr; gap: 16px; }
        @media (max-width: 900px) { .ins-metrics { grid-template-columns: repeat(2, 1fr); } .ins-lower { grid-template-columns: 1fr; } }
        @media (max-width: 480px) { .ins-metrics { grid-template-columns: 1fr; } }
      `}</style>

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 12, flexWrap: "wrap", marginBottom: 6 }}>
        <div>
          <h1 style={{ fontSize: 20, fontWeight: 600, letterSpacing: "-0.02em", marginBottom: 6 }}>Insights</h1>
          <p style={{ color: "#888", fontSize: 13, margin: 0 }}>Aggregate analytics over your real render activity.</p>
        </div>
        <RangeToggle days={days} onChange={setDays} />
      </div>

      <div style={{ marginTop: 20 }}>
        {loading && !data ? (
          <div style={{ ...cardStyle, fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#444", textAlign: "center" }}>Loading insights…</div>
        ) : !data || data.available !== true ? (
          <div style={{ ...cardStyle }}>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>Insights are temporarily unavailable</div>
            <p style={{ color: "#888", fontSize: 13, lineHeight: 1.6, margin: 0 }}>
              We couldn&apos;t load your render history right now. Your account still works — captures run
              normally — but the analytics view can&apos;t be built at the moment. Check back soon.
            </p>
          </div>
        ) : data.totals.captures === 0 ? (
          // Zero captures in range — honest empty state, no placeholder numbers.
          <div style={{ ...cardStyle, textAlign: "center", padding: "56px 28px" }}>
            <div style={{ width: 44, height: 44, borderRadius: 10, background: "rgba(0,232,123,0.08)", border: "1px solid rgba(0,232,123,0.2)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
              <svg width="22" height="22" viewBox="0 0 16 16" fill="none"><path d="M2 13V8M6 13V3M10 13v-7M14 13v-3" stroke="#00e87b" strokeWidth="1.5" strokeLinecap="round" /></svg>
            </div>
            <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 8 }}>No captures in the last {days} days</div>
            <p style={{ color: "#888", fontSize: 13, lineHeight: 1.6, maxWidth: 440, margin: "0 auto" }}>
              Once you start capturing screenshots, latency, success rate, top domains and daily volume will
              appear here — built from your real render history.
            </p>
            <div style={{ marginTop: 20, fontFamily: "var(--font-ibm-plex)", fontSize: 12 }}>
              <Link href="/dashboard/playground" style={{ color: "#00e87b", textDecoration: "none" }}>Try the Playground →</Link>
            </div>
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {/* Metric cards */}
            <div className="ins-metrics">
              <Metric label="Captures" value={data.totals.captures.toLocaleString()} sub={`last ${days} days`} />
              <Metric label="Success rate" value={pct(data.totals.success_rate)} sub="status 200 / total" />
              <Metric label="Cache hit rate" value={pct(data.totals.cache_hit_rate)} sub="of successful captures" />
              <Metric
                label="Median render"
                value={`${data.latency.median_ms.toLocaleString()} ms`}
                sub={data.latency.sample > 0 ? "backend render time" : "no un-cached samples"}
              />
              <Metric
                label="p95 render"
                value={`${data.latency.p95_ms.toLocaleString()} ms`}
                sub={data.latency.sample > 0 ? "backend render time" : "no un-cached samples"}
              />
            </div>

            <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444" }}>
              Render time is the backend&apos;s processing time only — it doesn&apos;t include network or proxy
              latency. Cached captures are excluded from the render-time figures.
            </div>

            {/* Captures per day */}
            <div style={{ ...cardStyle }}>
              <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Captures per day</div>
              <div data-lenis-prevent style={{ display: "flex", alignItems: "flex-end", gap: 8, overflowX: "auto", paddingBottom: 4, minHeight: 140 }}>
                {data.per_day.map((p) => {
                  const h = Math.round((p.count / maxDayCount) * 110)
                  return (
                    <div key={p.date} style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 6, minWidth: 34, flex: "1 0 auto" }}>
                      <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 10, color: "#888" }}>{p.count}</div>
                      <div
                        title={`${p.count} on ${p.date}`}
                        style={{ width: "70%", maxWidth: 28, height: Math.max(2, h), background: p.count > 0 ? "#00e87b" : "#1a1a1a", borderRadius: 3, transition: "height 0.3s" }}
                      />
                      <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 9, color: "#444", whiteSpace: "nowrap" }}>{shortDay(p.date)}</div>
                    </div>
                  )
                })}
              </div>
            </div>

            <div className="ins-lower">
              {/* Top domains */}
              <div style={{ ...cardStyle }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Top domains</div>
                {data.top_domains.length === 0 ? (
                  <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#444" }}>No domains yet.</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
                    {data.top_domains.map((d) => (
                      <div key={d.domain}>
                        <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 5, gap: 10 }}>
                          <span style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#f0f0f0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>{d.domain}</span>
                          <span style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#888", flexShrink: 0 }}>{d.count.toLocaleString()}</span>
                        </div>
                        <div style={{ height: 6, background: "#1a1a1a", borderRadius: 3, overflow: "hidden" }}>
                          <div style={{ height: "100%", width: `${(d.count / maxDomainCount) * 100}%`, background: "#00e87b", borderRadius: 3 }} />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Recent errors */}
              <div style={{ ...cardStyle }}>
                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 16 }}>Recent errors</div>
                {data.recent_errors.length === 0 ? (
                  <div style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#444" }}>No failed captures in this range. 🎉</div>
                ) : (
                  <div style={{ display: "flex", flexDirection: "column" }}>
                    {data.recent_errors.map((e, i) => (
                      <div key={i} style={{ display: "flex", alignItems: "center", gap: 10, padding: "9px 0", borderTop: i === 0 ? "none" : `1px solid ${BORDER}` }}>
                        <span style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, fontWeight: 600, color: "#ff6060", background: "rgba(255,96,96,0.1)", border: "1px solid rgba(255,96,96,0.25)", borderRadius: 5, padding: "2px 7px", flexShrink: 0 }}>
                          {e.status ?? "ERR"}
                        </span>
                        <span style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 12, color: "#c0c0c0", overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap", flex: 1 }} title={e.url || undefined}>{e.url || "—"}</span>
                        <span style={{ fontFamily: "var(--font-ibm-plex)", fontSize: 11, color: "#444", flexShrink: 0 }}>{whenLabel(e.ts)}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
