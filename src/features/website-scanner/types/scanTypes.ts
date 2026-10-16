import type { ScanViewport } from "@/features/website-scanner/constants/viewports";

export type WebsiteScanMode = "single_page" | "small_site";

export type AxeImpact =
  | "critical"
  | "serious"
  | "moderate"
  | "minor"
  | "unknown";

export type AccessibilityRuleLevel = "A" | "AA" | "best-practice" | "other";

export type WebsitePageScanRequest = {
  url: string;
  viewport: ScanViewport;
  mode: WebsiteScanMode;
  rootOrigin: string | null;
  includeBestPractices: boolean;
  scanId?: string;
};

export type WebsiteCrawlDiscoveredUrl = {
  url: string;
  depth: number;
};

export type WebsiteDiscoverCrawlResult = {
  urls: WebsiteCrawlDiscoveredUrl[];
};

export type LandmarkContext =
  | "header"
  | "navigation"
  | "main"
  | "footer"
  | "form"
  | "dialog"
  | "aside"
  | "unknown";

export type ElementContextSummary = {
  tag?: string;
  role?: string;
  hasAriaLabel?: boolean;
  stableId?: string;
  stableClasses?: string[];
  inputType?: string;
  linkHost?: string;
};

export type WebsiteViolationNode = {
  target: unknown;
  selectorLabel: string;
  htmlSnippet?: string;
  failureSummary?: string;
  landmarkContext?: LandmarkContext;
  elementContext?: ElementContextSummary;
  domSignature?: string;
  evidenceTruncated?: boolean;
};

export type ScanCompletenessLevel =
  | "complete"
  | "partial"
  | "limited"
  | "failed";

export type PageNodeReporting = {
  totalOccurrences: number;
  examplesShown: number;
  truncated: boolean;
};

export type PageScanQuality = {
  pageFullyLoaded: boolean;
  resourceBudgetExceeded: boolean;
  domTruncated: boolean;
  nodeEvidenceTruncated: boolean;
  crossOriginFrameLimitations: boolean;
  lazyContentSampling: "completed" | "limited";
  scanTimeout: boolean;
  domContentLoadedMs?: number;
  settleMs?: number;
  axeDurationMs?: number;
};

export type WebsiteAccessibilityViolation = {
  id: string;
  impact: AxeImpact;
  help: string;
  description: string;
  helpUrl?: string;
  tags: string[];
  wcagCriteria: string[];
  level: AccessibilityRuleLevel;
  totalNodeCount: number;
  nodes: WebsiteViolationNode[];
  isBestPractice: boolean;
};

export type WebsiteAccessibilityIncomplete = {
  id: string;
  impact: AxeImpact;
  help: string;
  description: string;
  helpUrl?: string;
  tags: string[];
  wcagCriteria: string[];
  level: AccessibilityRuleLevel;
  totalNodeCount: number;
  nodes: WebsiteViolationNode[];
};

export type PageAccessibilitySummary = {
  critical: number;
  serious: number;
  moderate: number;
  minor: number;
  unknown: number;
  incomplete: number;
  bestPractice: number;
};

export type WebsitePageMetadata = {
  documentLang: string | null;
  domNodeCount: number;
  internalLinkCount: number;
  linkCount: number;
  iframeCount: number;
  formCount: number;
  imageCount: number;
  headingCount: number;
  videoCount: number;
  interactiveControlCount: number;
  dialogHintCount: number;
};

export type WebsitePageScanResult = {
  requestedUrl: string;
  finalUrl: string;
  pageTitle: string | null;
  scannedAt: string;
  viewport: ScanViewport;
  httpStatus?: number;
  durationMs: number;
  axeVersion: string;
  scannerVersion: string;
  summary: PageAccessibilitySummary;
  violations: WebsiteAccessibilityViolation[];
  incomplete: WebsiteAccessibilityIncomplete[];
  passesCount: number;
  inapplicableCount: number;
  discoveredLinks: string[];
  warnings: string[];
  pageMetadata: WebsitePageMetadata;
  scanCompleteness?: ScanCompletenessLevel;
  scanQuality?: PageScanQuality;
  nodeReporting?: PageNodeReporting;
};

export type SiteRulePageOccurrence = {
  pageUrl: string;
  nodeCount: number;
};

export type SiteRuleAggregate = {
  ruleId: string;
  impact: AxeImpact;
  help: string;
  description: string;
  wcagCriteria: string[];
  level: AccessibilityRuleLevel;
  isBestPractice: boolean;
  affectedPageCount: number;
  totalNodeCount: number;
  pages: SiteRulePageOccurrence[];
};
