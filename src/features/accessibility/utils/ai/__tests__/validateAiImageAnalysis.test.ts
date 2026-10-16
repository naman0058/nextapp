import { describe, expect, it } from "vitest";
import { validateAiImageAnalysis } from "@/features/accessibility/utils/ai/validateAiImageAnalysis";

const valid = {
  imagePurpose: "informational",
  suggestedAltText: "Community workshop flyer for October 18.",
  altTextRationale: "Summarizes key event details visible in the image.",
  visibleText: ["October 18", "6 PM"],
  importantVisualDetails: ["Event title on poster"],
  captionCoverage: {
    status: "partially_covered",
    missingInformation: ["Date and time"],
  },
  userAltTextReview: {
    provided: false,
    status: "not_provided",
    issues: [],
    improvedAltText: null,
  },
  humanReview: {
    required: true,
    reasons: ["Verify dates manually"],
  },
  limitations: ["AI-detected text may contain errors"],
};

describe("validateAiImageAnalysis", () => {
  it("accepts a valid payload", () => {
    const result = validateAiImageAnalysis(valid);
    expect(result.ok).toBe(true);
  });

  it("rejects missing fields", () => {
    const result = validateAiImageAnalysis({ ...valid, suggestedAltText: 123 });
    expect(result.ok).toBe(false);
  });
});
