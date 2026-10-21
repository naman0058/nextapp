# Enterprise Accessibility Preflight Report (Phase 8)

Phase 8 introduces a **canonical enterprise view model** (`EnterprisePreflightReport`) attached to website scan reports as `AccessibilityPreflightReport.enterpriseView`. HTML preview, PDF, JSON, and Excel consume the same counters and section semantics—adapters must not recompute taxonomy or human-review totals independently.

## Canonical model

Built by `buildEnterprisePreflightReport()` from:

- Session + completed pages
- Phase 3 `websiteExecutivePreflight`
- Phase 2 taxonomy (`websiteScanTaxonomy`)
- Phase 4 `findingDetails`
- Phase 7 `humanReviewWorkspace`
- Phase 6B `reportWorkspace` (contributions with `includedInReport`)

Key fields: `reportMeta`, `scope`, `executiveSummary`, `coverage`, `affectedAreas`, `priorities`, `automatedFindings`, `incompleteFindings`, `bestPracticeFindings`, `humanReview`, `additionalEvidence`, `pageInventory`, `verification`, `methodology`, `exportSelection`, `counters`.

Schema version: `ENTERPRISE_REPORT_SCHEMA_VERSION` (`8.0`).

## Section order (HTML & PDF)

1. Executive summary (non-certifying status phrase + short note)
2. Scope strip
3. Automated preflight snapshot
4. Coverage & confidence (four diagnostic rows)
5. Top remediation priorities (≤5 unique)
6. Affected areas
7. WCAG coverage summary (counts only, with disclaimer)
8. Automated findings (bounded evidence)
9. Needs manual confirmation
10. Best-practice observations (if any)
11. Human review (Phase 7)
12. Additional review evidence (included contributions only)
13. Verification / rescan (when snapshot exists)
14. Page inventory
15. Methodology (website-scoped, dynamic)
16. Technical appendix (PDF page 3)

## Export inclusion policy

`buildExportSelectionPolicy()`:

- Core scanner + human review: always in report state
- Contributions: only `includedInReport === true`
- AI remediation: generated **and** user-selected for report/export
- Developer fix appendix: optional session flag

## Evidence limits

- Main PDF/HTML finding body: up to **5** representative evidence rows per finding (`ENTERPRISE_PDF_MAIN_EVIDENCE_LIMIT`)
- Copy must distinguish **total occurrences**, **retained evidence**, and **shown in report**

## Filenames

`buildWebsiteReportFilename()`:

- `digitalaccessready-{host}-preflight-{date}.pdf|json`
- `digitalaccessready-{host}-evidence-{date}.xlsx`

Same `reportId` across preview, PDF, JSON, and workbook executive sheet.

## Validation

`validateEnterpriseReportConsistency()` checks taxonomy ↔ enterprise counters, human review totals, contribution inclusion counts, evidence bounds, duplicate finding IDs, and banned executive phrases (no compliance %, scores, certification language).

## Non-certification

Executive status uses Phase 3 phrases such as “Important automated findings identified” or “No automated WCAG failures in scanned state”. Zero-finding reports still require human review. Disclaimers state the report is not legal advice or accessibility certification.

## PDF accessibility note

PDFs are readable client documents via `@react-pdf/renderer`; they are **not** fully tagged PDF/UA. See `PDF_UA_NOTE` in exports.

## Manual acceptance (E2E)

No dedicated browser E2E for full report flow. Manual check: scan → human review decision → include contribution → generate preview → PDF/JSON/Excel → verify matching failed-rule and occurrence counts.

## Phase 9 prerequisites

- Richer remediation plan blocks in PDF (deterministic steps + single framework example)
- Tagged PDF/UA if product requires certified export format
- Full report-flow Playwright E2E when infra is available
