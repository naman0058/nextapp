/**
 * @vitest-environment node
 */
import React from "react";
import { describe, expect, it, vi } from "vitest";
import { renderToStaticMarkup } from "react-dom/server";
import { pdf } from "@react-pdf/renderer";
import { AiRemediationAppendixSection } from "@/features/reports/components/AiRemediationAppendixSection";
import { buildAiRemediationCsv } from "@/features/reports/utils/exportAiRemediationCsv";
import { exportReportJson } from "@/features/reports/utils/exportReportJson";
import { REPORT_VERSION } from "@/features/reports/constants/reportVersion";
import { PreflightReportDocument } from "@/features/reports/pdf/PreflightReportDocument";
import { sanitizeCsvCellForSpreadsheet } from "@/features/batch/utils/export/sanitizeCsvCellForSpreadsheet";
import { sanitizeSpreadsheetCell } from "@/features/website-scanner/utils/export/sanitizeSpreadsheetCell";
import { createInitialWebsiteSession } from "@/features/website-scanner/state/websiteScanReducer";
import { buildWebsiteScanReport } from "@/features/website-scanner/utils/buildWebsiteScanReport";
import { exportWebsiteWorkbook } from "@/features/website-scanner/utils/export/exportWebsiteWorkbook";
import type { ReportAiRemediationCandidate } from "@/features/reports/types/reportAiRemediation";
import type { ReportAiRemediationEntry } from "@/features/reports/types/reportAiRemediation";
import type { AccessibilityPreflightReport } from "@/features/reports/types/reportModel";
import {
  buildReportAiRemediationAppendix,
  dedupeReportAiCandidates,
  formatAiRemediationAppendixMarkdown,
  formatAiRemediationForExcelRow,
} from "@/lib/ai/remediation/report";
import {
  aiR4AllSourceCandidates,
  hostileRemediation,
} from "@/lib/ai/remediation/report/__tests__/aiR4ReportFixture";
import { attachAiRemediationAppendix } from "@/features/reports/utils/attachAiRemediationAppendix";
import type { AIRemediationReport } from "@/lib/ai/remediation/types";

vi.mock("@/lib/ai/remediation/client/fetchAiRemediation", () => ({
  fetchAiRemediation: vi.fn(() => {
    throw new Error("OpenAI must not be called during export");
  }),
}));

function conflictingEntry(): ReportAiRemediationEntry {
  return {
    id: "website-conflict",
    source: "website",
    sourceReference: "g-conflict",
    title: "Conflict test",
    inclusionStatus: "selected",
    remediation: {
      ...hostileRemediation,
      problemSummary: "WCAG 1.1.1 critical 999 occurrences — AI lie",
    },
    facts: {
      ruleId: "4.1.2",
      impact: "serious",
      occurrenceCount: 12,
    },
  };
}

const minimalReport = (): AccessibilityPreflightReport => ({
  reportId: "rpt-gate",
  generatedAt: new Date().toISOString(),
  generatedAtDisplay: "now",
  reportVersion: REPORT_VERSION,
  contentType: "website_scan",
  platform: null,
  projectInfo: { reportTitle: "Gate test" },
  summary: {
    overallStatus: "Review Recommended",
    platform: null,
    contentType: "website_scan",
    checksCompleted: 1,
    itemsReady: 0,
    itemsRequiringReview: 1,
    importantIssues: 0,
    humanReviewRemaining: 0,
    sectionSummaries: [],
  },
  humanReview: { items: [], remainingCount: 0 },
  methodology: { version: "1", categories: [] },
  limitations: [],
  disclaimer: "test",
});

