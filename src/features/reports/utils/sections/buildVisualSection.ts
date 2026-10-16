import type { HumanReviewAnswer } from "@/features/accessibility/types/visualAccessibility";
import type { ReportFinding, ReportSection } from "@/features/reports/types/reportModel";
import type { PreflightReportSourceSnapshot } from "@/features/reports/types/reportSource";
import { CONTRAST_LIMITATION } from "@/features/reports/constants/limitations";
import {
  countFindings,
  deriveSectionStatus,
} from "@/features/reports/utils/sectionUtils";

import type { VisualChecklistState } from "@/features/accessibility/types/visualAccessibility";

const CHECKLIST_LABELS: Record<keyof VisualChecklistState, string> = {
  colorOnlyMeaning: "Meaning not conveyed by color alone",
  textOverComplexBackground: "Text readable over complex backgrounds",
  importantSmallText: "Important small text is legible",
  textOnlyInGraphic: "Text-only information in graphics addressed",
  understandableWithoutColor: "Content understandable without color cues",
};

function mapHumanAnswer(answer: HumanReviewAnswer): {
  status: "ready" | "attention" | "review" | "not_checked";
  label: string;
} {
  if (answer === "yes") return { status: "ready", label: "Yes" };
  if (answer === "no") return { status: "attention", label: "No" };
  if (answer === "not_sure") return { status: "review", label: "Not sure" };
  return { status: "not_checked", label: "Not reviewed" };
}

export function buildVisualSection(
  source: PreflightReportSourceSnapshot,
): ReportSection {
  if (!source.hasImage) {
    return {
      id: "visual-accessibility",
      title: "Visual accessibility",
      sectionStatus: "Not Applicable",
      findings: [],
      summaryLabel: "No image to measure",
    };
  }

  const session = source.visualSession;
  const measured =
    session?.measured ??
    source.contrastSnapshot.measured;

  const findings: ReportFinding[] = [];

  if (!measured) {
    findings.push({
      id: "contrast-not-measured",
      section: "visual-accessibility",
      title: "Contrast measurement",
      status: "not_checked" as const,
      sourceType: "measurement" as const,
      finding:
        "Contrast was not measured in the Visual Accessibility panel for this draft.",
    });
  } else if (session?.evaluation) {
    const ev = session.evaluation;
    const contrastStatus =
      ev.primaryVerdict === "pass"
        ? ("ready" as const)
        : ev.primaryVerdict === "fail"
          ? ("attention" as const)
          : ("review" as const);
    findings.push({
      id: "contrast-measured",
      section: "visual-accessibility",
      title: "Contrast measurement",
      status: contrastStatus,
      sourceType: "measurement",
      finding: `${ev.primaryLabel}: ratio ${ev.displayRatio} (required ${ev.requiredRatio}:1).`,
      recommendation:
        contrastStatus === "ready"
          ? undefined
          : "Adjust foreground/background colors or verify samples represent final design.",
    });
    if (session.foregroundHex && session.backgroundHex) {
      findings.push({
        id: "contrast-colors",
        section: "visual-accessibility",
        title: "Sampled colors",
        status: "ready",
        sourceType: "measurement",
        finding: `Foreground ${session.foregroundHex}, background ${session.backgroundHex}, text type ${session.textType ?? "normal"}.`,
      });
    }
  } else if (source.contrastSnapshot.measured) {
    const verdict = source.contrastSnapshot.primaryVerdict;
    findings.push({
      id: "contrast-summary",
      section: "visual-accessibility",
      title: "Contrast measurement",
      status:
        verdict === "pass"
          ? "ready"
          : verdict === "fail"
            ? "attention"
            : "review",
      sourceType: "measurement",
      finding: "Contrast was measured; open Visual Accessibility for full ratio details.",
    });
  }

  const checklist = session?.checklist;
  if (checklist) {
    for (const key of Object.keys(CHECKLIST_LABELS) as Array<
      keyof typeof CHECKLIST_LABELS
    >) {
      const mapped = mapHumanAnswer(checklist[key]);
      findings.push({
        id: `visual-check-${key}`,
        section: "visual-accessibility",
        title: CHECKLIST_LABELS[key],
        status: mapped.status,
        sourceType: "human",
        finding: `Reviewer answer: ${mapped.label}.`,
      });
    }
  }

  const counts = countFindings(findings);
  return {
    id: "visual-accessibility",
    title: "Visual accessibility",
    sectionStatus: deriveSectionStatus(findings),
    counts,
    findings,
    notes: [CONTRAST_LIMITATION],
  };
}
