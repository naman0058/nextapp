export type ViewportIssueComparisonClass =
  | "both"
  | "desktop_only"
  | "mobile_only"
  | "changed_count"
  | "unreliable";

export type ViewportPageComparison = {
  pageUrl: string;
  comparisonLimited: boolean;
  desktopOnlyCount: number;
  mobileOnlyCount: number;
  bothCount: number;
  changedOccurrenceCount: number;
  rows: ViewportComparisonRow[];
};

export type ViewportComparisonRow = {
  ruleId: string;
  classification: ViewportIssueComparisonClass;
  desktopOccurrences: number;
  mobileOccurrences: number;
  label: string;
};

export type SiteViewportComparisonSummary = {
  pagesCompared: number;
  issuesInBoth: number;
  desktopOnly: number;
  mobileOnly: number;
  changedOccurrenceCounts: number;
  limitedComparison: boolean;
};
