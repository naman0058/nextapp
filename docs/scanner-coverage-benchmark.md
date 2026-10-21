# Website Scanner — coverage benchmark (Phase 1)

This document maps **competitor-reported finding categories** to what **DigitalAccessReady** can support with **axe-core 4.13** (via `@axe-core/playwright`), documented heuristics, or human review — without claiming count parity with other vendors.

## Axe run profile (current product)

| Setting | Value |
|--------|--------|
| Engine | axe-core **4.13.x** (`@axe-core/playwright`) |
| Tags (WCAG mode) | `wcag2a`, `wcag2aa`, `wcag21a`, `wcag21aa`, `wcag22aa` |
| Best practices | Optional (`best-practice` tag when **Include best practices** is on) |
| Explicit rule enable | `target-size` (WCAG 2.2 AA) |
| Rule filtering | **After** axe runs — best-practice violations dropped when toggle off |
| Page readiness | `domcontentloaded` → **1.5s settle** → bounded lazy scroll → metadata → axe |
| Frames | Same-origin page only; cross-origin iframes may be partial |
| Evidence caps | 20 nodes/rule, 200 nodes/page (counts preserved) |

Approximate rules in scope: **~70** WCAG-tagged rules; **~100** with best-practice tag enabled (axe-core 4.13 inventory).

Implementation reference: `src/features/website-scanner/constants/axeScanConfig.ts`, `server/playwright/pageScan.ts`.

## Coverage accountability instrumentation

When `WEBSITE_SCANNER_COVERAGE_AUDIT=1`, `captureCoverageAudit: true`, or `NODE_ENV=test`, each page scan attaches `coverageAudit` on `WebsitePageScanResult`:

- **rawInventory** — every axe rule in violations / incomplete / passes / inapplicable
- **ruleLedger** — disposition per rule (preserved, filtered, lost)
- **undocumentedLosses** — must stay empty in CI

Trace helpers: `src/features/website-scanner/coverage/`.

Run FileMakr live inventory:

```bash
set FILEMAKR_COVERAGE_AUDIT=1
npx vitest run src/features/website-scanner/coverage/__tests__/filemakrCoverageAudit.integration.test.ts
```

## Benchmark finding matrix

Classification key:

- **A** — axe automated WCAG rule (in default WCAG tag run)
- **B** — axe best-practice rule (toggle)
- **C** — safe deterministic local heuristic (not implemented unless listed)
- **D** — human review / axe incomplete / checklist
- **E** — vendor-specific / not in axe 4.13

| Competitor theme | Typical axe rule(s) | Class | In product when |
|-----------------|---------------------|-------|-----------------|
| Text color contrast | `color-contrast` | **A** | Always (WCAG tags) |
| Non-text contrast (UI components) | *(no dedicated rule in axe 4.13)* | **E** | Not automated; manual / future heuristic |
| Image alternative text | `image-alt`, `object-alt`, `svg-img-alt`, … | **A** | WCAG tags |
| Link accessible name | `link-name`, `area-alt` | **A** | WCAG tags |
| Button / control name | `button-name`, `input-button-name` | **A** | WCAG tags |
| Form labels | `label`, `form-field-multiple-labels` | **A** | WCAG tags |
| Skip / bypass blocks | `bypass` | **A** | WCAG tags |
| Landmark structure | `landmark-one-main`, `region`, `skip-link` | **B** | Best-practice toggle |
| Heading structure | `heading-order`, `empty-heading`, `page-has-heading-one` | **B** | Best-practice toggle |
| ARIA roles / attributes | `aria-*` family (e.g. `aria-allowed-attr`) | **A** / **B** | WCAG vs best-practice per rule tags |
| Semantic emphasis | `p-as-heading` (experimental) | **A** | WCAG 2.x tag where tagged |
| Focus obscured (sticky UI) | *(no `focus-not-obscured` in axe 4.13)* | **E** | Manual / vendor tools |
| New window without warning | *(no `target-new-window` in axe 4.13)* | **E** | Manual checklist; not fabricated as WCAG fail |
| Target size (touch) | `target-size` | **A** | Explicitly enabled (WCAG 2.2 AA tag) |
| Page language | `html-has-lang`, `html-lang-valid`, `valid-lang` | **A** | WCAG tags |
| Viewport / zoom | `meta-viewport`, `meta-viewport-large` | **A** / **B** | WCAG vs best-practice |
| Document title | `document-title` | **A** | WCAG tags |
| Identical links purpose | `identical-links-same-purpose` | **E** | **AAA** tag — **not** in current tag set |
| Duplicate / sticky nav patterns | Often **B** or **E** | **B**/**E** | Depends on vendor |

## Documented post-axe filters (not bugs)

See `DOCUMENTED_POST_AXE_FILTERS` in `src/features/website-scanner/coverage/findingLossPolicy.ts`:

1. Best-practice violations omitted when toggle off (incomplete for same rule still kept).
2. Evidence node caps truncate examples, not rule rows or `totalNodeCount`.
3. Passes / inapplicable are not shown as failures.
4. Incomplete → normalized **review** findings (manual confirmation).
5. `uniqueAutomatedRules` excludes best-practice violations.

## Deterministic HTML fixtures

Under `test-fixtures/website-scanner/coverage/` — exercised by integration tests when `WEBSITE_SCANNER_INTEGRATION=1`:

| Fixture | Expected rule |
|---------|----------------|
| `color-contrast-fail.html` | `color-contrast` |
| `image-alt-fail.html` | `image-alt` |
| `link-name-fail.html` | `link-name` |
| `label-fail.html` | `label` |
| `aria-allowed-attr-fail.html` | `aria-allowed-attr` |
| `html-has-lang-fail.html` | `html-has-lang` |
| `bypass-fail.html` | `bypass` |
| `landmark-one-main-fail.html` | `landmark-one-main` (BP on) |
| `heading-order-fail.html` | `heading-order` (BP on) |
| `target-blank-advisory.html` | *(no WCAG violation — advisory only)* |

Pipeline regression: `src/features/website-scanner/coverage/__tests__/findingLossRegression.test.ts` — five raw WCAG violations must not collapse to one displayed rule.

## Why FileMakr may show one primary automated rule

**Verified 2026-03-21** (`FILEMAKR_COVERAGE_AUDIT=1`, best practices on): raw axe **violations** = `color-contrast` only; **incomplete** = `aria-prohibited-attr`, `color-contrast`; `undocumentedLosses` = empty.

So the live “one rule” UI reflects **axe output**, not product filtering.

Additional competitor gaps are still explained by:

1. **Not failing in axe** — Alt, link names, landmarks, etc. may **pass** on this DOM after settle even when other vendors flag heuristically.
2. **Incomplete vs violation** — e.g. `aria-prohibited-attr` surfaces under **manual confirmation**, not automated issue count.
3. **Not in tag set** — AAA rules (e.g. link purpose) are excluded from the WCAG tag run.
4. **Not in axe 4.13** — Non-text contrast, focus obscured, new-window warnings (**E**).
5. **Evidence cap** — 81 contrast occurrences with 20 examples retained does **not** remove other rule types (none were in raw violations).

## Manual-only product surfaces

- Axe **incomplete** → Issues / Human review (“Needs manual confirmation”).
- `WEBSITE_MANUAL_REVIEW_ITEMS` checklist (not axe violations).
- WCAG matrix **manual** criteria rows.

## Unsupported / do not automate as WCAG failures

- Proprietary competitor totals.
- Non-text contrast (until a supported engine rule or vetted heuristic exists).
- New-window advisory without a documented axe rule.
- Category **E** items must remain **manual or future scope**, not synthetic violations.
