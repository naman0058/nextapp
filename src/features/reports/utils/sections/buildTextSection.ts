import type { ReportSection } from "@/features/reports/types/reportModel";
import type { PreflightReportSourceSnapshot } from "@/features/reports/types/reportSource";
import { mapPreflightStatus } from "@/features/reports/types/reportStatus";
import {
  countFindings,
  deriveSectionStatus,
} from "@/features/reports/utils/sectionUtils";

export function buildTextSection(
  source: PreflightReportSourceSnapshot,
  includeTechnicalDetails: boolean,
): ReportSection {
  const findings = [];
  if (!source.phase1) {
    return {
      id: "text-accessibility",
      title: "Text accessibility",
      sectionStatus: "Not Checked",
      summaryLabel: "Caption checks not run",
      findings: [
        {
          id: "text-not-run",
          section: "text-accessibility",
          title: "Caption preflight",
          status: "not_checked",
          sourceType: "rule",
          finding: "Run caption preflight to evaluate text accessibility checks.",
        },
      ],
    };
  }

  for (const check of source.phase1.checks) {
    findings.push({
      id: `text-${check.id}`,
      section: "text-accessibility",
      title: check.title,
      status: mapPreflightStatus(check.status),
      sourceType: "rule" as const,
      finding: check.summary,
      recommendation: check.recommendation,
      technicalId: includeTechnicalDetails ? check.id : undefined,
    });
  }

  const counts = countFindings(findings);
  return {
    id: "text-accessibility",
    title: "Text accessibility",
    sectionStatus: deriveSectionStatus(findings),
    summaryLabel: source.phase1.scoreBandLabel,
    counts,
    findings,
    notes: [
      `Rule-based readiness score: ${source.phase1.score} (${source.phase1.scoreBandLabel}).`,
    ],
  };
}
