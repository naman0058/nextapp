import { describe, expect, it, vi, beforeEach } from "vitest";
import { buildDeveloperTicketContribution } from "@/features/accessibility-workspace/buildDeveloperTicketContribution";
import { buildVisualLocatorContribution } from "@/features/accessibility-workspace/buildVisualLocatorContribution";
import { buildImageAltContribution } from "@/features/accessibility-workspace/buildImageAltContribution";
import { buildReportWorkspaceBlock } from "@/features/accessibility-workspace/buildContrastContribution";
import { developerTicketContributionId } from "@/features/accessibility-workspace/contributionIds";
import { upsertContributionList } from "@/features/accessibility-workspace/upsertContribution";
import {
  queuePendingContribution,
  readPendingContributions,
  clearPendingContributions,
} from "@/features/accessibility-workspace/handoffStorage";
import type { DeveloperTicket } from "@/features/website-scanner/developerTicket/types";
import type { ToolHandoffContext } from "@/features/accessibility-workspace/types";
import { attachAiRemediationAppendix } from "@/features/reports/utils/attachAiRemediationAppendix";
import { exportReportJson } from "@/features/reports/utils/exportReportJson";
import { aiR4AllSourceCandidates } from "@/lib/ai/remediation/report/__tests__/aiR4ReportFixture";
import type { AccessibilityPreflightReport } from "@/features/reports/types/reportModel";

const ticketStub = (): DeveloperTicket => ({
  version: "1",
  title: "Fix color contrast",
  summary: "Summary",
  priority: "high",
  impact: "serious",
  sourceType: "axe",
  ruleId: "color-contrast",
  wcagCriteria: ["1.4.3"],
  userImpact: "Impact",
  scope: {
    affectedPageCount: 1,
    affectedElementCount: 2,
    affectedPagePaths: ["/a"],
    additionalPageCount: 0,
    selectorsShown: 1,
    totalSelectorsAvailable: 2,
  },
  representativeEvidence: [{ pagePath: "/a", selector: ".x" }],
  recommendedFix: ["Increase contrast"],
  acceptanceCriteria: ["Ratio meets AA", "Rescan passes"],
  verificationSteps: ["Rescan"],
  manualReviewRequired: false,
  limitations: [],
});

const handoffStub = (): ToolHandoffContext => ({
  version: 1,
  toolId: "image_alt_checker",
  createdAt: new Date().toISOString(),
  returnTo: {
    websiteSessionId: "sess",
    findingId: "finding-page-a",
    ruleId: "image-alt",
    resultView: "issues",
    label: "Images must have alt text",
  },
  ruleId: "image-alt",
  pageOrigin: "https://example.com",
  pagePath: "/page-a",
  scannerTotalOccurrences: 5,
});

function mockSessionStorage() {
  const store = new Map<string, string>();
  vi.stubGlobal("sessionStorage", {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => {
      store.set(k, v);
    },
    removeItem: (k: string) => {
      store.delete(k);
    },
    clear: () => store.clear(),
  });
}

