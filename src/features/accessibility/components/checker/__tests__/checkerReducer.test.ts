import { describe, expect, it } from "vitest";
import {
  checkerReducer,
  initialCheckerState,
} from "@/features/accessibility/components/checker/checkerReducer";
import type { AIImageAccessibilityAnalysis } from "@/features/accessibility/types/aiImageAnalysis";

const mockAnalysis: AIImageAccessibilityAnalysis = {
  imagePurpose: "informational",
  suggestedAltText: "Event poster",
  altTextRationale: "Test",
  visibleText: [],
  importantVisualDetails: [],
  captionCoverage: {
    status: "covered",
    missingInformation: [],
  },
  userAltTextReview: {
    provided: false,
    status: "not_provided",
    issues: [],
    improvedAltText: null,
  },
  humanReview: {
    required: false,
    reasons: [],
  },
  limitations: [],
};

describe("checkerReducer", () => {
  it("clears AI state when image is removed", () => {
    const withAi = checkerReducer(initialCheckerState, {
      type: "AI_SUCCESS",
      analysis: mockAnalysis,
      fingerprint: "fp1",
    });
    expect(withAi.aiStatus).toBe("success");

    const cleared = checkerReducer(withAi, {
      type: "SET_IMAGE",
      file: null,
      previewUrl: null,
      fileName: null,
    });

    expect(cleared.aiAnalysis).toBeNull();
    expect(cleared.aiStatus).toBe("idle");
    expect(cleared.lastAiInputFingerprint).toBeNull();
  });

  it("marks AI stale when caption changes after analysis", () => {
    const withAi = checkerReducer(
      {
        ...initialCheckerState,
        lastAiInputFingerprint: "fp1",
      },
      {
        type: "AI_SUCCESS",
        analysis: mockAnalysis,
        fingerprint: "fp1",
      },
    );

    const updated = checkerReducer(withAi, {
      type: "SET_CAPTION",
      caption: "Updated caption",
    });

    expect(updated.aiAnalysis).toBeNull();
    expect(updated.aiStatus).toBe("stale");
  });

  it("clears AI on platform change", () => {
    const withAi = checkerReducer(initialCheckerState, {
      type: "AI_SUCCESS",
      analysis: mockAnalysis,
      fingerprint: "fp1",
    });

    const switched = checkerReducer(withAi, {
      type: "SET_PLATFORM",
      platform: "x",
    });

    expect(switched.aiAnalysis).toBeNull();
    expect(switched.aiStatus).toBe("idle");
  });
});
