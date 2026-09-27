# public/proof

Static "Proof" screenshots shown on the homepage (`app/page.tsx`, `#proof`).

These are **real captures produced by Shotbase's own API**, not mockups — that's
what the section caption claims, so they must be generated that way.

## Regenerate

```bash
SHOTBASE_API_KEY=sk_live_xxx node scripts/generate-proof-shots.mjs
```

Writes (and this repo commits):

- `public/proof/stripe.png`      — https://stripe.com @ 1440×900
- `public/proof/linear.png`      — https://linear.app @ 1440×900
- `public/proof/hackernews.png`  — https://news.ycombinator.com @ 1440×900
- `lib/proof-timings.json`       — per-capture times; the homepage reads the
  proof-image captions from here so they can't drift from the real numbers.

Commit the images **and** `lib/proof-timings.json` together.

The site serves the images as static files. It does **not** call the API at
build or request time.
