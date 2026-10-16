# Competitor UX benchmark (internal)

**Review date:** 2026-10-15  
**Purpose:** Product research only — **not** for public marketing claims.

Competitors: AccessScan (accessiBe), UserWay scanner, AudioEye checker, AccessibilityChecker.org, WAVE (WebAIM).

## Summary table (public information)

| Competitor | Entry | First result | Multi-page | Exports | Monitoring / account | Notes |
|------------|-------|--------------|------------|---------|----------------------|-------|
| WAVE | URL field on wave.webaim.org | Inline overlay report | Single URL free; site-wide paid API | Unknown / Not Verified free PDF | Extension for local pages | Strong education; no certification claim |
| UserWay | userway.org/scanner | Widget-style results | Unknown / Not Verified | Unknown / Not Verified | Paid product ecosystem | **Not Verified** without live test |
| AudioEye | audioeye.com checker | Marketing + scan CTA | Unknown / Not Verified | Unknown / Not Verified | Commercial audit services | **Not Verified** |
| accessibilitychecker.org | URL scan | Issue list | Unknown / Not Verified | Unknown / Not Verified | Unknown | **Not Verified** |
| accessiBe AccessScan | accessibe.com/accessscan | Scan CTA | Unknown / Not Verified | Unknown / Not Verified | Commercial overlay product | **Not Verified** |

## Task steps (§151) — our product (internal baseline)

| Step | Our website scanner (S3) |
|------|--------------------------|
| Enter URL | 1 — URL field |
| Run scan | 2–4 — optional discover + select pages + viewport |
| Top issue | 1 — Overview / Start Here after scan |
| Element / evidence | 1 — Issues / Fix Lab |
| Fix hint | 1 — Fix Lab deterministic + optional AI |
| Export | 2 — Export menu + Report tab |

**Tradeoff:** More setup steps than single-URL scanners; less confusion about scope (selected pages, partial scans).

## WAVE (verified public docs)

- Free online URL + browser extensions (private/local pages).
- Details, Reference, Code, Structure, Order, Contrast panels.
- Explicit: humans required; cannot certify accessibility.
- Subscription API for site-wide monitoring — **not** copied in S4.

## Gap analysis (§285)

### Strengths we already provide

- Social + image + video + website in one suite
- Root-cause grouping, fix plan, Fix Lab, human review wizard
- WCAG 2.2 coverage matrix (transparent automation limits)
- Multi-page **selected** review (25 cap), sitemap/crawl discovery
- Desktop/mobile compare (capped), evidence ZIP, session privacy

### Areas competitors handle differently

- Browser extensions / intranet scanning (WAVE) — **intentionally not implemented**
- Continuous monitoring — **not in scope**
- Overlay widgets — **explicit non-goal**

### Features intentionally not implemented

Accounts, monitoring DB, auto-remediation, VPAT, certification claims, unlimited crawl.

### Ideas for future validation (not S4)

Extension for staging sites; durable scan history — deferred.
