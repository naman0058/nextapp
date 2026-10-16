import type {
  SiteRuleAggregate,
  WebsitePageScanResult,
} from "@/features/website-scanner/types/scanTypes";

export function aggregateSiteIssues(
  pages: WebsitePageScanResult[],
): SiteRuleAggregate[] {
  const map = new Map<string, SiteRuleAggregate>();

  for (const page of pages) {
    const pageUrl = page.finalUrl;
    for (const v of page.violations) {
      let agg = map.get(v.id);
      if (!agg) {
        agg = {
          ruleId: v.id,
          impact: v.impact,
          help: v.help,
          description: v.description,
          wcagCriteria: v.wcagCriteria,
          level: v.level,
          isBestPractice: v.isBestPractice,
          affectedPageCount: 0,
          totalNodeCount: 0,
          pages: [],
        };
        map.set(v.id, agg);
      }
      if (
        v.impact === "critical" ||
        (v.impact === "serious" && agg.impact !== "critical")
      ) {
        agg.impact = v.impact;
      }
      agg.totalNodeCount += v.totalNodeCount;
      const existing = agg.pages.find((p) => p.pageUrl === pageUrl);
      if (existing) {
        existing.nodeCount += v.totalNodeCount;
      } else {
        agg.pages.push({ pageUrl, nodeCount: v.totalNodeCount });
        agg.affectedPageCount += 1;
      }
    }
  }

  const impactOrder = {
    critical: 0,
    serious: 1,
    moderate: 2,
    minor: 3,
    unknown: 4,
  };

  return [...map.values()].sort(
    (a, b) => impactOrder[a.impact] - impactOrder[b.impact],
  );
}
