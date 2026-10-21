import type { SiteScanIntelligence } from "@/features/accessibility-intelligence/types/siteIntelligence";

/** Prefer stable findingId from findingDetails; match page when provided. */
export function resolveFindingIdForRule(
  intel: SiteScanIntelligence | null | undefined,
  ruleId: string,
  pageUrl?: string,
): string | undefined {
  if (!intel?.findingDetails?.length) return undefined;
  const scoped = intel.findingDetails.find(
    (d) =>
      d.ruleId === ruleId &&
      (!pageUrl ||
        d.affectedUrls.includes(pageUrl) ||
        d.pageViewportScopes.some((s) => s.pageUrl === pageUrl)),
  );
  if (scoped) return scoped.findingId;
  return intel.findingDetails.find((d) => d.ruleId === ruleId)?.findingId;
}
