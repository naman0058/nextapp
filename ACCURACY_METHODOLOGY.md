# Accuracy methodology (Strengthening S1)

## Evidence levels

1. **Automated rule detection** — axe-core via Playwright (website scanner); Phase 1 deterministic heuristics (social).
2. **Direct measurement** — WCAG contrast math (Phase 3); not merged with axe `color-contrast` results.
3. **AI-assisted observation** — Optional image/video/website fix guidance; labeled separately; never overrides axe impact or WCAG mapping.
4. **Human evaluation** — Manual checklist, axe incomplete results, contextual alt/link/form review.

## Root-cause grouping

Repeated DOM findings with stable signatures may be grouped as **likely shared implementation patterns**. Grouping is a remediation aid, not proof that all occurrences share identical source code. Confidence is high, medium, or low.

## Remediation priority

Priority (high / medium / low) considers technical impact, repetition, and likely fix reach. **It is not a legal-risk rating.** Axe `impact` is preserved separately.

## WCAG coverage matrix

The matrix distinguishes automated testing, partial automation, and manual review. **No automated violation detected** does not mean full criterion conformance when automation is partial or manual.

## Limitations

- DNS rebinding and network egress require Layer 2 controls (website scanner).
- Partial scans (timeouts, DOM limits, network caps) are labeled incomplete.
- Regression fixtures validate known pass/fail cases; they are not market-wide accuracy proof.

## False-positive philosophy

Do not hide legitimate axe violations. Reduce noise via grouping, representative evidence, and clearer explanations—not silent suppression.

## Multi-page and representative sampling (S3)

Controlled reviews scan up to **25 user-selected** same-origin pages. **Select suggested** picks conservative URL pattern representatives (e.g. one URL per repeated path pattern); static routes like `/about` and `/contact` are not merged with dynamic segments. Suggested pages are a **coverage aid**, not proof that the entire site was tested. Desktop/mobile compare runs sequential viewport scans and labels comparison limits when either side is partial or failed.
