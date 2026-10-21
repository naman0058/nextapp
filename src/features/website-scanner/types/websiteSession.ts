import type { ScanViewportId } from "@/features/website-scanner/constants/viewports";
import type { WebsiteFixGuidance } from "@/features/website-scanner/types/aiFixGuidance";
import type { WebsiteAiRemediationEntry } from "@/features/website-scanner/types/websiteAiRemediation";
import type {
  ExplanationLevel,
  IssuesGroupBy,
  ResultViewTab,
  UserFixTaskStatus,
} from "@/features/website-scanner/types/resultUx";
import type { IssuesFilterState } from "@/features/website-scanner/utils/issuesListUtils";
import type { SiteScanIntelligence } from "@/features/accessibility-intelligence/types/siteIntelligence";
import type {
  DiscoveredUrl,
  ExportPreferences,
  ReportBranding,
  ScanScopeSummary,
  ScanWorkload,
  SetupPhase,
  UrlPatternGroup,
  ViewportScanMode,
} from "@/features/website-scanner/types/websiteDiscovery";
import type { ViewportPageComparison } from "@/features/website-scanner/types/viewportComparison";
import type {
  SiteRuleAggregate,
  WebsitePageScanResult,
  WebsiteScanMode,
} from "@/features/website-scanner/types/scanTypes";

export type ManualReviewStatus =
  | "not_reviewed"
  | "passes"
  | "needs_review"
  | "not_applicable";

export type ManualReviewEntry = {
  itemId: string;
  status: ManualReviewStatus;
  note: string;
};

export type WebsitePageEntry = {
  url: string;
  normalizedKey: string;
  depth: number;
  status:
    | "queued"
    | "scanning"
    | "complete"
    | "skipped"
    | "blocked"
    | "failed";
  skipReason?: string;
  /** Legacy single-viewport result */
  result?: WebsitePageScanResult;
  desktopResult?: WebsitePageScanResult;
  mobileResult?: WebsitePageScanResult;
  viewportComparison?: ViewportPageComparison;
  duplicateFinalUrl?: boolean;
  canonicalUrl?: string | null;
  errorMessage?: string;
};

export type WebsiteScanSessionStatus =
  | "idle"
  | "validating"
  | "scanning"
  | "stopping"
  | "complete"
  | "partial"
  | "failed";

export type WebsiteScanSessionState = {
  sessionId: string;
  rootUrl: string;
  finalOrigin: string | null;
  mode: WebsiteScanMode;
  viewportId: ScanViewportId;
  includeBestPractices: boolean;
  startedAt: string | null;
  completedAt: string | null;
  status: WebsiteScanSessionStatus;
  stageLabel: string;
  pages: WebsitePageEntry[];
  crawlQueue: { url: string; depth: number }[];
  discoveredTotal: number;
  manualReview: ManualReviewEntry[];
  aiGuidance: Record<string, WebsiteFixGuidance & { stale?: boolean }>;
  previousSnapshot: WebsitePageScanResult[] | null;
  aggregates: SiteRuleAggregate[] | null;
  siteIntelligence: SiteScanIntelligence | null;
  liveMessage: string;
  resultView: ResultViewTab;
  issuesGroupBy: IssuesGroupBy;
  issuesFilter: IssuesFilterState;
  explanationLevel: ExplanationLevel;
  fixTaskStatus: Record<string, UserFixTaskStatus>;
  aiGuidanceByGroup: Record<string, WebsiteFixGuidance & { stale?: boolean }>;
  aiRemediationByGroup: Record<string, WebsiteAiRemediationEntry>;
  scanRevision: number;
  includeDeveloperFixGuidanceInReport: boolean;
  includeAiRemediationInReport: boolean;
  aiRemediationInclusionById: Record<string, boolean>;
  showAllManualChecks: boolean;
  highlightFixTaskId: string | null;
  /** Phase 6: scroll/highlight target in Issues explorer after tool handoff return. */
  highlightFindingId: string | null;
  /** Phase 7: scroll/highlight human review check after navigation from a finding. */
  highlightHumanReviewCheckId: string | null;
  setupPhase: SetupPhase;
  scanSource: "current_page" | "discover_site" | "sitemap";
  discoverySource: ScanScopeSummary["discoverySource"];
  discoveredUrls: DiscoveredUrl[];
  selectedUrlKeys: string[];
  suggestedUrlKeys: string[];
  urlPatternGroups: UrlPatternGroup[];
  externalUrlsIgnoredCount: number;
  scanScope: ScanScopeSummary;
  viewportMode: ViewportScanMode;
  scanWorkload: ScanWorkload;
  siteBatchId: string | null;
  viewportComparisonSummary: import("@/features/website-scanner/types/viewportComparison").SiteViewportComparisonSummary | null;
  reportBranding: ReportBranding;
  exportPreferences: ExportPreferences;
  /** Phase 6 cross-tool workspace (local session contributions). */
  accessibilityWorkspace: import("@/features/accessibility-workspace/types").AccessibilityWorkspaceState;
};
