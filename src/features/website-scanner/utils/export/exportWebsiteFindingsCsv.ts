import Papa from "papaparse";
import { sanitizeCsvCellForSpreadsheet } from "@/features/batch/utils/export/sanitizeCsvCellForSpreadsheet";
import type { SiteScanIntelligence } from "@/features/accessibility-intelligence/types/siteIntelligence";
import type { WebsitePageScanResult } from "@/features/website-scanner/types/scanTypes";

export function exportWebsiteFindingsCsv(
  pages: WebsitePageScanResult[],
  siteIntelligence?: SiteScanIntelligence | null,
  downloadFilename = "website-accessibility-findings.csv",
): void {
  const priorityByKey = new Map<string, string>();
  const rootByKey = new Map<string, string>();
  if (siteIntelligence) {
    for (const f of siteIntelligence.normalizedFindings) {
      const key = `${f.pageUrl ?? ""}::${f.viewportId ?? ""}::${f.ruleId ?? ""}`;
      priorityByKey.set(key, f.priority);
      if (f.rootCauseGroupId) rootByKey.set(key, f.rootCauseGroupId);
    }
  }
  const rows: Record<string, string>[] = [];

  for (const page of pages) {
    for (const v of page.violations) {
      for (const node of v.nodes) {
        const rowKey = `${page.finalUrl}::${page.viewport.id}::${v.id}`;
        rows.push({
          page_url: sanitizeCsvCellForSpreadsheet(page.finalUrl),
          viewport: sanitizeCsvCellForSpreadsheet(page.viewport.label),
          rule_id: sanitizeCsvCellForSpreadsheet(v.id),
          impact: sanitizeCsvCellForSpreadsheet(v.impact),
          priority: sanitizeCsvCellForSpreadsheet(
            priorityByKey.get(rowKey) ?? "",
          ),
          level: sanitizeCsvCellForSpreadsheet(v.level),
          wcag_criteria: sanitizeCsvCellForSpreadsheet(v.wcagCriteria.join("; ")),
          issue: sanitizeCsvCellForSpreadsheet(v.help),
          occurrences: String(v.totalNodeCount),
          pages_affected: String(
            siteIntelligence?.ruleAggregates.find((r) => r.ruleId === v.id)
              ?.affectedPageCount ?? 1,
          ),
          root_cause_group: sanitizeCsvCellForSpreadsheet(
            rootByKey.get(rowKey) ?? "",
          ),
          source_type: "axe",
          human_review_required: "false",
          selector: sanitizeCsvCellForSpreadsheet(node.selectorLabel),
          failure_summary: sanitizeCsvCellForSpreadsheet(
            node.failureSummary ?? "",
          ),
          status: v.isBestPractice ? "best_practice" : "violation",
        });
      }
      if (v.nodes.length === 0) {
        rows.push({
          page_url: sanitizeCsvCellForSpreadsheet(page.finalUrl),
          rule_id: sanitizeCsvCellForSpreadsheet(v.id),
          impact: sanitizeCsvCellForSpreadsheet(v.impact),
          level: sanitizeCsvCellForSpreadsheet(v.level),
          wcag_criteria: sanitizeCsvCellForSpreadsheet(v.wcagCriteria.join("; ")),
          issue: sanitizeCsvCellForSpreadsheet(v.help),
          affected_elements: String(v.totalNodeCount),
          selector: "",
          failure_summary: "",
          status: v.isBestPractice ? "best_practice" : "violation",
        });
      }
    }
    for (const inc of page.incomplete) {
      rows.push({
        page_url: sanitizeCsvCellForSpreadsheet(page.finalUrl),
        rule_id: sanitizeCsvCellForSpreadsheet(inc.id),
        impact: sanitizeCsvCellForSpreadsheet(inc.impact),
        level: sanitizeCsvCellForSpreadsheet(inc.level),
        wcag_criteria: sanitizeCsvCellForSpreadsheet(inc.wcagCriteria.join("; ")),
        issue: sanitizeCsvCellForSpreadsheet(inc.help),
        affected_elements: String(inc.totalNodeCount),
        selector: "",
        failure_summary: "",
        status: "human_review",
      });
    }
  }

  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = downloadFilename;
  a.click();
  URL.revokeObjectURL(url);
}
