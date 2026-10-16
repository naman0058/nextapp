import { describe, expect, it } from "vitest";
import { buildWcagCoverageMatrix } from "@/features/accessibility-intelligence/wcag/buildWcagCoverageMatrix";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import { SCAN_VIEWPORTS } from "@/features/website-scanner/constants/viewports";

const emptyPage: WebsitePageScanResult = {
  requestedUrl: "https://example.com/",
  finalUrl: "https://example.com/",
  pageTitle: null,
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
    domNodeCount: 10,
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
};

describe("buildWcagCoverageMatrix", () => {
  it("marks partial criteria as requiring manual review when no violation", () => {
    const matrix = buildWcagCoverageMatrix([emptyPage]);
    const alt = matrix.find((c) => c.criterion === "1.1.1");
    expect(alt?.automation).toBe("partial");
    expect(alt?.automatedResult).toBe("no_issue_detected");
    expect(alt?.manualReviewStatus).toBe("required");
    expect(alt?.notes).toMatch(/Human review still required/i);
  });

  it("detects issue on mapped criterion", () => {
    const matrix = buildWcagCoverageMatrix([
      {
        ...emptyPage,
        violations: [
          {
            id: "image-alt",
            impact: "critical",
            help: "Images must have alternate text",
            description: "d",
            tags: [],
            wcagCriteria: ["1.1.1"],
            level: "A",
            totalNodeCount: 1,
            nodes: [],
            isBestPractice: false,
          },
        ],
      },
    ]);
    const alt = matrix.find((c) => c.criterion === "1.1.1");
    expect(alt?.automatedResult).toBe("issue_detected");
  });
});
