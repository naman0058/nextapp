/** Canonical human review statuses (session-compatible). */
export type HumanReviewStatus =
  | "not_reviewed"
  | "passes"
  | "needs_review"
  | "not_applicable";

export type ApplicabilityLevel =
  | "relevant"
  | "possibly_relevant"
  | "not_applicable"
  | "unknown";

export type HumanReviewCategory =
  | "keyboard_focus"
  | "forms"
  | "media"
  | "semantics"
  | "visual"
  | "responsive"
  | "general";

export type HumanReviewScope = {
  kind: "site" | "page" | "viewport" | "finding" | "remediation_group";
  pageUrl?: string;
  viewportId?: "desktop" | "mobile";
  findingId?: string;
  representativeLabel?: string;
};

export type HumanReviewEvidenceRef = {
  type:
    | "reviewer_note"
    | "related_finding"
    | "related_occurrence"
    | "contrast_measurement"
    | "visual_locator_evidence"
    | "image_alt_review"
    | "screen_reader_preview_observation"
    | "video_review_observation"
    | "automated_rescan_reference"
    | "report_contribution";
  refId: string;
  label: string;
};

export type HumanReviewDecisionReason =
  | "observed_expected_behavior"
  | "issue_observed"
  | "not_applicable_feature_absent"
  | "insufficient_evidence";

export type HumanReviewRecord = {
  reviewId: string;
  checkDefinitionId: string;
  checkDefinitionVersion: number;

  title: string;
  category: HumanReviewCategory;
  description: string;
  whyHumanReviewRequired: string;

  applicableScope: HumanReviewScope;
  applicability: ApplicabilityLevel;

  relatedFindingIds: string[];
  relatedRuleIds: string[];
  relatedContributionIds: string[];

  procedureSteps: string[];

  status: HumanReviewStatus;
  decisionReason?: HumanReviewDecisionReason;
  notes?: string;
  evidenceReferences: HumanReviewEvidenceRef[];

  createdAt: string;
  updatedAt: string;
  reviewedAt?: string;

  provenance: "human_review";
  reportInclusion: "default" | "exclude_notes";

  /** Links axe incomplete uncertainty (not a pass/fail). */
  relatedIncompleteRuleIds?: string[];
};

export type HumanReviewCheckDefinition = {
  id: string;
  version: number;
  title: string;
  category: HumanReviewCategory;
  description: string;
  whyHumanReviewRequired: string;
  procedureSteps: string[];
  relatedWcagMappings: string[];
  relatedAutomatedRuleIds: string[];
  relatedToolIds: import("@/features/accessibility-workspace/types").WorkspaceToolId[];
  relevanceTags: string[];
  evidenceSuggestions: string[];
};

export type HumanReviewProgress = {
  relevant: number;
  reviewed: number;
  passes: number;
  needsReview: number;
  notApplicable: number;
  notReviewed: number;
  unknownApplicability: number;
  possiblyRelevant: number;
  /** Open work: not reviewed + needs review among relevant/possibly relevant */
  remainingOpen: number;
};

export type HumanReviewReportBlock = {
  progress: HumanReviewProgress;
  records: HumanReviewRecord[];
  disclaimer: string;
};
