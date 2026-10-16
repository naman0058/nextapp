# Platform guidance (Phase 5)

## Supported platforms

- Instagram
- Facebook
- LinkedIn
- X

## Source of truth

Platform capabilities, limits, help steps, and FAQs live in:

`src/features/accessibility/config/platformAccessibility/`

**Do not** embed changing platform facts in React components. Update the relevant platform config file when official documentation changes.

## Last review

Configuration review date: **2026-10-08** (`guidanceVersion: 2026.10`).

Platform UIs change frequently. End users may see: “Platform guidance reviewed: October 2026.”

## Verified vs best practice

- **Verified where stated:** X image description documented limit of **1,000 characters** (centralized in config; not a recommended target length).
- **No invented limits** for Instagram, Facebook, or LinkedIn alt-text maximums (`null` in config).
- **General accessibility best practice** (emoji repetition, hashtag capitalization, fancy Unicode, contrast) remains shared Phase 1–4 logic—not duplicated per platform.

## What this tool does not do

- No social login or API integration
- No auto-publishing
- No legal or WCAG/ADA certification
- No video upload or caption analysis (Phase 6)

## Updating config

1. Confirm facts against current official help documentation.
2. Edit the platform module (`instagram.ts`, `facebook.ts`, `linkedin.ts`, `x.ts`).
3. Update `lastReviewed` and `guidanceVersion` if material changes.
4. Run unit tests under `utils/platform/__tests__/`.
