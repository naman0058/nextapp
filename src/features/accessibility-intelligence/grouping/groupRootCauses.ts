import type { AccessibilityEvidence } from "@/features/accessibility-intelligence/types/evidence";
import type { RootCauseGroup } from "@/features/accessibility-intelligence/types/siteIntelligence";
import {
  buildGroupLabel,
  inferGroupType,
} from "@/features/accessibility-intelligence/grouping/inferGroupLabel";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";

type Occurrence = {
  pageUrl: string;
  ruleId: string;
  help: string;
  selector: string;
  domSignature: string;
  landmark: import("@/features/website-scanner/types/scanTypes").LandmarkContext;
  tag?: string;
  role?: string;
  evidence: AccessibilityEvidence;
};

function groupConfidence(
  pages: number,
  occurrences: number,
  sameSignature: boolean,
): "high" | "medium" | "low" {
  if (pages >= 3 && occurrences >= 5 && sameSignature) return "high";
  if (pages >= 2 && occurrences >= 3) return "medium";
  return "low";
}

export function groupRootCauses(
  pages: WebsitePageScanResult[],
): RootCauseGroup[] {
  const occurrences: Occurrence[] = [];
  for (const page of pages) {
    for (const v of page.violations) {
      if (v.isBestPractice) continue;
      for (const node of v.nodes) {
        const sig =
          node.domSignature ??
          `${v.id}::${node.selectorLabel}`;
        occurrences.push({
          pageUrl: page.finalUrl,
          ruleId: v.id,
          help: v.help,
          selector: node.selectorLabel,
          domSignature: sig,
          landmark: node.landmarkContext ?? "unknown",
          tag: node.elementContext?.tag,
          role: node.elementContext?.role,
          evidence: {
            sourceType: "axe",
            sourceId: v.id,
            engine: "axe-core",
            engineVersion: page.axeVersion,
            wcagCriteria: v.wcagCriteria,
            selector: node.selectorLabel,
            htmlSnippet: node.htmlSnippet,
            confidenceCategory: "tool_detected",
          },
        });
      }
      if (v.nodes.length === 0 && v.totalNodeCount > 0) {
        occurrences.push({
          pageUrl: page.finalUrl,
          ruleId: v.id,
          help: v.help,
          selector: v.id,
          domSignature: `${v.id}::__aggregate__`,
          landmark: "unknown",
          evidence: {
            sourceType: "axe",
            sourceId: v.id,
            engine: "axe-core",
            confidenceCategory: "tool_detected",
            evidenceText: `${v.totalNodeCount} elements (examples truncated)`,
          },
        });
      }
    }
  }

  const buckets = new Map<string, Occurrence[]>();
  for (const occ of occurrences) {
    const key = `${occ.ruleId}::${occ.domSignature}`;
    const list = buckets.get(key) ?? [];
    list.push(occ);
    buckets.set(key, list);
  }

  const groups: RootCauseGroup[] = [];
  let idx = 0;
  for (const [, list] of buckets) {
    const first = list[0]!;
    const pageSet = new Set(list.map((o) => o.pageUrl));
    const pagesCount = pageSet.size;
    const occCount = list.length;
    const confidence = groupConfidence(
      pagesCount,
      occCount,
      list.every((o) => o.domSignature === first.domSignature),
    );
    const groupType =
      pagesCount === 1 && occCount === 1
        ? "isolated"
        : inferGroupType(first.landmark, first.tag, first.role);
    const likelyShared =
      confidence !== "low" && pagesCount >= 2 && groupType !== "isolated";

    groups.push({
      id: `rcg-${idx++}`,
      ruleId: first.ruleId,
      confidence,
      groupType,
      label: buildGroupLabel(first.ruleId, groupType, first.help),
      affectedPages: [...pageSet],
      totalOccurrences: occCount,
      representativeSelectors: [
        ...new Set(list.map((o) => o.selector).slice(0, 5)),
      ],
      representativeEvidence: list.slice(0, 3).map((o) => o.evidence),
      likelySharedComponent: likelyShared,
      remediationReach: {
        pages: pagesCount,
        occurrences: occCount,
      },
    });
  }

  return groups.sort(
    (a, b) => b.totalOccurrences - a.totalOccurrences,
  );
}

export function attachRootCauseIdsToViolations(
  pages: WebsitePageScanResult[],
  groups: RootCauseGroup[],
): Map<string, string> {
  const nodeToGroup = new Map<string, string>();
  for (const group of groups) {
    for (const sel of group.representativeSelectors) {
      nodeToGroup.set(`${group.ruleId}::${sel}`, group.id);
    }
  }
  return nodeToGroup;
}
