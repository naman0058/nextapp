import { describe, expect, it } from "vitest";
import { comparePageViewports } from "@/features/website-scanner/utils/compareViewportAccessibility";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";

function page(
  url: string,
  viewportId: "desktop" | "mobile",
  ruleIds: string[],
): WebsitePageScanResult {
  return {
    requestedUrl: url,
    finalUrl: url,
    pageTitle: "T",
    scannedAt: new Date().toISOString(),
    viewport: {
      id: viewportId,
      width: viewportId === "desktop" ? 1440 : 390,
      height: viewportId === "desktop" ? 900 : 844,
      label: viewportId,
    },
    durationMs: 1,
    axeVersion: "4",
    scannerVersion: "1",
    summary: {
      critical: 0,
      serious: ruleIds.length,
      moderate: 0,
      minor: 0,
      unknown: 0,
      incomplete: 0,
      bestPractice: 0,
    },
    violations: ruleIds.map((id) => ({
      id,
      impact: "serious" as const,
      help: id,
      description: "d",
      tags: [],
      level: "A" as const,
      wcagCriteria: [],
      isBestPractice: false,
      totalNodeCount: 1,
      nodes: [
        {
          target: [],
          selectorLabel: "x",
        },
      ],
    })),
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
}

describe("comparePageViewports", () => {
  it("detects mobile-only rule", () => {
    const c = comparePageViewports(
      "https://example.com/",
      page("https://example.com/", "desktop", []),
      page("https://example.com/", "mobile", ["button-name"]),
    );
    expect(c.mobileOnlyCount).toBe(1);
  });
});
