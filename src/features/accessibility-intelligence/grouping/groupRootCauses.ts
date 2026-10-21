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

function isDistinctSharedCluster(list: Occurrence[]): boolean {
  const pageSet = new Set(list.map((o) => o.pageUrl));
  const occCount = list.length;
  if (pageSet.size >= 2 && occCount >= 2) return true;
  if (occCount >= 5) return true;
  return false;
}

function scannerTotalForRule(
  pages: WebsitePageScanResult[],
  ruleId: string,
  pageUrls: ReadonlySet<string>,
): number {
  let total = 0;
  for (const page of pages) {
    if (!pageUrls.has(page.finalUrl)) continue;
    for (const v of page.violations) {
      if (v.id !== ruleId || v.isBestPractice) continue;
      total += v.totalNodeCount;
    }
  }
  return total;
}

function resolveTotalAffectedOccurrences(
  list: Occurrence[],
  pages: WebsitePageScanResult[],
  pageSet: ReadonlySet<string>,
  groupType: RootCauseGroup["groupType"],
  retained: number,
): number {
  const ruleId = list[0]!.ruleId;
  const scannerTotal = scannerTotalForRule(pages, ruleId, pageSet);
  if (groupType === "rule_consolidated") {
    return scannerTotal > 0 ? scannerTotal : retained;
  }
  if (groupType === "isolated" && pageSet.size === 1) {
    return scannerTotal > 0 ? Math.max(retained, scannerTotal) : retained;
  }
  return retained;
}

function buildGroupFromOccurrences(
  list: Occurrence[],
  id: string,
  pages: WebsitePageScanResult[],
  groupTypeOverride?: RootCauseGroup["groupType"],
): RootCauseGroup {
  const first = list[0]!;
  const pageSet = new Set(list.map((o) => o.pageUrl));
  const pagesCount = pageSet.size;
  const retainedEvidenceCount = list.length;
  const groupType =
    groupTypeOverride ??
    (pagesCount === 1 && retainedEvidenceCount === 1
      ? "isolated"
      : inferGroupType(first.landmark, first.tag, first.role));
  const totalOccurrences = resolveTotalAffectedOccurrences(
    list,
    pages,
    pageSet,
    groupType,
    retainedEvidenceCount,
  );
  const confidence = groupConfidence(
    pagesCount,
    totalOccurrences,
    list.every((o) => o.domSignature === first.domSignature),
  );
  const likelyShared =
    groupType !== "rule_consolidated" &&
    confidence !== "low" &&
    pagesCount >= 2 &&
    groupType !== "isolated";

  const uniqueSelectors = [...new Set(list.map((o) => o.selector))];

  return {
    id,
    ruleId: first.ruleId,
    confidence,
    groupType,
    label: buildGroupLabel(first.ruleId, groupType, first.help),
    affectedPages: [...pageSet],
    totalOccurrences,
    retainedEvidenceCount,
    representativeSelectors: uniqueSelectors.slice(0, 50),
    representativeEvidence: list.slice(0, 5).map((o) => o.evidence),
    likelySharedComponent: likelyShared,
    remediationReach: {
      pages: pagesCount,
      occurrences: totalOccurrences,
    },
  };
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

  const microBuckets = new Map<string, Occurrence[]>();
  for (const occ of occurrences) {
    const key = `${occ.ruleId}::${occ.domSignature}`;
    const list = microBuckets.get(key) ?? [];
    list.push(occ);
    microBuckets.set(key, list);
  }

  const sharedGroups: RootCauseGroup[] = [];
  const orphanByRule = new Map<string, Occurrence[]>();
  let idx = 0;

  for (const list of microBuckets.values()) {
    if (isDistinctSharedCluster(list)) {
      sharedGroups.push(
        buildGroupFromOccurrences(list, `rcg-${idx++}`, pages),
      );
      continue;
    }
    const ruleId = list[0]!.ruleId;
    const orphans = orphanByRule.get(ruleId) ?? [];
    orphans.push(...list);
    orphanByRule.set(ruleId, orphans);
  }

  const consolidatedGroups: RootCauseGroup[] = [];
  for (const [, list] of orphanByRule) {
    if (list.length === 0) continue;
    if (list.length === 1) {
      consolidatedGroups.push(
        buildGroupFromOccurrences(list, `rcg-${idx++}`, pages, "isolated"),
      );
      continue;
    }
    consolidatedGroups.push(
      buildGroupFromOccurrences(
        list,
        `rcg-${idx++}`,
        pages,
        "rule_consolidated",
      ),
    );
  }

  return [...sharedGroups, ...consolidatedGroups].sort(
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

/** Stable remediation group key for fix-plan deduplication. */
export function remediationGroupKey(group: RootCauseGroup): string {
  return `${group.ruleId}::${group.groupType}::${group.likelySharedComponent ? "shared" : "local"}::${group.representativeSelectors[0] ?? group.id}`;
}
