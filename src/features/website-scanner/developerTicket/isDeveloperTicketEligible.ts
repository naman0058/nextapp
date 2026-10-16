import type { RootCauseGroup } from "@/features/accessibility-intelligence/types/siteIntelligence";
import type { NormalizedAccessibilityFinding } from "@/features/accessibility-intelligence/types/normalizedFinding";

export function isDeveloperTicketEligibleForRootCause(
  group: RootCauseGroup | undefined,
): boolean {
  if (!group) return false;
  if (group.totalOccurrences <= 0 && group.affectedPages.length === 0) return false;
  return true;
}

export function isDeveloperTicketEligibleForFinding(
  finding: NormalizedAccessibilityFinding | undefined,
): boolean {
  if (!finding) return false;
  if (finding.status === "pass" || finding.status === "not_applicable") return false;
  if (finding.status === "review" && finding.humanReviewRequired) return true;
  if (finding.status === "issue") return true;
  return finding.status === "review";
}
