# AI-R3 Content & Media Remediation — Final Gate Audit

Audit date: **2026-10-16**  
Scope: AI-R3 only (social, image/alt, contrast, video, batch + shared panel). **No AI-R4.**

## Executive summary

| Gate | Result |
|------|--------|
| **AI-R3 GATE** | **PASS** |

## Verification runs

| Command | Result |
|---------|--------|
| `npm run test:ai-remediation` | PASS (52 tests) |
| `npx vitest run src/features/batch/utils/ai/__tests__/batchRemediationGate.test.ts` | PASS (3 tests) |
| `npm run test:security` | PASS (79 tests, 7 skipped) |
| `npm run lint` | PASS (after `useAiRemediationSession` fix) |
| `npm run typecheck` | PASS |
| `npm run build` | PASS |

## A. Shared architecture (1–4)

| Check | Evidence | Test | Status |
|-------|----------|------|--------|
| Single remediation OpenAI path | [`generateRemediation.ts`](src/lib/ai/remediation/generateRemediation.ts) only product `responses.create` for remediation | Grep + R1 tests | PASS |
| R3 uses shared API | [`fetchAiRemediation`](src/lib/ai/remediation/client/fetchAiRemediation.ts) → `/api/accessibility/ai-remediation` | `aiR3ExplicitActionGate.test.ts` | PASS |
| No second remediation engine | Vision/transcription use separate routes; not invoked from remediation adapters | `aiR3ImageNoVisionGate.test.ts` | PASS |
| Legacy website route | [`ai-fix-guidance`](src/app/api/accessibility/website/ai-fix-guidance/route.ts) **410** | `aiFixGuidanceDeprecated.test.ts` | PASS |

## B. Shared panel (5–12)

| Check | Evidence | Test | Status |
|-------|----------|------|--------|
| Schema fields rendered | [`AIRemediationPanel.tsx`](src/lib/ai/remediation/components/AIRemediationPanel.tsx) | Code review | PASS |
| No inferred deterministic facts | Facts from adapters/API only | Code review | PASS |
| Safe rendering | React text nodes; no `dangerouslySetInnerHTML` | Grep | PASS |
| Hostile output | Literal `<script>` in validated report + markdown export | `aiR3ReportSafetyGate.test.ts` | PASS |

## C. Website R2 regression (13–25)

| Check | Evidence | Test | Status |
|-------|----------|------|--------|
| Thin wrapper on shared panel | [`WebsiteAiRemediationSection`](src/features/website-scanner/components/results/WebsiteAiRemediationSection.tsx) | Code review | PASS |
| Root-cause payload | `buildWebsiteRemediationContext` unchanged | `websiteAiRemediationGate.test.ts`, 20 context tests | PASS |
| Framework in fingerprint | `fingerprintRemediationRequest` + framework preference | R1 tests | PASS |
| One explicit request per generate | `inFlight` + cache | R1/R2 tests | PASS |
| Legacy unused | No client fetch to ai-fix-guidance | Grep | PASS |

## D. Explicit action (26–27)

| Check | Evidence | Test | Status |
|-------|----------|------|--------|
| No auto-fetch on mount | R3 sections delegate to panel; generate handler only | `aiR3ExplicitActionGate.test.ts` | PASS |

## E–G. Session & fingerprints (28–42)

| Check | Evidence | Test | Status |
|-------|----------|------|--------|
| Client UUID | [`useAiRemediationSession`](src/lib/ai/remediation/client/useAiRemediationSession.ts) via `useSyncExternalStore` | Code review | PASS |
| Not PII / not MongoDB | Session state only; no remediation in blog DB | Grep | PASS |
| Source in cache key | `fingerprintRemediationRequest` includes `input.source` + prompt **1.1** | `remediation.test.ts` | PASS |
| Cross-tool isolation | Same text → different adapter hashes | `contentAdapters.test.ts` | PASS |
| Evidence-sensitive hashes | Adapters include caption/colors/cue/batch target | Adapter tests | PASS |

## H–J. Social (43–61)

| Check | Evidence | Test | Status |
|-------|----------|------|--------|
| Bounded payload | [`buildSocialRemediationContext`](src/lib/ai/remediation/adapters/buildSocialRemediationContext.ts) | Code review | PASS |
| Fact preservation in evidence | `originalCaption`, `preserveMeaning`, guidance | `contentAdapters.test.ts` | PASS |
| Original not auto-overwritten | Apply via explicit button; `state.caption` preserved | Code review | PASS |
| Compare / apply / undo | [`SocialAiRemediationSection`](src/features/accessibility/components/checker/SocialAiRemediationSection.tsx) | Code review | PASS |
| Platform authority | `getPlatformAccessibilityConfig` summaries only | Adapter code | PASS |

## K–P. Image (62–81)

| Check | Evidence | Test | Status |
|-------|----------|------|--------|
| No duplicate vision on remediation | No `requestAiImageAnalysis` in image remediation paths | `aiR3ImageNoVisionGate.test.ts` | PASS |
| Reuse session analysis | `imageAnalysisEvidence` when `aiAnalysis` present | Adapter test | PASS |
| No image blob in remediation facts | JSON guard in tests | `contentAdapters.test.ts` | PASS |
| Without prior analysis | Text-only facts; UI hint to analyze first | Code + disclosure | LIMITATION (documented) |
| Suggestions not “correct alt” | Copy + human-review disclaimer | Code review | PASS |
| Sensitive traits / identity | Adapter guidance + system instructions | Code review | PASS |

## Q–U. Contrast (82–93)

