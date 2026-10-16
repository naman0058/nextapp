# Website scanner — Result UX methodology

## S2 — Remediation workflow

S2 turns S1 scan intelligence into a remediation workflow: prioritize fixes, understand root causes, apply deterministic guidance, optionally use grouped AI, complete human review, verify with rescan, and export client-ready reports.

### Tabs

| Tab | Role |
|-----|------|
| Overview | Summary cards (no 0–100 score), scan completeness alert, Start Here (top fix plan items), root-cause and WCAG summaries; desktop vs mobile comparison when compare mode was used |
| Issues | Root-cause / rule / page grouping; simple (default), developer, and standard explanation levels; viewport filter in compare mode |
| Fix plan | Priority-ordered tasks, fix status, Fix Lab, copy fix plan, rescan-to-verify CTA |
| Human review | Relevant checks from manual review library; optional full checklist |
| Page inventory | Sortable list of scanned URLs, viewports, completeness — no page score |
| Report | Preflight report with optional developer fix appendix; local client branding (session-only) |

### Fix workflow status

User status (`not_started`, `in_review`, `user_marked_fixed`) is never auto-upgraded on page load. After a rescan with a saved snapshot, display status may show **Verified by Rescan**, **Partially Improved**, or **Still Present** via fingerprint and occurrence heuristics.

### Fix Lab

Deterministic templates from `ruleKnowledge` are primary (**Recommended Fix**, **Possible Implementation Pattern**). Optional **Generate AI-Assisted Remediation** calls `POST /api/accessibility/ai-remediation` once per root-cause group (not per occurrence), with bounded evidence from `buildWebsiteRemediationContext`, `sessionId`, and `scanRevision`-based `scanId`. Results live in `aiRemediationByGroup`; rescan marks entries stale. Legacy `ai-fix-guidance` is deprecated (410).

### Visual Issue Locator

**View on Page** (secondary to **View Fix**) opens an accessible modal with an on-demand viewport screenshot: the server re-renders the public URL, resolves the axe target, draws a non-interactive overlay, and returns WebP/PNG (`Cache-Control: no-store`). Document-level rules and missing element targets hide the control. Occurrence prev/next and desktop/mobile toggle apply when the scan session includes that evidence. Screenshots are not taken during the initial scan and are not included in exports in v1.

### Developer Ticket Generator

**Copy Developer Ticket** (secondary in Fix Lab / Fix plan) turns root-cause scan evidence into a bounded Markdown or plain-text handoff: problem, impact, scope, representative selectors/snippets, deterministic Fix Lab guidance, acceptance criteria, and verification steps. Generation is local (no API); optional inclusion of already-generated AI Fix Lab guidance only. Workflow: scan → understand → copy ticket → implement → rescan to verify. Visual Locator answers *where*; Fix Lab answers *how*; the developer ticket answers *what to send to engineering*.

## S3 — Controlled reviews & enterprise-style exports

### Setup (before results)

1. Choose scan source: current URL, sitemap (auto or manual same-origin URL), or lightweight crawl discovery.
2. Review discovered URLs in a selection table (hard cap **25** pages).
3. Optional **Select suggested** fills representative URLs from conservative URL pattern groups — suggestions are not a guarantee of full-site coverage.
4. Choose viewport: desktop, mobile, or **compare** (sequential desktop then mobile per URL, max **10** pages in compare mode).
5. **Run Accessibility Scan** — no auto-scan on crawl/sitemap discovery.

### Scan scope transparency

Results show a **Scan scope** banner: discovered vs selected vs completed counts, partial/stop state, and workload disclosure (e.g. 10 pages × 2 viewports = 20 evaluations). Mobile viewport uses emulated dimensions — not a substitute for real device or assistive technology testing.

### Exports (client-side)

PDF (Report tab), Excel workbook, CSV (findings, page inventory, root causes), JSON session export, and evidence ZIP (bundled deliverables + README). Query strings are stripped from URLs in exports by default. Branding fields and logos stay in the browser session — never sent to AI or stored server-side.

### Non-goals (S4+)

Accounts, monitoring, auth-only scans, CMS plugins, auto-remediation, unlimited crawl, gzip sitemaps (unless fully safe), certification claims.
