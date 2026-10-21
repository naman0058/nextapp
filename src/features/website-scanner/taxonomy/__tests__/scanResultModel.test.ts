import { describe, expect, it } from "vitest";
import { buildSiteScanIntelligence } from "@/features/accessibility-intelligence/buildSiteScanIntelligence";
import { buildWebsiteScanReport } from "@/features/website-scanner/utils/buildWebsiteScanReport";
import { assertScanResultConsistency } from "@/features/website-scanner/taxonomy/assertScanResultConsistency";
import { normalizeAxeResults } from "@/features/website-scanner/server/axe/normalizeAxeResults";
import { SCAN_VIEWPORTS } from "@/features/website-scanner/constants/viewports";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import type { WebsiteScanSessionState } from "@/features/website-scanner/types/websiteSession";
import {
  mockAxeResults,
  mockAxeViolation,
} from "@/features/website-scanner/coverage/__tests__/helpers/mockAxeResults";
import type { AxeResults } from "axe-core";

function pageFromAxe(axe: AxeResults, includeBestPractices = true): WebsitePageScanResult {
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
    axeEvaluatedRules: normalized.axeEvaluatedRules,
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

function sessionWithIntel(
  intel: ReturnType<typeof buildSiteScanIntelligence>,
): WebsiteScanSessionState {
  return {
    sessionId: "tax-test",
    rootUrl: "https://example.com/",
    status: "complete",
    viewportMode: "desktop",
    includeBestPractices: true,
    aiGuidance: {},
    siteIntelligence: intel,
    manualReview: [],
    scanScope: {
      urlsDiscovered: 1,
      urlsSelected: 1,
      pagesCompleted: 1,
      pagesPartial: 0,
      pagesFailed: 0,
    },
    reportBranding: {},
    exportPreferences: { includeQueryStringsInExports: false },
    completedAt: new Date().toISOString(),
  } as unknown as WebsiteScanSessionState;
}

describe("scanResultModel taxonomy", () => {
  it("fixture A: mixed violation, pass, incomplete, inapplicable counts", () => {
    const axe = mockAxeResults({
      violations: [mockAxeViolation("color-contrast", ["wcag2aa", "wcag143"])],
      incomplete: [
        mockAxeViolation("aria-prohibited-attr", ["wcag2a", "wcag412"]),
        mockAxeViolation("color-contrast", ["wcag2aa", "wcag143"]),
      ],
    }) as AxeResults;
    axe.passes = Array.from({ length: 5 }, (_, i) => ({
      id: `pass-rule-${i}`,
      help: "pass",
      description: "pass",
      helpUrl: "https://example.com",
      tags: ["wcag2a"],
      nodes: [],
    })) as unknown as AxeResults["passes"];
    axe.inapplicable = Array.from({ length: 10 }, (_, i) => ({
      id: `na-rule-${i}`,
      help: "na",
      description: "na",
      helpUrl: "https://example.com",
      tags: ["wcag2a"],
      nodes: [],
    })) as unknown as AxeResults["inapplicable"];

    const page = pageFromAxe(axe);
    const intel = buildSiteScanIntelligence([page]);
    const c = intel.scanResultModel.summary;
    expect(c.failedAutomatedRules).toBe(1);
    expect(c.needsManualConfirmation).toBe(2);
    expect(c.passedAutomatedRules).toBe(5);
    expect(c.notApplicableRules).toBe(10);
    expect(c.automatedRulesEvaluated).toBe(17);
  });

  it("fixture B: overlap violation and incomplete for same rule", () => {
    const axe = mockAxeResults({
      violations: [mockAxeViolation("color-contrast", ["wcag2aa", "wcag143"], { nodeCount: 3 })],
      incomplete: [mockAxeViolation("color-contrast", ["wcag2aa", "wcag143"], { nodeCount: 2 })],
    });
    const intel = buildSiteScanIntelligence([pageFromAxe(axe)]);
    expect(intel.scanResultModel.summary.failedAutomatedRules).toBe(1);
    expect(intel.scanResultModel.summary.needsManualConfirmation).toBe(1);
    expect(intel.scanResultModel.incompleteChecks[0]?.alsoHasAutomatedFailure).toBe(true);
    const failFindings = intel.normalizedFindings.filter((f) => f.status === "issue");
    const incFindings = intel.normalizedFindings.filter((f) => f.status === "review");
    expect(failFindings.some((f) => f.ruleId === "color-contrast")).toBe(true);
    expect(incFindings.some((f) => f.ruleId === "color-contrast")).toBe(true);
    expect(failFindings.length).toBe(1);
  });

  it("fixture C: best-practice violation only", () => {
    const axe = mockAxeResults({
      violations: [
        mockAxeViolation("landmark-one-main", ["cat.semantics"], { bestPractice: true }),
      ],
    });
    const intel = buildSiteScanIntelligence([pageFromAxe(axe)], {
      includeBestPractices: true,
    });
    expect(intel.scanResultModel.summary.failedAutomatedRules).toBe(0);
    expect(intel.scanResultModel.summary.bestPracticeObservations).toBe(1);
  });

  it("report and intelligence counters stay consistent", () => {
    const axe = mockAxeResults({
      violations: [mockAxeViolation("image-alt", ["wcag2a", "wcag111"])],
    });
    const page = pageFromAxe(axe);
    const intel = buildSiteScanIntelligence([page]);
    const session = sessionWithIntel(intel);
    const report = buildWebsiteScanReport([page], session);
    assertScanResultConsistency({ intel, report });
  });
});
