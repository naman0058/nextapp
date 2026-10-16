import type { ReportFinding, ReportSection } from "@/features/reports/types/reportModel";
import type { PreflightReportSourceSnapshot } from "@/features/reports/types/reportSource";
import { SCREEN_READER_LIMITATION } from "@/features/reports/constants/limitations";
import {
  countFindings,
  deriveSectionStatus,
} from "@/features/reports/utils/sectionUtils";

export function buildScreenReaderSection(
  source: PreflightReportSourceSnapshot,
): ReportSection {
  if (!source.screenReaderEngaged || !source.screenReaderPreview) {
    return {
      id: "screen-reader-preview",
      title: "Screen reader experience preview",
      sectionStatus: "Not Checked",
      summaryLabel: "Preview not opened in this session",
      findings: [
        {
          id: "sr-not-run",
          section: "screen-reader-preview",
          title: "Screen reader preview",
          status: "not_checked",
          sourceType: "rule",
          finding:
            "Open the Screen Reader Experience panel to generate preview findings for this report.",
        },
      ],
      notes: [SCREEN_READER_LIMITATION],
    };
  }

  const preview = source.screenReaderPreview;
  const findings: ReportFinding[] = [];

  const level = preview.experienceSummary.level;
  const expStatus =
    level === "clear" || level === "mostly_clear"
      ? ("ready" as const)
      : level === "high_verbosity"
        ? ("attention" as const)
        : ("review" as const);

  findings.push({
    id: "sr-experience",
    section: "screen-reader-preview",
    title: "Listening experience summary",
    status: expStatus,
    sourceType: "rule",
    finding: preview.experienceSummary.label,
    recommendation: `${preview.experienceSummary.noiseSourceCount} potential noise source(s) identified in preview.`,
  });

  if (preview.noiseFindings.length > 0) {
    for (const [i, noise] of preview.noiseFindings.entries()) {
      findings.push({
        id: `sr-noise-${i}`,
        section: "screen-reader-preview",
        title: noise.title,
        status: noise.category === "duplication" ? "attention" : "review",
        sourceType: "rule",
        finding: noise.detail,
        recommendation: noise.recommendation,
      });
    }
  }

  if (preview.preflightReviewCount > 0) {
    findings.push({
      id: "sr-preflight-bridge",
      section: "screen-reader-preview",
      title: "Linked caption review items",
      status: "review",
      sourceType: "rule",
      finding: `${preview.preflightReviewCount} caption check(s) may affect listening order or noise.`,
    });
  }

  const counts = countFindings(findings);
  return {
    id: "screen-reader-preview",
    title: "Screen reader experience preview",
    sectionStatus: deriveSectionStatus(findings),
    counts,
    findings,
    notes: [
      SCREEN_READER_LIMITATION,
      "This is an approximation for accessibility review, not an exact screen reader simulation.",
    ],
  };
}
