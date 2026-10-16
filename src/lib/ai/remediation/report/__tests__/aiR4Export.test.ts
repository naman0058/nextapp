import { describe, expect, it, vi } from "vitest";
import { buildReportAiRemediationAppendix } from "@/lib/ai/remediation/report/buildReportAiRemediationAppendix";
import { buildAiRemediationCsv } from "@/features/reports/utils/exportAiRemediationCsv";
import { exportReportJson } from "@/features/reports/utils/exportReportJson";
import { aiRemediationAppendixHtmlString } from "@/features/reports/components/AiRemediationAppendixSection";
import { formatAiRemediationForExcelRow } from "@/lib/ai/remediation/report/formatAiRemediationForExcelRow";
import { buildWebsiteScanReport } from "@/features/website-scanner/utils/buildWebsiteScanReport";
import { createInitialWebsiteSession } from "@/features/website-scanner/state/websiteScanReducer";
import {
  aiR4AllSourceCandidates,
  hostileRemediation,
} from "@/lib/ai/remediation/report/__tests__/aiR4ReportFixture";
import type { AccessibilityPreflightReport } from "@/features/reports/types/reportModel";
import { attachAiRemediationAppendix } from "@/features/reports/utils/attachAiRemediationAppendix";

vi.mock("@/lib/ai/remediation/client/fetchAiRemediation", () => ({
  fetchAiRemediation: vi.fn(() => {
    throw new Error("OpenAI must not be called during export");
  }),
}));

describe("AI-R4 export integration", () => {
  it("excludes appendix when inclusion off", () => {
    const appendix = buildReportAiRemediationAppendix(aiR4AllSourceCandidates, {
      includeAppendix: false,
      selectedIds: aiR4AllSourceCandidates.map((c) => c.id),
      allowStaleWhenSelected: true,
    });
    expect(appendix).toBeUndefined();
  });

  it("excludes stale by default unless explicitly selected with allowStale", () => {
    const withoutStale = buildReportAiRemediationAppendix(aiR4AllSourceCandidates, {
      includeAppendix: true,
      selectedIds: ["website-stale"],
      allowStaleWhenSelected: false,
    });
    expect(withoutStale).toBeUndefined();

    const withStale = buildReportAiRemediationAppendix(aiR4AllSourceCandidates, {
      includeAppendix: true,
      selectedIds: ["website-stale"],
      allowStaleWhenSelected: true,
    });
    expect(withStale?.entries[0].stale).toBe(true);
  });

  it("website scan report does not embed AI in main findings when off", () => {
    const session = {
      ...createInitialWebsiteSession(),
      sessionId: "test-session",
      rootUrl: "https://example.com",
      aiRemediationByGroup: {
        g1: {
          report: aiR4AllSourceCandidates[0].remediation,
          facts: { ruleId: "button-name" },
          frameworkPreference: "generic_html" as const,
          stale: false,
          generatedAt: "2026-01-01",
        },
      },
      includeAiRemediationInReport: false,
      aiRemediationInclusionById: {},
    } satisfies import("@/features/website-scanner/types/websiteSession").WebsiteScanSessionState;
    const report = buildWebsiteScanReport([], session);
    const findings = report.textAccessibility?.findings ?? [];
    expect(findings.some((f) => f.id.startsWith("ai-remediation"))).toBe(false);
    expect(report.aiRemediationAppendix).toBeUndefined();
  });

  it("zero fetchAiRemediation when building exports", async () => {
    const { fetchAiRemediation } = await import(
      "@/lib/ai/remediation/client/fetchAiRemediation"
    );
    const appendix = buildReportAiRemediationAppendix(aiR4AllSourceCandidates, {
      includeAppendix: true,
      selectedIds: ["website-g1"],
      allowStaleWhenSelected: true,
    })!;
    const report: AccessibilityPreflightReport = attachAiRemediationAppendix(
      {
        reportId: "rpt-test",
        generatedAt: new Date().toISOString(),
        generatedAtDisplay: "now",
        reportVersion: "1.1",
        contentType: "social_post",
        platform: null,
        projectInfo: {},
        summary: {
          overallStatus: "Review Recommended",
          platform: null,
          contentType: "social_post",
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
      },
      aiR4AllSourceCandidates,
      { includeAppendix: true, selectedIds: ["website-g1"], allowStaleWhenSelected: true },
    );
    exportReportJson(report);
    buildAiRemediationCsv(appendix.entries);
    aiRemediationAppendixHtmlString(appendix);
    formatAiRemediationForExcelRow(appendix.entries[0]).forEach((cell) => {
      expect(cell.startsWith("=")).toBe(false);
    });
    expect(fetchAiRemediation).not.toHaveBeenCalled();
  });

  it("neutralizes formula-like AI strings in CSV", () => {
    const entry = {
      ...aiR4AllSourceCandidates[0],
      remediation: hostileRemediation,
      inclusionStatus: "selected" as const,
    };
    const csv = buildAiRemediationCsv([entry]);
    expect(csv).not.toMatch(/^=HYPERLINK/m);
    expect(csv).toContain("HYPERLINK");
  });

  it("JSON export omits model and adds aiRemediation array", () => {
    const report: AccessibilityPreflightReport = attachAiRemediationAppendix(
      {
        reportId: "rpt-test",
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
      },
      aiR4AllSourceCandidates,
      { includeAppendix: true, selectedIds: ["website-g1"], allowStaleWhenSelected: true },
    );
    const json = exportReportJson(report);
    const parsed = JSON.parse(json) as { aiRemediation?: unknown[]; model?: string };
    expect(parsed.aiRemediation?.length).toBe(1);
    expect(parsed.model).toBeUndefined();
  });
});
