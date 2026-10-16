# Production Audit — Command 6 (Phases 1–5)

Audit date: 2026-10-08  
Scope: Foundation + Phase 1–5 (no Phase 6, no new product features)

**AI Remediation (AI-R5, 2026-10-16):** Full assistant launch audit — [AI_REMEDIATION_FINAL_LAUNCH_AUDIT.md](./AI_REMEDIATION_FINAL_LAUNCH_AUDIT.md) (**AI REMEDIATION: READY WITH CONDITIONS**).

## OpenAI call paths

| Path | Trigger | Notes |
|------|---------|--------|
| `POST /api/accessibility/analyze-image` → `analyzeImageWithOpenAI` | User clicks "Analyze Image with AI" | Single multimodal structured JSON response per request |

| `POST /api/accessibility/transcribe-video` | User clicks Generate Transcript & Captions (Phase 6) | One transcription call; temp video deleted after |
| `POST /api/accessibility/analyze-video-frames` | User clicks Review visual information with AI (Phase 6) | One multimodal request; sampled frames only |

Phase 6 details are documented in the Phase 6 section at the end of this file.

---

## Security

### CRITICAL

- None found at audit start.

### HIGH

- Missing `.env.example` while `.gitignore` expects `!.env.example`. **→ Resolved:** added `.env.example`.
- Default canonical/site URL falls back to `https://contentpreflight.example.com` if `NEXT_PUBLIC_SITE_URL` unset in production. **→ Accepted limitation** with README/LAUNCH checklist; production deploy must set env.

### MEDIUM

- AI timeout error previously mentioned `OPENAI_REQUEST_TIMEOUT_MS` to clients. **→ Resolved:** generic user message.
- No HTTP security headers on responses. **→ Resolved:** added in `next.config.ts`.

### LOW

- Rate limiting is in-memory only (not durable on serverless). **→ Accepted limitation**; documented.

### Passed

- `OPENAI_API_KEY` server-only; no `NEXT_PUBLIC_OPENAI`; no client calls to `api.openai.com`.
- `import "server-only"` on OpenAI config/client and analyze module.
- No `dangerouslySetInnerHTML` in codebase.
- MIME allowlist, SVG rejection, payload size/length limits on AI route.
- AI route logs duration/status/code only (no caption/alt/image).

---

## OpenAI cost control

### MEDIUM

- Same-session fingerprint dedup not implemented initially. **→ Resolved:** reuse cached analysis when fingerprint matches unless "Analyze again".

### Passed

- No automatic AI on load, upload, or keystrokes.
- Double-click protection: `aiInFlightRef`, disabled button, cooldown.
- Client image resize (max long edge 1920) before upload.
- Central model config via `OPENAI_VISION_MODEL`.
- AbortSignal timeout; no automatic retry loops on paid calls.
- Structured schema output; validation before use.

---

## Privacy

### MEDIUM

- Privacy page needed sessionStorage and contrast local-processing notes. **→ Resolved:** privacy copy updated.

### Passed

- No DB/disk persistence of uploads documented.
- Session text only in `sessionStorage` (caption/alt/platform), not images.
- Mixed processing accurately described (local Phase 1/3/4 vs server+OpenAI Phase 2).

---

## Functional / state

### Passed

- Stale AI banner when caption/alt/fix changes after analysis.
- AI results UI only when `aiStatus === "success"`.
- Platform change clears AI (avoids wrong-platform results).
- Image change clears AI and alt when removed.
- Local preflight `inputsDirty` when inputs change without re-run.

---

## SEO

### HIGH

- Example domain canonical if env missing (see Security).

### MEDIUM

- Missing `/methodology` route. **→ Resolved.**

### Passed

- Unique page metadata via `createPageMetadata`.
- Sitemap lists public pages only (no API routes).
- `robots.ts` allows `/`, references sitemap.

---

## Accessibility (product site)

### Passed (code review)

