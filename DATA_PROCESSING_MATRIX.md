# Data processing matrix

Audit date: **2026-10-15**  
Cross-check: [`src/app/privacy/page.tsx`](src/app/privacy/page.tsx)

| Tool / flow | User data | Local (browser) | App server | Third party | Temporary storage | Persistence |
|-------------|-----------|-----------------|------------|-------------|-------------------|-------------|
| Social caption preflight | Caption, alt, platform | Rules + score heuristics | None | None | sessionStorage (text fields) | Session tab only |
| AI image analysis | Image, caption, alt | Resize before upload | Validates + forwards | OpenAI vision | None intentional | None |
| Contrast checker | Colors / samples | WCAG math | None | None | Optional session | Session |
| Screen reader preview | Caption text | TTS via Web Speech | None | OS/browser TTS | sessionStorage | Session |
| Platform checklists | Selections | Static guidance | None | None | sessionStorage | Session |
| Video upload/transcribe | Video file | Player UI | Blob upload, transcribe route | OpenAI audio | Vercel Blob private | Deleted after job + cron cleanup |
| Video visual review | Sampled frames | Frame capture | analyze-video-frames | OpenAI vision | None intentional | Session cues in browser |
| Batch checker | CSV, ZIP images | Parse + local preflight | AI route only if user selects rows | OpenAI if AI queue used | In-memory session | None server-side |
| Website scanner | Public URL | Session state, exports | Playwright/axe scan, sitemap fetch | None for scan* | None DB | Session only |
| Visual Issue Locator | URL + axe target metadata | Ephemeral object URLs in tab | HMAC token mint, Playwright re-render + viewport screenshot | None | None | Session only; images not stored server-side |
| Developer Ticket Generator | Scan intel + evidence snippets | Ticket text in dialog; optional download | None | None | None | None unless user copies/downloads locally |
| Website AI remediation (Fix Lab) | Bounded root-cause evidence (≤3 snippets; not full page) | `aiRemediationByGroup` session state | `ai-remediation` on explicit user action; `sessionId` + `scanId` | OpenAI `OPENAI_REMEDIATION_MODEL` | Server fingerprint cache per instance | Session tab only |
| Social / image / contrast / video AI remediation (R3) | Caption, alt, colors, cue text, findings | Session remediation state | `POST /api/accessibility/ai-remediation` on explicit click | OpenAI `OPENAI_REMEDIATION_MODEL` | Server fingerprint cache | Session tab only |
| Batch AI remediation (R3) | Selected row text + analysis summaries | Per-row `remediation` on item | Same shared route | OpenAI text | Caps: 5/run, 20/session | Session only |
| AI Remediation Assistant (shared API) | Bounded evidence per adapter | Tool-specific session ids | `POST /api/accessibility/ai-remediation` | OpenAI text | In-memory fingerprint cache | None; no DB |
| Reports / PDF | Aggregated findings | Client render (@react-pdf) | None | None | None | User download |
| Report branding (S3) | Logo, org names | session only | **Not sent** | None | None | Session |
| Scanner worker (remote) | URL, page HTML in worker | N/A | Next.js → worker Bearer auth | None | Ephemeral per scan | Worker logs minimal |
| SEO blog (MongoDB) | Public article text/metadata only | None | Read published posts (RSC) | MongoDB Atlas/host (operator) | N/A | Editorial content in `blog_posts`; no scan/caption/upload data |
| Sample accessibility report | None (static fixture in repo) | None | None | None | N/A | No user data; exports generated client-side from fixture |
| Report / export (AI appendix) | Cached AI remediation only if user selected inclusion | Report model in browser | PDF/Excel/CSV/JSON/ZIP formatters | **None** — export does not contact OpenAI | N/A | Session-only source data |

\*Scan executes on operator-controlled infrastructure; target site receives HTTP requests as any browser would.

## Gaps / actions (S4)

| Item | Status |
|------|--------|
| Privacy page mentions website scanner | Present — verify wording matches server-side scan |
| Third-party retention claims | Documented as application intent only; OpenAI retention per provider policy |
| Analytics / ads | Not integrated; no content in analytics payloads |
