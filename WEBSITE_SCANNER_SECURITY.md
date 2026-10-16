# Website scanner security

Phase 9 runs **server-side Playwright** against user-supplied URLs. Controls are split into **Layer 1 (application)** and **Layer 2 (infrastructure)**. Both are required for production; Layer 1 alone is not sufficient.

## Threat model

- **SSRF:** URLs pointing to internal services, cloud metadata, or localhost.
- **Subresource SSRF:** Scanned pages loading assets or `fetch` to private addresses.
- **Resource exhaustion:** Large DOMs, many network requests, crawl abuse.
- **Abuse:** Unauthorized third-party scanning or using the tool as a load generator.

## Layer 1 — Application protections

- **URL validation:** http/https only, standard ports (80/443; ephemeral loopback ports only in test), no embedded credentials.
- **Hostname blocklist:** localhost variants, `.local`, `.internal`, metadata hostnames, common loopback literals.
- **IP checks:** Private/reserved IPv4/IPv6 (including IPv4-mapped and decimal/hex literals) before and after DNS.
- **DNS resolution:** `dns.lookup({ all: true })`; reject if **any** address is private/reserved.
- **Redirect revalidation:** Document redirect `Location` headers and final URL validated after navigation.
- **Playwright subresource interception:** Abort requests failing the same checks (when not on test loopback fixtures).
- **Port/protocol:** Non-http(s) schemes blocked.
- **Browser isolation:** Fresh context per page; no auth cookies; dialogs dismissed; downloads blocked; no form submit or link clicking.
- **Limits:** Timeouts, DOM cap, network request cap, crawl depth/page cap (up to 25 selected pages), dual-viewport compare cap (10 pages), global concurrency, **weighted** in-memory rate limits (higher cost for multi-page scans, compare mode, sitemap discovery, and crawl discovery).
- **Sitemap (S3):** Same URL validation and redirect re-checks as page scans; byte caps; XXE-safe XML parsing (no external entities); sitemap index depth/file caps; same-origin `<loc>` only; `.gz` sitemaps rejected until safe decompression is implemented. APIs: `POST /api/accessibility/website/discover-sitemap`, `discover-crawl`, `register-batch` (batch URL registry with TTL; scan-page rejects unregistered batch URLs).
- **Worker auth boundary:** Browser UI calls **Next.js API only** (`POST /api/accessibility/website/scan-page`, visual locator `POST …/visual-locator-token` and `POST …/visualize-issue`). The scanner worker `POST /v1/scan-page` and `POST /v1/visualize-accessibility-issue` require `Authorization: Bearer <SCANNER_SERVICE_TOKEN>`. The token is **never** exposed to the client (`NEXT_PUBLIC_*` must not be used for scanner secrets). The remote worker is not CORS-open to browsers.
- **Visual Issue Locator:** On-demand only (no scan-time screenshots). Short-lived HMAC tokens (`VISUAL_LOCATOR_SIGNING_SECRET`, fail-closed in production if unset). Token mint validates session evidence; visualize re-runs SSRF URL validation before Playwright. Responses are viewport WebP/PNG with `Cache-Control: no-store`; no DB persistence; dedicated rate limits. Worker returns binary image body (not base64-in-JSON).
- **Test bypass rules:** `WEBSITE_SCANNER_TEST_ALLOW_LOOPBACK=1` only in non-production tests. **Production must not set it** — startup guards throw if `NODE_ENV=production` and the flag is enabled.

Implementation: [`src/features/website-scanner/server/security/`](src/features/website-scanner/server/security/), [`networkGuard.ts`](src/features/website-scanner/server/playwright/networkGuard.ts), [`redirectGuard.ts`](src/features/website-scanner/server/playwright/redirectGuard.ts).

## Layer 2 — Infrastructure protections

Required for production readiness:

- **Egress deny:** RFC1918, CGNAT, loopback, link-local, cloud metadata (e.g. `169.254.169.254`), internal cluster CIDRs.
- **Scanner isolation:** Dedicated worker pool/network; prefer private connectivity from Next.js to scanner.
- **Chromium sandbox:** Run worker with container sandbox and resource limits (see docker-compose).
- **CPU/memory/concurrency:** Cap worker replicas and per-pod resources.
- **DNS rebinding:** Application checks reduce risk but **cannot eliminate** rebinding; network egress must block private destinations even when DNS returns public IPs first.

Artifacts and guidance:

- [services/scanner/deploy/network-policy.example.yaml](services/scanner/deploy/network-policy.example.yaml)
- [services/scanner/deploy/README.md](services/scanner/deploy/README.md)
- [services/scanner/docker-compose.yml](services/scanner/docker-compose.yml)

## Secrets and logging

- `SCANNER_SERVICE_TOKEN` and `VISUAL_LOCATOR_SIGNING_SECRET` are server-only.
- Scanner worker should not receive unrelated secrets (e.g. `OPENAI_API_KEY`).
- Log scan id, hostname, duration, counts; strip query strings and fragments from operational logs.

## Security CI

`npm run test:security` runs website-scanner unit and integration tests (integration requires `WEBSITE_SCANNER_INTEGRATION=1` and loopback test flag). GitHub Actions workflow: `.github/workflows/website-scanner-security.yml`.
