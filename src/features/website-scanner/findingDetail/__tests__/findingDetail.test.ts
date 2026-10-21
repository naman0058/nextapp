import { describe, expect, it } from "vitest";
import { buildSiteScanIntelligence } from "@/features/accessibility-intelligence/buildSiteScanIntelligence";
import { groupRootCauses } from "@/features/accessibility-intelligence/grouping/groupRootCauses";
import {
  createInitialWebsiteSession,
  websiteScanReducer,
} from "@/features/website-scanner/state/websiteScanReducer";
import { buildFindingDetails } from "@/features/website-scanner/findingDetail/buildFindingDetails";
import { filterFindingDetails } from "@/features/website-scanner/findingDetail/filterFindingDetails";
import { parseContrastFromFailureSummary } from "@/features/website-scanner/findingDetail/parseAxeEvidenceFields";
import { sanitizeTicketHtmlSnippet } from "@/features/website-scanner/developerTicket/sanitizeDeveloperTicketContent";
import {
  formatDetailedEvidenceExamples,
  formatRepresentativeSelectorsShown,
} from "@/features/website-scanner/utils/occurrenceCounts";
import { DEFAULT_ISSUES_FILTER } from "@/features/website-scanner/utils/issuesListUtils";
import type {
  WebsiteAccessibilityViolation,
  WebsitePageScanResult,
} from "@/features/website-scanner/types/scanTypes";
import { SCAN_VIEWPORTS } from "@/features/website-scanner/constants/viewports";

function violationNode(
  selectorLabel: string,
  extra?: Partial<WebsiteAccessibilityViolation["nodes"][0]>,
): WebsiteAccessibilityViolation["nodes"][0] {
  return {
    target: [],
    selectorLabel,
    domSignature: selectorLabel,
    landmarkContext: "main",
    ...extra,
  };
}

