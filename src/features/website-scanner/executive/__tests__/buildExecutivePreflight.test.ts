import { describe, expect, it } from "vitest";
import { buildSiteScanIntelligence } from "@/features/accessibility-intelligence/buildSiteScanIntelligence";
import { assertScanResultConsistency } from "@/features/website-scanner/taxonomy/assertScanResultConsistency";
import { buildWebsiteScanReport } from "@/features/website-scanner/utils/buildWebsiteScanReport";
import { normalizeAxeResults } from "@/features/website-scanner/server/axe/normalizeAxeResults";
import { SCAN_VIEWPORTS } from "@/features/website-scanner/constants/viewports";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import type { WebsiteScanSessionState } from "@/features/website-scanner/types/websiteSession";
import {
  mockAxeResults,
  mockAxeViolation,
} from "@/features/website-scanner/coverage/__tests__/helpers/mockAxeResults";
import type { AxeResults } from "axe-core";

function pageFromAxe(
  axe: AxeResults,
  url: string,
  viewport: "desktop" | "mobile" = "desktop",
): WebsitePageScanResult {
  const normalized = normalizeAxeResults(axe, true);
  const vp =
    viewport === "mobile" ? SCAN_VIEWPORTS.mobile : SCAN_VIEWPORTS.desktop;
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

describe("buildExecutivePreflight", () => {
  it("case A: 1 failed rule, occurrences, 2 incomplete rows, human review tasks", () => {
    const axe = mockAxeResults({
      violations: [
        mockAxeViolation("color-contrast", ["wcag2aa", "wcag143"], {
          nodeCount: 81,
        }),
      ],
      incomplete: [
        mockAxeViolation("aria-prohibited-attr", ["wcag2a", "wcag412"]),
        mockAxeViolation("color-contrast", ["wcag2aa", "wcag143"]),
      ],
    });
    const intel = buildSiteScanIntelligence([pageFromAxe(axe, "https://a/")], {
      humanReviewTasks: 5,
    });
    const snap = intel.executivePreflight.snapshot;
    expect(snap.failedAutomatedRules).toBe(1);
    expect(snap.affectedOccurrences).toBe(81);
    expect(snap.needsManualConfirmation).toBe(2);
    expect(snap.humanReviewOpen).toBe(5);
    expect(intel.executivePreflight.topRemediationPriorities.length).toBeLessThanOrEqual(
      5,
    );
    const ids = intel.executivePreflight.topRemediationPriorities.map((p) => p.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("case B: zero failures with passes and manual review", () => {
    const axe = mockAxeResults({ violations: [] }) as AxeResults;
    axe.passes = [
      {
        id: "html-has-lang",
        help: "lang",
        description: "d",
        helpUrl: "https://example.com",
        tags: ["wcag2a"],
        nodes: [],
      },
    ] as unknown as AxeResults["passes"];
    const intel = buildSiteScanIntelligence([pageFromAxe(axe, "https://b/")], {
      humanReviewTasks: 3,
    });
    expect(intel.executivePreflight.snapshot.failedAutomatedRules).toBe(0);
    expect(intel.executivePreflight.snapshot.preflightStatusPhrase).toMatch(
      /No automated WCAG failures/,
    );
    expect(intel.executivePreflight.snapshot.humanReviewOpen).toBe(3);
  });

  it("case D: multi-page mixed outcomes for one rule", () => {
    const failPage = pageFromAxe(
      mockAxeResults({
        violations: [mockAxeViolation("image-alt", ["wcag2a", "wcag111"])],
      }),
      "https://site/a",
    );
    const passAxe = mockAxeResults({ violations: [] }) as AxeResults;
    passAxe.passes = [
      {
        id: "image-alt",
        help: "alt",
        description: "d",
        helpUrl: "https://example.com",
        tags: ["wcag2a"],
        nodes: [],
      },
    ] as unknown as AxeResults["passes"];
    const passPage = pageFromAxe(passAxe, "https://site/b");
    const incPage = pageFromAxe(
      mockAxeResults({
        incomplete: [mockAxeViolation("image-alt", ["wcag2a", "wcag111"])],
      }),
      "https://site/c",
    );
    const intel = buildSiteScanIntelligence([failPage, passPage, incPage]);
    expect(intel.scanResultModel.summary.failedAutomatedRules).toBe(1);
    const rollup = intel.executivePreflight.ruleRollups.find(
      (r) => r.ruleId === "image-alt",
    );
    expect(rollup?.pagesFailed).toContain("https://site/a");
    expect(rollup?.pagesPassed.length).toBeGreaterThan(0);
    expect(rollup?.pagesIncomplete.length).toBeGreaterThan(0);
  });

  it("case E: desktop and mobile same rule — one unique failed rule", () => {
    const desktop = pageFromAxe(
      mockAxeResults({
        violations: [
          mockAxeViolation("color-contrast", ["wcag2aa"], { nodeCount: 81 }),
        ],
      }),
      "https://x/",
      "desktop",
    );
    const mobile = pageFromAxe(
      mockAxeResults({
        violations: [
          mockAxeViolation("color-contrast", ["wcag2aa"], { nodeCount: 94 }),
        ],
      }),
      "https://x/",
      "mobile",
    );
    const intel = buildSiteScanIntelligence([desktop, mobile]);
    expect(intel.scanResultModel.summary.failedAutomatedRules).toBe(1);
    const rollup = intel.executivePreflight.ruleRollups.find(
      (r) => r.ruleId === "color-contrast",
    );
    expect(rollup?.desktopOccurrences).toBe(81);
    expect(rollup?.mobileOccurrences).toBe(94);
    expect(intel.scanResultModel.summary.affectedOccurrences).toBe(175);
  });

  it("report preview aligns with executive snapshot counters", () => {
    const axe = mockAxeResults({
      violations: [mockAxeViolation("label", ["wcag2a", "wcag412"])],
    });
    const page = pageFromAxe(axe, "https://c/");
    const intel = buildSiteScanIntelligence([page]);
    const session = {
      sessionId: "exec-test",
      rootUrl: "https://c/",
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
    const report = buildWebsiteScanReport([page], session);
    assertScanResultConsistency({ intel, report });
    expect(report.websiteExecutivePreflight?.snapshot.failedAutomatedRules).toBe(
      intel.executivePreflight.snapshot.failedAutomatedRules,
    );
  });
});
