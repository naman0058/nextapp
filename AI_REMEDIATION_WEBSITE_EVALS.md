# AI Remediation — Website eval criteria (AI-R2)

Controlled qualities for website root-cause remediation (mocked in CI; live evals optional with operator API key).

## Rule fixture set

Evaluated in `buildWebsiteRemediationContext.test.ts` for:

button-name, link-name, image-alt, label, select-name, frame-title, html-has-lang, document-title, color-contrast, aria-valid-attr, aria-required-attr, aria-roles, landmark-one-main, region, list, listitem.

## Expected qualities (each generation)

| Criterion | Verification |
|-----------|--------------|
| Problem understanding | Report `problemSummary` references rule/evidence context |
| No source fact mutation | API `facts.impact`, counts, WCAG remain client-supplied; UI badges use `facts` not report alone |
| Semantic HTML first | Prompt + schema; manual review of suggested code in eval runs |
| Framework match | User-selected framework in request; fingerprint changes on framework change |
| Acceptance criteria | Non-empty `acceptanceCriteria` array |
| Verification / rescan | Steps mention automated rescan or manual check |
| No compliance claim | `limitations` present; no “WCAG compliant” as product status |
| Contrast | Model must not recalculate authoritative ratio when `foregroundBackgroundContrast.authoritative` |
| Image alt | No invented alt when `imageContextAvailable` is false |
| Document-level | `documentLevelIssue` facts for title/lang rules |
| Human review | Incomplete/review findings set `humanReviewRequired` in facts |

## Cost model

One OpenAI request per root-cause group per framework/evidence fingerprint, not per occurrence.
