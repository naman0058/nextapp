import { describe, expect, it } from "vitest";
import { buildSiteScanIntelligence } from "@/features/accessibility-intelligence/buildSiteScanIntelligence";
import { buildWebsiteScanReport } from "@/features/website-scanner/utils/buildWebsiteScanReport";
import { validateEnterpriseReportConsistency } from "@/features/reports/enterprise/validateEnterpriseReportConsistency";
import { buildWebsiteReportFilename } from "@/features/reports/enterprise/buildWebsiteReportFilename";
import { ENTERPRISE_PDF_MAIN_EVIDENCE_LIMIT } from "@/features/reports/enterprise/constants";
import { normalizeAxeResults } from "@/features/website-scanner/server/axe/normalizeAxeResults";
import { SCAN_VIEWPORTS } from "@/features/website-scanner/constants/viewports";
import {
  mockAxeResults,
  mockAxeViolation,
} from "@/features/website-scanner/coverage/__tests__/helpers/mockAxeResults";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import type { WebsiteScanSessionState } from "@/features/website-scanner/types/websiteSession";
import { createInitialWebsiteSession } from "@/features/website-scanner/state/websiteScanReducer";
import type { AxeResults } from "axe-core";

function pageFromAxe(axe: AxeResults, url: string): WebsitePageScanResult {
  const normalized = normalizeAxeResults(axe, true);
  return {
    requestedUrl: url,
    finalUrl: url,
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
  pages: WebsitePageScanResult[],
  patch?: Partial<WebsiteScanSessionState>,
): WebsiteScanSessionState {
  const intel = buildSiteScanIntelligence(pages, { humanReviewTasks: 4 });
  return {
    ...createInitialWebsiteSession(),
    rootUrl: pages[0]?.finalUrl ?? "https://example.com/",
    siteIntelligence: intel,
    scanScope: {
      ...createInitialWebsiteSession().scanScope,
      urlsSelected: 1,
      pagesCompleted: pages.length,
    },
    ...patch,
  };
}

describe("enterprise preflight report Phase 8", () => {
  it("A/D: 1-page report with evidence limits", () => {
    const axe = mockAxeResults({
      violations: [mockAxeViolation("color-contrast", ["wcag2aa"], { nodeCount: 81 })],
    });
    const pages = [pageFromAxe(axe, "https://www.filemakr.com/")];
    const session = sessionWithIntel(pages);
    const report = buildWebsiteScanReport(pages, session);
    const ent = report.enterpriseView!;
    expect(ent.counters.failedAutomatedRules).toBe(1);
    expect(ent.counters.affectedOccurrences).toBe(81);
    expect(validateEnterpriseReportConsistency(report, ent).ok).toBe(true);
    const finding = ent.automatedFindings.find((f) => f.ruleId === "color-contrast");
    expect(finding?.pdfShownCount).toBeLessThanOrEqual(ENTERPRISE_PDF_MAIN_EVIDENCE_LIMIT);
  });

  it("B: zero failures copy", () => {
    const axe = mockAxeResults({ violations: [] });
    const pages = [pageFromAxe(axe, "https://b/")];
    const session = sessionWithIntel(pages);
    const report = buildWebsiteScanReport(pages, session);
    expect(report.enterpriseView?.executiveSummary.zeroFindingNote).toBeTruthy();
    expect(report.summary.overallStatus).toMatch(/No automated WCAG failures/i);
  });

  it("C: failure + incomplete same rule without duplicate failure row", () => {
    const axe = mockAxeResults({
      violations: [mockAxeViolation("color-contrast", ["wcag2aa"], { nodeCount: 5 })],
      incomplete: [mockAxeViolation("color-contrast", ["wcag2aa"])],
    });
    const pages = [pageFromAxe(axe, "https://c/")];
    const session = sessionWithIntel(pages);
    const report = buildWebsiteScanReport(pages, session);
    const inc = report.enterpriseView!.incompleteFindings.filter(
      (i) => i.ruleId === "color-contrast",
    );
    expect(inc.length === 0 || inc[0]?.overlapsFailure === true).toBe(true);
  });

  it("S/U: stable report ID and filename sanitization", () => {
    const axe = mockAxeResults({
      violations: [mockAxeViolation("color-contrast", ["wcag2aa"], { nodeCount: 1 })],
    });
    const pages = [pageFromAxe(axe, "https://www.filemakr.com/")];
    const session = sessionWithIntel(pages, { sessionId: "abc123456789" });
    const report = buildWebsiteScanReport(pages, session);
    const report2 = buildWebsiteScanReport(pages, session);
    expect(report.reportId).toBe(report2.reportId);
    expect(buildWebsiteReportFilename("https://www.filemakr.com/", report.generatedAt, "pdf")).toMatch(
      /^digitalaccessready-filemakr-com-preflight-/,
    );
  });

  it("V: no compliance score strings in executive copy", () => {
    const axe = mockAxeResults({
      violations: [mockAxeViolation("color-contrast", ["wcag2aa"], { nodeCount: 3 })],
    });
    const pages = [pageFromAxe(axe, "https://v/")];
    const report = buildWebsiteScanReport(pages, sessionWithIntel(pages));
    const validation = validateEnterpriseReportConsistency(report, report.enterpriseView);
    expect(validation.ok).toBe(true);
  });
});
