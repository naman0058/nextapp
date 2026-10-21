# Website scanner — result taxonomy (Phase 2)

## Purpose

Every scanner outcome is classified explicitly for UI, reports, and exports. This is **not** a compliance score and does not inflate finding counts.

## Source classes

| Source | Meaning |
|--------|---------|
| `AXE_WCAG` | axe-core rule tagged for WCAG A/AA run |
| `AXE_BEST_PRACTICE` | axe `best-practice` tag |
| `DETERMINISTIC` | Reserved for future non-axe heuristics |
| `MANUAL` | Dedicated human review checklist (not axe incomplete) |

## Outcome classes

| Outcome | User label | Notes |
|---------|------------|--------|
| `FAIL` | Automated failure | WCAG or best-practice violation |
| `PASS` | Automated check passed | **Not** WCAG compliance |
| `INCOMPLETE` | Needs manual confirmation | **Never** counted as automated failure |
| `NOT_APPLICABLE` | Not applicable to page state | **Not** a pass |
| `REVIEW_REQUIRED` | Human review task | Checklist procedures |

## Canonical model

Built in `buildScanResultModel()` and attached to `SiteScanIntelligence.scanResultModel`:

- **`ledger`** — one row per `(page, viewport, ruleId, axe bucket)`
- **`summary`** — executive counters (single source of truth)

### Counting rules

- **Rules evaluated** — unique `ruleId` values across all axe buckets on all scanned pages/viewports.
- **Failed automated rules** — unique WCAG violation rule ids (excludes best-practice).
- **Affected occurrences** — sum of `totalNodeCount` on WCAG violations (same as remediation totals).
- **Passed automated rules** — unique rule ids with at least one `pass` bucket and **no** WCAG violation anywhere in the scan.
- **Needs manual confirmation** — count of ledger rows with outcome `INCOMPLETE` (overlap with failures allowed).
- **Not applicable rules** — unique rule ids only inapplicable (no WCAG fail/incomplete on that rule).
- **Best-practice observations** — unique best-practice violation rule ids when included.
- **Human review tasks** — open dedicated checklist items (separate from axe incomplete).

One axe rule maps to one primary **product category** (`ruleCategoryMap.ts`). WCAG criteria come from axe tags via `extractWcagCriteria()` — not invented.

### Overlap (violation + incomplete)

Example: `color-contrast` may appear as both **automated failure** and **needs manual confirmation** for different elements. The UI uses separate findings:

- Failure finding — `status: issue`
- Incomplete finding — `status: review`, title prefixed “Needs manual confirmation”

### Best practices disabled

Best-practice violations may appear in the ledger with `filteringReason` and `includedInUserReport: false`. They are **not** shown as pass or N/A.

### Pass vs compliance

Copy standard: *“Passing an automated rule does not establish compliance with the associated WCAG success criterion.”*

## Surfaces

| Surface | Data source |
|---------|-------------|
| Overview counters | `scanResultModel.summary` |
| Issues tab | `normalizedFindings` + status filters |
| Coverage tab | `scanResultModel` ledger groupings |
| Report | `websiteScanTaxonomy` + sectioned findings |
| JSON export | Full session including `siteIntelligence.scanResultModel` |
| Excel executive summary | `scanResultModel.summary` rows |

Consistency check: `assertScanResultConsistency()` (UI counters vs report `websiteScanTaxonomy`).

## Phase 3 executive preflight

`SiteScanIntelligence.executivePreflight` is derived only from `scanResultModel` and scan pages (via `buildExecutivePreflight`). Overview, report preview (`websiteExecutivePreflight`), and exports must not recompute snapshot counters.

## Related docs

- Phase 1 accountability: `docs/scanner-coverage-audit-findings.md`
- Competitor benchmark: `docs/scanner-coverage-benchmark.md`
