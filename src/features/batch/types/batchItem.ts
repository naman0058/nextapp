import type { AIRemediationReport } from "@/lib/ai/remediation/types";
import type { BatchRemediationTarget } from "@/lib/ai/remediation/adapters/buildBatchRemediationContext";
import type { AIImageAccessibilityAnalysis } from "@/features/accessibility/types/aiImageAnalysis";
import type { PlatformChecklistResultItem } from "@/features/accessibility/config/platformAccessibility/types";
import type { PreflightAnalysisResult } from "@/features/accessibility/types/preflight";
import type { ExperienceSummary } from "@/features/accessibility/types/screenReaderPreview";
import type { SocialPlatform } from "@/types";

export type BatchImageMatchStatus =
  | "matched"
  | "missing"
  | "ambiguous"
  | "no_image_required";

export type BatchImageReference = {
  file: File;
  fileName: string;
  thumbnailUrl: string | null;
  matchStatus: BatchImageMatchStatus;
  /** When ambiguous, candidate paths from ZIP */
  ambiguousCandidates?: string[];
  selectedZipPath?: string;
};

export type BatchValidationSeverity = "valid" | "needs_review" | "invalid";

export type BatchValidationState = {
  severity: BatchValidationSeverity;
  messages: string[];
  canAnalyze: boolean;
};

export type BatchProcessingState =
  | "unprocessed"
  | "queued"
  | "processing_local"
  | "local_complete"
  | "ai_queued"
  | "ai_processing"
  | "complete"
  | "review"
  | "failed"
  | "cancelled";

export type BatchOverallStatus =
  | "Ready for Review"
  | "Needs Review"
  | "Attention Required"
  | "Incomplete"
  | "Failed";

export type BatchVisualStatus = {
  contrast: "not_checked" | "measured_pass" | "measured_review";
};

export type BatchLocalAnalysis = {
  phase1: PreflightAnalysisResult;
  screenReaderSummary: ExperienceSummary;
  noiseCount: number;
  platformChecklist: PlatformChecklistResultItem[];
  issueCount: number;
  captionIssueCount: number;
  humanReviewCount: number;
};

export type BatchAiState = {
  status: "not_run" | "success" | "error" | "stale" | "processing";
  analysis: AIImageAccessibilityAnalysis | null;
  error?: string | null;
  fingerprint: string | null;
  completedAt?: string;
};

export type BatchRemediationState = {
  status: "not_run" | "success" | "error" | "processing";
  target: BatchRemediationTarget;
  report: AIRemediationReport | null;
  error?: string | null;
  fingerprint: string | null;
  completedAt?: string;
};

export type BatchHumanReviewItem = {
  id: string;
  category: string;
  title: string;
  detail: string;
  priority: "high" | "medium" | "low";
};

export type BatchRowReviewFlags = {
  altTextVerified: boolean;
  imageTextVerified: boolean;
  platformPublishingReviewed: boolean;
};

export type BatchAccessibilityItem = {
  id: string;
  sourceRow: number;
  platform: SocialPlatform | null;
  platformSource: "csv" | "default" | "manual" | "unspecified";
  caption: string;
  altText: string;
  altTextSource: "user" | "ai_applied" | "none";
  image: BatchImageReference | null;
  imageFilename?: string;
  contentName?: string;
  client?: string;
  campaign?: string;
  notes?: string;
  validation: BatchValidationState;
  localAnalysis?: BatchLocalAnalysis;
  ai: BatchAiState;
  remediation: BatchRemediationState;
  visualStatus: BatchVisualStatus;
  humanReviewItems: BatchHumanReviewItem[];
  rowReview: BatchRowReviewFlags;
  overallStatus: BatchOverallStatus;
  processingState: BatchProcessingState;
  importWarnings: string[];
};
