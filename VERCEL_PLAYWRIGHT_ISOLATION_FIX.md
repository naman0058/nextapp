# Vercel Playwright isolation fix

Date: **2026-10-16**

## 1. Import chain that caused the crash

Shared Next.js server bundle evaluated website scanner API modules on cold start (same lambda serves `GET /`, favicon, etc.):

```text
scan-page/route.ts | visualize-issue/route.ts
  → getWebsiteScannerRuntime.ts [static import LocalPlaywrightScanner]
    → localPlaywrightScanner.ts
      → browserPool.ts → import { chromium } from "playwright"
      → pageScan.ts → @axe-core/playwright

discover-crawl/route.ts
  → discoverCrawlUrls.ts [static import]
    → browserPool.ts → playwright
```

Homepage [`src/app/layout.tsx`](src/app/layout.tsx) / [`src/app/page.tsx`](src/app/page.tsx) do **not** import Playwright directly.

## 2. Root cause

Static imports pulled the local Playwright subgraph into the server bundle at module init. With `serverExternalPackages`, Node still resolves `playwright` at load time → `ERR_MODULE_NOT_FOUND` on Vercel when Playwright is not installed for the frontend.

Default `SCANNER_RUNTIME` is **local** when unset; availability previously returned **available** for local mode on Vercel.

## 3. Files changed

| File | Change |
|------|--------|
| [`getWebsiteScannerRuntime.ts`](src/features/website-scanner/server/runtime/getWebsiteScannerRuntime.ts) | Async runtime; dynamic `import()` of local scanner only when local mode allowed |
| [`scannerPlatform.ts`](src/features/website-scanner/server/config/scannerPlatform.ts) | **New** — `isLocalPlaywrightSupportedOnPlatform()` (blocks local on `VERCEL=1`) |
| [`websiteScannerAvailability.ts`](src/features/website-scanner/server/config/websiteScannerAvailability.ts) | Unavailable when local not supported on platform |
| [`scan-page/route.ts`](src/app/api/accessibility/website/scan-page/route.ts) | `await getWebsiteScannerRuntime()` |
| [`visualize-issue/route.ts`](src/app/api/accessibility/website/visualize-issue/route.ts) | Same |
| [`discover-crawl/route.ts`](src/app/api/accessibility/website/discover-crawl/route.ts) | Dynamic import of `discoverCrawlUrls` inside `POST` |
| [`scannerRuntimeImportGate.test.ts`](src/features/website-scanner/__tests__/scannerRuntimeImportGate.test.ts) | Regression tests |

## 4. Playwright in `package.json`

**Remains** in root dependencies for **local development** and local scanner paths. Production Vercel frontend must **not** rely on it resolving at startup. Remote scanning uses [`RemoteScannerClient`](src/features/website-scanner/server/runtime/remoteScannerClient.ts) + [`services/scanner`](services/scanner) worker.

## 5–7. Runtime behavior

| Mode | Behavior |
|------|----------|
| **remote** (configured URL + token) | Remote client only; no Playwright import |
| **local** (dev, non-Vercel) | Dynamic import local scanner on first scan |
| **local on Vercel** | `SCANNER_UNAVAILABLE` — no Playwright import, no fallback to remote |
| **Playwright missing** (local host) | Controlled `SCANNER_UNAVAILABLE` after failed dynamic import |

No **remote fails → local Playwright** fallback.

## 8–10. Route expectations after deploy

| Route | Expected |
|-------|----------|
| `/`, `/favicon.ico`, `/icon`, `/robots.txt`, `/sitemap.xml` | Serve without loading Playwright |
| Scan APIs (misconfigured) | 503 `SCANNER_UNAVAILABLE` |
| Website scanner UI | Gated / unavailable messaging; **Layer-2 unchanged** |

## 11. Layer-2 status

**NOT DEPLOYED / NOT VERIFIED.** This fix does **not** satisfy Layer-2. Public website scanner remains **BLOCKED FOR PUBLIC PRODUCTION** per [`WEBSITE_SCANNER_SECURITY.md`](WEBSITE_SCANNER_SECURITY.md).

## 12. Verification (2026-10-16)

| Command | Result |
|---------|--------|
| `scannerRuntimeImportGate.test.ts` | PASS (6) |
| `npm run test:security` | PASS (85 passed, 7 skipped) |
| `npm run test:ai-remediation` | PASS (84) |
| `npm run test:seo` | PASS (5) |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |

## 13. Vercel redeployment steps

1. Deploy this commit.
2. Set `SCANNER_RUNTIME=remote` when worker is ready, plus `SCANNER_SERVICE_URL` and `SCANNER_SERVICE_TOKEN`.
3. Do **not** set `SCANNER_RUNTIME=local` on Vercel.
4. Leave `WEBSITE_SCANNER_PUBLIC_ENABLED` off until Layer-2 + launch checklist.
5. Confirm logs: no `ERR_MODULE_NOT_FOUND` for `playwright` on `GET /`.
6. Optional: smoke-test one authenticated scan against staging worker.
