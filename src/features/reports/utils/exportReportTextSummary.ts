import type { AccessibilityPreflightReport } from "@/features/reports/types/reportModel";
import { reportStatusLabel } from "@/features/reports/types/reportStatus";
import { APPLICATION_NAME } from "@/features/reports/constants/reportVersion";

export function buildReportTextSummary(
  report: AccessibilityPreflightReport,
): string {
  const lines: string[] = [];
  lines.push(`${APPLICATION_NAME} — Preflight Report Summary`);
  lines.push(`Report ID: ${report.reportId}`);
  lines.push(`Generated: ${report.generatedAtDisplay}`);
  lines.push(`Overall: ${report.summary.overallStatus}`);
  if (report.platform) lines.push(`Platform: ${report.platform}`);
  lines.push(`Content type: ${report.contentType}`);
  lines.push("");
  lines.push(
    `Checks completed: ${report.summary.checksCompleted}; ready: ${report.summary.itemsReady}; review: ${report.summary.itemsRequiringReview}; important: ${report.summary.importantIssues}`,
  );
  if (report.summary.ruleBasedReadinessScore != null) {
    lines.push(
      `Rule-based score: ${report.summary.ruleBasedReadinessScore} (${report.summary.ruleBasedReadinessBand ?? "n/a"})`,
    );
  }
  lines.push("");
  const sections = [
    report.textAccessibility,
    report.imageAccessibility,
    report.visualAccessibility,
    report.screenReaderPreview,
    report.videoAccessibility,
    report.platformPublishing,
  ].filter(Boolean);
  for (const section of sections) {
    lines.push(`## ${section!.title} — ${section!.sectionStatus}`);
    for (const f of section!.findings.slice(0, 15)) {
      lines.push(
        `- ${f.title}: ${reportStatusLabel(f.status)} — ${f.finding}`,
      );
    }
    lines.push("");
  }
  if (report.humanReview.items.length > 0) {
    lines.push("## Human review tasks");
    for (const item of report.humanReview.items.slice(0, 20)) {
      lines.push(`- [${item.priority}] ${item.title}: ${item.detail}`);
    }
    lines.push("");
  }
  lines.push(report.disclaimer);
  return lines.join("\n");
}

export function downloadReportTextSummary(
  report: AccessibilityPreflightReport,
  filename: string,
): void {
  const blob = new Blob([buildReportTextSummary(report)], {
    type: "text/plain;charset=utf-8",
  });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export async function copyReportTextSummary(
  report: AccessibilityPreflightReport,
): Promise<void> {
  await navigator.clipboard.writeText(buildReportTextSummary(report));
}
