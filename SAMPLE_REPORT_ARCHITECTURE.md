# Public Sample Accessibility Report — Architecture

## Purpose

The route `/sample-accessibility-report` is a **public, indexable marketing and education page** that shows production-quality website preflight output using a **version-controlled fictional fixture**. It does not run Playwright, OpenAI, MongoDB, or the scanner worker, and it does not mutate live scanner session state.

## Fictional identity

- **Organization:** Northstar Community Library — Fictional Demonstration  
- **URLs:** `https://example.com` paths only  
- **Date label:** Static demonstration date from `constants.ts` (not “audited today”)

## Data flow

1. `buildSampleAxePages()` — typed `WebsitePageScanResult[]` (desktop on 8 pages, mobile on 5, mixed violations).  
2. `buildSiteScanIntelligence(completedPages)` — same pipeline as live scans for root causes, fix plan, WCAG matrix, priorities.  
3. `buildSampleAccessibilityReportFixture()` — full `WebsiteScanSessionState` snapshot (manual review, fix statuses, rescan demo, branding).  
4. `validateSampleReportConsistency(fixture)` — pure checks in unit tests (counts, fix-plan IDs, rescan math).

## UI isolation

- `SampleWebsiteScanProvider` wraps `WebsiteScanProvider` with `initialState={fixture.session}` and `sampleMode`.  
- In `sampleMode`, mutating dispatches (scan, fix status, manual review, AI) are no-ops; `INIT_CLIENT` does not replace session.  
- Shared components accept optional `sampleMode`: anchor scroll instead of tab dispatch, hide View on Page / Fix Lab, read-only fix plan and human review.

## Exports

All exports run **in the browser** from the fixture:

| Format | Pipeline | Filename |
|--------|----------|----------|
| PDF | `buildWebsiteScanReport` (optional sample AI appendix via `forceIncludeAiRemediation`) → `exportReportPdf` with `sampleBanner` | `sample-accessibility-report.pdf` |
| Excel | `exportWebsiteWorkbook` | `sample-accessibility-report.xlsx` |
| CSV | `exportWebsiteFindingsCsv` | `sample-accessibility-report.csv` |
| JSON | `exportSampleSessionJson` (sanitized) | `sample-accessibility-report.json` |
| ZIP | `buildSampleEvidencePackageZip` (fictional README; may include sample `ai-remediation.md/json`) | `sample-accessibility-evidence.zip` |

Static fixture includes sample `aiRemediationByGroup` for demonstration only — labeled **Sample AI-Assisted Guidance**; no live OpenAI.

PDF preview uses `ReportHtmlPreview` in a dialog (no server render).

## Scanner CTA

`getWebsiteScannerPublicCta()` (`WEBSITE_SCANNER_PUBLIC_ENABLED`) gates the primary CTA to `/website-accessibility-scanner` vs `/tools` when the public scanner is disabled.

## Maintenance

When report models, intelligence types, or export schemas change:

1. Update `buildSampleAxePages` / fixture assembly if required fields drift.  
2. Run `npm run test:sample-report`.  
3. Regenerate a sample PDF/Excel manually on the page after major export template changes.

## Privacy

No user content, cookies, or server-side storage. JSON export strips worker URLs, tokens, and internal config.
