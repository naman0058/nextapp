import { HUMAN_REVIEW_REGISTRY_V1 } from "@/features/human-review-workspace/registry/v1";
import { humanReviewChecksForIncompleteRule } from "@/features/human-review-workspace/incompleteRuleMapping";

export function relatedHumanReviewCheckIdsForRule(
  ruleId: string,
  options?: { includeIncompleteMapping?: boolean },
): string[] {
  const ids = new Set<string>();
  for (const def of HUMAN_REVIEW_REGISTRY_V1) {
    if (def.relatedAutomatedRuleIds.includes(ruleId)) ids.add(def.id);
  }
  if (options?.includeIncompleteMapping) {
    for (const checkId of humanReviewChecksForIncompleteRule(ruleId)) {
      ids.add(checkId);
    }
  }
  return [...ids];
}
