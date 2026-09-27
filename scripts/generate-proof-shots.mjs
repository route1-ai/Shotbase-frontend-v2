#!/usr/bin/env node
/**
 * generate-proof-shots.mjs — produce the homepage "Proof" screenshots by calling
 * Shotbase's OWN public API, so the caption "Shotbase captured these itself" is
 * literally true.
 *
 * These are written as STATIC files into public/proof/ and committed. The site
 * NEVER calls the API at build or request time — it just serves the PNGs.
 *
 * Per-capture timings are written to lib/proof-timings.json (committed) and the
 * homepage reads the caption times from there — so a caption can never drift
 * from the number the API actually returned. Re-running updates both the images
 * and the timings together.
 *
 * Usage:
 *   SHOTBASE_API_KEY=sk_live_xxx node scripts/generate-proof-shots.mjs
 *
 * Optional env:
 *   SHOTBASE_API_URL   default https://api.shotbase.dev/screenshot
 *
 * After it runs: review public/proof/*.png, then commit the images AND
 * lib/proof-timings.json together.
 */

import { writeFile, mkdir } from "node:fs/promises"
import { fileURLToPath } from "node:url"
import { dirname, join } from "node:path"

const API_URL = process.env.SHOTBASE_API_URL || "https://api.shotbase.dev/screenshot"
const API_KEY = process.env.SHOTBASE_API_KEY

if (!API_KEY) {
  console.error("✗ Set SHOTBASE_API_KEY (your Shotbase API key) in the environment.")
  console.error("  e.g.  SHOTBASE_API_KEY=sk_live_xxx node scripts/generate-proof-shots.mjs")
  process.exit(1)
}

const ROOT = join(dirname(fileURLToPath(import.meta.url)), "..")
const OUT_DIR = join(ROOT, "public", "proof")
const TIMINGS_FILE = join(ROOT, "lib", "proof-timings.json")

// Committed filenames must match the <img src> values in app/page.tsx.
const SHOTS = [
  { name: "stripe", url: "https://stripe.com" },
  { name: "linear", url: "https://linear.app" },
  { name: "hackernews", url: "https://news.ycombinator.com" },
]

const WIDTH = 1440
const HEIGHT = 900

async function capture({ name, url }) {
  const started = Date.now()
  const res = await fetch(API_URL, {
    method: "POST",
    headers: { Authorization: `Bearer ${API_KEY}`, "Content-Type": "application/json" },
    // Viewport capture at 1440x900 PNG (not full_page) to match the framed gallery.
    body: JSON.stringify({ url, width: WIDTH, height: HEIGHT, format: "png", full_page: false }),
  })
  const ms = Date.now() - started
  if (!res.ok) {
    const body = await res.text().catch(() => "")
    throw new Error(`${name}: HTTP ${res.status} ${body.slice(0, 200)}`)
  }
  const buf = Buffer.from(await res.arrayBuffer())
  await writeFile(join(OUT_DIR, `${name}.png`), buf)
  console.log(`✓ ${name.padEnd(11)} ${String(Math.round(buf.length / 1024)).padStart(5)} KB  ${String(ms).padStart(6)} ms  → public/proof/${name}.png`)
  return { name, url, ms, bytes: buf.length, cached: res.headers.get("x-cache") || null }
}

await mkdir(OUT_DIR, { recursive: true })

const results = []
let failed = false
for (const shot of SHOTS) {
  try {
    results.push(await capture(shot))
  } catch (err) {
    failed = true
    console.error(`✗ ${err instanceof Error ? err.message : err}`)
  }
}

await writeFile(
  TIMINGS_FILE,
  JSON.stringify({ generatedAt: new Date().toISOString(), apiUrl: API_URL, width: WIDTH, height: HEIGHT, results }, null, 2) + "\n",
)

console.log(
  failed
    ? "\nSome captures failed — fix and re-run before committing."
    : "\nDone. Review public/proof/*.png, then commit the images AND lib/proof-timings.json together.",
)
process.exitCode = failed ? 1 : 0
