# AI-R1 Final Foundation Gate Audit

Audit date: **2026-10-16**  
Scope: Shared server-only AI Remediation foundation (`src/lib/ai/remediation/`, `POST /api/accessibility/ai-remediation`). **No AI-R2 UI.**

## Executive summary

| Gate | Result |
|------|--------|
| **AI-R1 GATE** | **PASS** |

Critical requirements met after gate fixes: strict Structured Outputs, incomplete/refusal handling, explicit remediation model, request allowlist, bounded context, no client OpenAI, no background calls, fact preservation, migration plan for legacy Fix Lab route.

## Verification runs

| Command | Result |
|---------|--------|
| `npm run test:ai-remediation` | PASS (27 tests) |
| `npm run lint` | PASS |
| `npm run typecheck` | PASS |
| `npm run test:security` | PASS (56 tests, 7 skipped) |
| `npm run test:blog` | PASS (11 tests) |
| `npm run build` | PASS |

## Checklist (representative)

| # | Check | Implementation evidence | Test | Status | Notes |
|---|--------|-------------------------|------|--------|-------|
| 1 | Responses API | `client.responses.create` in [`generateRemediation.ts`](src/lib/ai/remediation/generateRemediation.ts) | Mock client call | PASS | Official OpenAI SDK |
| 2 | Strict Structured Outputs | `text.format: { type: "json_schema", strict: true }` | Implicit in generate test | PASS | Not prompt-only JSON |
| 3 | Schema fields | [`aiRemediationJsonSchema.ts`](src/lib/ai/remediation/aiRemediationJsonSchema.ts) + [`validateAiRemediationReport.ts`](src/lib/ai/remediation/validateAiRemediationReport.ts) | validate tests | PASS | `additionalProperties: false` |
| 4 | Remediation model | `isRemediationModelConfigured()`; no TEXT model fallback | unavailable without env | PASS | 503 when unset |
| 5 | Refusal | [`detectResponseRefusal.ts`](src/lib/ai/remediation/detectResponseRefusal.ts) → `AI_REMEDIATION_REFUSED` | refusal test | PASS | Before JSON parse |
| 6 | Incomplete | `response.status !== "completed"` → `AI_REMEDIATION_INVALID_OUTPUT` | incomplete test | PASS | No partial parse |
| 7 | Failed/cancelled | Same branch → `AI_REMEDIATION_FAILED` | incomplete vs failed codes | PASS | Distinct from refusal |
| 8 | No raw SDK response | [`route.ts`](src/app/api/accessibility/ai-remediation/route.ts) returns normalized JSON | Code review | PASS | |
| 9 | Client request schema | Allowlist in [`validateRemediationRequest.ts`](src/lib/ai/remediation/validateRemediationRequest.ts) | unknown field test | PASS | |
| 10 | No tools | No tools/web_search in `responses.create` body | Code review | PASS | |
| 11 | Server-only | `server-only` on generator; no client imports | Grep | PASS | |
| 12 | API key exposure | No `NEXT_PUBLIC_OPENAI`; key in server config only | Repo search | PASS | |
| 13–14 | Prompt / data separation | [`systemInstructions.ts`](src/lib/ai/remediation/systemInstructions.ts), [`buildRemediationUserPayload.ts`](src/lib/ai/remediation/buildRemediationUserPayload.ts) | injection delimiter test | PASS | |
| 15–16 | Context limits | [`sanitizeRemediationFacts.ts`](src/lib/ai/remediation/sanitizeRemediationFacts.ts), `MAX_REMEDIATION_REQUEST_BYTES` | oversized facts test | PASS | Not full page by design |
| 17–18 | Output limits | Post-validate string/code line caps | validate tests | PASS | |
| 19 | Rate limit | [`checkAiRemediationRateLimit`](src/lib/rateLimit/checkAiRemediationRateLimit.ts) | Code review | PASS | **LIMITATION:** per instance |
| 20–21 | Session/scan caps | [`checkRemediationSessionCaps.ts`](src/lib/ai/remediation/checkRemediationSessionCaps.ts) | session cap test | PASS | Requires sessionId/scanId from client |
| 22 | Duplicate guard | Fingerprint cache | cache hit test | **LIMITATION** | No cross-instance lock; parallel identical requests may double-bill |
| 23 | Fingerprint | source, versions, framework, model, facts, guidance | fingerprint tests | PASS | |
| 24 | Session cache | TTL 45m, in-memory Map | cache test | **LIMITATION** | Per runtime instance |
| 25 | Distributed reality | Documented in architecture | N/A | LIMITATION | Honest per-instance semantics |
| 26 | Timeout | `AbortSignal.timeout(getRemediationTimeoutMs())` | timeout test | PASS | |
| 27–28 | Retries / cost | App: no retry loop; SDK default retries possible | Doc in cost map | PASS | **Normal success: 1** OpenAI call on cache miss |
| 29–30 | No background / UI | No client callers of route | Grep | PASS | |
| 31–33 | Logging / errors | [`recordRemediationUsage.ts`](src/lib/ai/remediation/recordRemediationUsage.ts), [`userMessageForCode`](src/lib/ai/remediation/errors.ts) | Code review | PASS | |
| 34–35 | XSS / Markdown | Strings only; no R1 UI rendering | XSS string test | N/A | R2 must escape on render |
| 36–37 | Deterministic facts | API returns request `facts` unchanged | runRemediationRequest test | PASS | Report text ≠ authoritative facts |
| 38 | Compliance claims | Prompt forbids; limitations required in schema | Prompt review | PASS | UI boundary in R2 |
| 39–49 | Injection, cache, source | Expanded vitest | PASS | | |
| 50 | Model in cache key | Fingerprint includes model | fingerprint test | PASS | |
| 51–52 | Prompt/schema version | Constants in fingerprint material | Code review | PASS | Bump constants to invalidate |
| 53–55 | Legacy ai-fix-guidance | Separate until AI-R2 | Architecture doc | PASS | **Replace + deprecate** plan documented |
| 56 | Adapter stubs | Throw not implemented | Code review | PASS | |
| 57 | Disclosure copy | [`remediationDisclosure.ts`](src/lib/ai/remediation/remediationDisclosure.ts) | Code review | PASS | Bounded evidence, not full page |
| 58–60 | Matrices / env | OPENAI_COST_MAP, DATA_PROCESSING_MATRIX, `.env.example` | Doc review | PASS | |
| 61 | Feature flag / build | Missing model → 503; build succeeds | build | PASS | |

## Gate fixes applied (AI-R1 only)

1. **Incomplete/non-completed Responses** — reject before parsing `output_text`.
2. **Explicit `OPENAI_REMEDIATION_MODEL`** — required for availability; included in fingerprint.
3. **Request body allowlist** — reject unknown top-level fields.
4. **Cache before session cap** — cached repeats allowed when at cap.
5. **Stricter facts size enforcement** — reject when context still exceeds cap after sanitization.

## Documented limitations (non-blocking)

- Rate limits, session cache, and caps are **in-memory per runtime instance** (not global on serverless).
- **No in-flight deduplication** for simultaneous identical POSTs across or within instance.
- Live OpenAI not called in CI (mocked only).
- Scan/session caps apply only when clients send `sessionId` / `scanId` (website wiring in AI-R2).
- OpenAI Node SDK may perform **limited automatic retries** on transient errors (shared client); application does not add remediation retry loops.

## Final gate

**AI-R1 GATE: PASS**

AI-R2 may now be implemented using the shared remediation foundation.
