import { describe, expect, it } from "vitest";
import {
  aggregatePageExecution,
  buildPageScanDiagnostic,
} from "@/features/website-scanner/utils/pageScanDiagnostics";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import { SCAN_VIEWPORTS } from "@/features/website-scanner/constants/viewports";

function minimalPage(
  overrides: Partial<WebsitePageScanResult>,
): WebsitePageScanResult {
  return {
    requestedUrl: "https://example.com/",
    finalUrl: "https://example.com/",
    pageTitle: "t",
    scannedAt: new Date().toISOString(),
    viewport: SCAN_VIEWPORTS.desktop,
    durationMs: 1,
    axeVersion: "4.13.0",
    scannerVersion: "test",
    summary: {
      critical: 0,
      serious: 0,
      moderate: 0,
      minor: 0,
      unknown: 0,
      incomplete: 0,
      bestPractice: 0,
    },
    violations: [],
    incomplete: [],
    passesCount: 0,
    inapplicableCount: 0,
    discoveredLinks: [],
    warnings: [],
    pageMetadata: {
      documentLang: "en",
      domNodeCount: 100,
      internalLinkCount: 0,
      linkCount: 0,
      iframeCount: 0,
      formCount: 0,
      imageCount: 0,
      headingCount: 0,
      videoCount: 0,
      interactiveControlCount: 0,
      dialogHintCount: 0,
    },
    ...overrides,
  };
}

describe("pageScanDiagnostics", () => {
  it("marks page execution complete when only evidence is truncated", () => {
    const page = minimalPage({
      scanCompleteness: "partial",
      scanQuality: {
        pageFullyLoaded: true,
        resourceBudgetExceeded: false,
        domTruncated: false,
        nodeEvidenceTruncated: true,
        crossOriginFrameLimitations: false,
        lazyContentSampling: "completed",
        scanTimeout: false,
      },
      nodeReporting: {
        totalOccurrences: 82,
        examplesShown: 20,
        truncated: true,
      },
    });
    const diagnostic = buildPageScanDiagnostic(page);
    expect(diagnostic.pageExecution).toBe("complete");
    expect(diagnostic.evidenceReporting).toBe("limited");
    expect(diagnostic.evidenceReasons[0]).toMatch(/20 of 82/);
    expect(aggregatePageExecution([page])).toBe("complete");
  });
});
