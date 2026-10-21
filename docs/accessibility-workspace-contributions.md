# Accessibility workspace & report contributions

DigitalAccessReady uses a **Website Scanner session** as the hub of an **Accessibility Preflight Workspace**. Specialized tools stay usable alone; cross-tool value is **bounded handoff**, **explicit report inclusion**, **stable IDs**, and **clear provenance**.

## Workspace model

- Session: `WebsiteScanSessionState.accessibilityWorkspace`
- Cross-route sync: `sessionStorage` via `handoffStorage.ts` (handoff, pending contributions, snapshot)
- No new server persistence for workspace contributions

## ReportContribution contract

See `src/features/accessibility-workspace/types.ts`. Key fields: `contributionId`, `toolId`, `sourceType`, `scope`, `includedInReport`, `relatedWebsiteFindingIds`, `relatedRuleIds`, optional `remediationDefinitionId` / `version`.

## Upsert policy

Contributions use **stable `contributionId` keys** and **replace** prior rows for the same key (same finding + tool + scope identity). Examples:

| Tool | ID pattern |
|------|------------|
| Contrast | `contrast-{findingId}-{fg}-{bg}` |
| Developer ticket | `dev-ticket-{findingId}` |
| Visual locator | `visual-{findingId}-{evidenceId}-{occurrenceIndex}` |
| Image / alt | `image-alt-{findingId}` |
| Screen Reader Preview | `sr-preview-{findingId}` |
| Video (session media) | `video-review-{findingId}` |

Pending queue merges with upsert before entering scanner state.

## Tool capability matrix (Phase 6B)

| Tool | Contextual handoff | Contribution | Return to finding | Report inclusion | Verification |
|------|-------------------|--------------|-------------------|------------------|--------------|
| Website Scanner | N/A | SUPPORTED (core scan) | N/A | Automatic (scan) | Automated rescan |
| Contrast Checker | SUPPORTED | SUPPORTED | SUPPORTED | Explicit | Measured ratio |
| Image / Alt review | SUPPORTED | SUPPORTED | SUPPORTED | Explicit | Human review only |
| Screen Reader Preview | SUPPORTED | SUPPORTED | SUPPORTED | Explicit | Preview observation only |
| Video Accessibility | SUPPORTED | SUPPORTED | SUPPORTED | Explicit | Session media review only |
| Developer Ticket | N/A (in scanner) | SUPPORTED | N/A | Explicit | Handoff metadata only |
| Visual Issue Locator | N/A (in scanner) | SUPPORTED | N/A | Explicit | Evidence reference only |
| AI-Assisted Remediation | N/A | SUPPORTED | N/A | Explicit (existing panel) | Suggestion only |
| Social Accessibility | NOT APPLICABLE | NOT APPLICABLE | NOT APPLICABLE | NOT APPLICABLE | Standalone social scope |
| Platform Guidance | NOT APPLICABLE | NOT APPLICABLE | NOT APPLICABLE | NOT APPLICABLE | No website WCAG routing in 6B |

**PARTIAL:** Excel/evidence package may not yet list every contribution field; JSON/HTML report workspace block does.

## Explicit inclusion

Specialized results are **not** in `reportWorkspace` until `includedInReport=true`. Generated ticket / visual / AI ≠ included.

## AI policy

`NEXT_PUBLIC_AI_REMEDIATION_ENABLED` is UI-only. API enforces server flags and config.

## Privacy

Handoff uses `sanitizeHandoffContext.ts` (URLs, selectors, alt text). Visual contributions store **metadata only** — not screenshot blobs in JSON. Locator tokens remain signed/expiring; secrets stay server-side.

## Backward compatibility

Missing `accessibilityWorkspace` / `reportWorkspace` on old sessions is tolerated; `INIT_CLIENT` backfills workspace state.

## Platform Guidance (Phase 6B decision)

Generic website WCAG failures are **not** routed to social/platform publishing tools. Platform pages remain standalone publishing guidance.
