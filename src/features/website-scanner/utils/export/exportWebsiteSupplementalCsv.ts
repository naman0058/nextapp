import Papa from "papaparse";
import { sanitizeCsvCellForSpreadsheet } from "@/features/batch/utils/export/sanitizeCsvCellForSpreadsheet";
import type { SiteScanIntelligence } from "@/features/accessibility-intelligence/types/siteIntelligence";
import type { WebsiteScanSessionState } from "@/features/website-scanner/types/websiteSession";
import { sanitizeExportUrl } from "@/features/website-scanner/utils/export/sanitizeExportUrl";
import { collectPageScanResults } from "@/features/website-scanner/utils/collectPageScanResults";

function downloadCsv(filename: string, rows: Record<string, string>[]) {
  const csv = Papa.unparse(rows);
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportWebsitePageInventoryCsv(session: WebsiteScanSessionState): void {
  const prefs = session.exportPreferences;
  const rows: Record<string, string>[] = [];
  for (const p of session.pages.filter((x) => x.status === "complete")) {
    const primary = p.desktopResult ?? p.mobileResult ?? p.result;
    const results = collectPageScanResults([p]);
    const issues = results.reduce(
      (n, r) => n + r.violations.filter((v) => !v.isBestPractice).length,
      0,
    );
    rows.push({
      url: sanitizeCsvCellForSpreadsheet(
        sanitizeExportUrl(primary?.finalUrl ?? p.url, prefs.includeQueryStringsInExports),
      ),
      title: sanitizeCsvCellForSpreadsheet(primary?.pageTitle ?? ""),
      viewports: p.desktopResult && p.mobileResult ? "desktop; mobile" : primary?.viewport.label ?? "",
      completeness: primary?.scanCompleteness ?? "complete",
      unique_rules: String(issues),
    });
  }
  downloadCsv("accessibility-page-inventory.csv", rows);
}

export function exportWebsiteRootCausesCsv(
  intel: SiteScanIntelligence | null | undefined,
): void {
  if (!intel?.rootCauseGroups.length) {
    downloadCsv("accessibility-root-causes.csv", []);
    return;
  }
  const rows = intel.rootCauseGroups.map((g) => ({
    label: sanitizeCsvCellForSpreadsheet(g.label),
    rule_id: sanitizeCsvCellForSpreadsheet(g.ruleId),
    pages_affected: String(g.affectedPages.length),
    occurrences: String(g.totalOccurrences),
    shared_component: g.likelySharedComponent ? "yes" : "no",
  }));
  downloadCsv("accessibility-root-causes.csv", rows);
}