| Check | Evidence | Test | Status |
|-------|----------|------|--------|
| Deterministic authority | `doNotRecalculate`, measured ratio in facts | `contentAdapters.test.ts` | PASS |
| Measured band in UI | [`ContrastAiRemediationSection`](src/features/accessibility/components/visual/ContrastAiRemediationSection.tsx) | Code review | PASS |
| AI optional on fail only | Panel when `primaryVerdict === "fail"` | Code review | PASS |
| AI cannot replace ratio in UI | `ContrastResultCard` unchanged; footnote on conflict | Code review | PASS |

## V–AB. Video (94–112)

| Check | Evidence | Test | Status |
|-------|----------|------|--------|
| Selected cue only | [`buildVideoRemediationContext`](src/lib/ai/remediation/adapters/buildVideoRemediationContext.ts) | `contentAdapters.test.ts` | PASS |
| Fact preservation in evidence | `originalCueText` + guidance | Video adapter test | PASS |
| No full video/transcript | Bounded neighbor context | Adapter test | PASS |
| Explicit per-cue action | “AI caption help” toggle | Code review | PASS |

## AC–AJ. Batch (113–132)

| Check | Evidence | Test | Status |
|-------|----------|------|--------|
| No fix-all | Selected rows only in UI | Code review | PASS |
| 5/run cap | [`planBatchRemediationRun`](src/features/batch/utils/ai/planBatchRemediationRun.ts) | `batchRemediationGate.test.ts` | PASS |
| 20/session cap (client) | Same planner | `batchRemediationGate.test.ts` | PASS |
| Server bypass of 5/run | Direct API still hits R1 session cap (default 12) | — | LIMITATION |
| Concurrency | `BATCH_AI_CONCURRENCY = 2` | `runBatchRemediationQueue.ts` | PASS |
| Cancel | `remediationCancelRef` + queue pump | Code review | PASS |
| Caption vs alt fingerprint | Different `remediationTarget` in hash | `batchRemediationGate.test.ts` | PASS |

## AK–AQ. Persistence & zero-call (133–142)

| Check | Evidence | Test | Status |
|-------|----------|------|--------|
| No MongoDB remediation | Grep | Grep | PASS |
| Copy/apply/undo | Local state only after first generate | Code review | PASS |
| Report/export | No AI-R4 appendix; exports unchanged | — | NA (AI-R4) |
| Sample report | Static fixture; no API | R2 audit still valid | PASS |

## AT–AX. Resilience & caps (144–150)

| Check | Evidence | Test | Status |
|-------|----------|------|--------|
| Provider failures | 503/502; deterministic tools unaffected | R1 tests | PASS |
| In-flight guard | `inFlight` ref in panel | Code review | PASS |
| Cache before cap | `runRemediationRequest` order | R1 tests | PASS |
| Per-instance limits | In-memory cache/rate/session | — | LIMITATION |

## AY–BE. Docs & privacy (151–157)

| Doc | Status |
|-----|--------|
| [`OPENAI_COST_MAP.md`](OPENAI_COST_MAP.md) | R3 rows present |
| [`DATA_PROCESSING_MATRIX.md`](DATA_PROCESSING_MATRIX.md) | R3 payload classes |
| [`AI_REMEDIATION_ARCHITECTURE.md`](AI_REMEDIATION_ARCHITECTURE.md) | R3 + batch cap note |
| [`src/app/privacy/page.tsx`](src/app/privacy/page.tsx) | R3 remediation paragraph |

## BF–BH. Analytics & claims (158–163)

| Check | Status |
|-------|--------|
| Logging | [`recordRemediationUsage`](src/lib/ai/remediation/recordRemediationUsage.ts) — metadata only | PASS |
| Product claims | No “guaranteed fix” / compliance cert in remediation UI | PASS |

## BW–BZ. Security regression (193–196)

| Area | Status |
|------|--------|
| Website SSRF / security tests | PASS (`test:security`) |
| Image/video/batch existing tests | Unchanged paths |

## CA–CB. Prompt version (197–198)

| Check | Status |
|-------|--------|
| `AI_REMEDIATION_PROMPT_VERSION = 1.1` in fingerprint material | PASS |

## CK. Live OpenAI (210)

| Check | Status |
|-------|--------|
| Paid live API in CI | NOT RUN — policy |

## Gate tests added (R3 audit)

| File | Purpose |
|------|---------|
| [`aiR3ExplicitActionGate.test.ts`](src/lib/ai/remediation/__tests__/aiR3ExplicitActionGate.test.ts) | No auto `fetchAiRemediation` |
| [`aiR3ImageNoVisionGate.test.ts`](src/lib/ai/remediation/__tests__/aiR3ImageNoVisionGate.test.ts) | No vision on remediation path |
| [`aiR3ReportSafetyGate.test.ts`](src/lib/ai/remediation/__tests__/aiR3ReportSafetyGate.test.ts) | Hostile string handling |
| [`batchRemediationGate.test.ts`](src/features/batch/utils/ai/__tests__/batchRemediationGate.test.ts) | Batch caps & fingerprints |
| Extended [`contentAdapters.test.ts`](src/lib/ai/remediation/adapters/__tests__/contentAdapters.test.ts) | Social/video facts |

## Documented limitations (non-blocking)

- Batch **5/run** and **20/session** enforced in batch UI/queue; not a dedicated server-side batch run counter (R1 shared session cap still applies on API).
- Per-instance fingerprint cache and rate limits; no cross-instance in-flight dedup.
- Anonymous `sessionId` is cost/abuse control, not authenticated identity.
- Image alt remediation without prior Phase 2 analysis is allowed as text-only remediation (no second vision call); UI prompts user to analyze image first.
- Live OpenAI eval not executed in CI.
- Layer-2 website scanner production gate unchanged.

## Critical blockers

None — all gate blockers **PASS**.

---

**AI-R3 GATE: PASS**

AI-R4 may now integrate existing AI-assisted remediation into report and export formats without generating new AI calls during export.
