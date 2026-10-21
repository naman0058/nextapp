/** Stable product tool identifiers for workspace contributions. */
export type WorkspaceToolId =
  | "website_scanner"
  | "contrast_checker"
  | "image_alt_checker"
  | "screen_reader_preview"
  | "video_accessibility"
  | "social_accessibility"
  | "platform_guidance"
  | "visual_issue_locator"
  | "developer_ticket"
  | "ai_assisted_remediation";

export type ContributionProvenance =
  | "automated_axe"
  | "measured_tool"
  | "human_review"
  | "deterministic_guidance"
  | "ai_assisted"
  | "visual_evidence"
  | "developer_handoff"
  | "platform_guidance"
  | "screen_reader_preview";

export type ContributionScopeType =
  | "single_element"
  | "single_occurrence"
  | "page"
  | "viewport"
  | "remediation_group"
  | "finding"
  | "site";

export type ContributionScope = {
  type: ContributionScopeType;
  pageUrl?: string;
  viewportId?: "desktop" | "mobile";
  selector?: string;
  /** Does not imply all occurrences site-wide were verified. */
  occurrenceLabel?: string;
};

export type ContributionMeasurement = {
  name: string;
  value: string | number;
  unit?: string;
  threshold?: string | number;
  passed?: boolean;
};

export type ContributionEvidence = {
  evidenceId: string;
  label: string;
  sanitizedSnippet?: string;
  selector?: string;
  failureSummary?: string;
};

export type ReportContributionFinding = {
  id: string;
  title: string;
  summary: string;
  provenance: ContributionProvenance;
};

export type ReportContribution = {
  contributionId: string;
  toolId: WorkspaceToolId;
  toolVersion?: string;
  createdAt: string;
  updatedAt: string;

  sourceType: ContributionProvenance;
  scope: ContributionScope;
  title: string;
  summary: string;

  findings: ReportContributionFinding[];
  measurements: ContributionMeasurement[];
  evidence: ContributionEvidence[];
  remediationActions: string[];
  humanReviewTasks: string[];
  verificationResults: {
    kind: "measured" | "automated_rescan" | "human_review";
    label: string;
    detail?: string;
  }[];

  relatedWebsiteFindingIds: string[];
  relatedRuleIds: string[];
  relatedRemediationGroupIds: string[];

  /** User explicitly included this in export/report composition. */
  includedInReport: boolean;
  exportEligibility: "allowed" | "blocked";
  privacyClassification: "local_session" | "sanitized_export";

  remediationDefinitionId?: string;
  remediationDefinitionVersion?: number;
};

export type ReturnToFindingContext = {
  websiteSessionId: string;
  findingId: string;
  remediationGroupId?: string;
  ruleId: string;
  resultView: "issues" | "overview" | "report" | "fix-plan";
  label: string;
  /** Scroll/highlight target in Issues explorer. */
  highlightFindingId?: string;
  issuesFilter?: Partial<
    import("@/features/website-scanner/utils/issuesListUtils").IssuesFilterState
  >;
};

export type ToolHandoffContext = {
  version: 1;
  toolId: WorkspaceToolId;
  createdAt: string;
  returnTo: ReturnToFindingContext;
  ruleId: string;
  wcagCriteria?: string[];
  pageOrigin?: string;
  pagePath?: string;
  viewportId?: "desktop" | "mobile";
  sanitizedSelector?: string;
  foregroundColor?: string;
  backgroundColor?: string;
  measuredContrastRatio?: string;
  requiredRatio?: string;
  scannerTotalOccurrences?: number;
  scannerRetainedEvidenceCount?: number;
  /** Stable evidence / locator reference when available. */
  evidenceId?: string;
  occurrenceIndex?: number;
  existingAltText?: string;
  userNoteSeed?: string;
};

export type AccessibilityWorkspaceState = {
  workspaceId: string;
  createdAt: string;
  updatedAt: string;
  contributions: ReportContribution[];
  returnToFinding: ReturnToFindingContext | null;
  humanReviewRecords: import("@/features/human-review-workspace/types").HumanReviewRecord[];
};

export type WorkspaceContributionSummary = {
  contrastMeasurements: number;
  imageAltReviews: number;
  visualLocatorEvidence: number;
  developerHandoffs: number;
  aiAssistedSuggestions: number;
  screenReaderObservations: number;
  humanReviewCompleted: number;
  humanReviewTotal: number;
};

export type ReportWorkspaceBlock = {
  workspaceSummary: string;
  contributions: ReportContribution[];
  contributionSummary: WorkspaceContributionSummary;
  toolCoverage: { toolId: WorkspaceToolId; count: number; included: number }[];
};
