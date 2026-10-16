"use client";

import { useMemo } from "react";
import type { CaptionCue, CaptionQualitySummary } from "@/features/video/types/captions";
import type { VideoVisualAccessibilityReview } from "@/features/video/types/visualReview";
import type { VideoReviewCheckboxes } from "@/features/video/utils/videoSessionStorage";
import type { PreflightReportSourceSnapshot } from "@/features/reports/types/reportSource";
import type { ReportAiRemediationCandidate } from "@/features/reports/types/reportAiRemediation";
import type { SocialPlatform } from "@/types";

export type VideoReportSourceInput = {
  platform: SocialPlatform;
  fileName?: string;
  durationSeconds?: number;
  format?: string;
  detectSpeakers?: boolean;
  cues: CaptionCue[];
  review: VideoReviewCheckboxes;
  visualReview: VideoVisualAccessibilityReview | null;
  visualStale?: boolean;
  captionQuality: CaptionQualitySummary | null;
  transcriptGenerated: boolean;
  aiRemediationCandidates?: ReportAiRemediationCandidate[];
};

export function useVideoReportSource(
  input: VideoReportSourceInput,
): PreflightReportSourceSnapshot {
  return useMemo(
    (): PreflightReportSourceSnapshot => ({
      platform: input.platform,
      hasImage: false,
      workingCaption: "",
      altText: "",
      altTextSource: "none",
      phase1: null,
      aiAnalysis: null,
      aiStatus: "idle",
      contrastSnapshot: { measured: false },
      visualSession: null,
      screenReaderEngaged: false,
      screenReaderPreview: null,
      publishingConfirmations: {},
      video: {
        fileName: input.fileName,
        durationSeconds: input.durationSeconds,
        format: input.format,
        detectSpeakers: input.detectSpeakers,
        cues: input.cues,
        review: input.review,
        visualReview: input.visualReview,
        visualStale: input.visualStale,
        captionQuality: input.captionQuality,
        transcriptGenerated: input.transcriptGenerated,
      },
      aiRemediationCandidates: input.aiRemediationCandidates,
    }),
    [
      input.platform,
      input.fileName,
      input.durationSeconds,
      input.format,
      input.detectSpeakers,
      input.cues,
      input.review,
      input.visualReview,
      input.visualStale,
      input.captionQuality,
      input.transcriptGenerated,
      input.aiRemediationCandidates,
    ],
  );
}
