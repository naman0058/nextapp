import type { AccessibilityEvidence } from "@/features/accessibility-intelligence/types/evidence";
import type { RemediationPriority } from "@/features/accessibility-intelligence/types/normalizedFinding";
import type { NormalizedAccessibilityFinding } from "@/features/accessibility-intelligence/types/normalizedFinding";
import type {
  ProductFindingCategory,
  ScanResultOutcome,
  ScanResultSource,
} from "@/features/website-scanner/taxonomy/types";
import type { AxeImpact } from "@/features/website-scanner/types/scanTypes";

export type FindingDetailKind =
  | "automated_failure"
  | "best_practice"
  | "incomplete_only";

export type WcagMappingDetail = {
  criterion: string;
  title?: string;
  level: "A" | "AA" | "AAA" | string;
  relationNote?: string;
};

export type ContrastEvidenceFields = {
  foregroundColor?: string;
  backgroundColor?: string;
  measuredContrastRatio?: string;
  requiredRatio?: string;
  fontSize?: string;
  fontWeight?: string;
  expectedThreshold?: string;
  rawFailureSummary?: string;
};

export type AriaSemanticsEvidenceFields = {
  tag?: string;
  role?: string;
  ariaAttributes?: string[];
  accessibleNameHint?: string;
  failureSummary?: string;
};

export type FindingEvidenceItem = {
  evidenceId: string;
  pageUrl: string;
  viewportId: "desktop" | "mobile";
  selector?: string;
  htmlSnippet?: string;
  failureSummary?: string;
  nodeImpact?: AxeImpact;
  measurement?: AccessibilityEvidence["measurement"];
  occurrenceIndex: number;
  contrast?: ContrastEvidenceFields;
  aria?: AriaSemanticsEvidenceFields;
};

export type PageViewportScope = {
  pageUrl: string;
  viewportId: "desktop" | "mobile";
  occurrenceCount: number;
};

export type RelatedIncompleteSummary = {
  findingId: string;
  ruleId: string;
  title: string;
  totalOccurrences: number;
  retainedEvidenceCount: number;
  affectedUrls: string[];
  affectedViewports: ("desktop" | "mobile")[];
  explanation?: string;
};

export type SpecializedToolRoute = {
  href: string;
  label: string;
};

export type FindingDetail = {
  findingId: string;
  remediationGroupId?: string;
  ruleId: string;
  title: string;
  description: string;
  helpUrl?: string;

  kind: FindingDetailKind;
  source: ScanResultSource;
  outcome: ScanResultOutcome;
  category: ProductFindingCategory;
  isBestPractice: boolean;

  impact: AxeImpact;
  priority: RemediationPriority;

  wcagMappings: WcagMappingDetail[];

  totalOccurrences: number;
  retainedEvidenceCount: number;
  displayedSelectorCount: number;
  pagesAffected: number;
  affectedUrls: string[];
  affectedViewports: ("desktop" | "mobile")[];

  representativeSelectors: string[];
  evidenceItems: FindingEvidenceItem[];
  pageViewportScopes: PageViewportScope[];

  relatedIncomplete: RelatedIncompleteSummary[];
  relatedManualTasks: string[];
  /** Phase 7 stable human review check definition IDs. */
  relatedHumanReviewCheckIds: string[];

  deterministicFixAvailable: boolean;
  aiRemediationAvailable: boolean;
  visualLocatorAvailable: boolean;
  developerTicketAvailable: boolean;
  specializedTool?: SpecializedToolRoute;

  /** Linked normalized rows (for Fix Lab / legacy hooks). */
  normalizedFindings: NormalizedAccessibilityFinding[];
};
