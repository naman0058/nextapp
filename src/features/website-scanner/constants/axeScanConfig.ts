/** WCAG A/AA tags supported by current axe-core; verify after upgrades. */
export const AXE_WCAG_TAG_SET = [
  "wcag2a",
  "wcag2aa",
  "wcag21a",
  "wcag21aa",
  "wcag22aa",
] as const;

export const AXE_BEST_PRACTICE_TAG = "best-practice";

/** Rules that may be off by default in axe — enable explicitly when applicable. */
export const AXE_EXPLICIT_RULE_IDS: string[] = ["target-size"];

export function buildAxeRunTags(includeBestPractices: boolean): string[] {
  const tags: string[] = [...AXE_WCAG_TAG_SET];
  if (includeBestPractices) {
    tags.push(AXE_BEST_PRACTICE_TAG);
  }
  return tags;
}

export type AxeRunProfileSummary = {
  tags: string[];
  includeBestPractices: boolean;
  explicitRuleIds: string[];
  wcagLevels: string[];
};

/** Documented axe run profile for coverage audits and docs. */
export function describeAxeRunProfile(
  includeBestPractices: boolean,
): AxeRunProfileSummary {
  return {
    tags: buildAxeRunTags(includeBestPractices),
    includeBestPractices,
    explicitRuleIds: [...AXE_EXPLICIT_RULE_IDS],
    wcagLevels: ["WCAG 2.0/2.1/2.2 Level A and AA (via axe tag sets)"],
  };
}
