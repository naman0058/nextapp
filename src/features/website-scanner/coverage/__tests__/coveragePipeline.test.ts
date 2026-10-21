import { describe, expect, it } from "vitest";
import { buildSiteScanIntelligence } from "@/features/accessibility-intelligence/buildSiteScanIntelligence";
import { buildAxeRunTags } from "@/features/website-scanner/constants/axeScanConfig";
import { buildProductCoverageTrace } from "@/features/website-scanner/coverage/buildProductCoverageTrace";
import { summarizeRawAxeResults } from "@/features/website-scanner/coverage/summarizeRawAxeResults";
import { normalizeAxeResults } from "@/features/website-scanner/server/axe/normalizeAxeResults";
import { buildWebsiteScanReport } from "@/features/website-scanner/utils/buildWebsiteScanReport";
import { SCAN_VIEWPORTS } from "@/features/website-scanner/constants/viewports";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import type { WebsiteScanSessionState } from "@/features/website-scanner/types/websiteSession";
import {
  mockAxeResults,
  mockAxeViolation,
} from "@/features/website-scanner/coverage/__tests__/helpers/mockAxeResults";

function minimalSession(intel: ReturnType<typeof buildSiteScanIntelligence>): WebsiteScanSessionState {
  return {
    sessionId: "sess-coverage-test",
    rootUrl: "https://example.com/",
    status: "complete",
    viewportMode: "desktop",
    includeBestPractices: false,
    discoveredUrls: [],
    selectedUrlKeys: [],
    pages: [],
    manualReview: [],
    aiGuidance: {},
    scanScope: {
      urlsDiscovered: 1,
      urlsSelected: 1,
      pagesCompleted: 1,
      pagesPartial: 0,
      pagesFailed: 0,
    },
    reportBranding: {},
    exportPreferences: { includeQueryStringsInExports: false },
    siteIntelligence: intel,
    completedAt: new Date().toISOString(),
  } as unknown as WebsiteScanSessionState;
}

describe("coverage pipeline trace", () => {
  it("traces raw axe -> normalized -> groups -> report for image-alt", () => {
    const axe = mockAxeResults({
      violations: [mockAxeViolation("image-alt", ["wcag2a", "wcag111"])],
    });
    const normalized = normalizeAxeResults(axe, true);
    const page: WebsitePageScanResult = {
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
      passesCount: 0,
      inapplicableCount: 0,
      discoveredLinks: [],
      warnings: [],
      pageMetadata: {
        documentLang: "en",
        domNodeCount: 5,
        internalLinkCount: 0,
        linkCount: 0,
        iframeCount: 0,
        formCount: 0,
        imageCount: 1,
        headingCount: 1,
        videoCount: 0,
        interactiveControlCount: 0,
        dialogHintCount: 0,
      },
    };
    const intel = buildSiteScanIntelligence([page]);
    const session = minimalSession(intel);
    const report = buildWebsiteScanReport([page], session);
    const trace = buildProductCoverageTrace({
      pages: [page],
      includeBestPractices: false,
      axeRunTags: buildAxeRunTags(false),
      rawInventories: [summarizeRawAxeResults(axe)],
      intelligence: intel,
      report,
    });

    expect(trace.intelligence.uniqueAutomatedRules).toBe(1);
    expect(trace.intelligence.normalizedIssueRuleIds).toContain("image-alt");
    expect(trace.report.automatedAttentionRuleIds).toContain("image-alt");
    expect(trace.pages[0]?.undocumentedLosses).toEqual([]);
    const ledger = trace.pages[0]?.ruleLedger.find((e) => e.ruleId === "image-alt");
    expect(ledger?.disposition).toBe("preserved_automated_violation");
    expect(ledger?.inRemediationGroups).toBe(true);
  });
});