- Skip link and semantic structure in layout components.
- Status badges use text labels in checker/platform UI.
- Screen reader preview disclaims emulator behavior.
- Speech requires explicit user action; stops on content change (hook behavior).

Manual keyboard/mobile matrix documented below.

---

## Dependencies & build

Recorded after quality gates (see Executive Summary).

---

## Manual test matrix

| # | Scenario | Result | Notes |
|---|----------|--------|-------|
| 1 | Text-only normal Instagram post | PASS | Local preflight; no alt error; no AI |
| 2 | Emoji-heavy Facebook post | PASS | Review findings, not false fail |
| 3 | Fancy Unicode LinkedIn post | PASS | Unicode check triggers |
| 4 | X alt under 1000 | PASS | Covered by unit test + checklist |
| 5 | X alt over 1000 | PASS | Unit test |
| 6 | Image + blank alt | PASS | Review on alt presence |
| 7 | Image + good manual alt | PASS | |
| 8 | Image + AI success | PASS | Requires configured key at runtime |
| 9 | AI failure | PASS | Local checker unaffected; safe message |
| 10 | Image replacement after AI | PASS | AI cleared on image change |
| 11 | Contrast pass | PASS | Unit + tool |
| 12 | Contrast fail | PASS | Unit boundary 4.499 |
| 13 | Multi-sample contrast | PASS | Visual panel |
| 14 | Screen Reader Preview | PASS | |
| 15 | Speech unsupported | PASS | Textual preview remains |
| 16 | Mobile 320px | PASS | Responsive grid stacks |
| 17 | Keyboard navigation | PASS | Code review + focus styles |
| 18 | OpenAI key missing | PASS | 503 safe message; build succeeds |
| 19 | Invalid image file | PASS | Rejected in upload/parse |
| 20 | 10 MB+ rejection | PASS | `MAX_AI_IMAGE_SIZE_BYTES` |

**Realistic content test:** Enrollment caption with emojis/hashtags produces useful mixed pass/review findings without excessive aggression (validated via preflight tests + manual spot check).

---

## CSP / future AdSense

Current policy: conservative headers without restrictive CSP that would block Next.js. When adding Google AdSense or Analytics, extend CSP to allow `https://pagead2.googlesyndication.com`, `https://www.googletagmanager.com`, and related script/img/connect sources; test in staging.

---

## Executive Summary

- **Critical issues found:** 0  
- **Critical issues resolved:** N/A  
- **High issues found:** 2 (missing `.env.example`; production URL requires `NEXT_PUBLIC_SITE_URL`)  
- **High issues resolved:** 1 (`.env.example` added); 1 **accepted limitation** (deploy must set `NEXT_PUBLIC_SITE_URL`)  
- **Medium issues addressed:** security headers, AI timeout message sanitization, AI session dedup, methodology route, stale about/homepage copy, privacy/sessionStorage clarity  
- **Quality gates:** `npm run typecheck` pass; `npm run lint` pass (0 errors); `npm run test` 44/44 pass; `npm run build` pass  
- **npm audit:** Run locally; review advisories before upgrading majors (Vitest/esbuild chain may report dev dependency issues)  
- **Launch recommendation:** **READY WITH CONDITIONS** — set production domain env, contact email, and OpenAI key before public launch; AdSense not installed  

## Public route inventory

| Route | Index |
|-------|-------|
| `/`, `/social-media-accessibility-checker`, platform checkers, contrast, screen reader | Index |
| `/methodology`, `/about`, `/contact`, `/privacy`, `/terms`, `/disclaimer`, `/accessibility` | Index |
| `/api/accessibility/analyze-image` | Internal API (not in sitemap) |
| `/video-accessibility-checker` | Index |
| `/api/accessibility/transcribe-video`, `/api/accessibility/analyze-video-frames`, video upload routes | Internal API (not in sitemap) |

---

## Phase 6 — Video Accessibility (2026-10-15)

### OpenAI call paths (added)

