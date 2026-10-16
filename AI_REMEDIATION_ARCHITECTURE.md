# AI Remediation Assistant — architecture (AI-R1)

Foundation for **explicit-action**, server-only remediation guidance via OpenAI **Responses API** with **strict JSON Schema** structured outputs. **AI-R2:** Website Fix Lab. **AI-R3:** Social, image/alt, contrast, video, and selected batch rows via shared adapters + [`AIRemediationPanel`](src/lib/ai/remediation/components/AIRemediationPanel.tsx).

## Flow

1. Website Fix Lab (and future tools) send `POST /api/accessibility/ai-remediation` with bounded `facts` and optional `sessionId` / `scanId`.
2. Route validates body (rejects `model`, `systemPrompt`, etc.), enforces payload size, rate limit, session/scan caps.
3. Fingerprint + in-memory session cache: duplicate requests within TTL return cached report without OpenAI.
4. `generateRemediation` calls `client.responses.create` with centralized developer instructions + delimited user payload.
5. Refusal output → stable `AI_REMEDIATION_REFUSED`; malformed JSON → `AI_REMEDIATION_INVALID_OUTPUT`.
6. Response: `{ report, promptVersion, schemaVersion, generatedAt, facts, cached? }` — never raw SDK payload.

## Code layout

| Area | Path |
|------|------|
| Types, schema, validation | [`src/lib/ai/remediation/`](src/lib/ai/remediation/) |
| API | [`src/app/api/accessibility/ai-remediation/route.ts`](src/app/api/accessibility/ai-remediation/route.ts) |
| OpenAI config | [`src/lib/openai/config.ts`](src/lib/openai/config.ts) |
| Rate limit | [`getAiRemediationRateLimiter`](src/lib/rateLimit/bestEffortMemoryLimiter.ts) |
| Tool context adapters | [`src/lib/ai/remediation/adapters/`](src/lib/ai/remediation/adapters/) |
| Shared UI panel | [`AIRemediationPanel.tsx`](src/lib/ai/remediation/components/AIRemediationPanel.tsx) |
| UI copy | [`remediationDisclosure.ts`](src/lib/ai/remediation/remediationDisclosure.ts) |

## Safety

- Evidence in user payload is **untrusted data** (delimiter blocks; not merged into system text).
- No web search, tools, or auto-apply/deploy.
- No MongoDB or localStorage persistence for remediation reports.
- No background prefetch on scan load.
- Deterministic scanner/social findings are **not** modified by this pipeline.
- Privacy-safe usage logging only (`recordRemediationUsage`).

## Relationship to Fix Lab (AI-R2 complete)

Website Fix Lab uses the shared remediation API and `OPENAI_REMEDIATION_MODEL`. Legacy [`ai-fix-guidance`](src/app/api/accessibility/website/ai-fix-guidance/route.ts) returns **410** — no OpenAI.

## Existing Website AI Guidance → AI-R2 Migration (completed)

**Decision (AI-R1 gate):** AI-R2 will **replace** Fix Lab’s direct calls to `ai-fix-guidance` with:

1. `buildWebsiteRemediationContext()` (bounded evidence, no full HTML page),
2. `POST /api/accessibility/ai-remediation` (shared schema, prompts, limits, cache),
3. UI that displays `AIRemediationReport` + unchanged deterministic facts.

Then **deprecate and remove** `/api/accessibility/website/ai-fix-guidance` to avoid two prompts, two schemas, and duplicate OpenAI cost for the same Fix Lab action.

**AI-R2 status:** Legacy `ai-fix-guidance` returns **410 Gone**. Fix Lab calls `POST /api/accessibility/ai-remediation` only.

**Operational requirements:** `OPENAI_API_KEY`, `AI_REMEDIATION_ENABLED=1`, and non-empty `OPENAI_REMEDIATION_MODEL` (structured-output-capable model). Missing remediation model → `503` / `AI_REMEDIATION_UNAVAILABLE`; core app still builds and runs.

**Instance-local controls:** fingerprint cache, rate limits, and session/scan caps use in-memory state per runtime instance (not global across serverless instances).

## AI-R3 — Content & media (complete)

| Tool | Adapter | UI | Session |
|------|---------|-----|---------|
| Social | `buildSocialRemediationContext` | `SocialAiRemediationSection` | `useAiRemediationSession` + fingerprint `scanId` |
| Image / alt | `buildImageRemediationContext` | `ImageAiRemediationSection` | Reuses Phase 2 vision evidence only |
| Contrast | `buildContrastRemediationContext` | `ContrastAiRemediationSection` | Measured ratio authoritative |
| Video | `buildVideoRemediationContext` | `VideoCueAiRemediationSection` per cue | No full video/transcript |
| Batch | `buildBatchRemediationContext` | Selected rows; caps in `batchLimits` | `BatchState.sessionId` |

Stale rules: content revision changes mark cached reports stale; batch remediation queue reuses Phase 8 concurrency (`BATCH_AI_CONCURRENCY`).

Batch **5/run** and **20/session** caps are enforced in the batch UI/queue ([`planBatchRemediationRun`](src/features/batch/utils/ai/planBatchRemediationRun.ts)); the shared API still applies R1 session/scan caps server-side (not a separate batch-only server counter).

## AI-R4 — Reports & exports (complete)

Cached remediation flows into optional **AI-Assisted Remediation Appendix** on Phase 7 and website reports. Inclusion default **OFF**; shared formatters under `src/lib/ai/remediation/report/`. PDF, Excel, CSV, JSON, and evidence ZIP reuse session data — **zero OpenAI** on export. See [AI_REMEDIATION_REPORT_EXPORTS.md](./AI_REMEDIATION_REPORT_EXPORTS.md).
