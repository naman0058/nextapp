# Final product audit (Strengthening S4)

Audit date: **2026-10-15**  
Repository commit at audit start: `0d8711c` (working tree includes S3 + S4 doc/fix deltas)  
Scope: Whole product Phases 1–9, S1–S3 — **no new product phase**

## Inventory (§1)

Areas read: README, PROJECT_STATUS, PRODUCTION_AUDIT, WEBSITE_SCANNER_SECURITY, ACCURACY/RESULT UX methodology, ADSENSE, LAUNCH_CHECKLIST, PLATFORM_GUIDANCE, AXE_RULE_COVERAGE, package.json, .env.example, next.config.ts, API routes (19), website scanner server modules, test suites (52+ files), public sitemap routes.

## Executive summary (§297)

| Dimension | Status |
|-----------|--------|
| **Overall product** | **READY WITH CONDITIONS** — deploy with production env (domain, HTTPS, optional OpenAI/Blob) |
| **Website scanner (public)** | **NOT READY FOR PUBLIC PRODUCTION** — Layer-2 network egress **not deployed** (operator confirmed) |
| **Security (Layer 1)** | **PASSED** — automated SSRF/worker-auth tests (when integration env enabled) |
| **Accuracy (S1 benchmark)** | **PASSED** — known pass/fail fixtures in CI suite |
| **Accessibility of product UI** | **READY WITH CONDITIONS** — formal keyboard/SR audit **Not verified** this session |
| **Performance** | **Not verified** — 25-page timing test not run (fixture gap) |
| **Privacy** | **PASSED** — DATA_PROCESSING_MATRIX + privacy page aligned |
| **AI cost control** | **PASSED** — OPENAI_COST_MAP; user-triggered routes only |
| **SEO** | **READY WITH CONDITIONS** — set `NEXT_PUBLIC_SITE_URL` |
| **AdSense** | **Prepared, not integrated** |

**Final statement (Option B):** Core accessibility tools are ready for **controlled public launch**; **Website Accessibility Scanner** remains **launch-gated** until Layer-2 egress is deployed and verified.

---

## Findings register

| Sev | Area | Problem | User impact | Technical impact | Fix | Verification | Status |
|-----|------|---------|-------------|------------------|-----|--------------|--------|
| **BLOCKER** | Website scanner launch | Layer-2 egress not deployed | Public scanner could reach internal networks if mis-deployed | SSRF defense incomplete without network deny | Deploy [`network-policy.example.yaml`](services/scanner/deploy/network-policy.example.yaml) or equivalent; document evidence | Operator checklist + penetration retest | **OPEN** |
| CRITICAL | — | None identified in code audit | — | — | — | — | **PASSED** |
| HIGH | Docs | SCANNER_CAPABILITY_MATRIX stale (10-page) | Misleading internal planning | Wrong caps | Supersede → PRODUCT_CAPABILITY_MATRIX | Doc review | **FIXED** |
| HIGH | Scanner UX | Remote scanner misconfig threw deep in request | Confusing errors | 500-class failures | Early `getWebsiteScannerAvailability()` on website APIs | Code review | **FIXED** |
| MEDIUM | Rate limits | In-memory limiter not durable on serverless | Abuse on multi-instance | Uneven throttling | Documented; weighted costs in S3 | WEBSITE_SCANNER_SECURITY | **ACCEPTED** |
| MEDIUM | Batch UI | "Readiness score /100" | Could imply compliance | Terminology drift | Label as local heuristic (existing); methodology clarifies | Legal grep | **PASSED** |
| MEDIUM | npm ci | EPERM during S4 gate run | CI parity on dev machine | Broken node_modules if dev server locks files | Stop dev server before `npm ci`; use install | FINAL_TEST_MATRIX | **Not verified** |
| LOW | CSP | No strict CSP header | XSS defense in depth | Relies on React defaults | Document future AdSense CSP needs | next.config | **ACCEPTED** |
| PASSED | Legal claims | No "WCAG compliant" product claims | Trust | — | grep clean | Repo search | **PASSED** |
| PASSED | XSS | No dangerouslySetInnerHTML | — | — | — | grep | **PASSED** |
| PASSED | OpenAI | Server-only keys | — | — | — | API review | **PASSED** |
| PASSED | Exports | Spreadsheet sanitization | CSV injection | — | sanitize helpers | Tests | **PASSED** |

---

## Public route inventory (§226)

| Route | Purpose | Index | Primary CTA |
|-------|---------|-------|-------------|
| `/` | Home | Yes | Choose tool |
| `/tools` | Tool hub | Yes | Open tool |
| `/social-media-accessibility-checker` | Flagship social | Yes | Run preflight |
| Platform `/*-accessibility-checker` | Platform copy | Yes | Run preflight |
| `/image-contrast-checker` | Contrast | Yes | Measure |
| `/screen-reader-preview` | SR preview | Yes | Preview |
| `/video-accessibility-checker` | Video | Yes | Upload |
| `/batch-accessibility-checker` | Batch | Yes | Import CSV |
| `/website-accessibility-scanner` | Website | Yes | Scan (gated prod) |
| `/accessibility-preflight-report` | Report info | Yes | Learn |
| `/methodology` | Trust | Yes | Read |
| Legal `/privacy` … | Trust | Yes | — |
| `/api/*` | APIs | Noindex (not in sitemap) | — |

---

## Product area launch classification (§210)

| Area | Status |
|------|--------|
| Social checker | READY WITH CONDITIONS |
| Image AI | READY WITH CONDITIONS (OpenAI) |
| Contrast | READY |
| Screen reader preview | READY |
| Platform guidance | READY |
| Video | READY WITH CONDITIONS (Blob + OpenAI) |
| Reports | READY |
| Batch | READY WITH CONDITIONS |
| Website scanner | **NOT READY FOR PUBLIC PRODUCTION** (Layer 2) |

---

## Layer-2 evidence template (§70)

Operator must attach: deployment name, date, egress rule summary, proof that RFC1918/metadata/loopback blocked from scanner worker pod/network. Until attached, website scanner checkbox in LAUNCH_CHECKLIST remains unchecked.

## Performance & worker smoke (§53–55, §238–241)

| Test | Result |
|------|--------|
| 25-page controlled scan timing | **Not verified** — no dedicated 25-page fixture server in repo |
| Dual viewport max (10 pages) | **Not verified** manual |
| Scanner Docker build/auth | **Not verified** this session — operator runs `services/scanner/docker-compose.yml` before public scanner |
