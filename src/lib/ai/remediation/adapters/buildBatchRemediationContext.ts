import type { AIImageAccessibilityAnalysis } from "@/features/accessibility/types/aiImageAnalysis";
import type { BatchLocalAnalysis } from "@/features/batch/types/batchItem";
import type { RemediationFacts } from "@/lib/ai/remediation/types";
import type { SocialPlatform } from "@/types";
import { hashRemediationMaterial } from "@/lib/ai/remediation/adapters/remediationFingerprint";

export type BatchRemediationTarget = "caption" | "alt";

export type BuildBatchRemediationContextInput = {
  batchItemId: string;
  platform: SocialPlatform;
  originalCaption: string;
  altText: string;
  localAnalysis: BatchLocalAnalysis;
  aiAnalysis?: AIImageAccessibilityAnalysis | null;
  remediationTarget: BatchRemediationTarget;
};

export type BatchRemediationContext = {
  facts: RemediationFacts;
  deterministicGuidance: string[];
};

function summarizeLocalAnalysis(local: BatchLocalAnalysis): Record<string, unknown> {
  return {
    issueCount: local.issueCount,
    captionIssueCount: local.captionIssueCount,
    humanReviewCount: local.humanReviewCount,
    score: local.phase1.score,
    scoreBandLabel: local.phase1.scoreBandLabel,
    topChecks: local.phase1.checks
      .filter((c) => c.status !== "pass")
      .slice(0, 8)
      .map((c) => ({ id: c.id, status: c.status, title: c.title })),
  };
}

export function buildBatchRemediationContext(
  input: BuildBatchRemediationContextInput,
): BatchRemediationContext {
  const {
    batchItemId,
    platform,
    originalCaption,
    altText,
    localAnalysis,
    aiAnalysis,
    remediationTarget,
  } = input;

  const issueFingerprint = hashRemediationMaterial("batch:item", [
    batchItemId,
    remediationTarget,
    platform,
    originalCaption,
    altText,
  ]);

  const facts: RemediationFacts = {
    source: "batch",
    issueFingerprint,
    batchItemId,
    platform,
    originalCaption,
    altText,
    remediationTarget,
    localAnalysisSummary: summarizeLocalAnalysis(localAnalysis),
    preserveOriginalEvidence: true,
  };

  if (aiAnalysis && remediationTarget === "alt") {
    facts.aiAnalysisSummary = {
      imagePurpose: aiAnalysis.imagePurpose,
      visibleTextObserved: aiAnalysis.visibleText.slice(0, 8),
      suggestedAltTextFromVision: aiAnalysis.suggestedAltText,
    };
  }

  const deterministicGuidance: string[] = [
    "Batch row originals in evidence are immutable.",
    remediationTarget === "caption"
      ? "Suggest accessible caption revision preserving facts and URLs."
      : "Suggest alt options using vision summary if present; no new image upload.",
  ];

  return { facts, deterministicGuidance };
}