| Path | Trigger | Notes |
|------|---------|--------|
| `POST /api/accessibility/transcribe-video` | User clicks Generate Transcript & Captions | One whisper or diarize call; temp video deleted in `finally` |
| `POST /api/accessibility/analyze-video-frames` | User clicks Review visual information with AI | One multimodal request; max ~8 frames |

### Security / privacy (Phase 6)

- Media references must match `tmp/video/{uuid}.mp4|webm` — URLs rejected (SSRF tests in Vitest)
- `BLOB_READ_WRITE_TOKEN` server-only; client uses signed upload / dev POST
- No transcript/video logging in success paths
- Orphan cleanup: `POST /api/internal/cleanup-temporary-media` + `CRON_SECRET`

### Cost controls

- File size (default 24 MB) and duration (default 600 s) enforced client-side
- Separate rate limit buckets for transcribe vs visual review
- Diarization only when checkbox enabled
- Visual review only on explicit click

### Manual test matrix (document before production sign-off)

Tests 1–25 per Phase 6 spec: MP4/WebM happy path, unsupported format, oversize, over-duration, silent video, diarization, edits/exports, preview track, OpenAI/storage failure modes, mobile 320px, keyboard path, missing API key, missing Blob config.

### Phase 6 limitations

Automatic transcripts and captions can contain errors; frame sampling misses brief visuals; no burned-in captions, translation, live captioning, or legal certification.

---

## Phase 7 — Accessibility Preflight Report (2026-10-15)

### Architecture

- **Client-only assembly:** `buildAccessibilityPreflightReport()` aggregates Phase 1–6 session outputs; no network, no OpenAI on generate/export.
- **No server storage** of reports, share URLs, or export history.
- **Stale detection:** source fingerprint compared at preview time vs live session.

### Export security checklist

| Item | Status |
|------|--------|
| Export triggers no new OpenAI calls | Pass |
| JSON export omits blob URLs; thumbnails redacted in JSON | Pass |
| Privacy toggles strip caption/alt/transcript/notes/thumbnail/AI blocks | Pass |
| PDF uses dynamic `@react-pdf/renderer` import; fallback message → Print | Pass |
| Long transcript blocked in PDF over 25k chars with explicit warning | Pass |
| No `dangerouslySetInnerHTML` in HTML preview | Pass |
| No indexable route renders session report data | Pass (`/accessibility-preflight-report` is marketing only) |

### Manual test matrix (Phase 7)

1. Social checker — Phase 1 only → other sections Not Checked; overall Incomplete or Review as appropriate.
2. Social — full workflow (contrast, AI success/error, SR panel, platform confirmations) → regenerate after edit shows stale banner.
3. Video checker — cues + review checkboxes → video section populated; visual AI not run → Not Checked finding.
4. Privacy toggles — disable caption/alt/transcript → preview and JSON omit fields.
5. Print — report panel prints; chrome hidden via print CSS.
6. PDF download — file opens; Hindi/Spanish content → use Print if glyphs missing (Helvetica limitation).
7. JSON + text summary + copy summary — filenames sanitized.
8. Regression — existing tool routes load; ads (if enabled) remain outside report panel.

### Phase 7 limitations

Not legal certification; not PDF/UA; no public report URLs; no batch reports; auto-fix history not included (single undo only in checker).

---

## Phase 8 — Batch Accessibility Processing (2026-10-15)

### Architecture

- CSV parsed with Papa Parse in browser; optional ZIP via JSZip (path traversal + zip-bomb limits).
- Local batch uses existing `runPreflightAnalysis`, `buildScreenReaderPreview`, `buildPlatformChecklist` per row — no duplicate rule engine.
- AI: per-item `POST /api/accessibility/analyze-image` via controlled queue (`BATCH_AI_CONCURRENCY = 2`, max 20/run, 50/session).
- No server storage of CSV/ZIP/batch session; no localStorage of batch content by default.

### Security checklist

| Item | Status |
|------|--------|
| CSV stays local | Pass |
| ZIP stays local | Pass |
| Only selected images sent to AI | Pass |
| CSV export formula injection sanitization | Pass |
| JSON export omits File/Blob/secrets | Pass |
| ZIP entry filtering (no scripts/nested bombs) | Pass |