function pageWithViolations(
  url: string,
  violations: WebsiteAccessibilityViolation[],
  incomplete: WebsitePageScanResult["incomplete"] = [],
  viewport: WebsitePageScanResult["viewport"] = SCAN_VIEWPORTS.desktop,
): WebsitePageScanResult {
  return {
    requestedUrl: url,
    finalUrl: url,
    pageTitle: "t",
    scannedAt: new Date().toISOString(),
    viewport,
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
    incomplete,
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

function colorContrastViolation(nodeCount: number): WebsiteAccessibilityViolation {
  const nodes = Array.from({ length: nodeCount }, (_, i) =>
    violationNode(`p:nth-child(${i + 1})`),
  );
  return {
    id: "color-contrast",
    impact: "serious",
    help: "Contrast",
    description: "desc",
    tags: [],
    wcagCriteria: ["1.4.3"],
    level: "AA",
    totalNodeCount: nodeCount,
    nodes: nodes.slice(0, 20),
    isBestPractice: false,
  };
}

describe("findingDetail", () => {
  it("A: preserves 81 total vs 20 retained vs displayed selectors", () => {
    const page = pageWithViolations("https://a/", [colorContrastViolation(81)]);
    const intel = buildSiteScanIntelligence([page]);
    const detail = intel.findingDetails.find((d) => d.ruleId === "color-contrast");
    expect(detail?.totalOccurrences).toBe(81);
    expect(detail?.retainedEvidenceCount).toBeLessThanOrEqual(20);
    expect(detail!.retainedEvidenceCount).toBeGreaterThan(0);
    expect(formatDetailedEvidenceExamples(detail!.retainedEvidenceCount)).toMatch(
      /detailed evidence examples retained/,
    );
    expect(formatRepresentativeSelectorsShown(3)).toBe(
      "Showing 3 representative selectors",
    );
  });

  it("B: one rule across three pages rolls up scope", () => {
    const pages = ["https://a/", "https://b/", "https://c/"].map((u) =>
      pageWithViolations(u, [colorContrastViolation(5)]),
    );
    const intel = buildSiteScanIntelligence(pages);
    const detail = intel.findingDetails.find((d) => d.ruleId === "color-contrast");
    expect(detail?.pagesAffected).toBe(3);
    expect(detail?.pageViewportScopes).toHaveLength(3);
  });

  it("C: same rule on desktop and mobile viewports", () => {
    const desktop = pageWithViolations(
      "https://a/",
      [colorContrastViolation(2)],
      [],
      SCAN_VIEWPORTS.desktop,
    );
    const mobile = pageWithViolations(
      "https://a/",
      [colorContrastViolation(3)],
      [],
      SCAN_VIEWPORTS.mobile,
    );
    const intel = buildSiteScanIntelligence([desktop, mobile]);
    const detail = intel.findingDetails.find((d) => d.ruleId === "color-contrast");
    expect(detail?.affectedViewports).toEqual(
      expect.arrayContaining(["desktop", "mobile"]),
    );
  });

  it("D: rule both FAIL and INCOMPLETE links related incomplete", () => {
    const page = pageWithViolations(
      "https://a/",
      [colorContrastViolation(4)],
      [
        {
          id: "color-contrast",
          impact: "serious",
          help: "Contrast incomplete",
          description: "inc",
          tags: [],
          wcagCriteria: ["1.4.3"],
          level: "AA",
          totalNodeCount: 2,
          nodes: [violationNode(".unknown")],
        },
      ],
    );
    const intel = buildSiteScanIntelligence([page]);
    const fail = intel.findingDetails.find(
      (d) => d.ruleId === "color-contrast" && d.kind === "automated_failure",
    );
    expect(fail?.relatedIncomplete.length).toBeGreaterThan(0);
  });

  it("E: best-practice-only appears under best_practice filter", () => {
    const page = pageWithViolations("https://a/", [
      {
        ...colorContrastViolation(1),
        id: "landmark-one-main",
        isBestPractice: true,
        help: "BP",
      },
    ]);
    const intel = buildSiteScanIntelligence([page], { includeBestPractices: true });
    const bp = filterFindingDetails(intel.findingDetails, {
      ...DEFAULT_ISSUES_FILTER,
      issueStatus: "best_practice",
    });
    expect(bp.some((d) => d.isBestPractice)).toBe(true);
  });

  it("F: no WCAG mapping still builds detail", () => {
    const page = pageWithViolations("https://a/", [
      {
        ...colorContrastViolation(1),
        id: "custom-unknown-rule",
        wcagCriteria: [],
      },
    ]);
    const intel = buildSiteScanIntelligence([page]);
    const detail = intel.findingDetails.find(
      (d) => d.ruleId === "custom-unknown-rule",
    );
    expect(detail).toBeDefined();
    expect(detail?.wcagMappings.length).toBe(0);
  });

  it("G: evidence redaction strips sensitive attrs in UI path", () => {
    const snippet = sanitizeTicketHtmlSnippet(
      '<input type="password" value="secret" autocomplete="off">',
    );
    expect(snippet).toContain("[redacted]");
  });

  it("H: category deep-link filter preset in reducer", () => {
    const state = createInitialWebsiteSession();
    const next = websiteScanReducer(state, {
      type: "OPEN_ISSUES_WITH_FILTER",
      filter: { category: "Visual & Contrast" },
    });
    expect(next.resultView).toBe("issues");
    expect(next.issuesFilter.category).toBe("Visual & Contrast");
  });

  it("I: page hotspot deep-link filter preset", () => {
    const state = createInitialWebsiteSession();
    const next = websiteScanReducer(state, {
      type: "OPEN_ISSUES_WITH_FILTER",
      filter: { pageUrl: "https://filemakr.com/" },
    });
    expect(next.issuesFilter.pageUrl).toBe("https://filemakr.com/");
  });

  it("J: zero retained evidence but totalOccurrences > 0", () => {
    const page = pageWithViolations("https://a/", [
      {
        ...colorContrastViolation(10),
        nodes: [],
      },
    ]);
    const intel = buildSiteScanIntelligence([page]);
    const detail = intel.findingDetails.find((d) => d.ruleId === "color-contrast");
    expect(detail?.totalOccurrences).toBe(10);
    expect(detail!.retainedEvidenceCount).toBeLessThan(detail!.totalOccurrences);
  });

  it("K: multiple distinct rules never share one remediation group id", () => {
    const page = pageWithViolations("https://a/", [
      colorContrastViolation(2),
      {
        ...colorContrastViolation(1),
        id: "button-name",
        help: "Button",
      },
    ]);
    const groups = groupRootCauses([page]);
    expect(groups.length).toBeGreaterThanOrEqual(2);
    const intel = buildSiteScanIntelligence([page]);
    const ids = new Set(intel.findingDetails.map((d) => d.remediationGroupId));
    expect(ids.size).toBeGreaterThanOrEqual(2);
  });

  it("parses contrast fields only from axe failure summary text", () => {
    const parsed = parseContrastFromFailureSummary(
      "Expected contrast ratio of 4.5:1, but got 2.1:1",
      "color-contrast",
    );
    expect(parsed?.requiredRatio).toBe("4.5:1");
    expect(parsed?.measuredContrastRatio).toBe("2.1:1");
  });

  it("category filter on finding details", () => {
    const page = pageWithViolations("https://a/", [colorContrastViolation(3)]);
    const intel = buildSiteScanIntelligence([page]);
    const filtered = filterFindingDetails(intel.findingDetails, {
      ...DEFAULT_ISSUES_FILTER,
      category: "Visual & Contrast",
    });
    expect(filtered.every((d) => d.category === "Visual & Contrast")).toBe(true);
  });

  it("buildFindingDetails matches intel attachment", () => {
    const page = pageWithViolations("https://a/", [colorContrastViolation(2)]);
    const intel = buildSiteScanIntelligence([page]);
    const rebuilt = buildFindingDetails([page], intel);
    expect(rebuilt.length).toBe(intel.findingDetails.length);
  });
});
