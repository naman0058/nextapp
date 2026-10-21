import { describe, expect, it } from "vitest";
import type { RootCauseGroup } from "@/features/accessibility-intelligence/types/siteIntelligence";
import { buildAiPayloadFromRootCauseGroup } from "@/features/website-scanner/utils/buildAiGuidancePayload";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";

const group: RootCauseGroup = {
  id: "rc-1",
  ruleId: "image-alt",
  confidence: "medium",
  groupType: "repeated_pattern",
  label: "Missing alt",
  affectedPages: ["https://example.com/"],
  totalOccurrences: 5,
  retainedEvidenceCount: 5,
  representativeSelectors: ["img"],
  representativeEvidence: [
    { sourceType: "axe", confidenceCategory: "tool_detected", htmlSnippet: "<img src=x>" },
    { sourceType: "axe", confidenceCategory: "tool_detected", htmlSnippet: "<img src=y>" },
    { sourceType: "axe", confidenceCategory: "tool_detected", htmlSnippet: "<img src=z>" },
    { sourceType: "axe", confidenceCategory: "tool_detected", htmlSnippet: "<img src=w>" },
  ],
  likelySharedComponent: true,
  remediationReach: { pages: 1, occurrences: 5 },
};

const page: WebsitePageScanResult = {
  requestedUrl: "https://example.com/",
  finalUrl: "https://example.com/",
  pageTitle: "Home",
  scannedAt: new Date().toISOString(),
  viewport: { id: "desktop", width: 1280, height: 720, label: "Desktop" },
  durationMs: 100,
  axeVersion: "4",
  scannerVersion: "1",
  summary: {
    critical: 0,
    serious: 1,
    moderate: 0,
    minor: 0,
    unknown: 0,
    incomplete: 0,
    bestPractice: 0,
  },
  violations: [
    {
      id: "image-alt",
      impact: "critical",
      help: "Images must have alt",
      description: "desc",
      tags: ["wcag2a"],
      level: "A",
      wcagCriteria: ["1.1.1"],
      isBestPractice: false,
      totalNodeCount: 5,
      nodes: [],
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
    imageCount: 5,
    headingCount: 1,
    videoCount: 0,
    interactiveControlCount: 0,
    dialogHintCount: 0,
  },
};

describe("buildAiPayloadFromRootCauseGroup", () => {
  it("builds one group payload with max 3 snippets", () => {
    const payload = buildAiPayloadFromRootCauseGroup(group, [page], 3);
    expect(payload.ruleId).toBe("image-alt");
    expect(payload.htmlSnippets).toHaveLength(3);
  });
});
