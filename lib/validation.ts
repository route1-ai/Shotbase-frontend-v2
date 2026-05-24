import { z } from 'zod'

/**
 * Zod schemas for inbound API requests.
 *
 * Usage in a route:
 *   const result = ScreenshotRequestSchema.safeParse(await req.json())
 *   if (!result.success) {
 *     return Response.json({ error: 'Invalid request', issues: result.error.flatten().fieldErrors }, { status: 400 })
 *   }
 *   const body = result.data
 *
 * Rules of thumb:
 *  - Cap every string length to prevent payload-bloat DoS
 *  - Cap every number to prevent integer-overflow / pathological-input cases
 *  - Use enums whenever the set is closed
 *  - Default values explicitly so the renderer never sees `undefined`
 */

export const ScreenshotRequestSchema = z.object({
  // The target URL. Bounded length here is a coarse first-line defense; the
  // real SSRF guard lives in lib/safe-url.ts.
  url: z.string().min(1).max(2048),

  // Output format
  format: z.enum(['png', 'jpeg', 'webp', 'pdf']).optional().default('png'),
  quality: z.number().int().min(1).max(100).optional(),

  // Capture mode
  full_page: z.boolean().optional().default(false),
  selector: z.string().max(500).optional(),
  clip: z
    .object({
      x: z.number().min(0).max(10000),
      y: z.number().min(0).max(10000),
      width: z.number().min(1).max(10000),
      height: z.number().min(1).max(10000),
    })
    .optional(),

  // Viewport
  width: z.number().int().min(100).max(3840).optional().default(1280),
  height: z.number().int().min(100).max(2160).optional().default(800),
  device_scale_factor: z.number().min(1).max(3).optional().default(1),

  // Wait conditions
  wait_until: z.enum(['load', 'domcontentloaded', 'networkidle', 'commit']).optional(),
  wait_for_selector: z.string().max(500).optional(),
  delay_ms: z.number().int().min(0).max(30_000).optional(),

  // Behavior toggles
  remove_popups: z.boolean().optional(),
  block_ads: z.boolean().optional(),
  block_cookies_banners: z.boolean().optional(),
  dark_mode: z.boolean().optional(),
  reduced_motion: z.boolean().optional(),

  // Caching
  cache_ttl: z.number().int().min(0).max(86_400 * 7).optional(),

  // Customization (bounded to prevent abuse)
  user_agent: z.string().max(500).optional(),
  accept_language: z.string().max(100).optional(),
  custom_js: z.string().max(10_000).optional(),
  custom_css: z.string().max(10_000).optional(),
  custom_headers: z.record(z.string().max(100), z.string().max(1000)).optional(),
})

export type ScreenshotRequest = z.infer<typeof ScreenshotRequestSchema>

/**
 * Extract endpoint — combines a screenshot capture with structured-data
 * extraction via an LLM. Either `schema` (JSON-schema shape) or `prompt`
 * (free-form instruction) is required; bounded to keep the LLM cost predictable.
 */
export const ExtractRequestSchema = ScreenshotRequestSchema.extend({
  schema: z.record(z.string(), z.any()).optional(),
  prompt: z.string().min(1).max(4000).optional(),
  model: z.enum(['fast', 'balanced', 'precise']).optional().default('balanced'),
}).refine((d) => d.schema !== undefined || d.prompt !== undefined, {
  message: 'Provide either `schema` or `prompt`',
  path: ['schema'],
})

export type ExtractRequest = z.infer<typeof ExtractRequestSchema>

/**
 * Helper: turn a Zod parse error into a stable JSON response shape.
 */
export function zodErrorResponse(error: z.ZodError, status = 400): Response {
  return Response.json(
    {
      error: 'Invalid request',
      issues: error.flatten().fieldErrors,
    },
    { status }
  )
}
