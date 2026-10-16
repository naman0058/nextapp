import { getPlatformAccessibilityConfig } from "@/features/accessibility/config/platformAccessibility";
import type { AIImageAccessibilityAnalysis } from "@/features/accessibility/types/aiImageAnalysis";
import type { PreflightAnalysisResult } from "@/features/accessibility/types/preflight";
import type { RemediationFacts } from "@/lib/ai/remediation/types";
import type { SocialPlatform } from "@/types";
import { hashRemediationMaterial } from "@/lib/ai/remediation/adapters/remediationFingerprint";

export type BuildSocialRemediationContextInput = {
  platform: SocialPlatform;
  originalCaption: string;
  workingCaption: string;
  altText?: string;
  hasImage: boolean;
  results: PreflightAnalysisResult;
  aiAnalysis?: AIImageAccessibilityAnalysis | null;
};

export type SocialRemediationContext = {
  facts: RemediationFacts;
  deterministicGuidance: string[];
};

function platformGuidanceSummary(platform: SocialPlatform): string[] {
  const config = getPlatformAccessibilityConfig(platform);
  if (!config) return [];
  const caps = [
    `Image alt: ${config.capabilities.imageAltText.label} (${config.capabilities.imageAltText.status})`,
    `Video captions: ${config.capabilities.videoCaptions.label} (${config.capabilities.videoCaptions.status})`,
  ];
  const guidanceTitles = config.publishingGuidance.slice(0, 3).map((g) => g.title);
  return [...caps, ...guidanceTitles];
}

function summarizeImageAnalysis(analysis: AIImageAccessibilityAnalysis): Record<string, unknown> {
  return {
    imagePurpose: analysis.imagePurpose,
    visibleTextObserved: analysis.visibleText.slice(0, 8),
    importantVisualDetails: analysis.importantVisualDetails.slice(0, 6),
    captionCoverageStatus: analysis.captionCoverage.status,
    limitations: analysis.limitations.slice(0, 4),
    note: "AI-observed image evidence from current session only; verify visible text and facts.",
  };
}

export function buildSocialRemediationContext(
  input: BuildSocialRemediationContextInput,
): SocialRemediationContext {
  const {
    platform,
    originalCaption,
    workingCaption,
    altText,
    hasImage,
    results,
    aiAnalysis,
  } = input;

  const deterministicFindings = results.checks
    .filter((c) => c.status !== "pass" && c.status !== "not_checked")
    .slice(0, 15)
    .map((c) => ({
      id: c.id,
      status: c.status,
      severity: c.severity,
      title: c.title,
      summary: c.summary,
      recommendation: c.recommendation?.slice(0, 300),
    }));

  const issueFingerprint = hashRemediationMaterial("social:caption", [
    platform,
    originalCaption,
    workingCaption,
    altText ?? "",
    hasImage,
    deterministicFindings.map((f) => f.id),
  ]);

  const facts: RemediationFacts = {
    source: "social",
    issueFingerprint,
    platform,
    originalCaption,
    workingCaption,
    altText: altText ?? "",
    hasImage,
    deterministicFindings,
    platformGuidanceSummary: platformGuidanceSummary(platform),
    preserveMeaning: true,
    doNotInventFacts: true,
  };

  if (hasImage && aiAnalysis) {
    facts.imageAnalysisSummary = summarizeImageAnalysis(aiAnalysis);
  } else if (hasImage) {
    facts.imageAnalysisSummary = {
      available: false,
      note: "No AI image analysis in this session; do not invent alt text from filename.",
    };
  }

  const deterministicGuidance: string[] = [
    "Deterministic preflight findings are authoritative for what was detected.",
    "Suggested caption must preserve URLs, prices, dates, names, and offers from the original unless the user changed them.",
    "Original caption in evidence must remain available; output is a suggestion only.",
  ];

  if (results.scoreBandLabel) {
    deterministicGuidance.push(`Readiness band: ${results.scoreBandLabel}.`);
  }

  return { facts, deterministicGuidance };
}
