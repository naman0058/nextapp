import { describe, expect, it } from "vitest";
import type { BatchAccessibilityItem } from "@/features/batch/types/batchItem";
import { computeImageImportCounts } from "@/features/batch/utils/images/matchImagesToRows";

function stubItem(partial: Partial<BatchAccessibilityItem>): BatchAccessibilityItem {
  return {
    id: "1",
    sourceRow: 2,
    platform: "instagram",
    platformSource: "csv",
    caption: "c",
    altText: "",
    altTextSource: "none",
    image: null,
    validation: { severity: "valid", messages: [], canAnalyze: true },
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
    overallStatus: "Incomplete",
    processingState: "unprocessed",
    importWarnings: [],
    ...partial,
  };
}

describe("computeImageImportCounts", () => {
  it("counts missing when filename set but no image", () => {
    const counts = computeImageImportCounts([
      stubItem({ imageFilename: "fall.jpg", image: null }),
    ]);
    expect(counts.imagesMissing).toBe(1);
  });

  it("counts matched", () => {
    const file = new File(["x"], "fall.jpg", { type: "image/jpeg" });
    const counts = computeImageImportCounts([
      stubItem({
        imageFilename: "fall.jpg",
        image: {
          file,
          fileName: "fall.jpg",
          thumbnailUrl: null,
          matchStatus: "matched",
        },
      }),
    ]);
    expect(counts.imagesMatched).toBe(1);
  });
});
