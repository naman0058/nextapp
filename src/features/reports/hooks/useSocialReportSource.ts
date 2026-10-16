"use client";

import { useMemo } from "react";
import type { AiStatus } from "@/features/accessibility/components/checker/checkerReducer";
import type { AIImageAccessibilityAnalysis } from "@/features/accessibility/types/aiImageAnalysis";
import type { PreflightAnalysisResult } from "@/features/accessibility/types/preflight";
import { buildScreenReaderPreview } from "@/features/accessibility/utils/screenReaderPreview";
import { loadPublishingConfirmations } from "@/features/accessibility/utils/publishingConfirmationsSession";
import { loadVisualPreflightSession } from "@/features/accessibility/utils/visualPreflightSession";
import type { ContrastSnapshot } from "@/features/accessibility/utils/platform/types";
import type { PreflightReportSourceSnapshot } from "@/features/reports/types/reportSource";
import type { ReportAiRemediationCandidate } from "@/features/reports/types/reportAiRemediation";
import {
  collectContrastRemediationCandidate,
} from "@/lib/ai/remediation/report";
import type { AltTextSource } from "@/features/accessibility/types/screenReaderPreview";
import type { SocialPlatform } from "@/types";

export type SocialReportSourceInput = {
  platform: SocialPlatform;
  hasImage: boolean;
  workingCaption: string;
  altText: string;
  altTextSource: AltTextSource;
  imageFileName?: string | null;
  phase1: PreflightAnalysisResult | null;
  aiAnalysis: AIImageAccessibilityAnalysis | null;
  aiStatus: AiStatus;
  aiError?: string | null;
  contrastSnapshot: ContrastSnapshot;
  screenReaderEngaged: boolean;
  imagePurpose?: AIImageAccessibilityAnalysis["imagePurpose"] | null;
  aiRemediationCandidates?: ReportAiRemediationCandidate[];
};

export function useSocialReportSource(
  input: SocialReportSourceInput,
): PreflightReportSourceSnapshot {
  return useMemo(() => {
    const visualSession = loadVisualPreflightSession();
    const publishingConfirmations = loadPublishingConfirmations(input.platform);
    const screenReaderPreview = input.screenReaderEngaged
      ? buildScreenReaderPreview({
          caption: input.workingCaption,
          altText: input.altText,
          hasImage: input.hasImage,
          platform: input.platform,
          altTextSource: input.altText.trim()
            ? input.altTextSource === "none"
              ? "user"
              : input.altTextSource
            : "none",
          imagePurpose: input.imagePurpose ?? null,
        })
      : null;

    const contrastEntry = visualSession?.contrastAiRemediation ?? null;
    const contrastFacts =
      visualSession?.evaluation && visualSession.foregroundHex
        ? {
            foregroundHex: visualSession.foregroundHex,
            backgroundHex: visualSession.backgroundHex,
            measuredRatio: visualSession.evaluation.displayRatio,
            requiredThreshold: String(visualSession.evaluation.requiredRatio),
            contrastResult: visualSession.evaluation.primaryLabel,
          }
        : undefined;
    const contrastCandidate = collectContrastRemediationCandidate(
      contrastEntry,
      contrastFacts,
    );
    const aiRemediationCandidates = [
      ...(input.aiRemediationCandidates ?? []),
      ...(contrastCandidate ? [contrastCandidate] : []),
    ];

    return {
      platform: input.platform,
      hasImage: input.hasImage,
      workingCaption: input.workingCaption,
      altText: input.altText,
      altTextSource: input.altTextSource,
      imageFileName: input.imageFileName ?? null,
      phase1: input.phase1,
      aiAnalysis: input.aiAnalysis,
      aiStatus: input.aiStatus,
      aiError: input.aiError ?? null,
      contrastSnapshot: input.contrastSnapshot,
      visualSession,
      screenReaderEngaged: input.screenReaderEngaged,
      screenReaderPreview,
      publishingConfirmations,
      video: null,
      aiRemediationCandidates:
        aiRemediationCandidates.length > 0 ? aiRemediationCandidates : undefined,
    };
  }, [
    input.platform,
    input.hasImage,
    input.workingCaption,
    input.altText,
    input.altTextSource,
    input.imageFileName,
    input.phase1,
    input.aiAnalysis,
    input.aiStatus,
    input.aiError,
    input.contrastSnapshot,
    input.screenReaderEngaged,
    input.imagePurpose,
    input.aiRemediationCandidates,
  ]);
}
