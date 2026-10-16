# Accessible Content Preflight Suite

Check and improve the accessibility readiness of social media and digital content before publishing.

## Current status

**Command 6 — Production V1 audit** completed for Phases 1–5. See [PROJECT_STATUS.md](./PROJECT_STATUS.md), [PRODUCTION_AUDIT.md](./PRODUCTION_AUDIT.md), [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md).

**Phase 6–9** (video, reports, batch checker, website scanner) are implemented. Website scanner **S1** (accuracy intelligence) and **S2** (result UX / Fix Lab) are documented in [ACCURACY_METHODOLOGY.md](./ACCURACY_METHODOLOGY.md) and [RESULT_UX_METHODOLOGY.md](./RESULT_UX_METHODOLOGY.md). See `.env.example`.

**Phase 9 — Website scanner:** Playwright **1.64.1**, `@axe-core/playwright` **4.13.0**, `ipaddr.js` **2.5.0**, `robots-parser` **3.0.1**. Local dev: `npx playwright install chromium` (Linux CI: `npx playwright install --with-deps chromium`). Production on Vercel: use `SCANNER_RUNTIME=remote` and deploy [services/scanner](./services/scanner/README.md). Security: [WEBSITE_SCANNER_SECURITY.md](./WEBSITE_SCANNER_SECURITY.md).

**Strengthening S1 — Result intelligence:** **Issue** = unique rule/context; **Occurrence** = affected element; **Root cause** = likely shared pattern; **Priority** = remediation order (not legal risk). **Automated** = axe; **Measured** = contrast tool; **AI-assisted** = optional guidance; **Human review** = incomplete/manual criteria. See [ACCURACY_METHODOLOGY.md](./ACCURACY_METHODOLOGY.md). Tests: `npm run test:accessibility`.

**SEO launch (pre-production):** Central metadata in `src/lib/seo/`, `npm run audit:seo`, `/llms.txt`, and [SEARCH_ENGINE_LAUNCH_CHECKLIST.md](./SEARCH_ENGINE_LAUNCH_CHECKLIST.md). Set `NEXT_PUBLIC_SITE_URL` before public launch.

**Strengthening S4 — Launch audit (2026-10-15):** [FINAL_PRODUCT_AUDIT.md](./FINAL_PRODUCT_AUDIT.md) (master), [PRODUCT_CAPABILITY_MATRIX.md](./PRODUCT_CAPABILITY_MATRIX.md), [FINAL_TEST_MATRIX.md](./FINAL_TEST_MATRIX.md), [DATA_PROCESSING_MATRIX.md](./DATA_PROCESSING_MATRIX.md), [OPENAI_COST_MAP.md](./OPENAI_COST_MAP.md). Internal research: COMPETITOR_UX_BENCHMARK.md, PRODUCT_DIFFERENTIATORS.md (not for public marketing). **Launch:** core tools ready with production env; **website scanner public launch blocked** until Layer-2 network egress is deployed ([WEBSITE_SCANNER_SECURITY.md](./WEBSITE_SCANNER_SECURITY.md)).

## Routes

- Video: `/video-accessibility-checker`
- Generic: `/social-media-accessibility-checker`
- Instagram: `/instagram-accessibility-checker`
- Facebook: `/facebook-accessibility-checker`
- LinkedIn: `/linkedin-accessibility-checker`
- X: `/x-accessibility-checker`
- Contrast: `/image-contrast-checker`
- Screen reader preview: `/screen-reader-preview`
- Preflight report (info): `/accessibility-preflight-report`
- Sample website report (fictional demo): `/sample-accessibility-report`
- Batch checker: `/batch-accessibility-checker`
- Website scanner: `/website-accessibility-scanner` (public CTA optional: `WEBSITE_SCANNER_PUBLIC_ENABLED`)
- Blog: `/blog` (optional MongoDB editorial guides; see `BLOG_EDITORIAL_WORKFLOW.md`)
- Methodology: `/methodology`
- Trust: `/privacy`, `/terms`, `/disclaimer`, `/accessibility`, `/about`, `/contact`

## V1 capabilities

| Layer | Behavior |
|-------|----------|
| Phase 1 | Local caption/alt heuristics and readiness score |
| Phase 2 | Optional OpenAI image analysis via `POST /api/accessibility/analyze-image` only when user clicks Analyze |
| Phase 3 | Local WCAG contrast measurement |
| Phase 4 | Local screen reader experience preview; optional browser speech |
| Phase 5 | Platform checklists and publishing guidance (no social APIs) |
| Phase 6 | MP4/WebM video: temporary private upload, OpenAI transcription, editable cues, SRT/VTT/TXT export, optional frame visual review |
| Phase 7 | Browser-generated preflight report (HTML preview, print, PDF, JSON, text summary) from existing checks only — no export-time AI |
| Phase 8 | Batch CSV/ZIP import (in-browser), local preflight for up to 100 posts, opt-in AI queue, CSV/JSON exports |
| Phase 9 / S3 | Server-side Playwright + axe-core public URL scan (single page or up to **25 selected** same-origin pages), secure sitemap/crawl discovery, desktop/mobile/compare viewports, SSRF controls, optional remote scanner worker, human review checklist, optional AI fix guidance, Excel/CSV/JSON/ZIP/report export |

