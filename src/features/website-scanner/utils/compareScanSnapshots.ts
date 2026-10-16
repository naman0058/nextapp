import { buildIssueFingerprint } from "@/features/accessibility-intelligence/compare/issueFingerprint";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";

export type ComparisonStatus =
  | "resolved"
  | "new"
  | "persistent"
  | "changed"
  | "could_not_reliably_match";

export type IssueComparisonRow = {
  key: string;
  fingerprint: string;
  pageUrl: string;
  ruleId: string;
  selector: string;
  status: ComparisonStatus;
  previousOccurrenceCount?: number;
  currentOccurrenceCount?: number;
};

type IssueEntry = {
  fingerprint: string;
  pageUrl: string;
  ruleId: string;
  selector: string;
  occurrenceCount: number;
};

function collectIssues(pages: WebsitePageScanResult[]): Map<string, IssueEntry> {
  const map = new Map<string, IssueEntry>();
  for (const page of pages) {
    for (const v of page.violations) {
      for (const node of v.nodes) {
        const fingerprint = buildIssueFingerprint({
          pageUrl: page.finalUrl,
          ruleId: v.id,
          domSignature: node.domSignature,
          selectorLabel: node.selectorLabel,
        });
        map.set(fingerprint, {
          fingerprint,
          pageUrl: page.finalUrl,
          ruleId: v.id,
          selector: node.selectorLabel,
          occurrenceCount: v.totalNodeCount,
        });
      }
      if (v.nodes.length === 0) {
        const fingerprint = buildIssueFingerprint({
          pageUrl: page.finalUrl,
          ruleId: v.id,
          selectorLabel: "__rule__",
        });
        map.set(fingerprint, {
          fingerprint,
          pageUrl: page.finalUrl,
          ruleId: v.id,
          selector: "__rule__",
          occurrenceCount: v.totalNodeCount,
        });
      }
    }
  }
  return map;
}

export function compareScanSnapshots(
  previous: WebsitePageScanResult[],
  current: WebsitePageScanResult[],
): {
  resolved: number;
  newCount: number;
  persistent: number;
  changed: number;
  rows: IssueComparisonRow[];
} {
  const prev = collectIssues(previous);
  const curr = collectIssues(current);
  const rows: IssueComparisonRow[] = [];

  for (const [fp, entry] of curr) {
    const prior = prev.get(fp);
    let status: ComparisonStatus;
    if (!prior) {
      status = "new";
    } else if (prior.occurrenceCount !== entry.occurrenceCount) {
      status = "changed";
    } else {
      status = "persistent";
    }
    rows.push({
      key: fp,
      fingerprint: fp,
      pageUrl: entry.pageUrl,
      ruleId: entry.ruleId,
      selector: entry.selector,
      status,
      previousOccurrenceCount: prior?.occurrenceCount,
      currentOccurrenceCount: entry.occurrenceCount,
    });
  }

  for (const [fp, entry] of prev) {
    if (!curr.has(fp)) {
      rows.push({
        key: fp,
        fingerprint: fp,
        pageUrl: entry.pageUrl,
        ruleId: entry.ruleId,
        selector: entry.selector,
        status: "resolved",
        previousOccurrenceCount: entry.occurrenceCount,
        currentOccurrenceCount: 0,
      });
    }
  }

  return {
    resolved: rows.filter((r) => r.status === "resolved").length,
    newCount: rows.filter((r) => r.status === "new").length,
    persistent: rows.filter((r) => r.status === "persistent").length,
    changed: rows.filter((r) => r.status === "changed").length,
    rows,
  };
}
