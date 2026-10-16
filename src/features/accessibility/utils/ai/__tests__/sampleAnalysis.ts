import type { AIImageAccessibilityAnalysis } from "@/features/accessibility/types/aiImageAnalysis";

export const sampleAiAnalysis: AIImageAccessibilityAnalysis = {
  imagePurpose: "informational",
  suggestedAltText: "Sale poster showing 50% off Friday only.",
  altTextRationale: "Includes essential offer details visible in the image.",
  visibleText: ["50% OFF", "Friday Only"],
  importantVisualDetails: ["Promotional sale headline"],
  captionCoverage: {
    status: "partially_covered",
    missingInformation: ["50% discount", "Friday-only timing"],
  },
  userAltTextReview: {
    provided: true,
    status: "needs_improvement",
    issues: ["Missing offer details"],
    improvedAltText: "50% off sale valid Friday only.",
  },
  humanReview: {
    required: true,
    reasons: ["Verify promotional numbers manually"],
  },
  limitations: ["AI-detected text may contain errors"],
};
