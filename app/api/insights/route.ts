import { auth } from '@clerk/nextjs/server'
import { createClient } from '@supabase/supabase-js'

// Aggregate analytics over the signed-in user's real capture history from the
// Supabase `screenshots` table (written by the render backend). Read-only.
//
// Same auth + Supabase setup as app/api/logs. No fabricated numbers: when the
// DB isn't configured or the query fails we return { available: false } and the
// UI shows an honest state.

const MAX_ROWS = 10_000

type Row = {
  url: string | null
  status: number | null
  time_ms: number | null
  cached: boolean | null
  created_at: string | null
}

// Nearest-rank percentile over an ascending-sorted array (integer ms).
function percentile(sortedAsc: number[], p: number): number {
  const n = sortedAsc.length
  if (n === 0) return 0
  const rank = Math.ceil((p / 100) * n)
  const idx = Math.min(n - 1, Math.max(0, rank - 1))
  return Math.round(sortedAsc[idx])
}

function hostnameOf(url: string | null): string | null {
  if (!url) return null
  try {
    return new URL(url).hostname.replace(/^www\./, '')
  } catch {
    return null
  }
}

// UTC yyyy-mm-dd bucket key for a timestamp.
function dayKey(d: Date): string {
  return d.toISOString().slice(0, 10)
}

export async function GET(req: Request) {
  const { userId } = await auth()
  if (!userId) return Response.json({ error: 'Unauthorized' }, { status: 401 })

  // Window: 7 (default) or 30 days. Anything else falls back to 7.
  const daysParam = new URL(req.url).searchParams.get('days')
  const days = daysParam === '30' ? 30 : 7

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || process.env.SUPABASE_URL
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !supabaseKey) {
    return Response.json({ available: false, days })
  }

  // Range start = 00:00:00 UTC of (today - (days-1)), so a 7-day window covers
  // 7 calendar days including today.
  const now = new Date()
  const from = new Date(now)
  from.setUTCDate(from.getUTCDate() - (days - 1))
  from.setUTCHours(0, 0, 0, 0)

  try {
    const supabase = createClient(supabaseUrl, supabaseKey)
    const { data, error } = await supabase
      .from('screenshots')
      .select('url,status,time_ms,cached,created_at')
      .eq('user_id', userId)
      .gte('created_at', from.toISOString())
      .order('created_at', { ascending: false })
      .limit(MAX_ROWS)

    if (error) {
      console.error('Supabase query error (insights):', error.message)
      return Response.json({ available: false, days })
    }

    const rows = (data || []) as Row[]
    const total = rows.length

    const status200 = rows.filter((r) => r.status === 200)
    const count200 = status200.length
    const cachedHits = status200.filter((r) => r.cached === true).length

    // Latency is meaningful ONLY over status-200, NON-cached rows: cached rows
    // log time_ms 0 and would drag the median/p95 toward zero.
    const latencySamples = status200
      .filter((r) => r.cached !== true)
      .map((r) => (typeof r.time_ms === 'number' ? r.time_ms : 0))
      .sort((a, b) => a - b)

    // Per-day counts — pre-seed every day in the window with 0 so the chart is
    // continuous even on days with no captures.
    const perDayMap = new Map<string, number>()
    for (let i = 0; i < days; i++) {
      const d = new Date(from)
      d.setUTCDate(from.getUTCDate() + i)
      perDayMap.set(dayKey(d), 0)
    }
    for (const r of rows) {
      if (!r.created_at) continue
      const key = r.created_at.slice(0, 10)
      if (perDayMap.has(key)) perDayMap.set(key, (perDayMap.get(key) || 0) + 1)
    }
    const perDay = Array.from(perDayMap.entries()).map(([date, count]) => ({ date, count }))

    // Top 5 domains by count.
    const domainMap = new Map<string, number>()
    for (const r of rows) {
      const h = hostnameOf(r.url)
      if (!h) continue
      domainMap.set(h, (domainMap.get(h) || 0) + 1)
    }
    const topDomains = Array.from(domainMap.entries())
      .map(([domain, count]) => ({ domain, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5)

    // 10 most recent non-200 rows (rows are already newest-first).
    const recentErrors = rows
      .filter((r) => r.status !== 200)
      .slice(0, 10)
      .map((r) => ({ ts: r.created_at, url: r.url, status: r.status }))

    return Response.json({
      available: true,
      days,
      range: { from: from.toISOString(), to: now.toISOString() },
      totals: {
        captures: total,
        // Fractions in [0,1]; the UI formats them as percentages.
        success_rate: total > 0 ? count200 / total : 0,
        cache_hit_rate: count200 > 0 ? cachedHits / count200 : 0,
      },
      latency: {
        median_ms: percentile(latencySamples, 50),
        p95_ms: percentile(latencySamples, 95),
        sample: latencySamples.length,
      },
      per_day: perDay,
      top_domains: topDomains,
      recent_errors: recentErrors,
    })
  } catch (err) {
    console.error('Insights API error:', err instanceof Error ? err.message : 'unknown')
    return Response.json({ available: false, days })
  }
}
