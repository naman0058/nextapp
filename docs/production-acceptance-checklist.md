# DigitalAccessReady — Production Acceptance Checklist (Phase 9)

Legend: **PASS** | **CONDITION** | **BLOCKER** — with evidence references.

## INFRASTRUCTURE

| Item | Status | Evidence |
|------|--------|----------|
| Remote scanner URL + token documented | PASS | `.env.example`, `SCANNER_WORKER_DEPLOYMENT.md` |
| Worker loopback-only (8787 not public) | PASS | Deployment docs; no Phase 9 infra change |
| Live `/health` + `/ready` on production worker | CONDITION | Manual ops verify per deploy; not run from CI here |

## SECURITY

| Item | Status | Evidence |
|------|--------|----------|
| SSRF / DNS / redirect guards | PASS | `npm run test:security`, `ssrf*.test.ts` |
| Worker auth rejection without token | PASS | `ssrf.worker-auth.test.ts` (skipped unless env) |
| Visual Locator signing | PASS | `visualLocator.token.test.ts` |
| No service token in client bundle | PASS | `SCANNER_SERVICE_TOKEN` server-only in `.env.example` |
| AI key server-only | PASS | `aiR5FinalLaunchAudit.test.ts`, gate tests |

## SCANNER

| Item | Status | Evidence |
|------|--------|----------|
| Taxonomy / coverage accountability | PASS | Phase 1–2 tests, `findingLossRegression.test.ts` |
| FileMakr live audit (semantic invariants) | PASS | `filemakrCoverageAudit.integration.test.ts` |
| Partial / multi-page / viewport rollups | PASS | `buildExecutivePreflight.test.ts`, taxonomy tests |

## RESULT TAXONOMY

| Item | Status | Evidence |
|------|--------|----------|
| Fail / pass / incomplete / N/A / BP separation | PASS | `scanResultModel.test.ts` |
| Occurrence vs retained vs shown | PASS | `launchGate.test.ts`, enterprise report tests |

## ISSUES / EVIDENCE

| Item | Status | Evidence |
|------|--------|----------|
| FindingDetail builder | PASS | `findingDetail.test.ts` |
| Evidence caps honored in report | PASS | `ENTERPRISE_PDF_MAIN_EVIDENCE_LIMIT`, enterprise tests |

## REMEDIATION

| Item | Status | Evidence |
|------|--------|----------|
| Deterministic registry | PASS | `deterministicRemediationRegistry.test.ts` |
| Enterprise `remediationPlan` block | PASS | `launchGate.test.ts` (N), HTML/PDF/Excel wired |
| Fix Lab richer than PDF (all frameworks) | CONDITION | By design: PDF one example; interactive Fix Lab full |

## AI

| Item | Status | Evidence |
|------|--------|----------|
| Server gate `AI_REMEDIATION_ENABLED` | PASS | `websiteAiRemediationGate.test.ts`, `aiR5FinalLaunchAudit.test.ts` |
| Client flag UI-only | PASS | AI audit docs |
| Deterministic usable without AI | PASS | Fix Lab + remediation plan |

## VISUAL LOCATOR

| Item | Status | Evidence |
|------|--------|----------|
| Token signing / expiry | PASS | `visualLocator.token.test.ts` |

## HUMAN REVIEW

| Item | Status | Evidence |
|------|--------|----------|
| Independence from automation / contributions | PASS | `humanReviewWorkspace.test.ts` |
| Report ↔ workspace counts | PASS | `validateEnterpriseReportConsistency` |

## WORKSPACE CONTRIBUTIONS

| Item | Status | Evidence |
|------|--------|----------|
| Phase 6B contribution tests | PASS | `phase6bContributions.test.ts`, `accessibilityWorkspace.test.ts` |
| Return-to-finding browser E2E | CONDITION | No Playwright UI E2E suite; manual steps below |

### Manual: Return-to-finding (Phase 6B case M)

