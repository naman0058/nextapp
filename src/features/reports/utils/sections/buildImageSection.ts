import type { ReportFinding, ReportSection } from "@/features/reports/types/reportModel";
import type { PreflightReportSourceSnapshot } from "@/features/reports/types/reportSource";
import { mapPreflightStatus } from "@/features/reports/types/reportStatus";
import { CHECK_IDS } from "@/features/accessibility/constants/checkIds";
import {
  countFindings,
  deriveSectionStatus,
} from "@/features/reports/utils/sectionUtils";

function altChecksFromPhase1(
  source: PreflightReportSourceSnapshot,
  includeTechnicalDetails: boolean,
): ReportFinding[] {
  if (!source.phase1 || !source.hasImage) return [];
  const altRelated = source.phase1.checks.filter(
    (c) =>
      c.id === CHECK_IDS.ALT_TEXT_PRESENCE ||
      c.id === CHECK_IDS.ALT_TEXT_PREFIX ||
      c.id === CHECK_IDS.ALT_TEXT_LENGTH ||
      c.id === CHECK_IDS.ALT_TEXT_FILENAME ||
      c.id === CHECK_IDS.DUPLICATE_CAPTION_ALT,
  );
  return altRelated.map((check) => ({
    id: `image-phase1-${check.id}`,
    section: "image-accessibility",
    title: check.title,
    status: mapPreflightStatus(check.status),
    sourceType: "rule" as const,
    finding: check.summary,
    recommendation: check.recommendation,
    technicalId: includeTechnicalDetails ? check.id : undefined,
  }));
}

export function buildImageSection(
  source: PreflightReportSourceSnapshot,
  includeTechnicalDetails: boolean,
): ReportSection {
  if (!source.hasImage) {
    return {
      id: "image-accessibility",
      title: "Image accessibility",
      sectionStatus: "Not Applicable",
      summaryLabel: "No image in this draft",
      findings: [],
    };
  }

  const findings: ReportFinding[] = [
    ...altChecksFromPhase1(source, includeTechnicalDetails),
  ];

  if (source.aiStatus === "idle" || source.aiStatus === "loading") {
    findings.push({
      id: "ai-not-run",
      section: "image-accessibility",
      title: "AI-assisted image review",
      status: "not_checked",
      sourceType: "ai",
      finding: "Optional AI image review was not run for this draft.",
    });
  } else if (source.aiStatus === "error") {
    findings.push({
      id: "ai-error",
      section: "image-accessibility",
      title: "AI-assisted image review",
      status: "error",
      sourceType: "ai",
      finding:
        source.aiError ??
        "AI image review is unavailable. Rule-based alt checks still apply.",
    });
  } else if (source.aiAnalysis) {
    const ai = source.aiAnalysis;
    findings.push({
      id: "ai-purpose",
      section: "image-accessibility",
      title: "Image purpose (AI-assisted)",
      status: "review",
      sourceType: "ai",
      finding: `Suggested purpose: ${ai.imagePurpose.replace(/_/g, " ")}.`,
      recommendation: ai.altTextRationale,
    });
    if (ai.humanReview.required) {
      for (const [i, reason] of ai.humanReview.reasons.entries()) {
        findings.push({
          id: `ai-human-${i}`,
          section: "image-accessibility",
          title: "Human review suggested (AI-assisted)",
          status: "human_review",
          sourceType: "ai",
          finding: reason,
        });
      }
    }
    if (ai.userAltTextReview.provided) {
      const status =
        ai.userAltTextReview.status === "good"
          ? ("ready" as const)
          : ai.userAltTextReview.status === "possibly_inaccurate"
            ? ("attention" as const)
            : ("review" as const);
      findings.push({
        id: "ai-alt-review",
        section: "image-accessibility",
        title: "Alt text quality (AI-assisted)",
        status,
        sourceType: "ai",
        finding: `AI review status: ${ai.userAltTextReview.status.replace(/_/g, " ")}.`,
        recommendation:
          ai.userAltTextReview.improvedAltText ??
          ai.userAltTextReview.issues.join(" "),
      });
    }
    if (ai.captionCoverage.status !== "covered") {
      findings.push({
        id: "ai-caption-coverage",
        section: "image-accessibility",
        title: "Caption coverage of image content (AI-assisted)",
        status:
          ai.captionCoverage.status === "not_covered" ? "attention" : "review",
        sourceType: "ai",
        finding: `Coverage: ${ai.captionCoverage.status.replace(/_/g, " ")}.`,
        recommendation: ai.captionCoverage.missingInformation.join("; "),
      });
    }
    if (ai.visibleText.length > 0) {
      findings.push({
        id: "ai-visible-text",
        section: "image-accessibility",
        title: "Visible text in image (AI-assisted)",
        status: "human_review",
        sourceType: "ai",
        finding: `Detected visible text: ${ai.visibleText.join("; ")}`,
        recommendation: "Confirm all visible text is represented in caption or alt text.",
      });
    }
  }

  const counts = countFindings(findings);
  return {
    id: "image-accessibility",
    title: "Image accessibility",
    sectionStatus: deriveSectionStatus(findings, {
      emptyMeans: "not_checked",
    }),
    counts,
    findings,
    notes: source.aiAnalysis?.limitations?.length
      ? [...source.aiAnalysis.limitations]
      : undefined,
  };
}
