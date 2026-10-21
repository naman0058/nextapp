import type { ContrastEvaluation } from "@/features/accessibility/types/visualAccessibility";
import type {
  ReportContribution,
  ToolHandoffContext,
} from "@/features/accessibility-workspace/types";
import { getDeterministicRemediation } from "@/features/website-scanner/remediation/registry";
import { contrastContributionId } from "@/features/accessibility-workspace/contributionIds";

export function buildContrastMeasurementContribution(input: {
  handoff: ToolHandoffContext;
  evaluation: ContrastEvaluation;
  foregroundHex: string;
  backgroundHex: string;
  textType: string;
  includedInReport: boolean;
}): ReportContribution {
  const { handoff, evaluation } = input;
  const now = new Date().toISOString();
  const def = getDeterministicRemediation(handoff.ruleId);
  const scopeLabel =
    handoff.scannerTotalOccurrences && handoff.scannerTotalOccurrences > 1
      ? `This measurement applies to one color pair you tested — not all ${handoff.scannerTotalOccurrences} scanner occurrences.`
      : "Single color-pair measurement from Contrast Checker.";

  return {
    contributionId: contrastContributionId(
      handoff.returnTo.findingId,
      input.foregroundHex,
      input.backgroundHex,
    ),
    toolId: "contrast_checker",
    toolVersion: "1",
    createdAt: now,
    updatedAt: now,
    sourceType: "measured_tool",
    scope: {
      type: "single_occurrence",
      pageUrl: handoff.pageOrigin,
      viewportId: handoff.viewportId,
      selector: handoff.sanitizedSelector,
      occurrenceLabel: scopeLabel,
    },
    title: "Contrast measurement (Contrast Checker)",
    summary: `Measured ${evaluation.displayRatio}:1 (${evaluation.primaryLabel}). ${scopeLabel}`,
    findings: [
      {
        id: "contrast-measurement",
        title: "User/tool contrast measurement",
        summary: evaluation.primaryLabel,
        provenance: "measured_tool",
      },
    ],
    measurements: [
      {
        name: "contrast_ratio",
        value: evaluation.ratio,
        unit: ":1",
        threshold: evaluation.requiredRatio,
        passed: evaluation.primaryVerdict === "pass",
      },
      {
        name: "foreground",
        value: input.foregroundHex,
      },
      {
        name: "background",
        value: input.backgroundHex,
      },
      {
        name: "text_type",
        value: input.textType,
      },
    ],
    evidence: [],
    remediationActions: [],
    humanReviewTasks: [],
    verificationResults: [
      {
        kind: "measured",
        label:
          evaluation.primaryVerdict === "pass"
            ? "Measured ratio meets selected threshold"
            : "Measured ratio below selected threshold",
        detail: `Required (AA): ${evaluation.requiredRatio}:1`,
      },
    ],
    relatedWebsiteFindingIds: [handoff.returnTo.findingId],
    relatedRuleIds: [handoff.ruleId],
    relatedRemediationGroupIds: handoff.returnTo.remediationGroupId
      ? [handoff.returnTo.remediationGroupId]
      : [],
    includedInReport: input.includedInReport,
    exportEligibility: "allowed",
    privacyClassification: "sanitized_export",
    remediationDefinitionId: def?.ruleId,
    remediationDefinitionVersion: def?.definitionVersion,
  };
}

export function summarizeContributionSummaryCounts(
  contributions: ReportContribution[],
): import("@/features/accessibility-workspace/types").WorkspaceContributionSummary {
  const included = contributions.filter((c) => c.includedInReport);
  return {
    contrastMeasurements: included.filter((c) => c.toolId === "contrast_checker")
      .length,
    imageAltReviews: included.filter((c) => c.toolId === "image_alt_checker")
      .length,
    visualLocatorEvidence: included.filter(
      (c) => c.toolId === "visual_issue_locator",
    ).length,
    developerHandoffs: included.filter((c) => c.toolId === "developer_ticket")
      .length,
    aiAssistedSuggestions: included.filter(
      (c) => c.toolId === "ai_assisted_remediation",
    ).length,
    screenReaderObservations: included.filter(
      (c) => c.toolId === "screen_reader_preview",
    ).length,
    humanReviewCompleted: 0,
    humanReviewTotal: 0,
  };
}

export function buildReportWorkspaceBlock(
  contributions: ReportContribution[],
  humanReviewCompleted: number,
  humanReviewTotal: number,
): import("@/features/accessibility-workspace/types").ReportWorkspaceBlock {
  const summary = summarizeContributionSummaryCounts(contributions);
  summary.humanReviewCompleted = humanReviewCompleted;
  summary.humanReviewTotal = humanReviewTotal;

  const byTool = new Map<string, { count: number; included: number }>();
  for (const c of contributions) {
    const row = byTool.get(c.toolId) ?? { count: 0, included: 0 };
    row.count += 1;
    if (c.includedInReport) row.included += 1;
    byTool.set(c.toolId, row);
  }

  const parts: string[] = [];
  if (summary.contrastMeasurements)
    parts.push(`${summary.contrastMeasurements} contrast measurement(s)`);
  if (summary.developerHandoffs)
    parts.push(`${summary.developerHandoffs} developer handoff(s)`);
  if (summary.visualLocatorEvidence)
    parts.push(`${summary.visualLocatorEvidence} visual evidence reference(s)`);
  if (summary.imageAltReviews)
    parts.push(`${summary.imageAltReviews} image/alt review(s)`);

  return {
    workspaceSummary:
      parts.length > 0
        ? `Additional review evidence: ${parts.join("; ")}.`
        : "Website scan only; no optional cross-tool contributions selected.",
    contributions: contributions.filter((c) => c.includedInReport),
    contributionSummary: summary,
    toolCoverage: [...byTool.entries()].map(([toolId, v]) => ({
      toolId: toolId as import("@/features/accessibility-workspace/types").WorkspaceToolId,
      count: v.count,
      included: v.included,
    })),
  };
}
