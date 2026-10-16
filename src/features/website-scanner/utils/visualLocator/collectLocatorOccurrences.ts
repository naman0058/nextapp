import { buildIssueFingerprint } from "@/features/accessibility-intelligence/compare/issueFingerprint";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import type { WebsiteViolationNode } from "@/features/website-scanner/types/scanTypes";
import { isNodeVisuallyLocatable } from "@/features/website-scanner/utils/visualLocator/isFindingVisuallyLocatable";

export type LocatorOccurrence = {
  pageUrl: string;
  viewportId: "desktop" | "mobile";
  ruleId: string;
  ruleTitle: string;
  occurrenceIndex: number;
  occurrenceTotal: number;
  target: unknown;
  selectorLabel: string;
  domSignature?: string;
  htmlSnippet?: string;
  issueFingerprint: string;
};

function collectNodesForRule(
  page: WebsitePageScanResult,
  ruleId: string,
): WebsiteViolationNode[] {
  const nodes: WebsiteViolationNode[] = [];
  for (const v of page.violations) {
    if (v.id !== ruleId || v.isBestPractice) continue;
    nodes.push(...v.nodes);
  }
  for (const inc of page.incomplete) {
    if (inc.id !== ruleId) continue;
    nodes.push(...inc.nodes);
  }
  return nodes;
}

export function collectLocatorOccurrencesForRule(
  pages: WebsitePageScanResult[],
  ruleId: string,
  ruleTitle: string,
  pageUrlFilter?: string,
): LocatorOccurrence[] {
  const out: LocatorOccurrence[] = [];
  for (const page of pages) {
    if (pageUrlFilter && page.finalUrl !== pageUrlFilter) continue;
    const nodes = collectNodesForRule(page, ruleId);
    let indexInPage = 0;
    for (const node of nodes) {
      if (
        !isNodeVisuallyLocatable({
          ruleId,
          target: node.target,
          selectorLabel: node.selectorLabel,
        })
      ) {
        continue;
      }
      const issueFingerprint = buildIssueFingerprint({
        pageUrl: page.finalUrl,
        ruleId,
        domSignature: node.domSignature,
        selectorLabel: node.selectorLabel,
      });
      out.push({
        pageUrl: page.finalUrl,
        viewportId: page.viewport.id,
        ruleId,
        ruleTitle,
        occurrenceIndex: indexInPage,
        occurrenceTotal: nodes.length,
        target: node.target,
        selectorLabel: node.selectorLabel,
        domSignature: node.domSignature,
        htmlSnippet: node.htmlSnippet,
        issueFingerprint,
      });
      indexInPage += 1;
    }
  }
  return out.map((o, i) => ({
    ...o,
    occurrenceIndex: i,
    occurrenceTotal: out.length,
  }));
}

export function canVisualizeRule(
  pages: WebsitePageScanResult[],
  ruleId: string,
): boolean {
  return collectLocatorOccurrencesForRule(pages, ruleId, ruleId).length > 0;
}