## Privacy model

- **Local:** preflight rules, contrast, preview text, platform checklists, video preview
- **Session storage:** caption/alt/platform text when navigating between checker routes (same tab); video cues/transcript state in session on the video tool
- **Server + OpenAI:** AI image analysis on explicit click; video transcription on explicit click; optional visual frame review on explicit click
- **Temporary video storage:** private upload (Vercel Blob in production, dev in-memory when configured); deleted after transcription attempt

## AI architecture and cost controls

- API key is server-only (`OPENAI_API_KEY`); browser never calls OpenAI directly
- One structured multimodal request per explicit analysis (or reuse cached result for identical inputs in-session unless “Analyze again”)
- Guards: in-flight ref, button disabled state, client cooldown, payload validation, best-effort rate limit (`checkAIRateLimit`)
- Client resizes images (max long edge 1920) before upload

## Environment variables

Copy `.env.example` to `.env.local` for development:

| Variable | Required | Notes |
|----------|----------|--------|
| `NEXT_PUBLIC_SITE_URL` | Production | Canonicals, sitemap, Open Graph |
| `OPENAI_API_KEY` | For AI feature | Site builds without it; AI shows unavailable |
| `OPENAI_VISION_MODEL` | Optional | Server default if unset |
| `OPENAI_IMAGE_DETAIL` | Optional | `auto`, `low`, or `high` |
| `OPENAI_REQUEST_TIMEOUT_MS` | Optional | 15000–180000 |
| `OPENAI_CAPTION_MODEL` / `OPENAI_DIARIZATION_MODEL` | Optional | Video transcription |
| `BLOB_READ_WRITE_TOKEN` | Production video | Private temporary video storage |
| `VIDEO_MAX_FILE_SIZE_MB` / `VIDEO_MAX_DURATION_SECONDS` | Optional | Defaults 24 MB / 600 s |
| `CRON_SECRET` | Production | Secured orphan media cleanup route |
| `SCANNER_RUNTIME` | Website scan | `local` (dev/Node) or `remote` (Vercel + Docker worker) |
| `SCANNER_SERVICE_URL` / `SCANNER_SERVICE_TOKEN` | Remote scanner | Server-to-server only |
| `SCANNER_USER_AGENT` | Optional | Default bot UA string |
| `OPENAI_TEXT_MODEL` | Optional | Website AI fix guidance |
| `MONGODB_URI` / `MONGODB_DB_NAME` | Blog only | Editorial `/blog` content; build works unset |
| `BLOG_IMAGE_HOSTS` | Optional | Comma-separated HTTPS hosts for blog thumbnails |
| `BLOG_REVALIDATE_SECONDS` | Optional | ISR for blog routes (default 900) |

## Deployment (generic)

1. Set `NEXT_PUBLIC_SITE_URL` to your HTTPS production origin.
2. Configure server env vars on the host (e.g. Vercel project settings).
3. Run `npm ci`, `npm run build`, deploy artifact.
4. Verify `/sitemap.xml`, `/robots.txt`, and primary tool routes.
5. Complete [LAUNCH_CHECKLIST.md](./LAUNCH_CHECKLIST.md).

### Website scanner (production on Vercel)

1. Build and run the worker: `docker compose -f services/scanner/docker-compose.yml up --build` (or your orchestrator).
2. Set on **Next.js only** (server): `SCANNER_RUNTIME=remote`, `SCANNER_SERVICE_URL`, `SCANNER_SERVICE_TOKEN`, and `VISUAL_LOCATOR_SIGNING_SECRET` (≥16 characters) to enable Visual Issue Locator.
3. Apply **private network egress deny** on the scanner service (see [WEBSITE_SCANNER_SECURITY.md](./WEBSITE_SCANNER_SECURITY.md)).
4. Confirm `GET /health` on the worker and a test scan from `/website-accessibility-scanner`.
5. Integration test locally: `WEBSITE_SCANNER_INTEGRATION=1 WEBSITE_SCANNER_TEST_ALLOW_LOOPBACK=1 npm run test:scanner`.

Developer remediation tickets are built in the browser from scan results (Markdown/plain text, copy/download). They do not call OpenAI or external issue trackers.

## npm commands

| Command | Description |
| -------- | ------------- |
| `npm run dev` | Development server |
| `npm run build` | Production build |
| `npm run start` | Production server locally |
| `npm run test` | Vitest |
| `npm run test:blog` | Blog unit tests |
| `npm run lint` | ESLint |
| `npm run typecheck` | TypeScript |

## Limitations

- Not legal or WCAG/ADA certification
- No social login, APIs, or auto-publishing
- In-memory rate limiting is not globally reliable on serverless without a durable store
- Platform UIs change; human review in the native app is always recommended

## Documentation

- [PLATFORM_GUIDANCE.md](./PLATFORM_GUIDANCE.md)
- [ADSENSE_READINESS.md](./ADSENSE_READINESS.md)
