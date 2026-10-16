# Product capability matrix

Audit date: **2026-10-15**  
Scope: Phases 1–9 + Strengthening S1–S3 (no accounts, no monitoring DB)

Legend: **Available** = shipped in repo; **Verified test** = automated or documented manual run in S4.

| Capability | Available | Free | Processing | Human review | Report | Mobile UI | Known limitation | Verified test |
|------------|-----------|------|------------|--------------|--------|-----------|------------------|---------------|
| Social caption review (Phase 1) | Yes | Yes | Browser local | Optional | Yes | Yes | Heuristic, not WCAG cert | Unit: preflight, hashtag |
| Image alt text checks (local) | Yes | Yes | Browser local | Yes | Yes | Yes | No pixel OCR | Unit: preflight |
| AI image review (Phase 2) | Yes | Yes* | App server + OpenAI | Required | Yes | Yes | Needs `OPENAI_API_KEY` | Schema validation tests |
| Contrast measurement (Phase 3) | Yes | Yes | Browser local | — | Yes | Yes | Sample-based | Unit: contrast formula |
| Screen reader preview (Phase 4) | Yes | Yes | Browser/OS TTS | — | Partial | Yes | Approximation only | Unit: preview text |
| Platform guidance (Phase 5) | Yes | Yes | Static docs | Yes | Yes | Yes | Not affiliated with platforms | Unit: checklist |
| Video transcription (Phase 6) | Yes | Yes* | Server + Blob + OpenAI | Required | Yes | Yes | Duration/size caps | Parse request tests |
| Timed captions / SRT / VTT | Yes | Yes | Browser session | Required | Yes | Yes | — | Caption export tests |
| Video visual AI review | Yes | Yes* | Server + OpenAI | Required | Yes | Yes | Sampled frames only | Route guards |
| Accessibility preflight reports (Phase 7) | Yes | Yes | Browser PDF/print | Yes | Yes | Yes | Not tagged PDF/UA | buildReport tests |
| Batch social review (Phase 8) | Yes | Yes | Browser local; AI optional | Yes | CSV/XLSX | Yes | Row/image caps | batchCsv tests |
| Website single-page scan | Yes | Yes | Server Playwright + axe | Yes | Yes | Yes | Public URLs only | Integration + SSRF |
| 25-page selected site scan (S3) | Yes | Yes | Client-orchestrated POSTs | Yes | Yes | Yes | Not full-site proof | Batch registry tests |
| Sitemap discovery (S3) | Yes | Yes | Server fetch/parse | — | — | Yes | No `.gz`; same-origin locs | sitemap.parse tests |
| Crawl discovery (S3) | Yes | Yes | Server Playwright BFS | — | — | Yes | Discovery only | Manual S4 |
| Root cause grouping (S1) | Yes | Yes | Server/client intel | — | Yes | Yes | Conservative merge | groupRootCauses tests |
| Fix plan / Start Here (S2) | Yes | Yes | Deterministic | — | Yes | Yes | Not legal priority | startHere tests |
| Fix Lab + AI remediation (R2) | Yes | Yes* | Templates + optional shared `ai-remediation` | Yes | Yes | Yes | Root-cause only; `OPENAI_REMEDIATION_MODEL` | buildWebsiteRemediationContext + deprecated route tests |
| AI remediation in reports/exports (R4) | Yes | Yes | Cached appendix only; user inclusion default OFF | Yes | PDF/Excel/CSV/JSON/ZIP | Yes | Zero OpenAI on export; deterministic facts preserved | aiR4Export tests |
| Visual Issue Locator | Yes | Yes | Server Playwright screenshot on demand | — | — | Yes | No scan-time capture; not in ZIP v1 | visualLocator.token tests |
| Developer remediation ticket | Yes | Yes | Browser/local format only | — | — | Yes | Copy/download only; no PM integration | developerTicket.test.ts |
| Human review wizard | Yes | Yes | Static library + relevance | Required | Yes | Yes | Not every WCAG manual test | Manual S4 |
| Desktop viewport scan | Yes | Yes | Playwright 1440×900 | — | Yes | N/A | Emulated | Default scan |
| Mobile viewport scan | Yes | Yes | Playwright 390×844 | — | Yes | N/A | Not real device AT | Viewport config |
| Desktop/mobile comparison (S3) | Yes | Yes | Sequential scans | — | Yes | Yes | Max 10 pages compare | compareViewport tests |
| Excel export (S3) | Yes | Yes | Browser dynamic import | — | Yes | Yes | Not full 10-sheet enterprise spec | Manual S4 |
| PDF export (report tab) | Yes | Yes | Client render | — | Yes | Yes | Print/CSS | Manual S4 |
| CSV / JSON exports | Yes | Yes | Browser | — | — | Yes | Query stripped default | Manual S4 |
| Evidence ZIP (S3) | Yes | Yes | Browser JSZip | — | Yes | Yes | No raw HTML in ZIP | Manual S4 |
| Client report branding (S3) | Yes | Yes | Session only | — | PDF | Yes | Never sent to server | Manual S4 |
| Rescan comparison | Yes | Yes | Session snapshots | — | Banner | Yes | Heuristic verify | fixWorkflow tests |
| Public sample website report | Yes | Yes | Browser fixture only | Yes | PDF/XLSX/CSV/JSON/ZIP | Yes | Fictional data; read-only UI | test:sample-report |
| WCAG 2.2 A/AA coverage matrix (S1) | Yes | Yes | Catalog + axe map | Yes | Yes | Yes | Manual criteria remain | wcagCoverage tests |
| WCAG/ADA legal certification | **No** | — | — | — | — | — | Disclaimer only | Legal audit PASSED |
| Accounts / saved history | **No** | — | — | — | — | — | By design | N/A |
| Monitoring / scheduled scans | **No** | — | — | — | — | — | By design | N/A |

\*Free to use; operator pays OpenAI/hosting costs.
