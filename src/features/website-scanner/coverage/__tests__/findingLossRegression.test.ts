import { describe, expect, it } from "vitest";
import { buildSiteScanIntelligence } from "@/features/accessibility-intelligence/buildSiteScanIntelligence";
import { buildAxeRunTags } from "@/features/website-scanner/constants/axeScanConfig";
import { buildPageScanCoverageAudit } from "@/features/website-scanner/coverage/buildScanCoverageAudit";
import {
  assertNoUndocumentedAutomatedRuleLoss,
  expectedDisplayedAutomatedRuleCount,
} from "@/features/website-scanner/coverage/findingLossPolicy";
import { summarizeRawAxeResults } from "@/features/website-scanner/coverage/summarizeRawAxeResults";
import { normalizeAxeResults } from "@/features/website-scanner/server/axe/normalizeAxeResults";
import { SCAN_VIEWPORTS } from "@/features/website-scanner/constants/viewports";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import {
  mockAxeResults,
  mockAxeViolation,
} from "@/features/website-scanner/coverage/__tests__/helpers/mockAxeResults";

const WCAG_TAGS = ["wcag2a", "wcag2aa"];

function pageFromAxe(
  axe: ReturnType<typeof mockAxeResults>,
  includeBestPractices: boolean,
): WebsitePageScanResult {
  const normalized = normalizeAxeResults(axe, includeBestPractices);
  return {
    requestedUrl: "https://example.com/",
    finalUrl: "https://example.com/",
    pageTitle: "t",
    scannedAt: new Date().toISOString(),
    viewport: SCAN_VIEWPORTS.desktop,
    durationMs: 1,
    axeVersion: "4.13.0",
    scannerVersion: "test",
    summary: normalized.summary,
    violations: normalized.violations,
    incomplete: normalized.incomplete,
    passesCount: normalized.passesCount,
    inapplicableCount: normalized.inapplicableCount,
    discoveredLinks: [],
    warnings: [],
    pageMetadata: {
      documentLang: "en",
      domNodeCount: 10,
      internalLinkCount: 0,
      linkCount: 0,
      iframeCount: 0,
      formCount: 0,
      imageCount: 0,
      headingCount: 1,
      videoCount: 0,
      interactiveControlCount: 0,
      dialogHintCount: 0,
    },
  };
}

describe("finding loss regression", () => {
  it("preserves five distinct raw WCAG violations through intelligence (no collapse to one rule)", () => {
    const ruleIds = [
      "color-contrast",
      "image-alt",
      "link-name",
      "label",
      "button-name",
    ];
    const axe = mockAxeResults({
      violations: ruleIds.map((id) => mockAxeViolation(id, WCAG_TAGS)),
    });
    const includeBestPractices = false;
    const page = pageFromAxe(axe, includeBestPractices);
    const intel = buildSiteScanIntelligence([page]);
    const rawInventory = summarizeRawAxeResults(axe);

    expect(intel.summary.uniqueAutomatedRules).toBe(5);
    expect(intel.rootCauseGroups).toHaveLength(5);
    expect(intel.fixPlan).toHaveLength(5);

    assertNoUndocumentedAutomatedRuleLoss({
      rawInventory,
      includeBestPractices,
      displayedUniqueAutomatedRules: intel.summary.uniqueAutomatedRules,
    });
    expect(expectedDisplayedAutomatedRuleCount(rawInventory, includeBestPractices)).toBe(
      5,
    );
  });

  it("documents best-practice filtering without reducing WCAG rule count", () => {
    const axe = mockAxeResults({
      violations: [
        mockAxeViolation("color-contrast", WCAG_TAGS),
        mockAxeViolation("landmark-one-main", ["cat.semantics"], {
          bestPractice: true,
        }),
      ],
    });
    const includeBestPractices = false;
    const page = pageFromAxe(axe, includeBestPractices);
    const intel = buildSiteScanIntelligence([page]);
    const rawInventory = summarizeRawAxeResults(axe);
    const audit = buildPageScanCoverageAudit({
      pageUrl: page.finalUrl,
      includeBestPractices,
      axeRunTags: buildAxeRunTags(includeBestPractices),
      rawInventory,
      page,
      rootCauseRuleIds: new Set(intel.rootCauseGroups.map((g) => g.ruleId)),
      normalizedIssueRuleIds: new Set(
        intel.normalizedFindings
          .filter((f) => f.status === "issue" && f.ruleId)
          .map((f) => f.ruleId!),
      ),
      normalizedReviewRuleIds: new Set(),
      reportFindingRuleIds: new Set(),
    });

    expect(intel.summary.uniqueAutomatedRules).toBe(1);
    expect(audit.undocumentedLosses).toEqual([]);
    const bpEntry = audit.ruleLedger.find((e) => e.ruleId === "landmark-one-main");
    expect(bpEntry?.disposition).toBe("filtered_best_practice_disabled");
  });

  it("keeps violation rows when evidence node budget is exhausted (no rule drop)", () => {
    const manyContrast = mockAxeViolation("color-contrast", WCAG_TAGS, {
      nodeCount: 150,
    });
    const otherRules = ["image-alt", "link-name", "label", "button-name"].map(
      (id) => mockAxeViolation(id, WCAG_TAGS, { nodeCount: 1 }),
    );
    const axe = mockAxeResults({ violations: [manyContrast, ...otherRules] });
    const page = pageFromAxe(axe, false);
    const intel = buildSiteScanIntelligence([page]);

    expect(intel.summary.uniqueAutomatedRules).toBe(5);
    expect(page.violations.map((v) => v.id).sort()).toEqual(
      ["button-name", "color-contrast", "image-alt", "label", "link-name"].sort(),
    );
  });
});
