import type { AiRemediationEntry } from "@/lib/ai/remediation/client/aiRemediationEntry";
import type { CaptionCue, CaptionQualitySummary } from "@/features/video/types/captions";
import type { VideoVisualAccessibilityReview } from "@/features/video/types/visualReview";
import type { SocialPlatform } from "@/types";

const KEY = "acps-video-preflight-v1";

export type VideoReviewCheckboxes = {
  transcriptReviewed: boolean;
  nonSpeechReviewed: boolean;
  speakerLabelsReviewed: boolean;
  timingReviewed: boolean;
  visualInformationReviewed: boolean;
};

export type VideoSessionSnapshot = {
  fingerprint?: string;
  cues: CaptionCue[];
  platform?: SocialPlatform;
  speakerLabels: Record<string, string>;
  review: VideoReviewCheckboxes;
  visualReview?: VideoVisualAccessibilityReview | null;
  visualStale?: boolean;
  fileName?: string;
  durationSeconds?: number;
  format?: string;
  detectSpeakers?: boolean;
  captionQuality?: CaptionQualitySummary | null;
  transcriptGenerated?: boolean;
  cueAiRemediationByCueId?: Record<string, AiRemediationEntry>;
};

export function loadVideoSession(): VideoSessionSnapshot | null {
  if (typeof globalThis.sessionStorage === "undefined") return null;
  try {
    const raw = globalThis.sessionStorage.getItem(KEY);
    if (!raw) return null;
    return JSON.parse(raw) as VideoSessionSnapshot;
  } catch {
    return null;
  }
}

export function saveVideoSession(snapshot: VideoSessionSnapshot): void {
  if (typeof globalThis.sessionStorage === "undefined") return;
  try {
    globalThis.sessionStorage.setItem(KEY, JSON.stringify(snapshot));
  } catch {
    /* quota */
  }
}

export function clearVideoSession(): void {
  if (typeof globalThis.sessionStorage === "undefined") return;
  globalThis.sessionStorage.removeItem(KEY);
}

export const DEFAULT_VIDEO_REVIEW: VideoReviewCheckboxes = {
  transcriptReviewed: false,
  nonSpeechReviewed: false,
  speakerLabelsReviewed: false,
  timingReviewed: false,
  visualInformationReviewed: false,
};
