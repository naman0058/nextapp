import type { SocialPlatform } from "@/types";
import type { ReportAiRemediationAppendix } from "@/features/reports/types/reportAiRemediation";
import type {
  OverallReportStatus,
  ReportPriority,
  ReportSourceType,
  ReportStatus,
} from "@/features/reports/types/reportStatus";

export type ReportContentType =
  | "social_post"
  | "image_post"
  | "video_post"
  | "website_scan";

export type ReportProjectInfo = {
  reportTitle?: string;
  clientOrganization?: string;
  campaignProjectName?: string;
  contentIdentifier?: string;
  preparedBy?: string;
  internalNotes?: string;
};

export type ReportFinding = {
  id: string;
  section: string;
  title: string;
  status: ReportStatus;
  priority?: ReportPriority;
  sourceType: ReportSourceType;
  finding: string;
  recommendation?: string;
  userConfirmed?: boolean;
  technicalId?: string;
};

export type ReportSectionCounts = {
  ready: number;
  review: number;
  attention: number;
  not_checked: number;
  not_applicable: number;
};

export type ReportSection = {
  id: string;
  title: string;
  sectionStatus: "Completed" | "Review Required" | "Not Checked" | "Not Applicable" | "Unavailable";
  summaryLabel?: string;
  counts?: ReportSectionCounts;
  findings: ReportFinding[];
  notes?: string[];
};

export type ReportSummary = {
  overallStatus: OverallReportStatus;
  platform: SocialPlatform | null;
  contentType: ReportContentType;
  checksCompleted: number;
  itemsReady: number;
  itemsRequiringReview: number;
  importantIssues: number;
  humanReviewRemaining: number;
  ruleBasedReadinessScore?: number;
  ruleBasedReadinessBand?: string;
  sectionSummaries: { id: string; label: string; tone: string }[];
};

export type HumanReviewItem = {
  id: string;
  title: string;
  detail: string;
  priority: ReportPriority;
  status: "pending" | "completed";
  phase: string;
};

export type HumanReviewSummary = {
  items: HumanReviewItem[];
  remainingCount: number;
};

export type ReportMethodology = {
  version: string;
  categories: { type: ReportSourceType; label: string; examples: string[] }[];
};

export type AccessibilityPreflightReport = {
  reportId: string;
  generatedAt: string;
  generatedAtDisplay: string;
  reportVersion: string;
  contentType: ReportContentType;
  platform: SocialPlatform | null;
  projectInfo: ReportProjectInfo;
  summary: ReportSummary;
  textAccessibility?: ReportSection;
  imageAccessibility?: ReportSection;
  visualAccessibility?: ReportSection;
  screenReaderPreview?: ReportSection;
  videoAccessibility?: ReportSection;
  platformPublishing?: ReportSection;
  humanReview: HumanReviewSummary;
  methodology: ReportMethodology;
  limitations: string[];
  disclaimer: string;
  /** Privacy-controlled content blocks */
  finalWorkingCaption?: string;
  altText?: string;
  fullTranscript?: string;
  imageThumbnailDataUrl?: string;
  /** Optional AI-assisted remediation appendix (explicit user inclusion only) */
  aiRemediationAppendix?: ReportAiRemediationAppendix;
  /** When appendix included: count for executive summary (not issues fixed) */
  aiRemediationIncludedSummary?: string;
};
