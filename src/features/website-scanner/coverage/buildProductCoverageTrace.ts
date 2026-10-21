import type { AccessibilityPreflightReport } from "@/features/reports/types/reportModel";
import { buildSiteScanIntelligence } from "@/features/accessibility-intelligence/buildSiteScanIntelligence";
import { buildPageScanCoverageAudit } from "@/features/website-scanner/coverage/buildScanCoverageAudit";
import type {
  BuildProductTraceInput,
  ProductCoverageTrace,
} from "@/features/website-scanner/coverage/types";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";

function ruleIdsFromReport(report: AccessibilityPreflightReport): {
  automated: Set<string>;
  manual: Set<string>;
} {
  const automated = new Set<string>();
  const manual = new Set<string>();
  for (const f of report.textAccessibility?.findings ?? []) {
    const id = f.technicalId;
    if (!id) continue;
    if (f.sourceType === "manual_review" || f.section === "Needs manual confirmation") {
      manual.add(id);
    } else if (f.status === "attention") {
      automated.add(id);
    }
  }
  return { automated, manual };
}

export function buildProductCoverageTrace(
  input: BuildProductTraceInput,
): ProductCoverageTrace {
  const pageAudits = input.pages.map((page, index) => {
    const issueRuleIds = new Set(
      input.intelligence.normalizedFindings
        .filter(
          (f) =>
            f.status === "issue" &&
            f.pageUrl === page.finalUrl &&
            f.viewportId === page.viewport.id &&
            f.ruleId,
        )
        .map((f) => f.ruleId!),
    );
    const reviewRuleIds = new Set(
      input.intelligence.normalizedFindings
        .filter(
          (f) =>
            f.status === "review" &&
            f.pageUrl === page.finalUrl &&
            f.viewportId === page.viewport.id &&
            f.ruleId,
        )
        .map((f) => f.ruleId!),
    );
    const rootCauseRuleIds = new Set(
      input.intelligence.rootCauseGroups
        .filter((g) => g.affectedPages.includes(page.finalUrl))
        .map((g) => g.ruleId),
    );
    const reportIds = input.report
      ? ruleIdsFromReport(input.report)
      : { automated: new Set<string>(), manual: new Set<string>() };

    return buildPageScanCoverageAudit({
      pageUrl: page.finalUrl,
      includeBestPractices: input.includeBestPractices,
      axeRunTags: input.axeRunTags,
      rawInventory: input.rawInventories[index] ?? [],
      page,
      rootCauseRuleIds,
      normalizedIssueRuleIds: issueRuleIds,
      normalizedReviewRuleIds: reviewRuleIds,
      reportFindingRuleIds: new Set([
        ...reportIds.automated,
        ...reportIds.manual,
      ]),
    });
  });

  const wcagRuleIds = input.intelligence.ruleAggregates
    .filter((r) => !r.isBestPractice)
    .map((r) => r.ruleId);

  const reportRuleIds = input.report
    ? ruleIdsFromReport(input.report)
    : { automated: new Set<string>(), manual: new Set<string>() };

  return {
    pages: pageAudits,
    intelligence: {
      uniqueAutomatedRules: input.intelligence.summary.uniqueAutomatedRules,
      uniqueRuleIds: wcagRuleIds,
      remediationGroupRuleIds: [
        ...new Set(input.intelligence.rootCauseGroups.map((g) => g.ruleId)),
      ],
      normalizedIssueRuleIds: [
        ...new Set(
          input.intelligence.normalizedFindings
            .filter((f) => f.status === "issue" && f.ruleId)
            .map((f) => f.ruleId!),
        ),
      ],
      normalizedReviewRuleIds: [
        ...new Set(
          input.intelligence.normalizedFindings
            .filter((f) => f.status === "review" && f.ruleId)
            .map((f) => f.ruleId!),
        ),
      ],
    },
    report: {
      automatedAttentionRuleIds: [...reportRuleIds.automated],
      manualReviewRuleIds: [...reportRuleIds.manual],
    },
  };
}

/** End-to-end trace from page results when raw inventories are attached. */
export function buildProductCoverageTraceFromPages(
  pages: WebsitePageScanResult[],
  options: {
    includeBestPractices: boolean;
    axeRunTags: string[];
    report?: AccessibilityPreflightReport;
  },
): ProductCoverageTrace {
  const intel = buildSiteScanIntelligence(pages);
  const inventories = pages.map((p) => p.coverageAudit?.rawInventory ?? []);
  return buildProductCoverageTrace({
    pages,
    includeBestPractices: options.includeBestPractices,
    axeRunTags: options.axeRunTags,
    rawInventories: inventories,
    intelligence: intel,
    report: options.report,
  });
}
