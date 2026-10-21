import type { WebsiteScanSessionState } from "@/features/website-scanner/types/websiteSession";
import { sanitizeSpreadsheetCell } from "@/features/website-scanner/utils/export/sanitizeSpreadsheetCell";
import { sanitizeExportUrl } from "@/features/website-scanner/utils/export/sanitizeExportUrl";
import { collectPageScanResults } from "@/features/website-scanner/utils/collectPageScanResults";
import {
  AI_REMEDIATION_EXCEL_HEADERS,
  formatAiRemediationForExcelRow,
} from "@/lib/ai/remediation/report";
import { getWebsiteAiRemediationAppendix } from "@/features/website-scanner/utils/getWebsiteReportWithAi";

export async function exportWebsiteWorkbook(
  session: WebsiteScanSessionState,
  completedPages?: import("@/features/website-scanner/types/scanTypes").WebsitePageScanResult[],
): Promise<Blob> {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  const prefs = session.exportPreferences;
  const scope = session.scanScope;
  const intel = session.siteIntelligence;

  const exec = wb.addWorksheet("Executive Summary");
  exec.addRow(["Accessibility preflight — executive summary"]);
  exec.addRow(["Scan URL", sanitizeExportUrl(session.rootUrl, prefs.includeQueryStringsInExports)]);
  exec.addRow(["Generated", new Date().toISOString()]);
  exec.addRow(["Pages discovered", scope.urlsDiscovered]);
  exec.addRow(["Pages selected", scope.urlsSelected]);
  exec.addRow(["Pages scanned", scope.pagesCompleted]);
  exec.addRow(["Viewport mode", session.viewportMode]);
  exec.addRow(["Unique issues", intel?.summary.uniqueAutomatedRules ?? ""]);
  exec.addRow([
    "Shared root causes",
    intel?.summary.sharedRootCauses ?? intel?.summary.likelyRootCauses ?? "",
  ]);
  exec.getRow(1).font = { bold: true };

  const inv = wb.addWorksheet("Page Inventory");
  inv.addRow(["URL", "Title", "Viewport", "Completeness", "Unique issues"]);
  inv.getRow(1).font = { bold: true };
  for (const p of session.pages.filter((x) => x.status === "complete")) {
    const results = collectPageScanResults([p]);
    const primary = p.desktopResult ?? p.mobileResult ?? p.result;
    const issues = results.reduce(
      (n, r) => n + r.violations.filter((v) => !v.isBestPractice).length,
      0,
    );
    inv.addRow([
      sanitizeSpreadsheetCell(
        sanitizeExportUrl(primary?.finalUrl ?? p.url, prefs.includeQueryStringsInExports),
      ),
      sanitizeSpreadsheetCell(primary?.pageTitle ?? ""),
      p.desktopResult && p.mobileResult ? "Both" : (primary?.viewport.label ?? ""),
      primary?.scanCompleteness ?? "complete",
      issues,
    ]);
  }

  if (intel?.fixPlan.length) {
    const fp = wb.addWorksheet("Fix Plan");
    fp.addRow(["Order", "Priority", "Task", "Pages", "Occurrences"]);
    fp.getRow(1).font = { bold: true };
    for (const item of intel.fixPlan) {
      fp.addRow([
        item.rank,
        item.priority,
        sanitizeSpreadsheetCell(item.title),
        item.affectedPages,
        item.affectedElements,
      ]);
    }
  }

  if (intel?.rootCauseGroups.length) {
    const rc = wb.addWorksheet("Root Causes");
    rc.addRow(["Label", "Rule", "Pages", "Occurrences", "Shared?"]);
    rc.getRow(1).font = { bold: true };
    for (const g of intel.rootCauseGroups) {
      rc.addRow([
        sanitizeSpreadsheetCell(g.label),
        g.ruleId,
        g.affectedPages.length,
        g.totalOccurrences,
        g.likelySharedComponent ? "yes" : "no",
      ]);
    }
  }

  if (intel?.wcagCoverage.length) {
    const wcag = wb.addWorksheet("WCAG Coverage");
    wcag.addRow(["Criterion", "Level", "Principle", "Automation"]);
    wcag.getRow(1).font = { bold: true };
    for (const row of intel.wcagCoverage) {
      wcag.addRow([
        sanitizeSpreadsheetCell(row.criterion),
        row.level,
        row.principle,
        row.automation,
      ]);
    }
  }

  if (intel?.normalizedFindings.length) {
    const findings = wb.addWorksheet("Findings Detail");
    findings.addRow([
      "Page",
      "Viewport",
      "Rule",
      "Title",
      "Impact",
      "Priority",
      "Occurrences",
    ]);
    findings.getRow(1).font = { bold: true };
    for (const f of intel.normalizedFindings.filter((x) => x.status === "issue")) {
      findings.addRow([
        sanitizeSpreadsheetCell(
          sanitizeExportUrl(f.pageUrl ?? "", prefs.includeQueryStringsInExports),
        ),
        f.viewportId ?? "",
        f.ruleId ?? "",
        sanitizeSpreadsheetCell(f.title),
        f.impact,
        f.priority,
        f.occurrenceCount ?? "",
      ]);
    }
  }

  const pages =
    completedPages ?? collectPageScanResults(session.pages.filter((p) => p.status === "complete"));
  const aiAppendix = getWebsiteAiRemediationAppendix(pages, session, {
    forExport: true,
    sampleLabel: session.sessionId.startsWith("sample") ? "Sample AI-Assisted Guidance" : undefined,
  });
  if (aiAppendix?.entries.length) {
    const sheet = wb.addWorksheet("AI Remediation");
    sheet.addRow([...AI_REMEDIATION_EXCEL_HEADERS]);
    sheet.getRow(1).font = { bold: true };
    for (const entry of aiAppendix.entries) {
      const row = formatAiRemediationForExcelRow(entry).map((cell) =>
        sanitizeSpreadsheetCell(cell),
      );
      sheet.addRow(row);
    }
    sheet.columns.forEach((col) => {
      col.width = 24;
    });
  }

  const buffer = await wb.xlsx.writeBuffer();
  return new Blob([buffer], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });
}

export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
