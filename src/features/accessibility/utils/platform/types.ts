import type { ExperienceSummaryLevel } from "@/features/accessibility/types/screenReaderPreview";
import type { PreflightAnalysisResult } from "@/features/accessibility/types/preflight";
import type { AiStatus } from "@/features/accessibility/components/checker/checkerReducer";
import type { SocialPlatform } from "@/types";

export type ContrastSnapshot = {
  measured: boolean;
  primaryVerdict?: "pass" | "fail";
};

export type PlatformChecklistInput = {
  platform: SocialPlatform;
  caption: string;
  altText: string;
  hasImage: boolean;
  phase1: PreflightAnalysisResult | null;
  phase2: { aiStatus: AiStatus; hasAnalysis: boolean } | null;
  phase3: ContrastSnapshot;
  phase4: { experienceLevel?: ExperienceSummaryLevel } | null;
  userPublishingConfirmations: Record<string, boolean>;
};
