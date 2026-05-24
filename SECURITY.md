# Security Policy

## Reporting a vulnerability

If you discover a security issue in Shotbase, please report it privately.
**Do not open a public GitHub issue.**

- **Email:** security@shotbase.dev
- **Disclosure window:** we acknowledge reports within 48 hours and aim to ship
  a fix or detailed mitigation plan within 14 days.

We are a small team and we read every report. Thank you for taking the time to
make Shotbase safer for everyone.

## Scope

In scope:

- `shotbase.dev` and `*.shotbase.dev`
- The Shotbase API (REST endpoints under `/api/*`)
- Official SDKs published under `@shotbase/*` on npm and pypi
- Vulnerabilities in dependencies that are exploitable through Shotbase

Out of scope:

- Volumetric attacks or spam against rate-limited endpoints
- Issues requiring physical access, lost devices, or social engineering of staff
- Reports automated scanners generate without manual verification
- Browser bugs in non-evergreen / unsupported versions

## We especially want to know about

- **SSRF** — server-side request forgery via the screenshot / extract / render endpoints
- Authentication or authorization bypasses (Clerk / API key / OAuth)
- Account takeover paths (session fixation, password reset, MFA bypass)
- Leakage of API keys, tokens, webhook signing secrets, or customer data
- Webhook forgery or replay (Stripe, Clerk)
- Injection (SQL, command, header, template, prompt-injection through `/extract`)
- XSS, CSRF, clickjacking, open redirects with security impact
- Race conditions on quota / billing endpoints
- Information disclosure (PII, internal IDs, stack traces, env-var names)

## Safe harbor

We will not pursue legal action against researchers who:

- Make a good-faith effort to avoid privacy violations, data destruction, and
  service disruption (no automated scans without rate limiting; no
  brute-forcing accounts; no exfiltration beyond what proves the issue)
- Report findings privately and give us reasonable time to fix before
  publishing details
- Do not access data that does not belong to them

## Recognition

After issues are remediated we list reporters in our security acknowledgements
page, unless they prefer to remain anonymous.

## How we operate

- **Encryption:** TLS 1.3 in transit, AES-256 at rest (via Supabase / Vercel
  managed storage)
- **Access logging:** every API call appended to a tamper-evident audit log,
  retained 90 days by default (configurable per-org)
- **Secrets:** stored in Vercel Environment Variables, never in source. Our
  CI runs gitleaks on every PR.
- **Dependencies:** Dependabot opens PRs weekly for vulnerable packages; we
  evaluate and merge within one week for High / Critical advisories.
- **Webhooks:** signature-verified and timestamp-bounded against replay.
- **Renderer SSRF:** target URLs are validated at the API gateway against
  private IP ranges, internal hostnames, cloud-metadata endpoints, and
  non-http(s) schemes before reaching the renderer.

## Compliance roadmap

See [Trust Center](https://shotbase.dev/trust) for the current state of
SOC 2, HIPAA, ISO 27001, and GDPR posture.
