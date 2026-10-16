# Scanner security gate (public enablement)

**WEBSITE SCANNER PUBLIC ENABLEMENT: BLOCKED**

Do not set `WEBSITE_SCANNER_PUBLIC_ENABLED=1` until every gate below is satisfied and recorded.

## Network isolation status (Layer 2)

| Status | Value |
|--------|--------|
| Hostinger egress isolation | **LIVE VERIFIED** (operator) |
| Persistence after Docker restart | **DOCKER-RESTART PERSISTENT** |
| Persistence after full VPS reboot | **FULL VPS REBOOT VERIFICATION PENDING** |

Layer 1 application controls alone are **not** sufficient for public production. See [`WEBSITE_SCANNER_SECURITY.md`](WEBSITE_SCANNER_SECURITY.md).

## Ten-step public enablement gate

| # | Gate | Evidence / test |
|---|------|-----------------|
| 1 | Remote worker deployed on isolated network (`dar-scanner-net`) | [`SCANNER_WORKER_DEPLOYMENT.md`](SCANNER_WORKER_DEPLOYMENT.md); `curl 127.0.0.1:8787/health` |
| 2 | Host publish loopback only (`127.0.0.1:8787`) | `scanner-worker/docker-compose.yml` |
| 3 | Egress deny verified (private, metadata, docker bridges) | `scanner-worker/scripts/verify-egress.sh` |
| 4 | Worker Bearer auth (`401` without token) | `services/scanner/__tests__/server.test.ts`; `ssrf.worker-auth.test.ts` (integration) |
| 5 | Vercel `SCANNER_RUNTIME=remote` — no silent local fallback on Vercel | `scannerRuntimeImportGate.test.ts` |
| 6 | SSRF URL validation + DNS private rejection | `ssrf.test.ts`, `ssrf.dns.test.ts` |
| 7 | Redirect / subresource private blocking (integration) | `npm run test:security` with `WEBSITE_SCANNER_INTEGRATION=1` |
| 8 | `WEBSITE_SCANNER_TEST_ALLOW_LOOPBACK` unset in production | `testBypass.ts` startup guard |
| 9 | Rate limits + concurrency verified | `SCANNER_MAX_CONCURRENT`; Vercel rate limit tests |
| 10 | Privacy copy + launch checklist sign-off | [`LAUNCH_CHECKLIST.md`](LAUNCH_CHECKLIST.md) website scanner section |

## Checklist mapping (audit items 1–21)

Many items overlap existing SSRF and worker tests:

| Topic | Primary coverage |
|-------|------------------|
| Invalid URL / scheme | `ssrf.test.ts` |
| Hostname blocklist | `ssrf.test.ts` |
| Private IP literals | `ssrf.test.ts` |
| DNS all-address check | `ssrf.dns.test.ts` |
| Worker auth boundary | `server.test.ts`, `ssrf.worker-auth.test.ts` |
| No client token exposure | Code review; no `NEXT_PUBLIC_SCANNER_*` |
| Visual locator HMAC | `visualLocator.token.test.ts` |
| Crawl on remote worker | `discoverCrawlRemote.test.ts`, worker `POST /v1/discover-crawl`, `server.test.ts` |

## Remote scanner architecture

**REMOTE SCANNER ARCHITECTURE: PASS** — Production remote mode (`SCANNER_RUNTIME=remote` on Vercel) performs zero Playwright/Chromium execution in the Next.js app for scan, visual locator, or crawl discovery. Sitemap XML parsing is HTTP-only (no browser) and remains on Vercel by design.

## Honest limitations

1. **Full VPS reboot** firewall persistence: operator must verify and update the status table above.
2. **Public marketing CTA** stays off until all gates pass and Layer-2 reboot verification is complete.
3. **WEBSITE_SCANNER_PUBLIC_ENABLED** remains unset until operator sign-off — architecture pass does not imply public launch.

## When unblocking

1. Complete pending VPS reboot verification.
2. Run full verification matrix in [`SCANNER_WORKER_DEPLOYMENT.md`](SCANNER_WORKER_DEPLOYMENT.md).
3. Set Vercel remote env vars (token, URL).
4. Only then consider `WEBSITE_SCANNER_PUBLIC_ENABLED=1` with executive sign-off.
