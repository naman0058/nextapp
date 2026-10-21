import type { WebsiteScanSessionState } from "@/features/website-scanner/types/websiteSession";
import { sanitizeSpreadsheetCell } from "@/features/website-scanner/utils/export/sanitizeSpreadsheetCell";
import { sanitizeExportUrl } from "@/features/website-scanner/utils/export/sanitizeExportUrl";
import { collectPageScanResults } from "@/features/website-scanner/utils/collectPageScanResults";
import {
  buildPageScanDiagnostic,
  formatEvidenceReportingLabel,
  formatPageExecutionLabel,
} from "@/features/website-scanner/utils/pageScanDiagnostics";
import {
  AI_REMEDIATION_EXCEL_HEADERS,
  formatAiRemediationForExcelRow,
} from "@/lib/ai/remediation/report";
import { getWebsiteAiRemediationAppendix } from "@/features/website-scanner/utils/getWebsiteReportWithAi";
import { ensureHumanReviewRecords } from "@/features/human-review-workspace/ensureHumanReviewRecords";
import { humanReviewResultWording } from "@/features/human-review-workspace/humanReviewStatusLabel";
import { buildWebsiteScanReport } from "@/features/website-scanner/utils/buildWebsiteScanReport";

export async function exportWebsiteWorkbook(
  session: WebsiteScanSessionState,
  completedPages?: import("@/features/website-scanner/types/scanTypes").WebsitePageScanResult[],
): Promise<Blob> {
  const ExcelJS = (await import("exceljs")).default;
  const wb = new ExcelJS.Workbook();
  const prefs = session.exportPreferences;
  const scope = session.scanScope;
  const intel = session.siteIntelligence;
  const pagesForReport =
    completedPages ?? collectPageScanResults(session.pages.filter((p) => p.status === "complete"));
  const canonicalReport = buildWebsiteScanReport(pagesForReport, session, { forExport: true });
  const enterprise = canonicalReport.enterpriseView;
  const tax = enterprise?.taxonomy ?? intel?.scanResultModel.summary;

  const exec = wb.addWorksheet("Executive Summary");
  exec.addRow(["Accessibility preflight — executive summary"]);
  exec.addRow(["Report ID", canonicalReport.reportId]);
  exec.addRow(["Scan URL", sanitizeExportUrl(session.rootUrl, prefs.includeQueryStringsInExports)]);
  exec.addRow(["Generated", canonicalReport.generatedAt]);
  exec.addRow(["Status", enterprise?.executiveSummary.statusPhrase ?? canonicalReport.summary.overallStatus]);
  exec.addRow(["Pages discovered", scope.urlsDiscovered]);
  exec.addRow(["Pages selected", scope.urlsSelected]);
  exec.addRow(["Pages scanned", scope.pagesCompleted]);
  exec.addRow(["Viewport mode", session.viewportMode]);
  exec.addRow(["Unique issues", intel?.summary.uniqueAutomatedRules ?? ""]);
  if (tax) {
    exec.addRow(["Failed automated rules", tax.failedAutomatedRules]);
    exec.addRow(["Affected occurrences", tax.affectedOccurrences]);
    exec.addRow(["Passed automated rules", tax.passedAutomatedRules]);
    exec.addRow(["Needs manual confirmation", tax.needsManualConfirmation]);
    exec.addRow(["Not applicable rules", tax.notApplicableRules]);
    exec.addRow(["Best-practice observations", tax.bestPracticeObservations]);
  }
  if (enterprise) {
    exec.addRow([
      "Human review",
      `${enterprise.counters.humanReviewReviewed} of ${enterprise.counters.humanReviewRelevant} reviewed`,
    ]);
  }
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
      primary
        ? (() => {
            const d = buildPageScanDiagnostic(primary);
            return `Execution: ${formatPageExecutionLabel(d.pageExecution)} · Evidence: ${formatEvidenceReportingLabel(d.evidenceReporting)}`;
          })()
        : "—",
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

  const pages = pagesForReport;
  const aiAppendix = getWebsiteAiRemediationAppendix(pages, session, {
    forExport: true,
    sampleLabel: session.sessionId.startsWith("sample") ? "Sample AI-Assisted Guidance" : undefined,
  });
  const contributions = session.accessibilityWorkspace?.contributions ?? [];
  const hrRecords = ensureHumanReviewRecords({
    records: session.accessibilityWorkspace?.humanReviewRecords ?? [],
    manualReview: session.manualReview,
    completedPages: pages,
    intel: session.siteIntelligence,
    contributions,
    urlsSelected: session.scanScope.urlsSelected,
  });
  if (enterprise?.coverage.length) {
    const cov = wb.addWorksheet("Coverage");
    cov.addRow(["Diagnostic", "Status", "Detail"]);
    cov.getRow(1).font = { bold: true };
    for (const row of enterprise.coverage) {
      cov.addRow([row.label, row.statusLabel, sanitizeSpreadsheetCell(row.detail)]);
    }
  }

  if (enterprise?.remediationPlan.length) {
    const rp = wb.addWorksheet("Remediation Plan");
    rp.addRow([
      "Rule",
      "Title",
      "Definition version",
      "Steps",
      "Framework",
      "Verification",
      "Specialized tool",
    ]);
    rp.getRow(1).font = { bold: true };
    for (const plan of enterprise.remediationPlan) {
      rp.addRow([
        plan.ruleId,
        sanitizeSpreadsheetCell(plan.title),
        plan.definitionVersion ?? "",
        sanitizeSpreadsheetCell(plan.implementationSteps.join(" · ")),
        plan.selectedFramework ?? "",
        sanitizeSpreadsheetCell(plan.verificationSteps.join(" · ")),
        plan.specializedTool?.label ?? "",
      ]);
    }
  }

  if (enterprise?.automatedFindings.length) {
    const auto = wb.addWorksheet("Automated Findings");
    auto.addRow([
      "Rule",
      "Title",
      "Impact",
      "Priority",
      "Total occurrences",
      "Retained evidence",
      "Pages affected",
    ]);
    auto.getRow(1).font = { bold: true };
    for (const f of enterprise.automatedFindings) {
      auto.addRow([
        f.ruleId,
        sanitizeSpreadsheetCell(f.title),
        f.impact,
        f.priority,
        f.totalOccurrences,
        f.retainedEvidenceCount,
        f.pagesAffected,
      ]);
    }
  }

  if (hrRecords.length > 0) {
    const hr = wb.addWorksheet("Human Review");
    hr.addRow([
      "Check ID",
      "Check",
      "Definition version",
      "Category",
      "Scope",
      "Applicability",
      "Status",
      "Reviewed At",
      "Related Finding",
      "Evidence Type",
      "Notes",
    ]);
    hr.getRow(1).font = { bold: true };
    for (const r of hrRecords) {
      const evidenceTypes = r.evidenceReferences.map((e) => e.type).join("; ");
      hr.addRow([
        r.checkDefinitionId,
        sanitizeSpreadsheetCell(r.title),
        r.checkDefinitionVersion,
        r.category,
        r.applicableScope.kind,
        r.applicability,
        r.status,
        r.reviewedAt ?? "",
        sanitizeSpreadsheetCell(r.relatedFindingIds.join(", ")),
        sanitizeSpreadsheetCell(evidenceTypes),
        sanitizeSpreadsheetCell(r.notes ?? humanReviewResultWording(r.status)),
      ]);
    }
  }

  if (contributions.length > 0) {
    const cs = wb.addWorksheet("Contributions");
    cs.addRow([
      "Tool",
      "Provenance",
      "Scope",
      "Related finding",
      "Related rule",
      "Summary",
      "Included",
      "Timestamp",
    ]);
    cs.getRow(1).font = { bold: true };
    for (const c of contributions.filter((x) => x.includedInReport)) {
      cs.addRow([
        c.toolId,
        c.sourceType,
        c.scope.type,
        sanitizeSpreadsheetCell(c.relatedWebsiteFindingIds.join(", ")),
        sanitizeSpreadsheetCell(c.relatedRuleIds.join(", ")),
        sanitizeSpreadsheetCell(c.summary),
        c.includedInReport ? "yes" : "no",
        c.updatedAt,
      ]);
    }
  }

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
