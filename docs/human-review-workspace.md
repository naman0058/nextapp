# Human Review Workspace (Phase 7)

Structured human review for website scans: auditable procedures, explicit scope, and report export—without conflating human judgment with automated axe results, deterministic fixes, specialized tool measurements, or AI suggestions.

## HumanReviewRecord

Canonical session model (`src/features/human-review-workspace/types.ts`):

- Stable `reviewId` and versioned `checkDefinitionId` / `checkDefinitionVersion`
- Procedure copy, applicability, scope, related finding/rule/contribution IDs
- Status: `not_reviewed` | `passes` | `needs_review` | `not_applicable`
- Optional notes (sanitized), evidence references, `reviewedAt` / `updatedAt`
- `provenance: "human_review"` and `reportInclusion`

Records live on `accessibilityWorkspace.humanReviewRecords` and sync with legacy `manualReview` via `ensureHumanReviewRecords` / `SET_MANUAL_REVIEW`.

## Check registry

Versioned definitions in `registry/v1.ts`, migrated from `WEBSITE_MANUAL_REVIEW_ITEMS` plus `video-captions`. UI and reports read procedures from the registry—not duplicated strings in components.

## Applicability

`applicability.ts` scores each check using merged page metadata:

- `relevant` | `possibly_relevant` | `not_applicable` | `unknown`
- UI queue defaults to relevant + possibly relevant; “Show all registry checks” exposes the full set with honest labels.

Absence of a feature does not force N/A unless the heuristic is reliable (e.g. no forms → form-errors N/A).

## Axe incomplete vs human review

- **Axe incomplete** = automation could not conclude the rule.
- **Human review** = structured procedure with an explicit reviewer decision.

`incompleteRuleMapping.ts` links uncertainty to optional procedures (e.g. `aria-prohibited-attr` → screen-reader). Incomplete rows never become human PASS/FAIL automatically.

## Evidence and specialized tools

Contributions link by tool ID and finding ID (`linkContributions.ts`). Image/Alt, Contrast, Screen Reader Preview, Video, and Visual Locator evidence can appear as references; they do **not** auto-complete a human check unless the reviewer chooses a status.

## Scope

Default site scope for multi-page scans includes a representative-review label when multiple URLs are selected. Per-page/per-viewport records are reserved for later phases; desktop keyboard review does not imply mobile touch-target review.

## Progress and overview

`buildHumanReviewProgress` drives:

- Human Review tab header
- Overview strip (`HumanReviewOverviewStrip`)
- Executive open count via `syncSessionHumanReview` → `humanReviewTasks`

Progress is workflow completion (“3 of 8 reviewed”), not a compliance percentage.

## Report and export

- `buildHumanReviewReportBlock` → `AccessibilityPreflightReport.humanReviewWorkspace`
- HTML preview section with non-certification disclaimer
- Excel: **Human Review** and **Contributions** sheets in `exportWebsiteWorkbook.ts`

Wording uses “Human review result”, “Reviewer marked this procedure as passes”, “Needs further review”, “Not reviewed”, “Not applicable to the reviewed scope”. `NOT_REVIEWED` is never exported as FAIL; `PASSES` is never WCAG certification.

## FindingDetail linkage

`relatedHumanReviewCheckIds` on each finding; Issues explorer opens the Human Review tab via `OPEN_HUMAN_REVIEW_CHECK`. Human Review cards link back with `FOCUS_FINDING`.

## Legacy migration

Sessions with only `manualReview[]` backfill into `HumanReviewRecord` on first sync (`migrateLegacyManualReview`). Existing statuses and notes are preserved.

## Accessibility UX

Native radios for status, labelled notes, live region on save, semantic headings and ordered procedure lists, no color-only status, keyboard-operable filters.

## Browser E2E (Phase 6B case M)

No dedicated Playwright navigation suite is checked in. **Manual acceptance:** Scanner → Finding → specialized tool → contribution → return → same workspace/finding → contribution merged once (desktop and narrow viewport).

## Non-certification

Human review records reviewer judgments for listed procedures only. Completion copy: “All currently identified human-review procedures have been reviewed” plus explicit disclaimer that this is not accessibility certification.
