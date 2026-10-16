# AI-R2 Website Remediation — Final Gate Audit

Audit date: **2026-10-16**  
Scope: Website Fix Lab AI remediation (AI-R2 only). **No AI-R3.**

## Executive summary

| Gate | Result |
|------|--------|
| **AI-R2 GATE** | **PASS** |

## Verification runs

| Command | Result |
|---------|--------|
| `npm run test:ai-remediation` | PASS (28 tests) |
| `npm run test:security` | PASS (79 tests, 7 skipped) |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |

## Architecture (checks 1–4)

| Check | Evidence | Test | Status |
|-------|----------|------|--------|
| Single website AI path | [`WebsiteAiRemediationSection.tsx`](src/features/website-scanner/components/results/WebsiteAiRemediationSection.tsx) → `/api/accessibility/ai-remediation` → [`runRemediationRequest`](src/lib/ai/remediation/runRemediationRequest.ts) | `websiteAiRemediationGate.test.ts` | PASS |
| Legacy route 410 | [`ai-fix-guidance/route.ts`](src/app/api/accessibility/website/ai-fix-guidance/route.ts) | `aiFixGuidanceDeprecated.test.ts` | PASS |
| No live legacy fetch | Repo grep — no client `fetch` to ai-fix-guidance | Grep | PASS |
| No second website engine | `generateWebsiteFixGuidance.ts` unused by product; website OpenAI only via shared remediation | Doc | PASS (legacy file pending removal) |

## Root cause & identity (5–8)

| Check | Evidence | Test | Status |
|-------|----------|------|--------|
| Root-cause only | AI section only when `group` set in [`FixLabPanel`](src/features/website-scanner/components/results/FixLabPanel.tsx) | Code review | PASS |
| One AI action per group | Single POST per explicit generate; 12 occurrences → 1 group | `websiteAiRemediationGate.test.ts` | PASS |
| Stable root-cause id | `issueFingerprint: group.id` in facts | `buildWebsiteRemediationContext.test.ts` | PASS |
| Same rule, different groups | Distinct fingerprints | `buildWebsiteRemediationContext.test.ts` | PASS |

## Session / scan / stale (9–18)

| Check | Evidence | Test | Status |
|-------|----------|------|--------|
| sessionId | `crypto.randomUUID()` in provider; max 128 server-side | `validateRemediationRequest` | PASS |
| scanId | `` `${sessionId}:${scanRevision}` `` in UI | `websiteAiRemediationGate.test.ts` | PASS |
| scanRevision | Incremented on `FINISH_SCAN` only | Reducer review | PASS |
| Failed finish revision | `FINISH_SCAN` increments for partial/failed too | — | LIMITATION (documented) |
| Stale after rescan | `MARK_AI_STALE` + UI banner | Code review | PASS |
| No auto-regenerate on rescan | No fetch on rescan hooks | Grep | PASS |

## Context & facts (19–30)

| Check | Evidence | Test | Status |
|-------|----------|------|--------|
| Bounded adapter | [`buildWebsiteRemediationContext.ts`](src/features/website-scanner/server/remediation/buildWebsiteRemediationContext.ts) | 20 rule eval tests | PASS |
| Snippets ≤ 3, selectors ≤ 5 | Builder + server sanitize | Eval tests | PASS |
| No full page HTML | No pageHtml/fullDom fields | `buildWebsiteRemediationContext.test.ts` | PASS |
| Deterministic facts in UI | Impact badge from `entry.facts` | Code review | PASS |
| Labels / disclosure | AI-Assisted Remediation; [`remediationDisclosure.ts`](src/lib/ai/remediation/remediationDisclosure.ts) | Code review | PASS |
| No compliance claims in UI | Grep website-scanner | Grep | PASS |

## Resilience & caps (37–48)

| Check | Evidence | Test | Status |
|-------|----------|------|--------|
| Missing key/model | API 503; Fix Lab deterministic remains | R1 tests | PASS |
| Provider errors isolated | UI `role="alert"` only | Code review | PASS |
| Double-click guard | `inFlight` ref + disabled button | Code review | PASS |
| Concurrent duplicate | No in-flight dedup | — | LIMITATION |
| Cache hit | Session cache + skip OpenAI | `remediation.test.ts` | PASS |
| Cache before cap | Order in `runRemediationRequest` | R1 + scan cap test | PASS |
| Scan cap with scanId | `MAX_AI_REMEDIATIONS_PER_SCAN` | `remediation.test.ts` | PASS |
| Session cap | When sessionId sent | R1 tests | PASS |
| Rate limit scope | In-memory per instance | — | LIMITATION |
| ID spoofing | Anonymous cost control | — | LIMITATION |

## Ticket, report, sample (53–61)

| Check | Evidence | Test | Status |
|-------|----------|------|--------|
| Ticket AI optional, default OFF | [`DeveloperTicketDialog`](src/features/website-scanner/components/developerTicket/DeveloperTicketDialog.tsx) | `developerTicket.test.ts` | PASS |
| Ticket disclaimer | AI-Assisted Guidance — Review Before Implementation | Copy update | PASS |
| No new OpenAI from ticket | Local format only | Code review | PASS |
| Report metadata | `buildWebsiteScanReport.ts` ai remediation rows | Code review | PASS |
| Sample static only | Fixture `aiRemediationByGroup`; no API | Code review | PASS |
| Sample label | Sample AI-Assisted Guidance | FixLabPanel | PASS |

## Security & UX (62–90)

| Check | Evidence | Test | Status |
|-------|----------|------|--------|
| Visual Locator no AI | Separate hooks | Code review | PASS |
| Rescan CTA | Fix Lab + AI panel | Code review | PASS |
| AI cannot mark verified | No auto-resolve in report | Code review | PASS |
| Code as text | CopyCodeBlock / lists; no innerHTML for AI | `formatAiRemediationMarkdown.test.ts` | PASS |
| XSS in markdown export | Literal script in output string | `formatAiRemediationMarkdown.test.ts` | PASS |
| Common rule evals | [`AI_REMEDIATION_WEBSITE_EVALS.md`](AI_REMEDIATION_WEBSITE_EVALS.md) + 16 rules | Context tests | PASS |
| Analytics | Not implemented | N/A | N/A |
| Live OpenAI | Not run in CI | — | NOT RUN — policy |

## Documentation (94–98)

| Doc | Status |
|-----|--------|
| [`AI_REMEDIATION_ARCHITECTURE.md`](AI_REMEDIATION_ARCHITECTURE.md) | Updated R2 complete |
| [`OPENAI_COST_MAP.md`](OPENAI_COST_MAP.md) | Website row → shared route |
| [`DATA_PROCESSING_MATRIX.md`](DATA_PROCESSING_MATRIX.md) | Website remediation row |
| [`PRODUCTION_AUDIT.md`](PRODUCTION_AUDIT.md) | Legacy 410 noted |

## Documented limitations (non-blocking)

- In-memory rate limit and fingerprint cache (**per runtime instance**)
- No cross-instance in-flight deduplication
- `sessionId` / `scanId` are abuse/cost identifiers, not authenticated identity
- AI unavailable state on explicit generate (503 message), not proactive pre-disable
- `scanRevision` increments on any scan finish (including failed/partial)
- Layer-2 scanner egress production requirement unchanged
- Live OpenAI eval not executed (mock-only CI)

## Critical blockers

None — all gate blockers **PASS**.

---

**AI-R2 GATE: PASS**

AI-R3 may now be implemented using the proven shared remediation and Website UX pattern.
