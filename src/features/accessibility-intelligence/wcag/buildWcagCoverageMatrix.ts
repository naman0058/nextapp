import type { WcagCoverageCriterion } from "@/features/accessibility-intelligence/types/siteIntelligence";
import { WCAG_22_AA_CATALOG } from "@/features/accessibility-intelligence/wcag/wcag22Catalog";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";

export function buildWcagCoverageMatrix(
  pages: WebsitePageScanResult[],
): WcagCoverageCriterion[] {
  const violatingRules = new Set<string>();
  const incompleteRules = new Set<string>();
  for (const page of pages) {
    for (const v of page.violations) {
      if (!v.isBestPractice) violatingRules.add(v.id);
    }
    for (const inc of page.incomplete) {
      incompleteRules.add(inc.id);
    }
  }

  return WCAG_22_AA_CATALOG.map((entry) => {
    const matchedRules = entry.relatedAxeRules.filter(
      (r) => violatingRules.has(r) || incompleteRules.has(r),
    );
    const issueDetected = entry.relatedAxeRules.some((r) =>
      violatingRules.has(r),
    );
    const automatedResult: WcagCoverageCriterion["automatedResult"] =
      entry.relatedAxeRules.length === 0
        ? "not_tested"
        : issueDetected
          ? "issue_detected"
          : "no_issue_detected";

    let manualReviewStatus: WcagCoverageCriterion["manualReviewStatus"] =
      "not_started";
    if (entry.automation === "manual") {
      manualReviewStatus = "required";
    } else if (entry.automation === "partial") {
      manualReviewStatus = "required";
    }

    let notes: string | undefined;
    if (
      automatedResult === "no_issue_detected" &&
      entry.automation !== "automated"
    ) {
      notes =
        "No automated violation detected for linked rules. Human review still required where automation is partial or manual.";
    }
    if (automatedResult === "not_tested") {
      notes =
        "No automated rules mapped for this criterion in the current scan configuration.";
      manualReviewStatus = "required";
    }

    return {
      criterion: entry.criterion,
      name: entry.name,
      level: entry.level,
      principle: entry.principle,
      automation: entry.automation,
      automatedRules: matchedRules.length > 0 ? matchedRules : entry.relatedAxeRules,
      automatedResult,
      manualReviewStatus,
      notes,
    };
  });
}
