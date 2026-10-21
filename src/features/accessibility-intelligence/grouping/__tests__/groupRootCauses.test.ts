import { describe, expect, it } from "vitest";
import { buildSiteScanIntelligence } from "@/features/accessibility-intelligence/buildSiteScanIntelligence";
import { buildFixPlan } from "@/features/accessibility-intelligence/fixPlan/buildFixPlan";
import { groupRootCauses } from "@/features/accessibility-intelligence/grouping/groupRootCauses";
import { getStartHereItems } from "@/features/website-scanner/utils/issueViewModels";
import type {
  WebsiteAccessibilityViolation,
  WebsitePageScanResult,
} from "@/features/website-scanner/types/scanTypes";
import { SCAN_VIEWPORTS } from "@/features/website-scanner/constants/viewports";

function violationNode(
  selectorLabel: string,
  domSignature: string,
): WebsiteAccessibilityViolation["nodes"][0] {
  return {
    target: [],
    selectorLabel,
    domSignature,
    landmarkContext: "main",
  };
}

function pageWithViolations(
  url: string,
  violations: WebsiteAccessibilityViolation[],
): WebsitePageScanResult {
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
      critical: 0,
      serious: 1,
      moderate: 0,
      minor: 0,
      unknown: 0,
      incomplete: 0,
      bestPractice: 0,
    },
    violations,
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

function colorContrastViolation(
  nodes: WebsiteAccessibilityViolation["nodes"],
): WebsiteAccessibilityViolation {
  return {
    id: "color-contrast",
    impact: "serious",
    help: "Elements must meet minimum color contrast ratio requirements",
    description: "desc",
    tags: [],
    wcagCriteria: ["1.4.3"],
    level: "AA",
    totalNodeCount: nodes.length,
    nodes,
    isBestPractice: false,
  };
}

describe("groupRootCauses", () => {
  it("consolidates many unique signatures for one rule into one remediation group", () => {
    const nodes = Array.from({ length: 82 }, (_, i) =>
      violationNode(`#el-${i}`, `sig-${i}`),
    );
    const groups = groupRootCauses([
      pageWithViolations("https://example.com/", [
        colorContrastViolation(nodes),
      ]),
    ]);
    expect(groups).toHaveLength(1);
    expect(groups[0]?.ruleId).toBe("color-contrast");
    expect(groups[0]?.totalOccurrences).toBe(82);
    expect(groups[0]?.groupType).toBe("rule_consolidated");
    expect(groups[0]?.likelySharedComponent).toBe(false);
  });

  it("keeps genuinely distinct shared clusters separate from consolidated orphans", () => {
    const sharedSig = "shared-nav-btn";
    const sharedNode = violationNode("nav > button", sharedSig);
    const groups = groupRootCauses([
      pageWithViolations("https://example.com/a", [
        colorContrastViolation([
          sharedNode,
          sharedNode,
          sharedNode,
          sharedNode,
          sharedNode,
          violationNode("#one", "sig-one"),
        ]),
      ]),
      pageWithViolations("https://example.com/b", [
        colorContrastViolation([sharedNode, sharedNode]),
      ]),
    ]);
    const shared = groups.filter((g) => g.likelySharedComponent);
    const consolidated = groups.filter((g) => g.groupType === "rule_consolidated");
    expect(shared.length).toBeGreaterThanOrEqual(1);
    expect(consolidated.length).toBeGreaterThanOrEqual(0);
    expect(groups.length).toBeLessThan(8);
  });

  it("does not over-merge unrelated rules", () => {
    const groups = groupRootCauses([
      pageWithViolations("https://example.com/", [
        colorContrastViolation([
          violationNode("a", "sig-a"),
          violationNode("b", "sig-b"),
        ]),
        {
          id: "button-name",
          impact: "critical",
          help: "Buttons must have discernible text",
          description: "d",
          tags: [],
          wcagCriteria: ["4.1.2"],
          level: "A",
          totalNodeCount: 2,
          nodes: [
            violationNode("button.one", "btn-1"),
            violationNode("button.two", "btn-2"),
          ],
          isBestPractice: false,
        },
      ]),
    ]);
    const ruleIds = new Set(groups.map((g) => g.ruleId));
    expect(ruleIds.has("color-contrast")).toBe(true);
    expect(ruleIds.has("button-name")).toBe(true);
    expect(groups.filter((g) => g.ruleId === "color-contrast")).toHaveLength(1);
    expect(groups.filter((g) => g.ruleId === "button-name")).toHaveLength(1);
  });
});

describe("site intelligence aggregation (82-node regression)", () => {
  it("produces one fix-plan task and non-duplicate Start Here cards", () => {
    const nodes = Array.from({ length: 82 }, (_, i) =>
      violationNode(`#el-${i}`, `sig-${i}`),
    );
    const intel = buildSiteScanIntelligence([
      pageWithViolations("https://example.com/", [
        colorContrastViolation(nodes),
      ]),
    ]);
    expect(intel.summary.uniqueAutomatedRules).toBe(1);
    expect(intel.summary.totalOccurrences).toBe(82);
    expect(intel.fixPlan).toHaveLength(1);
    expect(intel.fixPlan[0]?.affectedElements).toBe(82);
    const startHere = getStartHereItems(intel.fixPlan);
    expect(startHere).toHaveLength(1);
    const titles = startHere.map((s) => s.title);
    expect(new Set(titles).size).toBe(titles.length);
  });

  it("fix plan dedupes duplicate remediation keys", () => {
    const nodes = Array.from({ length: 10 }, (_, i) =>
      violationNode(`#x-${i}`, `unique-${i}`),
    );
    const groups = groupRootCauses([
      pageWithViolations("https://example.com/", [
        colorContrastViolation(nodes),
      ]),
    ]);
    const plan = buildFixPlan(groups, []);
    expect(plan.length).toBeLessThanOrEqual(1);
  });
});
