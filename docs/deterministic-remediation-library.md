# Deterministic remediation library

## Purpose

Single canonical registry for **deterministic remediation guidance** (Phase 5). One definition feeds Fix Lab, Developer Ticket, AI bounded context, and report appendix entries—not duplicate copy in UI components.

## Schema

See `DeterministicRemediationDefinition` in `src/features/website-scanner/remediation/types.ts`:

- `ruleId`, `definitionVersion`, `title`, `shortProblem`, `whyItMatters`
- `wcagMappings`, `remediationSteps`, `verificationSteps` (each tagged `automated` | `manual` | `both`)
- `examples` per framework (`html`, `react`, `vue`, `angular`)
- `specializedTool`, `developerAcceptanceCriteria`, optional `limitations` / `requiresHumanJudgment`

Library version: `REMEDIATION_LIBRARY_VERSION` (currently `1`).

## Supported rules

Priority A and B rule packs live under:

- `remediation/definitions/priorityA.ts`
- `remediation/definitions/priorityB.ts`

Lookup: `getDeterministicRemediation(ruleId)`.

## Policies

### Native HTML first

Prefer `<button>`, `<label>`, landmarks, headings, and lists over redundant ARIA.

### Framework examples

Short, idiomatic samples marked **example only—not automatic patches**. Omitted when a safe generic pattern does not exist.

### Deterministic vs AI

- **Deterministic:** registry + scan evidence (sanitized).
- **AI-assisted:** explicit user action only; `NEXT_PUBLIC_AI_REMEDIATION_ENABLED` gates UI; bounded facts per existing AI remediation architecture.

### Verification semantics

Rescan comparison uses **“No longer detected in this automated rescan”**—not “fixed” or “compliant.”

### Fallback

Unsupported rules: axe help, evidence, generic verification, Developer Ticket, optional AI when configured.

## Specialized tool routing

`remediationActionRouter.ts` maps rules to contrast checker, image/alt tools, screen reader preview, video checker, visual locator, and developer ticket actions.

## Exports

JSON/report exports may reference `definitionVersion` and library version; full step text included when report appendix requires self-contained content.
