# AI Remediation — Report & Export Integration (AI-R4)

## Overview

AI-R4 integrates **already-generated**, session-cached AI remediation into professional accessibility reports and exports. Report generation and export **never** call OpenAI.

Flow:

1. User explicitly generates AI remediation in Fix Lab / checker tools.
2. Session stores normalized `AIRemediationReport` (via `AiRemediationEntry` / `WebsiteAiRemediationEntry`).
3. User chooses whether to include selected entries (default **OFF**).
4. Report / PDF / Excel / CSV / JSON / evidence package reuse cached data only.

## Report model (v1.1)

- [`AccessibilityPreflightReport`](src/features/reports/types/reportModel.ts) may include optional `aiRemediationAppendix`.
- Entry shape: [`ReportAiRemediationEntry`](src/features/reports/types/reportAiRemediation.ts) — references `AIRemediationReport` without duplicating internal API payloads.
- Deterministic facts live in `facts` (`ReportAiRemediationFactBlock`); AI prose never overrides rule, WCAG, contrast ratio, pass/fail, timestamps, or batch row data.

## Inclusion policy

- Master control: **Include AI-Assisted Remediation in Report** — default **OFF**.
- Per-entry checkboxes; **Select all existing (non-stale)** / **Select none**.
- Stale website guidance: excluded from bulk select; may be included if explicitly checked (labeled **Stale guidance — Previous scan**).
- Website exports: separate toggle for Excel / evidence ZIP (`includeAiRemediationInExports`).

## Formats

| Format | Behavior |
|--------|----------|
| HTML / print | `AiRemediationAppendixSection` after human review |
| PDF | `PreflightReportDocument` — AI-Assisted Remediation Appendix |
| Excel | Optional **AI Remediation** sheet; all AI strings via `sanitizeSpreadsheetCell` |
| CSV | Optional `*-ai-remediation.csv` (Phase 7 generator) |
| JSON | Top-level `aiRemediation` array (export-safe); no prompts/model/tokens |
| Evidence ZIP | Optional `ai-remediation.md` + `ai-remediation.json` when inclusion on |
| Developer ticket | Optional AI block unchanged; default OFF; same cached report object |

## Shared formatters

Under [`src/lib/ai/remediation/report/`](src/lib/ai/remediation/report/):

- `buildReportAiRemediationAppendix`, collectors per source
- `formatAiRemediationAppendixMarkdown`, Excel/CSV row builders
- `toExportableAiRemediationJson`

## Zero OpenAI on export

Export/report code paths must not import or call `fetchAiRemediation` or `/api/accessibility/ai-remediation`. Verified by `aiR4Export.test.ts` and architecture review.

## Sample report

Static fixture includes sample website AI remediation. Sample PDF/Excel/ZIP use **Sample AI-Assisted Guidance** labels; no live session or OpenAI.

## Known limitations

- AI remediation remains session-scoped (no persistent history).
- Contrast/video entries persist in visual/video session storage for report wiring only.
- Batch caps (5/run, 20/session) remain UI/queue limits — not stated in export claims.
