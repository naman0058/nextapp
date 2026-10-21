import type { FindingDetail } from "@/features/website-scanner/findingDetail/types";
import type { IssuesGroupBy } from "@/features/website-scanner/types/resultUx";
import type { IssuesSortKey } from "@/features/website-scanner/utils/issuesListUtils";

export type FindingDetailGroup = {
  key: string;
  label: string;
  details: FindingDetail[];
};

const impactOrder: Record<string, number> = {
  critical: 0,
  serious: 1,
  moderate: 2,
  minor: 3,
  unknown: 4,
};

export function groupFindingDetails(
  details: FindingDetail[],
  groupBy: IssuesGroupBy,
): FindingDetailGroup[] {
  const map = new Map<string, FindingDetail[]>();
  for (const d of details) {
    let key: string;
    switch (groupBy) {
      case "page":
        for (const url of d.affectedUrls.length ? d.affectedUrls : ["(unknown)"]) {
          const list = map.get(url) ?? [];
          list.push(d);
          map.set(url, list);
        }
        continue;
      case "rule":
        key = d.ruleId;
        break;
      case "category":
        key = d.category;
        break;
      case "wcag":
        key = d.wcagMappings[0]?.criterion ?? "unmapped";
        break;
      case "root-cause":
      default:
        key = d.remediationGroupId ?? d.findingId;
        break;
    }
    const list = map.get(key) ?? [];
    list.push(d);
    map.set(key, list);
  }

  return [...map.entries()].map(([key, items]) => ({
    key,
    label:
      groupBy === "root-cause"
        ? items[0]?.title ?? key
        : groupBy === "rule"
          ? items[0]?.title ?? key
          : groupBy === "page"
            ? key
            : groupBy === "category"
              ? key
              : key === "unmapped"
                ? "Unmapped WCAG"
                : `WCAG ${key}`,
    details: items,
  }));
}

export function sortFindingDetails(
  details: FindingDetail[],
  sortKey: IssuesSortKey,
  fixPlanRanks: Map<string, number>,
): FindingDetail[] {
  const copy = [...details];
  copy.sort((a, b) => {
    switch (sortKey) {
      case "pages":
        return b.pagesAffected - a.pagesAffected;
      case "occurrences":
        return b.totalOccurrences - a.totalOccurrences;
      case "impact":
        return (
          (impactOrder[a.impact] ?? 4) - (impactOrder[b.impact] ?? 4)
        );
      case "rule":
        return a.title.localeCompare(b.title);
      case "priority":
      default: {
        const ra = fixPlanRanks.get(a.remediationGroupId ?? a.findingId) ?? 999;
        const rb = fixPlanRanks.get(b.remediationGroupId ?? b.findingId) ?? 999;
        if (ra !== rb) return ra - rb;
        const order = { high: 0, medium: 1, low: 2 };
        return order[a.priority] - order[b.priority];
      }
    }
  });
  return copy;
}
