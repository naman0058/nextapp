import type { FixPlanItem } from "@/features/accessibility-intelligence/types/siteIntelligence";
import type { RootCauseGroup } from "@/features/accessibility-intelligence/types/siteIntelligence";
import { computeRemediationPriority } from "@/features/accessibility-intelligence/priority/remediationPriority";
import { getVerificationStepsForRule } from "@/features/accessibility-intelligence/knowledge/ruleKnowledge";
import type { SiteRuleAggregate } from "@/features/website-scanner/types/scanTypes";

export function buildFixPlan(
  groups: RootCauseGroup[],
  ruleAggregates: SiteRuleAggregate[],
): FixPlanItem[] {
  const items: FixPlanItem[] = [];
  const ruleImpact = new Map(ruleAggregates.map((r) => [r.ruleId, r.impact]));

  for (const group of groups) {
    const impact = ruleImpact.get(group.ruleId) ?? "unknown";
    const { priority, reasonForPriority } = computeRemediationPriority({
      impact,
      occurrenceCount: group.totalOccurrences,
      affectedPageCount: group.remediationReach.pages,
      likelySharedComponent: group.likelySharedComponent,
      sharedConfidence: group.confidence,
      humanReviewRequired: false,
    });
    items.push({
      rank: 0,
      rootCauseGroupId: group.id,
      title: group.label,
      priority,
      impact,
      affectedPages: group.remediationReach.pages,
      affectedElements: group.remediationReach.occurrences,
      likelySharedFix: group.likelySharedComponent,
      reasonForPriority,
      estimatedReachLabel: group.likelySharedComponent
        ? `Fix once may improve ${group.remediationReach.occurrences} occurrences across ${group.remediationReach.pages} pages`
        : `${group.remediationReach.occurrences} occurrence(s) on ${group.remediationReach.pages} page(s)`,
      verificationSteps: getVerificationStepsForRule(group.ruleId),
      ruleId: group.ruleId,
    });
  }

  items.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });
  items.forEach((item, i) => {
    item.rank = i + 1;
  });
  return items.slice(0, 15);
}