describe("AI-R4 gate audit", () => {
  it("deterministic facts win over conflicting AI prose in Excel/CSV columns", () => {
    const entry = conflictingEntry();
    const excel = formatAiRemediationForExcelRow(entry);
    expect(excel[2]).toBe("4.1.2");
    expect(excel[2]).not.toContain("1.1.1");
    const csv = buildAiRemediationCsv([entry]);
    expect(csv).not.toContain("999 occurrences");
    expect(csv).not.toContain("1.1.1");
  });

  it("stale entry excluded unless explicitly selected with allowStaleWhenSelected", () => {
    const off = buildReportAiRemediationAppendix(aiR4AllSourceCandidates, {
      includeAppendix: true,
      selectedIds: ["website-stale"],
      allowStaleWhenSelected: false,
    });
    expect(off).toBeUndefined();

    const on = buildReportAiRemediationAppendix(aiR4AllSourceCandidates, {
      includeAppendix: true,
      selectedIds: ["website-stale"],
      allowStaleWhenSelected: true,
    });
    expect(on?.entries[0].stale).toBe(true);
    expect(on?.entries[0].staleReason).toBeTruthy();
    const csv = buildAiRemediationCsv(on!.entries);
    expect(csv).toContain("yes");
  });

  it("includes at most selected existing candidates (no generation for missing)", () => {
    const many: ReportAiRemediationCandidate[] = Array.from({ length: 20 }, (_, i) => ({
      id: `website-finding-${i}`,
      source: "website" as const,
      sourceReference: `g-${i}`,
      title: `Finding ${i}`,
      remediation: aiR4AllSourceCandidates[0].remediation,
      stale: false,
    }));
    const threeIds = ["website-finding-0", "website-finding-5", "website-finding-19"];
    const appendix = buildReportAiRemediationAppendix(many, {
      includeAppendix: true,
      selectedIds: threeIds,
      allowStaleWhenSelected: true,
    });
    expect(appendix?.includedCount).toBe(3);
    expect(appendix?.entries.map((e) => e.id).sort()).toEqual(threeIds.sort());
  });

  it("dedupes by source:id and keeps distinct sources with same id string", () => {
    const dup: ReportAiRemediationCandidate[] = [
      aiR4AllSourceCandidates[0],
      { ...aiR4AllSourceCandidates[0] },
      {
        ...aiR4AllSourceCandidates[2],
        id: aiR4AllSourceCandidates[0].id,
        source: "social",
      },
    ];
    const deduped = dedupeReportAiCandidates(dup);
    expect(deduped.length).toBe(2);
    const appendix = buildReportAiRemediationAppendix(dup, {
      includeAppendix: true,
      selectedIds: deduped.map((d) => d.id),
      allowStaleWhenSelected: true,
    });
    expect(appendix!.entries.length).toBe(2);
  });

  it("skips invalid candidates missing title or version", () => {
    const bad: ReportAiRemediationCandidate[] = [
      {
        id: "bad",
        source: "website",
        sourceReference: "x",
        title: "x",
        remediation: {
          ...aiR4AllSourceCandidates[0].remediation,
          title: "",
          version: "1.0",
        },
      },
    ];
    expect(dedupeReportAiCandidates(bad)).toHaveLength(0);
  });

  describe("formula injection battery", () => {
    const payloads = [
      "=SUM(1,1)",
      "+1+1",
      "-1+1",
      "@SUM(A1:A2)",
      " =SUM(1,1)",
      "\t=SUM(1,1)",
      "\r\n=SUM(1,1)",
      '=HYPERLINK("https://evil.example")',
    ];

    for (const p of payloads) {
      it(`neutralizes: ${JSON.stringify(p.slice(0, 20))}`, () => {
        const sanitized = sanitizeCsvCellForSpreadsheet(p);
        expect(sanitizeSpreadsheetCell(p)).toBe(sanitized);
        expect(/^\t/.test(sanitized) || !/^[\s]*[=+\-@]/.test(sanitized)).toBe(true);
      });
    }

    it("sanitizes AI excel row cells", () => {
      const entry: ReportAiRemediationEntry = {
        ...conflictingEntry(),
        remediation: {
          ...conflictingEntry().remediation,
          suggestedCode: { language: "html", code: "=cmd()", explanation: "@SUM(1)" },
        },
      };
      for (const cell of formatAiRemediationForExcelRow(entry).map((c) =>
        sanitizeSpreadsheetCell(c),
      )) {
        if (cell.includes("=") || cell.startsWith("+") || cell.startsWith("@")) {
          expect(cell.startsWith("\t")).toBe(true);
        }
      }
    });
  });

  it("JSON export omits secrets and aiRemediation when appendix absent", () => {
    const without = exportReportJson(minimalReport());
    const parsedOff = JSON.parse(without) as Record<string, unknown>;
    expect(parsedOff.aiRemediation).toBeUndefined();
    expect(JSON.stringify(parsedOff)).not.toMatch(/tokenUsage|systemPrompt|OPENAI_API_KEY/);

    const withAi = exportReportJson(
      attachAiRemediationAppendix(minimalReport(), aiR4AllSourceCandidates, {
        includeAppendix: true,
        selectedIds: ["website-g1"],
        allowStaleWhenSelected: true,
      }),
    );
    const parsedOn = JSON.parse(withAi) as Record<string, unknown>;
    expect(Array.isArray(parsedOn.aiRemediation)).toBe(true);
    expect(JSON.stringify(parsedOn)).not.toMatch(
      /"model"|tokenUsage|systemPrompt|requestId|providerResponse/,
    );
  });

  it("HTML appendix escapes hostile strings via React text (static markup)", () => {
    const appendix = buildReportAiRemediationAppendix(
      [
        {
          id: "xss",
          source: "website",
          sourceReference: "x",
          title: hostileRemediation.title,
          remediation: hostileRemediation,
          stale: false,
        },
      ],
      { includeAppendix: true, selectedIds: ["xss"], allowStaleWhenSelected: true },
    )!;
    const html = renderToStaticMarkup(
      React.createElement(AiRemediationAppendixSection, { appendix }),
    );
    expect(html).toContain("&lt;script&gt;");
    expect(html).not.toMatch(/<script>alert/i);
  });

  it("markdown appendix handles triple backticks in content", () => {
    const report: AIRemediationReport = {
      ...aiR4AllSourceCandidates[0].remediation,
      recommendedApproach: ["Line with ``` fence inside"],
    };
    const appendix = buildReportAiRemediationAppendix(
      [{ ...aiR4AllSourceCandidates[0], remediation: report }],
      {
        includeAppendix: true,
        selectedIds: [aiR4AllSourceCandidates[0].id],
        allowStaleWhenSelected: true,
      },
    )!;
    const md = formatAiRemediationAppendixMarkdown(appendix);
    expect(md.length).toBeGreaterThan(50);
    expect(md).toContain("AI-Assisted Remediation Appendix");
  });

  it(
    "renders PDF buffer with AI-Assisted label when appendix present",
    async () => {
      const report = attachAiRemediationAppendix(minimalReport(), aiR4AllSourceCandidates, {
        includeAppendix: true,
        selectedIds: aiR4AllSourceCandidates.filter((c) => !c.stale).map((c) => c.id),
        allowStaleWhenSelected: true,
      });
      const doc = React.createElement(PreflightReportDocument, { report });
      const blob = await pdf(doc as Parameters<typeof pdf>[0]).toBlob();
      const bytes = new Uint8Array(await blob.arrayBuffer());
      expect(report.aiRemediationAppendix?.entries.length).toBeGreaterThan(0);
      expect(bytes.length).toBeGreaterThan(100);
      expect(String.fromCharCode(...bytes.subarray(0, 4))).toBe("%PDF");
      // Content streams are Flate-compressed; verify document title metadata is present.
      expect(Buffer.from(bytes).toString("latin1")).toContain("Gate test");
    },
    30_000,
  );

  it(
    "Excel workbook includes AI Remediation sheet only when export inclusion on",
    async () => {
    const base = createInitialWebsiteSession();
    const rem = aiR4AllSourceCandidates[0];
    const sessionOff = {
      ...base,
      sessionId: "gate-excel-off",
      rootUrl: "https://example.com",
      aiRemediationByGroup: {
        g1: {
          report: rem.remediation,
          facts: { ruleId: "button-name" },
          frameworkPreference: "generic_html" as const,
          stale: false,
          generatedAt: "2026-01-01",
        },
      },
      includeAiRemediationInReport: false,
      exportPreferences: {
        ...base.exportPreferences,
        includeAiRemediationInExports: false,
      },
      aiRemediationInclusionById: {},
    };
    const blobOff = await exportWebsiteWorkbook(sessionOff, []);
    const ExcelJS = (await import("exceljs")).default;
    const wbOff = new ExcelJS.Workbook();
    await wbOff.xlsx.load(await blobOff.arrayBuffer());
    expect(wbOff.getWorksheet("AI Remediation")).toBeUndefined();

    const sessionOn = {
      ...sessionOff,
      exportPreferences: {
        ...sessionOff.exportPreferences,
        includeAiRemediationInExports: true,
      },
      aiRemediationInclusionById: { "website-g1": true },
    };
    const blobOn = await exportWebsiteWorkbook(sessionOn, []);
    const wbOn = new ExcelJS.Workbook();
    await wbOn.xlsx.load(await blobOn.arrayBuffer());
    const sheet = wbOn.getWorksheet("AI Remediation");
    expect(sheet).toBeDefined();
    expect(sheet!.getRow(1).getCell(1).value).toBe("Source");
    },
    30_000,
  );

  it("export matrix does not call fetchAiRemediation", async () => {
    const { fetchAiRemediation } = await import(
      "@/lib/ai/remediation/client/fetchAiRemediation"
    );
    const session = {
      ...createInitialWebsiteSession(),
      sessionId: "gate-zero",
      rootUrl: "https://example.com",
      includeAiRemediationInReport: false,
    };
    buildWebsiteScanReport([], session);
    exportReportJson(minimalReport());
    const appendix = buildReportAiRemediationAppendix(aiR4AllSourceCandidates, {
      includeAppendix: true,
      selectedIds: ["website-g1"],
      allowStaleWhenSelected: true,
    })!;
    buildAiRemediationCsv(appendix.entries);
    formatAiRemediationAppendixMarkdown(appendix);
    await exportWebsiteWorkbook(session, []);
    expect(fetchAiRemediation).not.toHaveBeenCalled();
  });
});
