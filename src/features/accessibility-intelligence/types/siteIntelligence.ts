import type { AccessibilityEvidence } from "@/features/accessibility-intelligence/types/evidence";
import type {
  NormalizedAccessibilityFinding,
  RemediationPriority,
} from "@/features/accessibility-intelligence/types/normalizedFinding";
import type { AxeImpact } from "@/features/website-scanner/types/scanTypes";

export type ScanCompleteness = "complete" | "partial" | "limited" | "failed";

export type ScanQualityMetadata = {
  pageFullyLoaded?: boolean;
  resourceBudgetExceeded?: boolean;
  domTruncated?: boolean;
  nodeEvidenceTruncated?: boolean;
  crossOriginFrameLimitations?: boolean;
  lazyContentSampling?: "completed" | "limited";
  scanTimeout?: boolean;
  domContentLoadedMs?: number;
  settleMs?: number;
  axeDurationMs?: number;
  totalDurationMs?: number;
};

export type RootCauseGroupType =
  | "shared_navigation"
  | "shared_footer"
  | "shared_form_component"
  | "shared_button_component"
  | "shared_image_component"
  | "shared_template"
  | "repeated_pattern"
  | "rule_consolidated"
  | "isolated"
  | "unknown";

export type RootCauseGroup = {
  id: string;
  ruleId: string;
  confidence: "high" | "medium" | "low";
  groupType: RootCauseGroupType;
  label: string;
  affectedPages: string[];
  /** Total affected occurrences from scanner metadata (not retained evidence count). */
  totalOccurrences: number;
  /** Detailed node/evidence records retained in this group (may be less than totalOccurrences). */
  retainedEvidenceCount: number;
  representativeSelectors: string[];
  representativeEvidence: AccessibilityEvidence[];
  likelySharedComponent: boolean;
  remediationReach: {
    pages: number;
    occurrences: number;
  };
};

export type WcagAutomationClass = "automated" | "partial" | "manual";

export type WcagCoverageCriterion = {
  criterion: string;
  name: string;
  level: "A" | "AA" | "AAA";
  principle: "Perceivable" | "Operable" | "Understandable" | "Robust";
  automation: WcagAutomationClass;
  automatedRules: string[];
  automatedResult: "issue_detected" | "no_issue_detected" | "not_tested";
  manualReviewStatus:
    | "required"
    | "completed_pass"
    | "completed_review"
    | "not_started"
    | "not_applicable";
  notes?: string;
};

export type SiteLevelSummary = {
  pagesScanned: number;
  completePages: number;
  partialPages: number;
  pagesWithViolations: number;
  uniqueAutomatedRules: number;
  /** @deprecated display as shared root causes — same as sharedRootCauses */
  likelyRootCauses: number;
  sharedRootCauses: number;
  totalOccurrences: number;
  humanReviewItems: number;
  bestPracticeFindings: number;
};

export type FixPlanItem = {
  rank: number;
  rootCauseGroupId?: string;
  title: string;
  priority: RemediationPriority;
  impact: AxeImpact;
  affectedPages: number;
  affectedElements: number;
  likelySharedFix: boolean;
  reasonForPriority: string;
  estimatedReachLabel: string;
  verificationSteps: string[];
  ruleId?: string;
};

export type SiteScanIntelligence = {
  generatedAt: string;
  summary: SiteLevelSummary;
  normalizedFindings: NormalizedAccessibilityFinding[];
  rootCauseGroups: RootCauseGroup[];
  ruleAggregates: import("@/features/website-scanner/types/scanTypes").SiteRuleAggregate[];
  wcagCoverage: WcagCoverageCriterion[];
  fixPlan: FixPlanItem[];
  priorityExplanation: string;
};
