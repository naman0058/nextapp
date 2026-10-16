import { describe, expect, it } from "vitest";
import {
  filterNormalizedFindings,
  groupFindingsByRule,
  DEFAULT_ISSUES_FILTER,
} from "@/features/website-scanner/utils/issuesListUtils";
import type { NormalizedAccessibilityFinding } from "@/features/accessibility-intelligence/types/normalizedFinding";

function finding(
  ruleId: string,
  pageUrl: string,
): NormalizedAccessibilityFinding {
  return {
    id: `${pageUrl}-${ruleId}`,
    sourceType: "axe",
    category: "website_automation",
    title: ruleId,
    status: "issue",
    impact: "serious",
    priority: "high",
    confidence: "high",
    description: "d",
    pageUrl,
    ruleId,
    humanReviewRequired: false,
    evidence: [],
  };
}

describe("issues list grouping", () => {
  it("filters by search query", () => {
    const list = [
      finding("button-name", "https://a.test/"),
      finding("image-alt", "https://b.test/"),
    ];
    const filtered = filterNormalizedFindings(list, {
      ...DEFAULT_ISSUES_FILTER,
      search: "button",
    });
    expect(filtered).toHaveLength(1);
    expect(filtered[0].ruleId).toBe("button-name");
  });

  it("groups by rule", () => {
    const groups = groupFindingsByRule([
      finding("a", "https://x/"),
      finding("a", "https://y/"),
      finding("b", "https://x/"),
    ]);
    expect(groups).toHaveLength(2);
    expect(groups.find((g) => g.ruleId === "a")?.findings).toHaveLength(2);
  });
});
