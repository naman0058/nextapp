/** Maps axe incomplete rules to related human review check IDs (not auto pass/fail). */
const INCOMPLETE_TO_CHECKS: Record<string, string[]> = {
  "aria-prohibited-attr": ["screen-reader"],
  "link-in-text-block": ["link-purpose"],
  "color-contrast": ["screen-reader"],
};

export function humanReviewChecksForIncompleteRule(ruleId: string): string[] {
  return INCOMPLETE_TO_CHECKS[ruleId] ?? [];
}

export function enrichDefinitionIncompleteLinks(
  defId: string,
  incompleteRuleIds: string[],
): string[] {
  return incompleteRuleIds.filter((ruleId) =>
    (INCOMPLETE_TO_CHECKS[ruleId] ?? []).includes(defId),
  );
}
