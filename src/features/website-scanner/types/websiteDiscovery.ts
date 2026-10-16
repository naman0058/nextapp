
export type DiscoverySourceKind =
  | "starting_url"
  | "sitemap"
  | "crawler"
  | "manual";

export type DiscoveredUrl = {
  url: string;
  normalizedKey: string;
  source: DiscoverySourceKind;
  depth?: number;
  lastModified?: string | null;
  patternGroupId?: string | null;
};

export type UrlPatternGroup = {
  id: string;
  pattern: string;
  urls: string[];
  urlCount: number;
  representativeUrls: string[];
  confidence: "high" | "medium" | "low";
};

export type ScanScopeSummary = {
  discoverySource: "current" | "crawl" | "sitemap" | "mixed";
  urlsDiscovered: number;
  urlsSelected: number;
  pagesCompleted: number;
  pagesPartial: number;
  pagesFailed: number;
  pagesSkippedRobots: number;
  urlsNotScanned: number;
};

export type ViewportScanMode = "desktop" | "mobile" | "compare";

export type ScanWorkload = {
  selectedPages: number;
  viewportsPerPage: number;
  totalPageEvaluations: number;
};

export type ReportBranding = {
  preparedFor: string;
  clientOrganization: string;
  projectName: string;
  preparedBy: string;
  reportSubtitle: string;
  accentColor: string;
  logoDataUrl: string | null;
};

export type ExportPreferences = {
  includeQueryStringsInExports: boolean;
  includeDeveloperAppendix: boolean;
  includeHumanReview: boolean;
  includeWcagCoverage: boolean;
  includeViewportComparison: boolean;
  includeRescanComparison: boolean;
  includeAiGuidance: boolean;
  includeAiRemediationInExports: boolean;
};

export const DEFAULT_EXPORT_PREFERENCES: ExportPreferences = {
  includeQueryStringsInExports: false,
  includeDeveloperAppendix: false,
  includeHumanReview: true,
  includeWcagCoverage: true,
  includeViewportComparison: true,
  includeRescanComparison: true,
  includeAiGuidance: false,
  includeAiRemediationInExports: false,
};

export const DEFAULT_REPORT_BRANDING: ReportBranding = {
  preparedFor: "",
  clientOrganization: "",
  projectName: "",
  preparedBy: "",
  reportSubtitle: "",
  accentColor: "#2563eb",
  logoDataUrl: null,
};

export type SetupPhase =
  | "configure"
  | "discovering"
  | "select_pages"
  | "ready_to_scan";
