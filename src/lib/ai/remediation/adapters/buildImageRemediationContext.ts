import type { AIImageAccessibilityAnalysis } from "@/features/accessibility/types/aiImageAnalysis";
import type { PreflightAnalysisResult } from "@/features/accessibility/types/preflight";
import type { RemediationFacts } from "@/lib/ai/remediation/types";
import { hashRemediationMaterial } from "@/lib/ai/remediation/adapters/remediationFingerprint";

export type BuildImageRemediationContextInput = {
  sourceTool: "social_checker" | "batch";
  userAltText: string;
  caption?: string;
  hasImage: boolean;
  results?: PreflightAnalysisResult | null;
  aiAnalysis?: AIImageAccessibilityAnalysis | null;
  batchItemId?: string;
};

export type ImageRemediationContext = {
  facts: RemediationFacts;
  deterministicGuidance: string[];
};

const ALT_CHECK_IDS = new Set([
  "alt-text-presence",
  "alt-text-length",
  "alt-text-filename",
  "alt-text-prefix",
  "duplicate-caption-alt",
]);

export function buildImageRemediationContext(
  input: BuildImageRemediationContextInput,
): ImageRemediationContext {
  const { sourceTool, userAltText, caption, hasImage, results, aiAnalysis, batchItemId } =
    input;

  const deterministicAltChecks =
    results?.checks
      .filter((c) => ALT_CHECK_IDS.has(c.id))
      .slice(0, 10)
      .map((c) => ({
        id: c.id,
        status: c.status,
        title: c.title,
        summary: c.summary,
      })) ?? [];

  const issueFingerprint = hashRemediationMaterial("image:alt", [
    sourceTool,
    batchItemId ?? "",
    userAltText,
    caption ?? "",
    hasImage,
    aiAnalysis?.suggestedAltText ?? "",
    aiAnalysis?.imagePurpose ?? "",
  ]);

  const facts: RemediationFacts = {
    source: "image",
    issueFingerprint,
    sourceTool,
    batchItemId,
    userAltText,
    caption: caption ?? "",
    hasImage,
    deterministicAltChecks,
    humanReviewRequired: true,
    doNotIdentifyPeople: true,
    doNotInferSensitiveTraits: true,
  };

  if (aiAnalysis) {
    facts.imageAnalysisAvailable = true;
    facts.imageAnalysisEvidence = {
      imagePurpose: aiAnalysis.imagePurpose,
      suggestedAltTextFromVision: aiAnalysis.suggestedAltText,
      altTextRationale: aiAnalysis.altTextRationale,
      visibleTextObserved: aiAnalysis.visibleText.slice(0, 10),
      importantVisualDetails: aiAnalysis.importantVisualDetails.slice(0, 8),
      userAltTextReview: aiAnalysis.userAltTextReview,
      limitations: aiAnalysis.limitations.slice(0, 6),
      note: "Reuse session vision analysis; label visible text as AI-observed.",
    };
  } else {
    facts.imageAnalysisAvailable = false;
    facts.imageAnalysisEvidence = null;
  }

  const deterministicGuidance: string[] = [
    "Final alt text requires human context review; never claim one alt is objectively correct.",
    "Do not infer sensitive traits or identify real people.",
    "If visible text was observed, label it as AI-observed and ask user to verify dates, prices, URLs.",
  ];

  if (!aiAnalysis) {
    deterministicGuidance.push(
      "No image vision analysis in this session — suggest alt patterns only from caption and deterministic checks; do not invent visual detail.",
    );
  }

  return { facts, deterministicGuidance };
}
