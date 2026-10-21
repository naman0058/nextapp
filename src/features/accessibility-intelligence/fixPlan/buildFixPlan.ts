import type { FixPlanItem } from "@/features/accessibility-intelligence/types/siteIntelligence";
import type { RootCauseGroup } from "@/features/accessibility-intelligence/types/siteIntelligence";
import { remediationGroupKey } from "@/features/accessibility-intelligence/grouping/groupRootCauses";
import { formatRetainedEvidenceNote } from "@/features/website-scanner/utils/occurrenceCounts";
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
      estimatedReachLabel: (() => {
        const base = group.likelySharedComponent
          ? `Fix once may improve ${group.remediationReach.occurrences} affected occurrences across ${group.remediationReach.pages} pages`
          : `${group.remediationReach.occurrences} affected occurrence(s) on ${group.remediationReach.pages} page(s)`;
        const retainedNote = formatRetainedEvidenceNote(
          group.retainedEvidenceCount,
          group.totalOccurrences,
        );
        return retainedNote ? `${base} · ${retainedNote}` : base;
      })(),
      verificationSteps: getVerificationStepsForRule(group.ruleId),
      ruleId: group.ruleId,
    });
  }

  const deduped: FixPlanItem[] = [];
  const seenKeys = new Set<string>();
  for (const item of items) {
    const group = groups.find((g) => g.id === item.rootCauseGroupId);
    const key = group
      ? remediationGroupKey(group)
      : `${item.ruleId ?? item.title}::${item.rootCauseGroupId ?? "none"}`;
    if (seenKeys.has(key)) continue;
    seenKeys.add(key);
    deduped.push(item);
  }

  deduped.sort((a, b) => {
    const order = { high: 0, medium: 1, low: 2 };
    return order[a.priority] - order[b.priority];
  });
  deduped.forEach((item, i) => {
    item.rank = i + 1;
  });
  return deduped.slice(0, 15);
}
