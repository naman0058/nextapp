import type { ReportContribution } from "@/features/accessibility-workspace/types";

/** Replace contribution with same contributionId or append. */
export function upsertContributionList(
  list: ReportContribution[],
  contribution: ReportContribution,
): ReportContribution[] {
  const idx = list.findIndex((c) => c.contributionId === contribution.contributionId);
  if (idx === -1) return [...list, contribution];
  const copy = [...list];
  copy[idx] = contribution;
  return copy;
}