describe("Phase 6B contributions", () => {
  beforeEach(() => {
    vi.stubGlobal("crypto", { randomUUID: () => "uuid" });
    mockSessionStorage();
  });

  it("J: developer ticket contribution uses stable finding id and definition refs", () => {
    const c = buildDeveloperTicketContribution({
      ticket: ticketStub(),
      findingId: "finding-abc",
      ruleId: "color-contrast",
      remediationGroupId: "group-1",
      includedInReport: true,
    });
    expect(c.contributionId).toBe(developerTicketContributionId("finding-abc"));
    expect(c.relatedWebsiteFindingIds).toEqual(["finding-abc"]);
    expect(c.relatedRuleIds).toEqual(["color-contrast"]);
    expect(c.remediationDefinitionId).toBe("color-contrast");
    expect(c.verificationResults[0]?.label).toContain("handoff");
    expect(c.summary).not.toBe(c.findings[0]?.title);
  });

  it("I: visual locator contribution has no signing secret and uses evidence id", () => {
    const c = buildVisualLocatorContribution({
      findingId: "finding-1",
      ruleId: "color-contrast",
      evidenceId: "fp-123",
      occurrenceIndex: 2,
      occurrenceTotal: 10,
      pageUrl: "https://example.com/page?token=secret",
      viewportId: "desktop",
      includedInReport: true,
      locatorMatch: "exact",
    });
    const json = JSON.stringify(c);
    expect(json).not.toMatch(/VISUAL_LOCATOR_SIGNING_SECRET/i);
    expect(c.privacyClassification).toBe("local_session");
    expect(c.evidence[0]?.evidenceId).toBe("fp-123");
    expect(c.title).toContain("Visual evidence");
    expect(c.title).not.toContain("verified");
  });

  it("L: image alt contribution scopes to one finding / page", () => {
    const c = buildImageAltContribution({
      handoff: handoffStub(),
      proposedAlt: "Diagram of workflow",
      humanReviewed: true,
      aiSuggested: false,
      includedInReport: true,
    });
    expect(c.scope.pageUrl).toBe("https://example.com");
    expect(c.scope.occurrenceLabel).toContain("5");
    expect(c.relatedWebsiteFindingIds).toEqual(["finding-page-a"]);
  });

  it("upsert replaces developer ticket regeneration", () => {
    const a = buildDeveloperTicketContribution({
      ticket: ticketStub(),
      findingId: "f1",
      ruleId: "color-contrast",
      includedInReport: false,
    });
    const b = buildDeveloperTicketContribution({
      ticket: { ...ticketStub(), acceptanceCriteria: ["One"] },
      findingId: "f1",
      ruleId: "color-contrast",
      includedInReport: true,
    });
    const merged = upsertContributionList([a], b);
    expect(merged).toHaveLength(1);
    expect(merged[0]?.includedInReport).toBe(true);
    expect(merged[0]?.measurements[0]?.value).toBe(1);
  });

  it("F: AI generated but not selected is absent from report JSON", () => {
    const base: AccessibilityPreflightReport = {
      reportId: "rpt-f",
      generatedAt: new Date().toISOString(),
      generatedAtDisplay: "now",
      reportVersion: "1.1",
      contentType: "website_scan",
      platform: null,
      projectInfo: {},
      summary: {
        overallStatus: "Review Recommended",
        platform: null,
        contentType: "website_scan",
        checksCompleted: 0,
        itemsReady: 0,
        itemsRequiringReview: 0,
        importantIssues: 0,
        humanReviewRemaining: 0,
        sectionSummaries: [],
      },
      humanReview: { items: [], remainingCount: 0 },
      methodology: { version: "1", categories: [] },
      limitations: [],
      disclaimer: "test",
    };
    const excluded = attachAiRemediationAppendix(base, aiR4AllSourceCandidates, {
      includeAppendix: true,
      selectedIds: ["website-g1"],
    });
    const json = exportReportJson(excluded!);
    expect(json).toContain("website-g1");
    expect(json).not.toContain("website-g2");
    expect(buildReportWorkspaceBlock([], 0, 0).contributions).toHaveLength(0);
  });

  it("G: selected AI appendix is present and labelled for review", () => {
    const base: AccessibilityPreflightReport = {
      reportId: "rpt-g",
      generatedAt: new Date().toISOString(),
      generatedAtDisplay: "now",
      reportVersion: "1.1",
      contentType: "website_scan",
      platform: null,
      projectInfo: {},
      summary: {
        overallStatus: "Review Recommended",
        platform: null,
        contentType: "website_scan",
        checksCompleted: 0,
        itemsReady: 0,
        itemsRequiringReview: 0,
        importantIssues: 0,
        humanReviewRemaining: 0,
        sectionSummaries: [],
      },
      humanReview: { items: [], remainingCount: 0 },
      methodology: { version: "1", categories: [] },
      limitations: [],
      disclaimer: "test",
    };
    const withAi = attachAiRemediationAppendix(base, aiR4AllSourceCandidates, {
      includeAppendix: true,
      selectedIds: ["website-g1"],
    });
    expect(withAi.aiRemediationAppendix?.entries[0]?.inclusionStatus).toBe("selected");
    expect(withAi.aiRemediationAppendix?.intro).toMatch(/review/i);
  });

  it("pending queue dedupes by contribution id", () => {
    clearPendingContributions();
    const c1 = buildDeveloperTicketContribution({
      ticket: ticketStub(),
      findingId: "f1",
      ruleId: "color-contrast",
      includedInReport: false,
    });
    queuePendingContribution(c1);
    queuePendingContribution({
      ...c1,
      includedInReport: true,
      updatedAt: new Date().toISOString(),
    });
    const pending = readPendingContributions();
    expect(pending).toHaveLength(1);
    expect(pending[0]?.includedInReport).toBe(true);
  });

});
