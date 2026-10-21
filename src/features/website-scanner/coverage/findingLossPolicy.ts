import type { RawAxeRuleInventoryItem } from "@/features/website-scanner/coverage/types";

/** Documented filters applied after axe runs — not finding-loss bugs. */
export const DOCUMENTED_POST_AXE_FILTERS = {
  bestPracticeViolationsWhenDisabled:
    "Best-practice-tagged axe violations are omitted from normalized violations when includeBestPractices is false. Incomplete checks for those rules are still preserved.",
  evidenceNodeCap:
    "Per-page and per-rule node evidence caps truncate retained DOM examples; rule rows and totalNodeCount are preserved.",
  passesNotSurfacedAsFailures:
    "Axe passes and inapplicable rules are not promoted to user-facing issue lists (expected).",
  incompleteAsManualReview:
    "Axe incomplete results become normalized findings with status review, not automated failures.",
  bestPracticeExcludedFromUniqueAutomatedRules:
    "Site summary uniqueAutomatedRules excludes best-practice violations by design.",
} as const;

export function rawAutomatedViolationRuleIds(
  inventory: RawAxeRuleInventoryItem[],
  includeBestPractices: boolean,
): string[] {
  const ids = new Set<string>();
  for (const item of inventory) {
    if (item.bucket !== "violations") continue;
    if (item.isBestPractice && !includeBestPractices) continue;
    ids.add(item.ruleId);
  }
  return [...ids].sort();
}

export function expectedDisplayedAutomatedRuleCount(
  inventory: RawAxeRuleInventoryItem[],
  includeBestPractices: boolean,
): number {
  return rawAutomatedViolationRuleIds(inventory, includeBestPractices).length;
}

export function assertNoUndocumentedAutomatedRuleLoss(input: {
  rawInventory: RawAxeRuleInventoryItem[];
  includeBestPractices: boolean;
  displayedUniqueAutomatedRules: number;
}): void {
  const expected = expectedDisplayedAutomatedRuleCount(
    input.rawInventory,
    input.includeBestPractices,
  );
  if (input.displayedUniqueAutomatedRules >= expected) return;

  const msg = [
    "Undocumented automated rule loss:",
    `expected at least ${expected} unique automated rule(s) from raw axe violations,`,
    `but product summary reports ${input.displayedUniqueAutomatedRules}.`,
    "See DOCUMENTED_POST_AXE_FILTERS for allowed reductions.",
  ].join(" ");
  throw new Error(msg);
}
