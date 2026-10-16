# OpenAI cost map

Audit date: **2026-10-15**  
Model configuration: [`src/lib/openai/config.ts`](src/lib/openai/config.ts), [`src/features/accessibility/constants/aiLimits.ts`](src/features/accessibility/constants/aiLimits.ts)

| Feature | User trigger | API route | Model config | Requests per action | Payload summary | Retry | Rate limit | Cache / reuse |
|---------|--------------|-----------|--------------|---------------------|-----------------|-------|------------|---------------|
| AI image review | Click "Analyze Image with AI" | `POST /api/accessibility/analyze-image` | `OPENAI_VISION_MODEL`, `OPENAI_IMAGE_DETAIL` | 1 | Resized image + caption + alt + platform | Abort timeout only; no auto-retry loop | 10/min client key (`AI_RATE_LIMIT_*`) | Client fingerprint dedup + cooldown |
| Video transcription | Generate transcript | `POST /api/accessibility/transcribe-video` | `OPENAI_CAPTION_MODEL`, optional diarization model | 1 | Audio from temp blob | Controlled errors | 3/min | None |
| Video visual review | Explicit visual review | `POST /api/accessibility/analyze-video-frames` | Vision model | 1 | Sampled frames + cues context | Same | 5/min | None |
| Website AI remediation (Fix Lab) | Optional **Generate AI-Assisted Remediation** per root cause | `POST /api/accessibility/ai-remediation` | **`OPENAI_REMEDIATION_MODEL` required** | **1** per root cause on cache miss (not per occurrence) | Bounded facts via `buildWebsiteRemediationContext` | App: no retry loop | Shared remediation rate limit | Client session + fingerprint cache |
| Social caption remediation (R3) | **Generate Accessible Revision** after preflight | Same shared route | Same | **1** explicit request | Caption + findings + platform summary | No auto-retry | Shared | Fingerprint includes `social:` prefix |
| Image alt remediation (R3) | **Generate Improved Alt Options** | Same | Same | **1** | Reuses session vision JSON; no second vision call | No auto-retry | Shared | Fingerprint `image:` |
| Contrast guidance (R3) | **Explain & Refine Fix** (optional) | Same | Same | **1** | Measured colors + ratios only | No auto-retry | Shared | Deterministic ratio authoritative |
| Video cue remediation (R3) | **AI caption help** per cue | Same | Same | **1** per cue | Selected cue + neighbor context | No auto-retry | Shared | No full transcript |
| Batch remediation (R3) | **AI remediation (selected)** | Same | Same | **1** per row (≤5/run, ≤20/session) | Row caption/alt + local analysis summary | Queue cancel | Shared + batch caps | Selected ids only |
| ~~Website AI fix guidance~~ | Deprecated AI-R2 | ~~`ai-fix-guidance`~~ | — | — | — | — | — | Returns **410** — use shared route |
| Visual Issue Locator | **View on Page** (explicit) | `POST …/visual-locator-token`, `POST …/visualize-issue` | — | **0 OpenAI** | HMAC token + Playwright screenshot | N/A | Dedicated visual-locator limits | Session blob cache in tab |
| Developer Ticket Generator | **Copy Developer Ticket** | — (client-only) | — | **0 OpenAI** | Deterministic format from scan session | N/A | N/A | Optional inclusion of cached AI guidance only |
| Report open / preview | Generate report preview | — | — | **0** | Reads session only | N/A | N/A | No generation |
| PDF export | Download PDF | — | — | **0** | `@react-pdf/renderer` local | N/A | N/A | Appendix from cache |
| Excel export | Download workbook | — | — | **0** | ExcelJS local | N/A | N/A | Optional AI sheet |
| CSV export (AI) | Download AI remediation CSV | — | — | **0** | Local formatters | N/A | N/A | Formula-safe cells |
| JSON report export | Download report JSON | — | — | **0** | Serialized report model | N/A | N/A | Export-safe `aiRemediation` array |
| Evidence package ZIP | Export ZIP | — | — | **0** | JSZip local | N/A | N/A | Optional `ai-remediation.md/json` |

## Non-OpenAI paid paths

None in application code beyond operator hosting (Vercel, Blob, scanner worker).

## Safeguards verified (S4)

- No `NEXT_PUBLIC_OPENAI` or client-side OpenAI SDK usage found.
- Routes return **503** with plain message when `OPENAI_API_KEY` unset (image, video, AI fix).
- Website scan does **not** call OpenAI unless user requests fix guidance.
- CI tests use mocks; no paid calls in `npm run test`.

## Double-request / Strict Mode

Client patterns: `aiInFlightRef`, disabled buttons, cooldown (`CLIENT_ANALYSIS_COOLDOWN_MS`). Re-audit when touching checker components.