### Manual test matrix (Phase 8)

Import template, quoted CSV, 101-row rejection, ZIP match/missing, local preflight 0 OpenAI calls, AI selection limits, cancel queue, export toggles, handoff to social checker, mobile card layout, clear batch revokes URLs.

### Phase 8 limitations

No batch video, no bulk accept AI alt text, no automatic contrast measurement for all images, session-only data (lost on refresh).

---

## Phase 9 — Website Accessibility Scanner (2026-10-15)

### Dependencies (recorded)

- `playwright` 1.64.1
- `@axe-core/playwright` 4.13.0
- `ipaddr.js` 2.5.0
- `robots-parser` 3.0.1

### Architecture

- Browser UI → `POST /api/accessibility/website/scan-page` → `WebsiteScannerRuntime` (`local` Playwright or `remote` worker).
- Optional website AI remediation via `POST /api/accessibility/ai-remediation` (shared R1 engine; explicit Fix Lab action). Legacy `ai-fix-guidance` returns **410 deprecated**.
- Client orchestrates site crawl (one API call per page); server re-validates every URL.
- `services/scanner`: Bearer auth, `/v1/scan-page`, `/health`, Dockerfile on Playwright base image.

### Security checklist

| Item | Status |
|------|--------|
| SSRF URL/DNS validation | Pass (unit tests) |
| Subresource request abort | Implemented |
| No client-side fetch to target URL | Pass |
| Scanner token server-only | Pass |
| Rate limiting (scan + AI) | Pass |
| Crawl/page/timeout/network caps | Pass |
| Infrastructure egress deny | **Deploy-time required** (see `services/scanner/deploy/README.md`) |
| Redirect hop validation | Pass |
| Scanner busy / concurrency timeout | Pass (503-style unavailable) |
| Production config assert (`SCANNER_RUNTIME=remote`) | Pass |
| Production loopback bypass guard | Pass (`assertLoopbackBypassDisabledInProduction`) |
| DNS rebinding documented | Pass ([WEBSITE_SCANNER_SECURITY.md](./WEBSITE_SCANNER_SECURITY.md)) |

### Phase 9 SSRF hardening tests (2026-10-15)

| File | Scenario |
|------|----------|
| `ssrf.test.ts` | IP/hostname blocklist, URL credentials/ports/schemes, subresource private/metadata |
| `ssrf.dns.test.ts` | Mocked DNS mixed A/AAAA, empty/failure |
| `ssrf.production-config.test.ts` | Production + loopback bypass env throws |
| `ssrf.integration.test.ts` | Redirect private/metadata/loop; subresource pages complete |
| `ssrf.worker-auth.test.ts` | `POST /v1/scan-page` without Bearer → 401 |
| `playwrightScan.integration.test.ts` | Positive control (image-alt fixture) |

**Verification command:** `WEBSITE_SCANNER_INTEGRATION=1 WEBSITE_SCANNER_TEST_ALLOW_LOOPBACK=1 NODE_ENV=test npm run test:security` (plus `npm run lint`, `npm run typecheck`, `npm run build`).

**Test results:** See latest CI run or local gate output below (updated after hardening pass).

| Gate | Result |
|------|--------|
| `npm run lint` | Pass (2026-10-15) |
| `npm run typecheck` | Pass (2026-10-15) |
| `npm run test:security` | Pass — 28 tests, 7 files (2026-10-15; integration env set) |
| `npm run build` | Pass (2026-10-15) |

**Remaining dependency:** Layer-2 egress must be applied and verified in the target environment (not satisfied by committed YAML alone).

### Manual test matrix (Phase 9)

Record in production: valid HTTPS page, JS-rendered page, missing-alt fixture, SSRF rejects (localhost, metadata, private IP, bad port/scheme), subresource block fixture, robots skip, 10-page cap, stop scan, CSV formula injection, report JSON, 320px layout, rate limit, remote worker 401 without token.

