# Launch Checklist — V1

Use before public deployment. S4 (2026-10-15) categories below.

## MANDATORY BEFORE LAUNCH (core product)

- [ ] Production domain configured
- [ ] HTTPS enabled
- [ ] `NEXT_PUBLIC_SITE_URL` set to production origin (not example.com)
- [ ] `OPENAI_API_KEY` configured server-side (optional but required for AI feature)
- [ ] `OPENAI_VISION_MODEL` verified for your OpenAI account
- [ ] Privacy page reviewed
- [ ] Terms reviewed
- [ ] Disclaimer reviewed
- [ ] Contact information configured (`siteConfig.contact.email` or env-driven update)
- [ ] Accessibility statement reviewed
- [ ] `robots.txt` correct
- [ ] `/sitemap.xml` works and lists indexable pages only
- [ ] Search Console ready to connect
- [ ] Favicon/app icons configured
- [ ] Open Graph default image configured (if using custom OG image)
- [ ] Mobile tested (320px+)
- [ ] `npm run typecheck` passes
- [ ] `npm run lint` passes
- [ ] `npm run test` passes
- [ ] `npm run build` passes
- [ ] AI cost safeguards verified (no auto-AI, dedup, rate limit documented)
- [ ] Error monitoring strategy decided
- [ ] Analytics strategy decided (no raw user content in events)
- [ ] AdSense intentionally NOT added until content/tool quality is validated in production
- [ ] Private Vercel Blob store connected (OIDC on Production/Preview); legacy `BLOB_READ_WRITE_TOKEN` only if not on Vercel
- [ ] `CRON_SECRET` set and Vercel Cron (or equivalent) calls `/api/internal/cleanup-temporary-media`
- [ ] Video size limit (default 24 MB) verified in UI
- [ ] Video duration limit (default 10 min) verified in UI
- [ ] Transcription model access verified (`OPENAI_CAPTION_MODEL`)
- [ ] Diarization model access verified if offering speaker detection
- [ ] Video temp file cleanup tested (success + failure paths)
- [ ] SRT/VTT download tested
- [ ] Video tool mobile-tested (320px+)
- [ ] Privacy copy reviewed for Phase 6 video processing
- [ ] Preflight report: generate from social checker (partial + full workflow)
- [ ] Preflight report: generate from video checker with captions
- [ ] Preflight report: privacy toggles, print, PDF, JSON, and copy summary tested
- [ ] Preflight report: stale banner after editing caption/cues
- [ ] `/accessibility-preflight-report` info page indexed in sitemap
- [ ] `/sample-accessibility-report` loads with SAMPLE disclosure; no scanner/OpenAI network calls
- [ ] Sample exports download with `sample-*` filenames; PDF shows sample banner
- [ ] `/sample-accessibility-report` in sitemap; homepage/scanner/preflight-info links verified
- [ ] `npm run test:sample-report` passes
- [ ] Batch checker: CSV import, local preflight, AI queue limits, exports tested
- [ ] `/batch-accessibility-checker` in sitemap
### Website scanner — production-ready gate (all required)

The website accessibility scanner is **not** publicly production-ready until every item below is checked.

**Remote architecture:** With `SCANNER_RUNTIME=remote` on Vercel, browser work (scan, visual locator, crawl discovery) runs on the worker only — see **REMOTE SCANNER ARCHITECTURE: PASS** in [`SCANNER_WORKER_DEPLOYMENT.md`](./SCANNER_WORKER_DEPLOYMENT.md). Public CTA remains off until Layer-2 + checklist below.

