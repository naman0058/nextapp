import { describe, expect, it } from "vitest";
import { buildWebsiteScanReport } from "@/features/website-scanner/utils/buildWebsiteScanReport";
import { validateEnterpriseReportConsistency } from "@/features/reports/enterprise/validateEnterpriseReportConsistency";
import { BANNED_REPORT_PHRASES } from "@/features/reports/enterprise/constants";
import { buildSiteScanIntelligence } from "@/features/accessibility-intelligence/buildSiteScanIntelligence";
import { createInitialWebsiteSession } from "@/features/website-scanner/state/websiteScanReducer";
import { normalizeAxeResults } from "@/features/website-scanner/server/axe/normalizeAxeResults";
import { SCAN_VIEWPORTS } from "@/features/website-scanner/constants/viewports";
import {
  mockAxeResults,
  mockAxeViolation,
} from "@/features/website-scanner/coverage/__tests__/helpers/mockAxeResults";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import type { AxeResults } from "axe-core";

function pageFromAxe(
  axe: AxeResults,
  url: string,
  viewport: "desktop" | "mobile" = "desktop",
): WebsitePageScanResult {
  const normalized = normalizeAxeResults(axe, true);
  const vp = viewport === "mobile" ? SCAN_VIEWPORTS.mobile : SCAN_VIEWPORTS.desktop;
  return {
    requestedUrl: url,
    finalUrl: url,
    pageTitle: "t",
    scannedAt: new Date().toISOString(),
    viewport: vp,
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

describe("Phase 9 launch gate", () => {
  it("N: remediation plan on enterprise report for color-contrast", () => {
    const axe = mockAxeResults({
      violations: [mockAxeViolation("color-contrast", ["wcag2aa"], { nodeCount: 81 })],
    });
    const pages = [pageFromAxe(axe, "https://example.com/")];
    const intel = buildSiteScanIntelligence(pages, {});
    const session = {
      ...createInitialWebsiteSession(),
      rootUrl: "https://example.com/",
      siteIntelligence: intel,
      scanScope: { ...createInitialWebsiteSession().scanScope, pagesCompleted: 1, urlsSelected: 1 },
    };
    const report = buildWebsiteScanReport(pages, session);
    const plan = report.enterpriseView!.remediationPlan.find((p) => p.ruleId === "color-contrast");
    expect(plan).toBeTruthy();
    expect(plan!.implementationSteps.length).toBeGreaterThan(0);
    expect(plan!.definitionVersion).toBeGreaterThan(0);
  });

  it("G: zero-finding safe executive phrase", () => {
    const axe = mockAxeResults({ violations: [] });
    const pages = [pageFromAxe(axe, "https://z/")];
    const session = {
      ...createInitialWebsiteSession(),
      siteIntelligence: buildSiteScanIntelligence(pages, {}),
    };
    const report = buildWebsiteScanReport(pages, session);
    expect(report.summary.overallStatus).toMatch(/No automated WCAG failures/i);
    const bad = ["100%", "COMPLIANT", "ACCESSIBLE", "certified"].filter((w) =>
      JSON.stringify(report.enterpriseView).toUpperCase().includes(w.toUpperCase()),
    );
    expect(bad).toEqual([]);
  });

  it("C/S: export parity counters", () => {
    const axe = mockAxeResults({
      violations: [mockAxeViolation("color-contrast", ["wcag2aa"], { nodeCount: 81 })],
    });
    const pages = [pageFromAxe(axe, "https://p/")];
    const intel = buildSiteScanIntelligence(pages, { humanReviewTasks: 2 });
    const session = {
      ...createInitialWebsiteSession(),
      siteIntelligence: intel,
      scanScope: { ...createInitialWebsiteSession().scanScope, pagesCompleted: 1 },
    };
    const report = buildWebsiteScanReport(pages, session);
    const ent = report.enterpriseView!;
    expect(ent.counters.failedAutomatedRules).toBe(report.websiteScanTaxonomy!.failedAutomatedRules);
    expect(validateEnterpriseReportConsistency(report, ent).ok).toBe(true);
  });

  it("I: banned positive compliance claims list is defined", () => {
    expect(BANNED_REPORT_PHRASES.length).toBeGreaterThan(0);
  });
});
