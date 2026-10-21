import type { RootCauseGroup } from "@/features/accessibility-intelligence/types/siteIntelligence";
import type { NormalizedAccessibilityFinding } from "@/features/accessibility-intelligence/types/normalizedFinding";
import type { ProductFindingCategory } from "@/features/website-scanner/taxonomy/types";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";

export type IssuesSortKey =
  | "priority"
  | "impact"
  | "pages"
  | "occurrences"
  | "rule";

export type IssuesViewportFilter = "all" | "both" | "desktop" | "mobile";

export type IssuesStatusFilter =
  | "actionable"
  | "failed"
  | "confirmation"
  | "best_practice";

export type IssuesFilterState = {
  priority: string;
  impact: string;
  wcagLevel: string;
  wcagCriterion: string;
  category: ProductFindingCategory | "all";
  pageUrl: string;
  sourceType: string;
  bestPracticeOnly: boolean | null;
  humanReviewOnly: boolean;
  issueStatus: IssuesStatusFilter;
  search: string;
  viewport: IssuesViewportFilter;
};

export const DEFAULT_ISSUES_FILTER: IssuesFilterState = {
  priority: "all",
  impact: "all",
  wcagLevel: "all",
  wcagCriterion: "all",
  category: "all",
  pageUrl: "all",
  sourceType: "all",
  bestPracticeOnly: null,
  humanReviewOnly: false,
  issueStatus: "actionable",
  search: "",
  viewport: "all",
};

export function filterFindingsByIssueStatus(
  findings: NormalizedAccessibilityFinding[],
  issueStatus: IssuesStatusFilter,
): NormalizedAccessibilityFinding[] {
  switch (issueStatus) {
    case "failed":
      return findings.filter((f) => f.status === "issue" && !f.bestPractice);
    case "confirmation":
      return findings.filter(
        (f) => f.status === "review" && f.humanReviewRequired && f.sourceType === "axe",
      );
    case "best_practice":
      return findings.filter((f) => f.status === "issue" && f.bestPractice);
    case "actionable":
    default:
      return findings.filter((f) => f.status === "issue" && !f.bestPractice);
  }
}

export function filterFindingsByViewport(
  findings: NormalizedAccessibilityFinding[],
  viewport: IssuesViewportFilter,
): NormalizedAccessibilityFinding[] {
  if (viewport === "all") return findings;
  if (viewport === "desktop") {
    return findings.filter((f) => f.viewportId === "desktop" || !f.viewportId);
  }
  if (viewport === "mobile") {
    return findings.filter((f) => f.viewportId === "mobile");
  }
  const desktopKeys = new Set(
    findings
      .filter((f) => f.viewportId === "desktop" && f.ruleId && f.pageUrl)
      .map((f) => `${f.pageUrl}::${f.ruleId}`),
  );
  const mobileKeys = new Set(
    findings
      .filter((f) => f.viewportId === "mobile" && f.ruleId && f.pageUrl)
      .map((f) => `${f.pageUrl}::${f.ruleId}`),
  );
  const bothKeys = new Set(
    [...desktopKeys].filter((k) => mobileKeys.has(k)),
  );
  return findings.filter(
    (f) =>
      f.pageUrl &&
      f.ruleId &&
      bothKeys.has(`${f.pageUrl}::${f.ruleId}`),
  );
}

export function filterNormalizedFindings(
  findings: NormalizedAccessibilityFinding[],
  filter: IssuesFilterState,
): NormalizedAccessibilityFinding[] {
  const q = filter.search.trim().toLowerCase();
  const byViewport = filterFindingsByViewport(findings, filter.viewport);
  const byStatus = filterFindingsByIssueStatus(byViewport, filter.issueStatus);
  return byStatus.filter((f) => {
    if (filter.humanReviewOnly && !f.humanReviewRequired) return false;
    if (filter.bestPracticeOnly === true && !f.bestPractice) return false;
    if (filter.bestPracticeOnly === false && f.bestPractice) return false;
    if (filter.priority !== "all" && f.priority !== filter.priority) return false;
    if (filter.impact !== "all" && f.impact !== filter.impact) return false;
    if (filter.wcagLevel !== "all" && f.wcagLevel !== filter.wcagLevel) return false;
    if (filter.pageUrl !== "all" && f.pageUrl !== filter.pageUrl) return false;
    if (filter.sourceType !== "all" && f.sourceType !== filter.sourceType) return false;
    if (!q) return true;
    return (
      (f.ruleId?.toLowerCase().includes(q) ?? false) ||
      f.title.toLowerCase().includes(q) ||
      (f.pageUrl?.toLowerCase().includes(q) ?? false) ||
      (f.wcagCriteria?.join(" ").toLowerCase().includes(q) ?? false) ||
      (f.evidence.some((e) => e.selector?.toLowerCase().includes(q)) ?? false)
    );
  });
}

