import { describe, expect, it, vi, beforeEach } from "vitest";
import {
  buildContrastMeasurementContribution,
  buildReportWorkspaceBlock,
} from "@/features/accessibility-workspace/buildContrastContribution";
import { buildToolHandoff } from "@/features/accessibility-workspace/buildHandoffFromFinding";
import type { FindingDetail } from "@/features/website-scanner/findingDetail/types";
import {
  createInitialWebsiteSession,
  websiteScanReducer,
} from "@/features/website-scanner/state/websiteScanReducer";
import { evaluateContrast, parseHexColor } from "@/features/accessibility/utils/contrast";
const minimalDetail = (): FindingDetail =>
  ({
    findingId: "finding-color-contrast-1",
    remediationGroupId: "group-abc",
    ruleId: "color-contrast",
    title: "Elements must have sufficient color contrast",
    description: "Test",
    kind: "automated_failure",
    source: "AXE_WCAG",
    outcome: "fail",
    category: "Visual design",
    isBestPractice: false,
    impact: "serious",
    priority: "high",
    wcagMappings: [{ criterion: "1.4.3", level: "AA" }],
    totalOccurrences: 81,
    retainedEvidenceCount: 3,
    displayedSelectorCount: 3,
    pagesAffected: 2,
    affectedUrls: ["https://example.com/page"],
    affectedViewports: ["desktop"],
    representativeSelectors: [".btn"],
    evidenceItems: [
      {
        evidenceId: "e1",
        pageUrl: "https://example.com/page",
        viewportId: "desktop",
        selector: ".btn",
        occurrenceIndex: 1,
        contrast: {
          foregroundColor: "#777777",
          backgroundColor: "#ffffff",
          measuredContrastRatio: "3.2",
          requiredRatio: "4.5",
        },
      },
    ],
    pageViewportScopes: [],
    relatedIncomplete: [],
    relatedManualTasks: [],
    relatedHumanReviewCheckIds: [],
    deterministicFixAvailable: true,
    aiRemediationAvailable: true,
    visualLocatorAvailable: true,
    developerTicketAvailable: true,
    specializedTool: {
      href: "/image-contrast-checker",
      label: "Contrast checker",
    },
    normalizedFindings: [],
  }) as unknown as FindingDetail;

describe("accessibility workspace Phase 6", () => {
  beforeEach(() => {
    vi.stubGlobal("crypto", {
      randomUUID: () => "test-uuid",
    });
  });

  it("A: website scan only has empty included contributions in report block", () => {
    const session = createInitialWebsiteSession();
    const block = buildReportWorkspaceBlock([], 0, 0);
    expect(block.contributions).toHaveLength(0);
    expect(session.accessibilityWorkspace.contributions).toHaveLength(0);
  });

  it("B: builds contrast handoff from finding with occurrence metadata", () => {
    const handoff = buildToolHandoff({
      toolId: "contrast_checker",
      detail: minimalDetail(),
      websiteSessionId: "sess-1",
    });
    expect(handoff.toolId).toBe("contrast_checker");
    expect(handoff.scannerTotalOccurrences).toBe(81);
    expect(handoff.returnTo.findingId).toBe("finding-color-contrast-1");
    expect(handoff.pagePath).toBe("/page");
  });

  it("C/D/E: contrast contribution scope and report inclusion", () => {
    const handoff = buildToolHandoff({
      toolId: "contrast_checker",
      detail: minimalDetail(),
      websiteSessionId: "sess-1",
    });
    const fg = parseHexColor("#333333");
    const bg = parseHexColor("#ffffff");
    const evaluation = evaluateContrast(fg, bg, "normal");
    const included = buildContrastMeasurementContribution({
      handoff,
      evaluation,
      foregroundHex: "#333333",
      backgroundHex: "#ffffff",
      textType: "normal",
      includedInReport: true,
    });
    const excluded = buildContrastMeasurementContribution({
      handoff,
      evaluation,
      foregroundHex: "#333333",
      backgroundHex: "#ffffff",
      textType: "normal",
      includedInReport: false,
    });
    expect(included.summary).toContain("81");
    expect(included.summary).toContain("not all 81");
    expect(included.relatedWebsiteFindingIds).toContain("finding-color-contrast-1");
    const reportBlock = buildReportWorkspaceBlock([included, excluded], 0, 0);
    expect(reportBlock.contributions).toHaveLength(1);
    expect(reportBlock.contributionSummary.contrastMeasurements).toBe(1);
  });

  it("reducer merges pending contributions and return-to-finding", () => {
    let state = createInitialWebsiteSession();
    state = websiteScanReducer(state, { type: "INIT_CLIENT", sessionId: "sess-1" });
    const handoff = buildToolHandoff({
      toolId: "contrast_checker",
      detail: minimalDetail(),
      websiteSessionId: "sess-1",
    });
    const fg = parseHexColor("#333333");
    const bg = parseHexColor("#ffffff");
    const evaluation = evaluateContrast(fg, bg, "normal");
    const contribution = buildContrastMeasurementContribution({
      handoff,
      evaluation,
      foregroundHex: "#333333",
      backgroundHex: "#ffffff",
      textType: "normal",
      includedInReport: true,
    });
    state = websiteScanReducer(state, {
      type: "MERGE_PENDING_CONTRIBUTIONS",
      contributions: [contribution],
    });
    expect(state.accessibilityWorkspace.contributions).toHaveLength(1);
    state = websiteScanReducer(state, {
      type: "APPLY_RETURN_TO_FINDING",
      returnTo: handoff.returnTo,
    });
    expect(state.resultView).toBe("issues");
    expect(state.highlightFindingId).toBe("finding-color-contrast-1");
  });

  it("N: old session without contributions still loads via reducer defaults", () => {
    const legacy = {
      ...createInitialWebsiteSession(),
      accessibilityWorkspace: undefined,
    } as unknown as ReturnType<typeof createInitialWebsiteSession>;
    const next = websiteScanReducer(legacy, {
      type: "INIT_CLIENT",
      sessionId: "legacy",
    });
    expect(next.accessibilityWorkspace.contributions).toEqual([]);
  });

});
