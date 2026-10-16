import { describe, expect, it } from "vitest";
import type { FixPlanItem } from "@/features/accessibility-intelligence/types/siteIntelligence";
import { getStartHereItems } from "@/features/website-scanner/utils/issueViewModels";

const item = (rank: number): FixPlanItem => ({
  rank,
  title: `Task ${rank}`,
  priority: "medium",
  impact: "serious",
  affectedPages: 1,
  affectedElements: 1,
  likelySharedFix: false,
  reasonForPriority: "test",
  estimatedReachLabel: "1 page",
  verificationSteps: [],
});

describe("getStartHereItems", () => {
  it("returns top 5 by rank order", () => {
    const plan = [item(3), item(1), item(2), item(4), item(5), item(6)];
    const top = getStartHereItems(plan);
    expect(top.map((t) => t.rank)).toEqual([1, 2, 3, 4, 5]);
  });
});