export function sortRootCauseGroupsForIssues(
  groups: RootCauseGroup[],
  sortKey: IssuesSortKey,
  findings: NormalizedAccessibilityFinding[],
): RootCauseGroup[] {
  const copy = [...groups];
  const priorityForRule = (ruleId: string) => {
    const f = findings.find((x) => x.ruleId === ruleId && x.status === "issue");
    return f?.priority ?? "medium";
  };
  const impactOrder: Record<string, number> = {
    critical: 0,
    serious: 1,
    moderate: 2,
    minor: 3,
    unknown: 4,
  };
  copy.sort((a, b) => {
    switch (sortKey) {
      case "pages":
        return b.affectedPages.length - a.affectedPages.length;
      case "occurrences":
        return b.totalOccurrences - a.totalOccurrences;
      case "impact": {
        const ia = impactOrder[findings.find((f) => f.ruleId === a.ruleId)?.impact ?? "unknown"];
        const ib = impactOrder[findings.find((f) => f.ruleId === b.ruleId)?.impact ?? "unknown"];
        return ia - ib;
      }
      case "rule":
        return a.label.localeCompare(b.label);
      case "priority":
      default: {
        const pa = priorityForRule(a.ruleId);
        const pb = priorityForRule(b.ruleId);
        const order = { high: 0, medium: 1, low: 2 };
        return order[pa] - order[pb];
      }
    }
  });
  return copy;
}

export function groupFindingsByPage(
  findings: NormalizedAccessibilityFinding[],
): { pageUrl: string; findings: NormalizedAccessibilityFinding[] }[] {
  const map = new Map<string, NormalizedAccessibilityFinding[]>();
  for (const f of findings) {
    const url = f.pageUrl ?? "(unknown)";
    const list = map.get(url) ?? [];
    list.push(f);
    map.set(url, list);
  }
  return [...map.entries()].map(([pageUrl, items]) => ({ pageUrl, findings: items }));
}

export function groupFindingsByRule(
  findings: NormalizedAccessibilityFinding[],
): { ruleId: string; title: string; findings: NormalizedAccessibilityFinding[] }[] {
  const map = new Map<string, NormalizedAccessibilityFinding[]>();
  for (const f of findings) {
    const id = f.ruleId ?? f.id;
    const list = map.get(id) ?? [];
    list.push(f);
    map.set(id, list);
  }
  return [...map.entries()].map(([ruleId, items]) => ({
    ruleId,
    title: items[0]?.title ?? ruleId,
    findings: items,
  }));
}

export function mergePageMetadata(
  pages: WebsitePageScanResult[],
): import("@/features/website-scanner/types/scanTypes").WebsitePageMetadata {
  const base = pages[0]?.pageMetadata;
  if (!base) {
    return {
      documentLang: null,
      domNodeCount: 0,
      internalLinkCount: 0,
      linkCount: 0,
      iframeCount: 0,
      formCount: 0,
      imageCount: 0,
      headingCount: 0,
      videoCount: 0,
      interactiveControlCount: 0,
      dialogHintCount: 0,
    };
  }
  return pages.reduce(
    (acc, p) => ({
      documentLang: acc.documentLang ?? p.pageMetadata.documentLang,
      domNodeCount: acc.domNodeCount + p.pageMetadata.domNodeCount,
      internalLinkCount:
        acc.internalLinkCount + p.pageMetadata.internalLinkCount,
      linkCount: acc.linkCount + p.pageMetadata.linkCount,
      iframeCount: acc.iframeCount + p.pageMetadata.iframeCount,
      formCount: acc.formCount + p.pageMetadata.formCount,
      imageCount: acc.imageCount + p.pageMetadata.imageCount,
      headingCount: acc.headingCount + p.pageMetadata.headingCount,
      videoCount: acc.videoCount + p.pageMetadata.videoCount,
      interactiveControlCount:
        acc.interactiveControlCount + p.pageMetadata.interactiveControlCount,
      dialogHintCount: acc.dialogHintCount + p.pageMetadata.dialogHintCount,
    }),
    { ...base },
  );
}
