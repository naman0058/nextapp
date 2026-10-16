import { readFileSync } from "node:fs";
import { join } from "node:path";
import { describe, expect, it } from "vitest";
import { buildImageRemediationContext } from "@/lib/ai/remediation/adapters/buildImageRemediationContext";

const ROOT = join(process.cwd(), "src");

describe("AI-R3 image remediation — no duplicate vision", () => {
  it("ImageAiRemediationSection does not import vision analysis client", () => {
    const src = readFileSync(
      join(ROOT, "features/accessibility/components/checker/ImageAiRemediationSection.tsx"),
      "utf8",
    );
    expect(src).not.toContain("requestAiImageAnalysis");
    expect(src).not.toContain("analyze-image");
  });

  it("runBatchRemediationQueue does not call vision analysis", () => {
    const src = readFileSync(
      join(ROOT, "features/batch/utils/ai/runBatchRemediationQueue.ts"),
      "utf8",
    );
    expect(src).not.toContain("requestAiImageAnalysis");
    expect(src).toContain("fetchAiRemediation");
  });

  it("adapter reuses session analysis evidence when present", () => {
    const { facts } = buildImageRemediationContext({
      sourceTool: "social_checker",
      userAltText: "logo",
      hasImage: true,
      aiAnalysis: {
        imagePurpose: "informational",
        suggestedAltText: "Company logo",
        altTextRationale: "Simple logo",
        visibleText: [],
        importantVisualDetails: [],
        captionCoverage: { status: "uncertain", missingInformation: [] },
        userAltTextReview: {
          provided: true,
          status: "needs_improvement",
          issues: [],
          improvedAltText: null,
        },
        humanReview: { required: true, reasons: ["Context"] },
        limitations: [],
      },
    });
    expect(facts.imageAnalysisAvailable).toBe(true);
    expect(JSON.stringify(facts)).not.toMatch(/blob|base64/i);
  });
});