- [ ] Remote scanner worker deployed ([`SCANNER_WORKER_DEPLOYMENT.md`](./SCANNER_WORKER_DEPLOYMENT.md), Hostinger `scanner-worker/`)
- [ ] Crawl discovery uses remote worker in production (`POST /v1/discover-crawl`; tests: `discoverCrawlRemote.test.ts`)
- [ ] Network egress policy applied and verified (`scanner-worker/scripts/verify-egress.sh`; see [`SCANNER_SECURITY_GATE.md`](./SCANNER_SECURITY_GATE.md))
- [ ] Metadata endpoint blocked at network layer
- [ ] Production loopback bypass disabled (guard verified; `WEBSITE_SCANNER_TEST_ALLOW_LOOPBACK` unset)
- [ ] Redirect-to-private integration test passed in CI (`npm run test:security`)
- [ ] Subresource-to-private integration test passed in CI
- [ ] Worker authentication verified (`401` without Bearer token)
- [ ] Global concurrency/rate limits verified
- [ ] Chromium installed on scanner worker
- [ ] `SCANNER_SERVICE_TOKEN` configured server-side only
- [ ] WCAG axe rule configuration verified; axe version recorded in audit
- [ ] 25-page selected review tested (controlled fixture or staging)
- [ ] Website AI guidance optional and rate-limited
- [ ] Website scanner privacy copy reviewed
- [ ] Production website scan report generated
- [ ] `/website-accessibility-scanner` in sitemap
- [ ] Website results UX: five tabs, Start Here, Fix Lab, human review wizard, rescan comparison tested (320px+)
- [ ] Website `?view=` deep link to results tab tested
- [ ] `VISUAL_LOCATOR_SIGNING_SECRET` set in production (≥16 chars) if Visual Issue Locator enabled
- [ ] Visual Issue Locator: mint + visualize on staging; verify 401 on worker without Bearer; rate limit smoke test
- [ ] Visual Issue Locator: confirm no token/image/HTML logged; `Cache-Control: no-store` on image response

## RECOMMENDED

- [ ] [FINAL_PRODUCT_AUDIT.md](./FINAL_PRODUCT_AUDIT.md) executive summary reviewed
- [ ] Layer-2 egress evidence attached before enabling public website scanner
- [ ] Error monitoring strategy (no PII in logs)
- [ ] Search Console connected after `NEXT_PUBLIC_SITE_URL` set

## POST-LAUNCH

- [ ] Real-user feedback on S2/S3 remediation flows
- [ ] Usage analytics (minimal events only — see OPENAI_COST_MAP / privacy)
- [ ] Content growth on methodology/trust pages
- [ ] Re-evaluate AdSense after traffic quality review

## AI Remediation — final launch gate (AI-R5)

Evidence: [AI_REMEDIATION_FINAL_LAUNCH_AUDIT.md](./AI_REMEDIATION_FINAL_LAUNCH_AUDIT.md). Status: **AI REMEDIATION: READY WITH CONDITIONS**.

- [ ] `OPENAI_API_KEY` configured (server-only)
- [ ] `OPENAI_REMEDIATION_MODEL` configured (strict Structured Outputs capable)
- [ ] Remediation enabled intentionally (`AI_REMEDIATION_ENABLED=1`)
- [ ] Missing-key / missing-model fallback verified (503; deterministic tools still work)
- [ ] Rate limits, session caps, scan caps verified in staging
- [ ] Batch limits documented (5/run, 20/session UI + API caps)
- [ ] Context and payload limits verified
- [ ] Output limits / timeout / refusal handling verified (mock tests + staging)
- [ ] Prompt injection tests passed (`npm run test:ai-remediation`)
- [ ] No full website HTML sent to remediation (bounded context only)
- [ ] No duplicate vision call on alt remediation path
- [ ] Deterministic facts preserved in UI and exports
- [ ] AI disclosure visible; report inclusion default OFF
- [ ] Exports make zero AI calls (including evidence ZIP)
- [ ] Excel/CSV injection protection passed
- [ ] XSS export tests passed
- [ ] OpenAI outage / kill switch (`AI_REMEDIATION_ENABLED=0`) verified
- [ ] One controlled **live** remediation smoke test after config (not in CI)
- [ ] Mobile / AI UI accessibility spot-check (320px+)

## Website scanner — Layer 2 gate (BLOCKER for public scanner)

- [ ] Documented proof of deployed egress deny (not example YAML alone) — see FINAL_PRODUCT_AUDIT.md
