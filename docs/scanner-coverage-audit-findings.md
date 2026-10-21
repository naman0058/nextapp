# Phase 1 coverage audit — findings summary

**Date:** 2026-03-21  
**Scope:** Website Scanner pipeline (axe → normalize → intelligence → report)  
**Live URL reference:** https://www.filemakr.com/ (inventory via optional integration test)

## Task 1 — Raw axe vs product

| Stage | Module | Loss allowed? |
|-------|--------|----------------|
| A. Raw axe | `@axe-core/playwright` `analyze()` | — |
| B. Normalized | `normalizeAxeResults.ts` | Best-practice violations when toggle off only |
| C. Remediation groups | `groupRootCauses.ts` | Consolidates **occurrences**, not **rule ids** |
| D. User report | `buildWebsiteScanReport.ts` | Incomplete → review section; BP → best practices section |

**Instrumentation:** `PageScanCoverageAudit` on scan results (test / `WEBSITE_SCANNER_COVERAGE_AUDIT=1`).  
**Regression:** `findingLossRegression.test.ts` — five raw WCAG violations must yield five `uniqueAutomatedRules`.

**Finding-loss bugs found in audit:** None in the normalization → intelligence path for multi-rule raw input. Prior bug (82 vs 20 **occurrence** display) was presentation/grouping, not rule drop.

## Task 2 — Axe configuration

- **WCAG levels:** A + AA via tag union (2.0, 2.1, 2.2 AA tag included).
- **Excluded:** Rules outside those tags (e.g. **WCAG AAA** such as `identical-links-same-purpose`, `color-contrast-enhanced`).
- **Best practice:** Separate tag; mixed in axe output but split in product via `isBestPractice`.
- **iframes / shadow DOM:** Default axe + Playwright behavior; warning when `iframeCount > 0`.
- **Readiness:** `domcontentloaded` + 1.5s settle + bounded scroll; not unbounded network idle.
- **Filtering:** Only post-axe in `normalizeAxeResults` (BP toggle).

## Task 3 — Competitor benchmark

See **`docs/scanner-coverage-benchmark.md`** for the full A/B/C/D/E matrix.

## Task 4 — Page-state parity (FileMakr)

Live run (2026-03-21, desktop viewport, best practices **on**, production scanner profile):

| Metric | Value |
|--------|--------|
| `rawViolationRuleIds` | **`color-contrast` only** |
| `rawIncompleteRuleIds` | `aria-prohibited-attr`, `color-contrast` |
| `productUniqueAutomatedRules` | **1** (matches raw WCAG violations) |
| `undocumentedLosses` | **[]** (no pipeline loss) |
| Page execution | Complete (no timeout / DOM cap) |
| Evidence reporting | 81 occurrences, 20 examples retained |

**Conclusion:** The product is not collapsing competitor categories into one rule. **Axe-core on this loaded page state only reports one automated violation.** Competitor themes (landmarks, skip link, alt text, link names, non-text contrast, new-window warnings, etc.) are either **passing**, **inapplicable**, **incomplete**, **best-practice-only on pages that pass**, or **vendor heuristics (E)** — not missing from our normalization layer.

**Phase 2:** FileMakr semantics are surfaced via `scanResultModel` (Overview, Coverage tab, report `websiteScanTaxonomy`). See `docs/scanner-result-taxonomy.md`.

Re-run inventory:

```bash
set FILEMAKR_COVERAGE_AUDIT=1
npx vitest run src/features/website-scanner/coverage/__tests__/filemakrCoverageAudit.integration.test.ts
```

## Task 5 — Fixtures

Added under `test-fixtures/website-scanner/coverage/`; integration tests in `coverageFixtures.integration.test.ts`.

## Task 6 — Finding loss test

`findingLossRegression.test.ts` + policy in `findingLossPolicy.ts`.

## Task 7 — Inventory

| Bucket | Count (axe 4.13) | Product surface |
|--------|------------------|-----------------|
| WCAG-tagged rules in run | ~70 | Violations / incomplete / passes (counts only) |
| + Best practice tag | ~100 | BP toggle |
| Explicit enable | `target-size` | Same as WCAG run |
| Deterministic extensions | 0 new in Phase 1 | Fixtures prove axe path only |
| Manual-only | Incomplete + checklist | Human review tab |
| Unsupported (E) | Non-text contrast, focus obscured, new-window warning, many vendor checks | Documented only |

## Recommended follow-ups (out of Phase 1 scope)

1. Run FileMakr audit in CI nightly with secret/network allowance and store JSON artifact.
2. Product copy when **one WCAG rule dominates** — link to benchmark doc and BP toggle.
3. Evaluate **AAA** or additional tags only with explicit product policy (not for count parity).
