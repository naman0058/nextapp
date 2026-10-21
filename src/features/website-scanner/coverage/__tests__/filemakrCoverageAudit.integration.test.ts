import { describe, expect, it } from "vitest";
import { buildSiteScanIntelligence } from "@/features/accessibility-intelligence/buildSiteScanIntelligence";
import { buildAxeRunTags, describeAxeRunProfile } from "@/features/website-scanner/constants/axeScanConfig";
import { buildProductCoverageTraceFromPages } from "@/features/website-scanner/coverage/buildProductCoverageTrace";
import { assertNoUndocumentedAutomatedRuleLoss } from "@/features/website-scanner/coverage/findingLossPolicy";
import { LocalPlaywrightScanner } from "@/features/website-scanner/server/runtime/localPlaywrightScanner";
import { SCAN_VIEWPORTS } from "@/features/website-scanner/constants/viewports";

const RUN = process.env.FILEMAKR_COVERAGE_AUDIT === "1";

describe.skipIf(!RUN)("FileMakr live coverage audit", () => {
  it("captures raw axe inventory vs product surfaces for https://www.filemakr.com/", async () => {
    const scanner = new LocalPlaywrightScanner();
    const includeBestPractices = true;
    const result = await scanner.scanPage({
      url: "https://www.filemakr.com/",
      viewport: SCAN_VIEWPORTS.desktop,
      mode: "single_page",
      rootOrigin: "https://www.filemakr.com",
      includeBestPractices,
      captureCoverageAudit: true,
    });

    const intel = buildSiteScanIntelligence([result]);
    const trace = buildProductCoverageTraceFromPages([result], {
      includeBestPractices,
      axeRunTags: buildAxeRunTags(includeBestPractices),
    });

    assertNoUndocumentedAutomatedRuleLoss({
      rawInventory: result.coverageAudit?.rawInventory ?? [],
      includeBestPractices,
      displayedUniqueAutomatedRules: intel.summary.uniqueAutomatedRules,
    });

    const rawViolationIds = [
      ...new Set(
        (result.coverageAudit?.rawInventory ?? [])
          .filter((i) => i.bucket === "violations")
          .map((i) => i.ruleId),
      ),
    ].sort();

    console.log(
      JSON.stringify(
        {
          axeProfile: describeAxeRunProfile(includeBestPractices),
          pageExecution: result.scanQuality,
          nodeReporting: result.nodeReporting,
          rawViolationRuleIds: rawViolationIds,
          rawIncompleteRuleIds: [
            ...new Set(
              (result.coverageAudit?.rawInventory ?? [])
                .filter((i) => i.bucket === "incomplete")
                .map((i) => i.ruleId),
            ),
          ],
          productUniqueAutomatedRules: intel.summary.uniqueAutomatedRules,
          productRuleIds: trace.intelligence.uniqueRuleIds,
          undocumentedLosses: result.coverageAudit?.undocumentedLosses ?? [],
        },
        null,
        2,
      ),
    );

    expect(result.coverageAudit?.undocumentedLosses ?? []).toEqual([]);

    const tax = intel.scanResultModel.summary;
    expect(tax.failedAutomatedRules).toBe(1);
    expect(tax.needsManualConfirmation).toBeGreaterThanOrEqual(2);
    expect(tax.affectedOccurrences).toBeGreaterThan(0);
  }, 120_000);
});
