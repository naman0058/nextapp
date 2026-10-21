import type { FindingDetail } from "@/features/website-scanner/findingDetail/types";
import type {
  IssuesFilterState,
  IssuesStatusFilter,
} from "@/features/website-scanner/utils/issuesListUtils";
import type { ProductFindingCategory } from "@/features/website-scanner/taxonomy/types";

function matchesStatus(detail: FindingDetail, issueStatus: IssuesStatusFilter): boolean {
  switch (issueStatus) {
    case "failed":
      return detail.kind === "automated_failure";
    case "confirmation":
      return (
        detail.kind === "incomplete_only" ||
        (detail.kind === "automated_failure" && detail.relatedIncomplete.length > 0)
      );
    case "best_practice":
      return detail.kind === "best_practice";
    case "actionable":
    default:
      return detail.kind === "automated_failure";
  }
}

export function filterFindingDetails(
  details: FindingDetail[],
  filter: IssuesFilterState,
): FindingDetail[] {
  const q = filter.search.trim().toLowerCase();
  return details.filter((d) => {
    if (!matchesStatus(d, filter.issueStatus)) return false;

    if (filter.bestPracticeOnly === true && !d.isBestPractice) return false;
    if (filter.bestPracticeOnly === false && d.isBestPractice) return false;
    if (filter.priority !== "all" && d.priority !== filter.priority) return false;
    if (filter.impact !== "all" && d.impact !== filter.impact) return false;

    if (filter.category !== "all" && d.category !== filter.category) return false;

    if (filter.wcagCriterion !== "all") {
      const hit = d.wcagMappings.some(
        (m) =>
          m.criterion === filter.wcagCriterion ||
          m.criterion.includes(filter.wcagCriterion),
      );
      if (!hit) return false;
    }

    if (filter.wcagLevel !== "all") {
      const levelHit = d.wcagMappings.some(
        (m) => String(m.level) === filter.wcagLevel,
      );
      if (!levelHit && d.normalizedFindings[0]?.wcagLevel !== filter.wcagLevel) {
        return false;
      }
    }

    if (filter.pageUrl !== "all" && !d.affectedUrls.includes(filter.pageUrl)) {
      return false;
    }

    if (filter.sourceType !== "all") {
      const sourceMap: Record<string, FindingDetail["source"]> = {
        axe_wcag: "AXE_WCAG",
        axe_best_practice: "AXE_BEST_PRACTICE",
        deterministic: "DETERMINISTIC",
        manual: "MANUAL",
      };
      const expected = sourceMap[filter.sourceType];
      if (expected && d.source !== expected) return false;
    }

    if (filter.viewport !== "all") {
      if (filter.viewport === "desktop" && !d.affectedViewports.includes("desktop")) {
        return false;
      }
      if (filter.viewport === "mobile" && !d.affectedViewports.includes("mobile")) {
        return false;
      }
      if (filter.viewport === "both") {
        if (
          !d.affectedViewports.includes("desktop") ||
          !d.affectedViewports.includes("mobile")
        ) {
          return false;
        }
      }
    }

    if (!q) return true;
    return (
      d.ruleId.toLowerCase().includes(q) ||
      d.title.toLowerCase().includes(q) ||
      d.affectedUrls.some((u) => u.toLowerCase().includes(q)) ||
      d.wcagMappings.some((m) => m.criterion.toLowerCase().includes(q)) ||
      d.representativeSelectors.some((s) => s.toLowerCase().includes(q)) ||
      d.evidenceItems.some((e) => (e.selector?.toLowerCase().includes(q) ?? false))
    );
  });
}

export const ALL_PRODUCT_CATEGORIES: ProductFindingCategory[] = [
  "Visual & Contrast",
  "Images & Alternatives",
  "Structure & Landmarks",
  "Names, Roles & ARIA",
  "Navigation & Links",
  "Keyboard & Focus",
  "Forms & Input",
  "Media",
  "Language & Metadata",
  "Tables & Lists",
  "Dynamic Content",
  "Best Practices",
];
