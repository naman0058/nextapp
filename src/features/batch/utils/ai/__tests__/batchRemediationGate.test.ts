import { describe, expect, it } from "vitest";
import { planBatchRemediationRun } from "@/features/batch/utils/ai/planBatchRemediationRun";
import { buildBatchRemediationContext } from "@/lib/ai/remediation/adapters/buildBatchRemediationContext";
import type { PreflightAnalysisResult } from "@/features/accessibility/types/preflight";
import type { BatchAccessibilityItem } from "@/features/batch/types/batchItem";

const baseResults: PreflightAnalysisResult = {
  checks: [],
  score: 80,
  scoreBandLabel: "Good",
  counts: { pass: 10, review: 0, fail: 0, not_checked: 0 },
};

function stubItem(id: string): BatchAccessibilityItem {
  return {
    id,
    sourceRow: 1,
    platform: "instagram",
    platformSource: "csv",
    caption: "Summer sale starts today.",
    altText: "",
    altTextSource: "none",
    image: null,
    validation: { severity: "valid", messages: [], canAnalyze: true },
    localAnalysis: {
      phase1: baseResults,
      screenReaderSummary: {
        level: "clear",
        label: "Clear",
        noiseSourceCount: 0,
        repeatedEmojis: false,
        fancyUnicode: false,
        excessHashtags: false,
        duplicateCaptionAlt: false,
        genericLinkLanguage: false,
      },
      noiseCount: 0,
      platformChecklist: [],
      issueCount: 0,
      captionIssueCount: 0,
      humanReviewCount: 0,
    },
    ai: { status: "not_run", analysis: null, fingerprint: null },
    remediation: {
      status: "not_run",
      target: "caption",
      report: null,
      fingerprint: null,
    },
    visualStatus: { contrast: "not_checked" },
    humanReviewItems: [],
    rowReview: {
      altTextVerified: false,
      imageTextVerified: false,
      platformPublishingReviewed: false,
    },
    overallStatus: "Needs Review",
    processingState: "local_complete",
    importWarnings: [],
  };
}

describe("batch remediation gate", () => {
  it("caps run at 5 when 6 items selected", () => {
    const items = Array.from({ length: 6 }, (_, i) => stubItem(`row-${i}`));
    const plan = planBatchRemediationRun(
      items,
      items.map((i) => i.id),
      0,
      "caption",
    );
    expect(plan.cappedCount).toBe(5);
    expect(plan.eligibleIds.length).toBe(5);
  });

  it("blocks when session remediation count reaches 20", () => {
    const items = [stubItem("row-1")];
    const plan = planBatchRemediationRun(items, ["row-1"], 20, "caption");
    expect(plan.cappedCount).toBe(0);
    expect(plan.error).toMatch(/20/);
  });

  it("uses different fingerprints for caption vs alt on same row", () => {
    const local = stubItem("row-1").localAnalysis!;
    const caption = buildBatchRemediationContext({
      batchItemId: "row-1",
      platform: "instagram",
      originalCaption: "Summer sale starts today.",
      altText: "",
      localAnalysis: local,
      remediationTarget: "caption",
    });
    const alt = buildBatchRemediationContext({
      batchItemId: "row-1",
      platform: "instagram",
      originalCaption: "Summer sale starts today.",
      altText: "",
      localAnalysis: local,
      remediationTarget: "alt",
    });
    expect(caption.facts.issueFingerprint).not.toBe(alt.facts.issueFingerprint);
  });
});
