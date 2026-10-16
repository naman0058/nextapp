import { describe, expect, it } from "vitest";
import { groupRootCauses } from "@/features/accessibility-intelligence/grouping/groupRootCauses";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";
import { SCAN_VIEWPORTS } from "@/features/website-scanner/constants/viewports";

function page(url: string, nodes: WebsitePageScanResult["violations"][0]["nodes"]): WebsitePageScanResult {
  return {
    requestedUrl: url,
    finalUrl: url,
    pageTitle: "t",
    scannedAt: new Date().toISOString(),
    viewport: SCAN_VIEWPORTS.desktop,
    durationMs: 1,
    axeVersion: "4.13.0",
    scannerVersion: "test",
    summary: {
      critical: 1,
      serious: 0,
      moderate: 0,
      minor: 0,
      unknown: 0,
      incomplete: 0,
      bestPractice: 0,
    },
    violations: [
      {
        id: "button-name",
        impact: "critical",
        help: "Buttons must have discernible text",
        description: "desc",
        tags: [],
        wcagCriteria: ["4.1.2"],
        level: "A",
        totalNodeCount: nodes.length,
        nodes,
        isBestPractice: false,
      },
    ],
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
      headingCount: 1,
      videoCount: 0,
      interactiveControlCount: 1,
      dialogHintCount: 0,
    },
  };
}

describe("groupRootCauses", () => {
  it("groups same signature across pages", () => {
    const sig = "abc123";
    const node = {
      target: [],
      selectorLabel: "nav > button",
      domSignature: sig,
      landmarkContext: "navigation" as const,
    };
    const groups = groupRootCauses([
      page("https://example.com/a", [node, node, node]),
      page("https://example.com/b", [node]),
    ]);
    const shared = groups.filter((g) => g.likelySharedComponent);
    expect(shared.length).toBeGreaterThan(0);
    expect(shared[0]?.affectedPages.length).toBe(2);
  });

  it("keeps unrelated signatures separate", () => {
    const groups = groupRootCauses([
      page("https://example.com/a", [
        {
          target: [],
          selectorLabel: "nav > button",
          domSignature: "sig-a",
          landmarkContext: "navigation",
        },
      ]),
      page("https://example.com/b", [
        {
          target: [],
          selectorLabel: "footer > button",
          domSignature: "sig-b",
          landmarkContext: "footer",
        },
      ]),
    ]);
    expect(groups.length).toBe(2);
  });
});
