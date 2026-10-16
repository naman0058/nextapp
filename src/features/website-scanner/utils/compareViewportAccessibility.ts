import { buildIssueFingerprint } from "@/features/accessibility-intelligence/compare/issueFingerprint";
import type {
  SiteViewportComparisonSummary,
  ViewportComparisonRow,
  ViewportPageComparison,
} from "@/features/website-scanner/types/viewportComparison";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";

function ruleOccurrences(page: WebsitePageScanResult | undefined): Map<string, number> {
  const map = new Map<string, number>();
  if (!page) return map;
  for (const v of page.violations) {
    if (v.isBestPractice) continue;
    map.set(v.id, (map.get(v.id) ?? 0) + v.totalNodeCount);
  }
  return map;
}

export function comparePageViewports(
  pageUrl: string,
  desktop: WebsitePageScanResult | undefined,
  mobile: WebsitePageScanResult | undefined,
): ViewportPageComparison {
  const limited =
    desktop?.scanCompleteness === "partial" ||
    desktop?.scanCompleteness === "limited" ||
    desktop?.scanCompleteness === "failed" ||
    mobile?.scanCompleteness === "partial" ||
    mobile?.scanCompleteness === "limited" ||
    mobile?.scanCompleteness === "failed";

  const dRules = ruleOccurrences(desktop);
  const mRules = ruleOccurrences(mobile);
  const allRules = new Set([...dRules.keys(), ...mRules.keys()]);
  const rows: ViewportComparisonRow[] = [];
  let desktopOnlyCount = 0;
  let mobileOnlyCount = 0;
  let bothCount = 0;
  let changedOccurrenceCount = 0;

  for (const ruleId of allRules) {
    const dOcc = dRules.get(ruleId) ?? 0;
    const mOcc = mRules.get(ruleId) ?? 0;
    if (dOcc === 0 && mOcc > 0) {
      mobileOnlyCount += 1;
      rows.push({
        ruleId,
        classification: "mobile_only",
        desktopOccurrences: 0,
        mobileOccurrences: mOcc,
        label: mobile?.violations.find((v) => v.id === ruleId)?.help ?? ruleId,
      });
    } else if (mOcc === 0 && dOcc > 0) {
      desktopOnlyCount += 1;
      rows.push({
        ruleId,
        classification: "desktop_only",
        desktopOccurrences: dOcc,
        mobileOccurrences: 0,
        label: desktop?.violations.find((v) => v.id === ruleId)?.help ?? ruleId,
      });
    } else if (dOcc > 0 && mOcc > 0) {
      bothCount += 1;
      const classification =
        dOcc !== mOcc ? "changed_count" : "both";
      if (dOcc !== mOcc) changedOccurrenceCount += 1;
      rows.push({
        ruleId,
        classification,
        desktopOccurrences: dOcc,
        mobileOccurrences: mOcc,
        label: desktop?.violations.find((v) => v.id === ruleId)?.help ?? ruleId,
      });
    }
  }

  return {
    pageUrl,
    comparisonLimited: limited,
    desktopOnlyCount,
    mobileOnlyCount,
    bothCount,
    changedOccurrenceCount,
    rows,
  };
}

export function summarizeViewportComparison(
  comparisons: ViewportPageComparison[],
): SiteViewportComparisonSummary {
  return {
    pagesCompared: comparisons.length,
    issuesInBoth: comparisons.reduce((n, c) => n + c.bothCount, 0),
    desktopOnly: comparisons.reduce((n, c) => n + c.desktopOnlyCount, 0),
    mobileOnly: comparisons.reduce((n, c) => n + c.mobileOnlyCount, 0),
    changedOccurrenceCounts: comparisons.reduce(
      (n, c) => n + c.changedOccurrenceCount,
      0,
    ),
    limitedComparison: comparisons.some((c) => c.comparisonLimited),
  };
}

export function fingerprintRules(page: WebsitePageScanResult): Set<string> {
  const set = new Set<string>();
  for (const v of page.violations) {
    for (const node of v.nodes) {
      set.add(
        buildIssueFingerprint({
          pageUrl: page.finalUrl,
          ruleId: v.id,
          domSignature: node.domSignature,
          selectorLabel: node.selectorLabel,
        }),
      );
    }
  }
  return set;
}
