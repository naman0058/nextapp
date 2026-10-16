import type { AIImageAccessibilityAnalysis } from "@/features/accessibility/types/aiImageAnalysis";
import type { AiStatus } from "@/features/accessibility/components/checker/checkerReducer";
import type { PreflightAnalysisResult } from "@/features/accessibility/types/preflight";
import type { VisualChecklistState } from "@/features/accessibility/types/visualAccessibility";
import type { ContrastEvaluation } from "@/features/accessibility/types/visualAccessibility";
import type { AiRemediationEntry } from "@/lib/ai/remediation/client/aiRemediationEntry";
import type { ScreenReaderPreviewResult } from "@/features/accessibility/types/screenReaderPreview";
import type { ContrastSnapshot } from "@/features/accessibility/utils/platform/types";
import type { CaptionCue } from "@/features/video/types/captions";
import type { VideoVisualAccessibilityReview } from "@/features/video/types/visualReview";
import type { VideoReviewCheckboxes } from "@/features/video/utils/videoSessionStorage";
import type { CaptionQualitySummary } from "@/features/video/types/captions";
import type { SocialPlatform } from "@/types";
import type { ReportAiRemediationCandidate } from "@/features/reports/types/reportAiRemediation";

export type VisualPreflightSessionData = {
  measured: boolean;
  foregroundHex?: string;
  backgroundHex?: string;
  textType?: string;
  evaluation?: ContrastEvaluation | null;
  backgroundSampleCount?: number;
  checklist?: VisualChecklistState;
  contrastAiRemediation?: AiRemediationEntry | null;
};

export type PreflightReportSourceSnapshot = {
  platform: SocialPlatform | null;
  hasImage: boolean;
  workingCaption: string;
  altText: string;
  altTextSource: string;
  imageFileName?: string | null;

  phase1: PreflightAnalysisResult | null;
  aiAnalysis: AIImageAccessibilityAnalysis | null;
  aiStatus: AiStatus;
  aiError?: string | null;

  contrastSnapshot: ContrastSnapshot;
  visualSession: VisualPreflightSessionData | null;

  screenReaderEngaged: boolean;
  screenReaderPreview: ScreenReaderPreviewResult | null;

  publishingConfirmations: Record<string, boolean>;

  video?: {
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
  } | null;

  /** Pre-built catalog for report inclusion UI (no generation on export) */
  aiRemediationCandidates?: ReportAiRemediationCandidate[];
};
