import { describe, expect, it } from "vitest";
import { buildWebsiteRemediationContext } from "@/features/website-scanner/server/remediation/buildWebsiteRemediationContext";
import type { RootCauseGroup } from "@/features/accessibility-intelligence/types/siteIntelligence";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";

function minimalGroup(): RootCauseGroup {
  return {
    id: "rc-gate-1",
    ruleId: "button-name",
    confidence: "high",
    groupType: "shared_navigation",
    label: "Navigation buttons",
    affectedPages: ["https://example.com/"],
    totalOccurrences: 12,
    retainedEvidenceCount: 12,
    representativeSelectors: ["nav button"],
    representativeEvidence: [
      {
        sourceType: "axe",
        confidenceCategory: "tool_detected",
        htmlSnippet: "<button></button>",
        selector: "nav button",
      },
    ],
    likelySharedComponent: true,
    remediationReach: { pages: 6, occurrences: 12 },
  };
}

function page(): WebsitePageScanResult {
  return {
    finalUrl: "https://example.com/",
    viewport: { id: "desktop", label: "Desktop", width: 1280, height: 720 },
    violations: [
      {
        id: "button-name",
        impact: "critical",
        help: "Buttons must have discernible text",
        description: "desc",
        wcagCriteria: ["4.1.2"],
        nodes: [],
        totalNodeCount: 12,
      },
    ],
    passes: [],
    incomplete: [],
    inapplicable: [],
    scanCompleteness: "complete",
  } as unknown as WebsitePageScanResult;
}

describe("website AI remediation gate payload", () => {
  it("builds one root-cause payload with expected API fields", () => {
    const group = minimalGroup();
    const { facts, deterministicGuidance } = buildWebsiteRemediationContext({
      group,
      fixPlanItem: {
        rank: 1,
        title: "Fix nav buttons",
        priority: "high",
        impact: "critical",
        affectedPages: 6,
        affectedElements: 12,
        likelySharedFix: true,
        reasonForPriority: "High impact",
        estimatedReachLabel: "6 pages",
        verificationSteps: ["Rescan"],
        rootCauseGroupId: group.id,
        ruleId: "button-name",
      },
      completedPages: [page()],
      viewportMode: "desktop",
    });

    const apiBody = {
      source: "website",
      sessionId: "550e8400-e29b-41d4-a716-446655440000",
      scanId: "550e8400-e29b-41d4-a716-446655440000:2",
      frameworkPreference: "react",
      facts,
      deterministicGuidance,
    };

    expect(apiBody.source).toBe("website");
    expect(apiBody.sessionId.length).toBeLessThanOrEqual(128);
    expect(apiBody.scanId).toContain(":");
    expect(apiBody.frameworkPreference).toBe("react");
    expect(facts.issueFingerprint).toBe(group.id);
    expect(facts.affectedElementCount).toBe(12);
    expect(facts.affectedPageCount).toBe(1);
    expect((facts.htmlSnippets as string[]).length).toBeLessThanOrEqual(3);
    expect(deterministicGuidance.length).toBeGreaterThan(0);
  });
});
