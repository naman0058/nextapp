import { describe, expect, it } from "vitest";
import type { RootCauseGroup } from "@/features/accessibility-intelligence/types/siteIntelligence";
import { resolveDisplayFixStatus } from "@/features/website-scanner/utils/fixWorkflowStatus";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";

function minimalPage(
  url: string,
  ruleId: string,
  nodeCount: number,
): WebsitePageScanResult {
  return {
    requestedUrl: url,
    finalUrl: url,
    pageTitle: "T",
    scannedAt: new Date().toISOString(),
    viewport: { id: "desktop", width: 1280, height: 720, label: "Desktop" },
    durationMs: 1,
    axeVersion: "4",
    scannerVersion: "1",
    summary: {
      critical: 0,
      serious: nodeCount,
      moderate: 0,
      minor: 0,
      unknown: 0,
      incomplete: 0,
      bestPractice: 0,
    },
    violations: [
      {
        id: ruleId,
        impact: "serious",
        help: "Help",
        description: "Desc",
        helpUrl: "",
        wcagCriteria: ["1.1.1"],
        isBestPractice: false,
        totalNodeCount: nodeCount,
        tags: ["wcag2a"],
        level: "A",
        nodes: [
          {
            target: ["img"],
            selectorLabel: "img",
            failureSummary: "fix",
            htmlSnippet: "<img>",
            domSignature: "sig",
          },
        ],
      },
    ],
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
      imageCount: 1,
      headingCount: 1,
      videoCount: 0,
      interactiveControlCount: 0,
      dialogHintCount: 0,
    },
  };
}

describe("resolveDisplayFixStatus", () => {
  it("returns User Marked Fixed when user marked and no snapshot", () => {
    const status = resolveDisplayFixStatus({
      taskKey: "g1",
      userStatus: "user_marked_fixed",
      ruleId: "image-alt",
      previousSnapshot: null,
      currentPages: [minimalPage("https://a.test/", "image-alt", 2)],
    });
    expect(status).toBe("User Marked Fixed");
  });

  it("returns Verified by Rescan when rule gone after rescan", () => {
    const prev = [minimalPage("https://a.test/", "image-alt", 2)];
    const curr = [minimalPage("https://a.test/", "image-alt", 0)];
    curr[0].violations = [];
    const group: RootCauseGroup = {
      id: "g1",
      ruleId: "image-alt",
      confidence: "high",
      groupType: "isolated",
      label: "Images",
      affectedPages: ["https://a.test/"],
      totalOccurrences: 0,
      retainedEvidenceCount: 0,
      representativeSelectors: [],
      representativeEvidence: [],
      likelySharedComponent: false,
      remediationReach: { pages: 1, occurrences: 0 },
    };
    const status = resolveDisplayFixStatus({
      taskKey: "g1",
      userStatus: "user_marked_fixed",
      ruleId: "image-alt",
      previousSnapshot: prev,
      currentPages: curr,
      rootCauseGroup: group,
    });
    expect(status).toBe("Verified by Rescan");
  });
});
