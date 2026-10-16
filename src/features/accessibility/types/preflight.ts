import type {
  AccessibilityCategory,
  PreflightSeverity,
  PreflightStatus,
  SocialPlatform,
} from "@/types";
import type { CheckId } from "@/features/accessibility/constants/checkIds";

export type AutoFixDescriptor = {
  fixId: string;
  label: string;
  previewCaption: string;
};

export type AccessibilityCheckResult = {
  id: CheckId;
  category: AccessibilityCategory;
  title: string;
  status: PreflightStatus;
  severity: PreflightSeverity;
  summary: string;
  recommendation?: string;
  referenceLabel?: string;
  autoFix?: AutoFixDescriptor;
};

export type PreflightInput = {
  platform: SocialPlatform;
  caption: string;
  hasImage: boolean;
  altText: string;
};

export type PreflightCounts = {
  pass: number;
  review: number;
  fail: number;
  not_checked: number;
};

export type PreflightAnalysisResult = {
  checks: AccessibilityCheckResult[];
  score: number;
  scoreBandLabel: string;
  counts: PreflightCounts;
};
