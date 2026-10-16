# AdSense Readiness

Status: **Prepared, not integrated** — no AdSense script, publisher ID, or live ads (S4 2026-10-15: still not installed per command scope).

## Content available for review

- Homepage with live tool workflow
- Social media accessibility checker (generic + four platform pages)
- Image contrast checker
- Screen reader experience preview
- Video accessibility checker (Phase 6)
- Website accessibility scanner (Phase 9)
- Methodology (`/methodology`)
- Privacy, terms, disclaimer, accessibility statement
- About and contact

## Trust and legal pages

All linked from the site footer. Automated guidance disclaimers appear near meaningful results in the checker.

## Future safe ad placement zones

| Zone | Description |
|------|-------------|
| A | Below page introduction on educational/tool pages |
| B | Between educational content sections (not inside forms) |
| C | After complete result workflow (below copy/reset actions) |
| D | Desktop sidebar only where spacing is ample |

## Prohibited / unsafe placements

- Inside upload control or between Analyze and results
- Inside video upload, transcription progress, caption editor, SRT/VTT download, or visual review controls (Phase 6)
- Inside the Accessibility Preflight Report preview panel or export action row (Phase 7)
- Inside `/sample-accessibility-report` body, export controls, or fictional issue demo (sample page is education-first)
- Inside batch results table or adjacent to Run AI / export / delete (Phase 8)
- Between URL input and Scan button, inside website finding cards, next to Copy selector / AI fix / Rescan (Phase 9)
- Adjacent to Copy, Download, Apply Fix, Reset, or Continue
- Inside platform checklist rows
- Sticky mobile units covering navigation or primary CTAs
- Fake placeholder ad boxes before approval

## Component hook

`src/components/ads/AdSlot.tsx` renders nothing until an ad network is explicitly configured later.

## After integration checklist

- Test mobile layouts at 320–430px widths
- Update Content-Security-Policy for Google ad/analytics domains
- Confirm no caption, alt text, image, or AI output is sent to ad or analytics payloads
- Re-run keyboard and focus order checks around new ad iframes

## Reminders

- AdSense approval is not guaranteed
- Do not use click incentives or content locking behind ads
- Do not publish unsupported CPC/RPM claims
