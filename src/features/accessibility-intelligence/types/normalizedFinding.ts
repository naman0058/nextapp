import type { AccessibilityCategory } from "@/types";
import type { AccessibilityEvidence, AccessibilityEvidenceSource } from "@/features/accessibility-intelligence/types/evidence";
import type { AxeImpact } from "@/features/website-scanner/types/scanTypes";

export type NormalizedFindingStatus =
  | "issue"
  | "review"
  | "pass"
  | "not_checked"
  | "not_applicable"
  | "error";

export type RemediationPriority = "high" | "medium" | "low";

export type NormalizedConfidence = "high" | "medium" | "human_required";

export type NormalizedAccessibilityFinding = {
  id: string;
  sourceType: AccessibilityEvidenceSource;
  category: AccessibilityCategory | "website_automation";
  title: string;
  status: NormalizedFindingStatus;
  /** Axe or rule impact — never overwritten by priority logic. */
  impact: AxeImpact;
  priority: RemediationPriority;
  confidence: NormalizedConfidence;
  description: string;
  userImpact?: string;
  recommendation?: string;
  verificationSteps?: string[];
  wcagCriteria?: string[];
  wcagLevel?: "A" | "AA" | "AAA" | null;
  bestPractice?: boolean;
  evidence: AccessibilityEvidence[];
  pageUrl?: string;
  affectedElementCount?: number;
  occurrenceCount?: number;
  rootCauseGroupId?: string;
  humanReviewRequired: boolean;
  relatedFindingIds?: string[];
  ruleId?: string;
  /** Present when scans include multiple viewports (e.g. compare mode). */
  viewportId?: "desktop" | "mobile";
};