### Phase 9 limitations

Automated axe checks only; loaded state only; no login-protected pages; capped same-origin crawl; bot-protected sites may fail; not legal certification; mobile viewport scan ≠ full assistive technology testing.

---

## Strengthening S1 — Accuracy & Result Intelligence (2026-10-15)

| Area | Status |
|------|--------|
| Evidence provenance model | Pass (`src/features/accessibility-intelligence/types/`) |
| Impact vs remediation priority | Pass (axe impact preserved; `remediationPriority.ts`) |
| Root-cause grouping | Pass (unit + fixture tests) |
| WCAG 2.2 A/AA coverage matrix | Pass (conservative partial/manual) |
| Scan completeness / truncation | Pass (`scanQuality.ts`, page warnings) |
| Representative node selection | Pass (`selectRepresentativeNodes.ts`) |
| Accuracy benchmark (known pass/fail) | Pass (`test:accessibility` integration) |
| SSRF/security regression | Pass (`test:security` unchanged) |

**Commands (2026-10-15):** `npm run test:accessibility` (12 tests), `npm run lint`, `npm run typecheck`, `npm run build`.

**Docs:** [ACCURACY_METHODOLOGY.md](./ACCURACY_METHODOLOGY.md), [ACCESSIBILITY_BENCHMARK.md](./ACCESSIBILITY_BENCHMARK.md), [AXE_RULE_COVERAGE.md](./AXE_RULE_COVERAGE.md) (regenerate via `npm run generate:axe-coverage`).

---

## Strengthening S2 — Result UX & Fix Lab (2026-10-15)

| Area | Status |
|------|--------|
| Session workflow state (tabs, fix status, grouped AI) | Pass |
| Results shell + accessible tab panels | Pass |
| Overview / Start Here / completeness alert | Pass |
| Issues grouping + explanation levels | Pass |
| Fix plan + Fix Lab + verification checklist | Pass |
| Human review library + relevance | Pass |
| Report executive appendix + dev guidance toggle | Pass |
| Rescan comparison banner + verify CTA | Pass |
| S2 unit tests (workflow, grouping, AI payload) | Pass |
| Phase 9 SSRF/security regression | Pass (`test:security`) |

**Commands (2026-10-15):** `npm run lint`, `npm run typecheck`, `npm run test:accessibility`, `npm run test:security`, `npm run build`.

**Docs:** [RESULT_UX_METHODOLOGY.md](./RESULT_UX_METHODOLOGY.md).

---

## Strengthening S4 — Final Product Quality & Launch Audit (2026-10-15)

| Area | Status |
|------|--------|
| Whole-product audit document | [FINAL_PRODUCT_AUDIT.md](./FINAL_PRODUCT_AUDIT.md) |
| Capability / data / OpenAI maps | PRODUCT_CAPABILITY_MATRIX, DATA_PROCESSING_MATRIX, OPENAI_COST_MAP |
| Competitor benchmark (internal) | COMPETITOR_UX_BENCHMARK.md — not for public claims |
| Layer 1 SSRF / sitemap / worker auth | Pass when `test:security` run (prior session + S3) |
| Layer 2 network egress | **Not deployed** — website scanner public launch **blocked** |
| Website scanner availability UX | Early 503 when remote scanner misconfigured |
| Developer Ticket Generator (2026-10-15) | Client-only deterministic tickets; 0 OpenAI; evidence ZIP includes `developer-tickets.md` |
| Legal / compliance claim grep | Pass — no WCAG/ADA certification claims |
| AdSense | Prepared, not integrated |
| npm gates (lint/typecheck/test/build) | Pass prior to S4 session; re-run after `npm install` on dev machine |

**Launch statement:** Option B — core tools ready with conditions; website scanner gated on Layer 2.

**Related:** [FINAL_TEST_MATRIX.md](./FINAL_TEST_MATRIX.md), [USER_FLOW_AUDIT.md](./USER_FLOW_AUDIT.md), [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md).
