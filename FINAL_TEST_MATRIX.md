# Final test matrix (S4)

Audit date: **2026-10-15**  
Legend: **Executed** | **Mock-only** | **Not verified** (manual pending or blocked)

**AI Remediation (AI-R5, 2026-10-16):** See [AI_REMEDIATION_FINAL_LAUNCH_AUDIT.md](./AI_REMEDIATION_FINAL_LAUNCH_AUDIT.md) for the full matrix (`test:ai-remediation` 84 tests, security, exports, build, SEO, blog).

## Automated gates

| Command | Result | Notes |
|---------|--------|-------|
| `npm ci` | Not verified | EPERM on Windows while dev server held lock (2026-10-15 AM) |
| `npm install` | **Executed** exit 0 | ~1000s; reported 13 transitive audit findings — review before `npm audit fix --force` |
| `npm run lint` | **Executed** pass | 2026-10-15 post-install |
| `npm run typecheck` | **Executed** pass | 2026-10-15 post-install |
| `npm run test:accessibility` | **Executed** pass (28 tests) | Includes benchmark integration |
| `npm run test:security` | **Executed** pass (44 tests) | SSRF integration |
| `npm run build` | **Executed** pass | Next 16 production build |
| `npm outdated` | Not verified | Optional pre-launch |
| `npm audit` | Not verified | 13 issues noted in install summary |

## Social (§183)

| Case | Status |
|------|--------|
| Normal caption samples | Unit: preflight, hashtag segmentation |
| Problematic caps/emoji/Unicode | Unit coverage partial; full 10+10 manual matrix **Not verified** |

## Image AI (§184)

| Case | Status |
|------|--------|
| Schema validation | **Executed** validateAiImageAnalysis tests |
| Controlled 8-image manual set | **Not verified** (no paid CI) |

## Contrast (§185)

| Case | Status |
|------|--------|
| Boundary WCAG ratios | **Executed** contrast.test.ts |

## Video (§186)

| Case | Status |
|------|--------|
| Caption export SRT/VTT | **Executed** |
| Transcription parse | **Executed** |
| End-to-end MP4 prod path | **Not verified** without Blob + OpenAI |

## Batch (§187)

| Case | Status |
|------|--------|
| CSV parse | **Executed** batchCsv.test.ts |
| Image match | **Executed** batchImageMatch.test.ts |
| 100-row manual | **Not verified** |

## Website (§188)

| Case | Status |
|------|--------|
| Known pass/fail benchmark | **Executed** integration |
| SSRF private/redirect | **Executed** with `WEBSITE_SCANNER_INTEGRATION=1` |
| Sitemap XXE/parse | **Executed** sitemap.parse.test.ts |
| Viewport compare | **Executed** compareViewport.test.ts |
| 25-page controlled timing | **Not verified** (no 25-page fixture server in repo) |
| Dual viewport max scan | **Not verified** manual |
| Visual Issue Locator token sign/verify | **Executed** visualLocator.token.test.ts |
| Visual Issue Locator worker auth | **Executed** ssrf.worker-auth.test.ts (visualize route) |
| Visual Issue Locator E2E screenshot | **Not verified** without `WEBSITE_SCANNER_INTEGRATION=1` + fixture |
| Developer Ticket Generator | **Executed** developerTicket.test.ts |

## Security (§189)

| Case | Status |
|------|--------|
| SSRF Layer 1 | **Executed** automated |
| Sitemap XXE | **Executed** unit |
| Worker auth | **Executed** ssrf.worker-auth.test.ts |
| Spreadsheet formula injection | **Executed** via sanitize helpers + export patterns |
| Zip bomb | **Not verified** dedicated test |
| Layer 2 egress | **NOT DEPLOYED** — launch gate |

## Reports / exports (§190)

| Case | Status |
|------|--------|
| buildReport unit | **Executed** |
| Excel/ZIP/PDF manual | **Not verified** full manual matrix |

## UX / a11y (§191–192)

| Case | Status |
|------|--------|
| Persona walkthroughs | Documented in USER_FLOW_AUDIT.md |
| Keyboard full app | **Not verified** formal pass |
| 200% zoom | **Not verified** |
