# User flow audit (personas)

Audit date: **2026-10-15**  
Method: Code-path review + tool page structure ([`src/config/toolPages.ts`](src/config/toolPages.ts)); live browser walkthrough **Not verified** in this session.

## Persona A — Small business owner

| Task | Route | Friction | Fix / status |
|------|-------|----------|--------------|
| Understand tool | `/social-media-accessibility-checker` | Eyebrow + title state purpose; checker below fold on some viewports | Tool-first layout already on flagship; **PASSED** |
| Get top issue | Results dashboard | Readiness score is **local heuristic**, not compliance | Score labeled "readiness"; disclaimers on tool pages **PASSED** |
| Copy fixed caption | Final working caption field | Present in checker flow | **PASSED** |

## Persona B — Frontend developer

| Task | Route | Friction | Fix / status |
|------|-------|----------|--------------|
| Find selector + rule | Website → Issues / Fix Lab | S2 grouping + developer explanation level | **PASSED** |
| WCAG mapping | Issues cards + methodology | WCAG matrix in intel | **PASSED** |

## Persona C — Accessibility professional

| Task | Route | Friction | Fix / status |
|------|-------|----------|--------------|
| Automation boundary | `/methodology`, scan scope banner | Methodology page + S3 scope banner | **PASSED** |
| Manual gaps | Human review tab | Relevance filtering | **PASSED** |

## Persona D — Agency / freelancer

| Task | Route | Friction | Fix / status |
|------|-------|----------|--------------|
| Select pages + export | Website S3 setup → Export menu | Setup steps add clicks vs single-URL competitors | Intentional for control; **PASSED** |
| Brand PDF | Report tab branding panel | Session-only | **PASSED** |

## Persona E — Social media manager

| Task | Route | Friction | Fix / status |
|------|-------|----------|--------------|
| Platform-specific tips | Platform tool pages | Many nav chips in ToolSwitcherNav | Acceptable; link to `/tools` hub **MEDIUM** clutter only |

## Persona F — Public-sector content team

| Task | Route | Friction | Fix / status |
|------|-------|----------|--------------|
| Document review | Report + batch CSV export | Batch uses local readiness score — label clearly | **PASSED** with disclaimer |

## 5-second comprehension (§6)

| Page | What / input / output clear? |
|------|------------------------------|
| Website scanner | Yes — URL + setup wizard disclosed in S3 |
| Video checker | Yes — upload CTA |
| Batch | Yes — import CTA |
| Methodology | Educational — not a tool page **PASSED** |