1. Complete website scan → Issues → open finding.
2. Open specialized tool → create contribution → return.
3. Confirm same session, same finding highlight, contribution merged once.

## REPORT

| Item | Status | Evidence |
|------|--------|----------|
| Enterprise view single source | PASS | `buildEnterprisePreflightReport.ts` |
| HTML / PDF / JSON share counters | PASS | `launchGate.test.ts` (C/S) |
| PDF not PDF/UA tagged | CONDITION | `PDF_UA_NOTE`; documented non-blocker |
| Remediation depth in PDF | PASS | Phase 9 `remediationPlan` |

## EXPORTS

| Item | Status | Evidence |
|------|--------|----------|
| Excel uses canonical report build | PASS | `exportWebsiteWorkbook.ts` |
| Professional filenames | PASS | `buildWebsiteReportFilename.ts` |
| Stable report ID | PASS | `launchGate.test.ts` / enterprise tests |

## ACCESSIBILITY (product UI)

| Item | Status | Evidence |
|------|--------|----------|
| Automated axe on all marketing routes | CONDITION | Run manual axe on key routes pre-launch |
| Human Review / report semantic HTML | PASS | Phase 7/8 components use headings, labels, tables |
| Core workflow keyboard | CONDITION | Manual keyboard pass on scanner + results tabs |

## RESPONSIVE

| Item | Status | Evidence |
|------|--------|----------|
| 320px report / human review | CONDITION | Manual check; CSS uses responsive grids |
| Primary E2E mobile | CONDITION | No browser E2E infra |

## PRIVACY

| Item | Status | Evidence |
|------|--------|----------|
| Export JSON sanitization | PASS | `exportReportJson.ts` |
| Spreadsheet / ticket sanitization | PASS | security + developer ticket tests |

## SEO

| Item | Status | Evidence |
|------|--------|----------|
| robots / sitemap | PASS | `src/app/robots.ts`, `sitemap.ts` |
| Session results not indexed | PASS | Client session state; no public scan URLs in sitemap |

## ADS / UX

| Item | Status | Evidence |
|------|--------|----------|
| Ad slots not blocking scan controls | PASS | `AdSlot` separate from tool workspaces (review layout pre-launch) |

## ERROR STATES

| Item | Status | Evidence |
|------|--------|----------|
| Scanner unavailable messaging | PASS | `discoverCrawlRemote.test.ts`, UI shells |
| No stack traces to user | CONDITION | Spot-check; Sentry not assumed |

## LEGACY COMPATIBILITY

| Item | Status | Evidence |
|------|--------|----------|
| Human review migration | PASS | `humanReviewWorkspace.test.ts` (P) |
| Missing enterpriseView on old JSON | CONDITION | Website reports always rebuild enterprise on generate |

## PRIMARY JOURNEY E2E

| Item | Status | Evidence |
|------|--------|----------|
| Full browser scan → report automation | CONDITION | Vitest unit/integration only; manual production checklist |

## Production feature matrix (internal)

| Feature | Depends on | If unavailable |
|---------|------------|----------------|
| Website Scanner | `SCANNER_SERVICE_URL`, `SCANNER_SERVICE_TOKEN`, `SCANNER_RUNTIME=remote` | Scanner unavailable message; no local Playwright on Vercel |
| AI Remediation | `AI_REMEDIATION_ENABLED`, `OPENAI_API_KEY`, `OPENAI_REMEDIATION_MODEL` | Deterministic Fix Lab + report plan remain |
| Visual Locator | `VISUAL_LOCATOR_SIGNING_SECRET` | View-on-page disabled; evidence lists remain |
| Public scanner CTA | `WEBSITE_SCANNER_PUBLIC_ENABLED` | Marketing hides primary CTA |

## Manual production sign-off (recommended)

- [ ] Fresh FileMakr scan: Overview counts = Report preview = Excel executive sheet
- [ ] PDF download opens without clipped executive block
- [ ] Worker `/health` and authenticated scan from Vercel staging
- [ ] Return-to-finding manual path (above)
