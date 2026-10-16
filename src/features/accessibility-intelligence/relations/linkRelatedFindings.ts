/** Links automated missing-alt with manual alt-quality review without deduplicating. */
export const RELATED_FINDING_PAIRS: { automatedRuleId: string; manualReviewId: string }[] =
  [
    { automatedRuleId: "image-alt", manualReviewId: "alt-meaning" },
    { automatedRuleId: "link-name", manualReviewId: "link-purpose" },
  ];

export function relatedManualReviewForRule(ruleId: string): string | undefined {
  return RELATED_FINDING_PAIRS.find((p) => p.automatedRuleId === ruleId)
    ?.manualReviewId;
}
