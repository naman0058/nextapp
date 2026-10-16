import { describe, expect, it } from "vitest";
import { fingerprintRemediationRequest } from "@/lib/ai/remediation/fingerprintRemediationRequest";
import { buildWebsiteRemediationContext } from "@/features/website-scanner/server/remediation/buildWebsiteRemediationContext";
import type { RootCauseGroup } from "@/features/accessibility-intelligence/types/siteIntelligence";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";

const EVAL_RULES = [
  "button-name",
  "link-name",
  "image-alt",
  "label",
  "select-name",
  "frame-title",
  "html-has-lang",
  "document-title",
  "color-contrast",
  "aria-valid-attr",
  "aria-required-attr",
  "aria-roles",
  "landmark-one-main",
  "region",
  "list",
  "listitem",
] as const;

function minimalGroup(ruleId: string): RootCauseGroup {
  return {
    id: `rc-${ruleId}`,
    ruleId,
    confidence: "medium",
    groupType: "repeated_pattern",
    label: `Sample ${ruleId}`,
    affectedPages: ["https://example.com/"],
    totalOccurrences: 3,
    representativeSelectors: ["button.menu"],
    representativeEvidence: [
      {
        sourceType: "axe",
        confidenceCategory: "tool_detected",
        htmlSnippet: "<button></button>",
        selector: "button.menu",
        evidenceText: "Fix any of the following",
      },
    ],
    likelySharedComponent: ruleId === "button-name",
    remediationReach: { pages: 1, occurrences: 3 },
  };
}

function pageWithRule(ruleId: string): WebsitePageScanResult {
  return {
    finalUrl: "https://example.com/",
    viewport: { id: "desktop", label: "Desktop", width: 1280, height: 720 },
    violations: [
      {
        id: ruleId,
        impact: "serious",
        help: "Help",
        description: "Desc",
        wcagCriteria: ["4.1.2"],
        nodes: [],
        totalNodeCount: 3,
      },
    ],
    passes: [],
    incomplete: [],
    inapplicable: [],
    scanCompleteness: "complete",
  } as unknown as WebsitePageScanResult;
}

describe("buildWebsiteRemediationContext", () => {
  it.each(EVAL_RULES)("builds bounded facts for %s", (ruleId) => {
    const group = minimalGroup(ruleId);
    const { facts, deterministicGuidance } = buildWebsiteRemediationContext({
      group,
      completedPages: [pageWithRule(ruleId)],
      viewportMode: "desktop",
    });
    expect(facts.ruleId).toBe(ruleId);
    expect(facts.issueFingerprint).toBe(group.id);
    expect(facts.source).toBe("website");
    expect(Array.isArray(facts.htmlSnippets)).toBe(true);
    expect((facts.htmlSnippets as string[]).length).toBeLessThanOrEqual(3);
    expect((facts.selectors as string[]).length).toBeLessThanOrEqual(5);
    expect(JSON.stringify(facts).length).toBeLessThan(20_000);
    expect(deterministicGuidance.length).toBeGreaterThan(0);
  });

  it("flags document-level issues", () => {
    const { facts } = buildWebsiteRemediationContext({
      group: minimalGroup("document-title"),
      completedPages: [pageWithRule("document-title")],
      viewportMode: "desktop",
    });
    expect(facts.documentLevelIssue).toBe(true);
  });

  it("uses distinct issueFingerprint per root cause for the same rule", () => {
    const header = minimalGroup("button-name");
    header.id = "rc-nav-buttons";
    header.label = "Header navigation buttons";
    const carousel = minimalGroup("button-name");
    carousel.id = "rc-carousel-buttons";
    carousel.label = "Carousel control buttons";

    const headerCtx = buildWebsiteRemediationContext({
      group: header,
      completedPages: [pageWithRule("button-name")],
      viewportMode: "desktop",
    });
    const carouselCtx = buildWebsiteRemediationContext({
      group: carousel,
      completedPages: [pageWithRule("button-name")],
      viewportMode: "desktop",
    });

    expect(headerCtx.facts.issueFingerprint).toBe("rc-nav-buttons");
    expect(carouselCtx.facts.issueFingerprint).toBe("rc-carousel-buttons");
    expect(
      fingerprintRemediationRequest(
        { source: "website", facts: headerCtx.facts },
        "generic_html",
        "gpt-4.1-mini",
      ),
    ).not.toBe(
      fingerprintRemediationRequest(
        { source: "website", facts: carouselCtx.facts },
        "generic_html",
        "gpt-4.1-mini",
      ),
    );
  });

  it("does not attach full page HTML to facts", () => {
    const hugePage = "<html><body>" + "x".repeat(50_000) + "</body></html>";
    const group = minimalGroup("button-name");
    const { facts } = buildWebsiteRemediationContext({
      group,
      completedPages: [pageWithRule("button-name")],
      viewportMode: "desktop",
    });
    const serialized = JSON.stringify(facts);
    expect(serialized).not.toContain(hugePage);
    expect(serialized.length).toBeLessThan(20_000);
    expect(facts).not.toHaveProperty("pageHtml");
    expect(facts).not.toHaveProperty("fullDom");
  });

  it("includes contrast measurements when present", () => {
    const group = minimalGroup("color-contrast");
    const { facts } = buildWebsiteRemediationContext({
      group,
      completedPages: [pageWithRule("color-contrast")],
      viewportMode: "desktop",
      normalizedFindings: [
        {
          id: "f1",
          sourceType: "axe",
          category: "website_automation",
          title: "Contrast",
          status: "issue",
          impact: "serious",
          priority: "high",
          confidence: "high",
          description: "Low contrast",
          humanReviewRequired: false,
          rootCauseGroupId: group.id,
          ruleId: "color-contrast",
          evidence: [
            {
              sourceType: "measurement",
              confidenceCategory: "measured",
              measurement: {
                name: "contrast",
                value: 2.1,
                threshold: 4.5,
                unit: "ratio",
              },
            },
          ],
        },
      ],
    });
    expect(facts.foregroundBackgroundContrast).toBeDefined();
  });
});
