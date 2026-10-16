import { describe, expect, it } from "vitest";
import {
  computeRemediationPriority,
  scoreToPriority,
} from "@/features/accessibility-intelligence/priority/remediationPriority";

describe("remediationPriority", () => {
  it("ranks shared serious multi-page issue above minor isolated", () => {
    const shared = computeRemediationPriority({
      impact: "serious",
      occurrenceCount: 20,
      affectedPageCount: 10,
      likelySharedComponent: true,
      sharedConfidence: "high",
      humanReviewRequired: false,
    });
    const isolated = computeRemediationPriority({
      impact: "minor",
      occurrenceCount: 1,
      affectedPageCount: 1,
      likelySharedComponent: false,
      sharedConfidence: "low",
      humanReviewRequired: false,
    });
    expect(scoreToPriority(50)).toBe("high");
    expect(shared.priority).toBe("high");
    expect(isolated.priority).not.toBe("high");
  });

  it("does not mention legal risk in reason", () => {
    const { reasonForPriority } = computeRemediationPriority({
      impact: "critical",
      occurrenceCount: 5,
      affectedPageCount: 3,
      likelySharedComponent: true,
      sharedConfidence: "medium",
      humanReviewRequired: false,
    });
    expect(reasonForPriority).toContain("not a legal-risk rating");
    expect(reasonForPriority.toLowerCase()).not.toMatch(/\blegal risk\b/);
  });
});
