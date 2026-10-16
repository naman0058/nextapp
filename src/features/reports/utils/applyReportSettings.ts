import type {
  AccessibilityPreflightReport,
  ReportSection,
} from "@/features/reports/types/reportModel";
import type { ReportSettings } from "@/features/reports/types/reportSettings";

function stripAiFindings(section: ReportSection | undefined): ReportSection | undefined {
  if (!section) return section;
  return {
    ...section,
    findings: section.findings.filter((f) => f.sourceType !== "ai"),
    notes: section.notes?.filter((n) => !n.toLowerCase().includes("ai")),
  };
}

function filterDetailedFindings(
  section: ReportSection | undefined,
  includeDetailed: boolean,
): ReportSection | undefined {
  if (!section || includeDetailed) return section;
  return {
    ...section,
    findings: section.findings.slice(0, 8),
  };
}

export function applyReportSettings(
  report: AccessibilityPreflightReport,
  settings: ReportSettings,
): AccessibilityPreflightReport {
  const clone: AccessibilityPreflightReport = {
    ...report,
    projectInfo: { ...report.projectInfo },
    summary: { ...report.summary, sectionSummaries: [...report.summary.sectionSummaries] },
    humanReview: settings.includeHumanReviewChecklist
      ? { ...report.humanReview, items: [...report.humanReview.items] }
      : { items: [], remainingCount: 0 },
    methodology: settings.includeMethodology
      ? report.methodology
      : { version: report.methodology.version, categories: [] },
    limitations: [...report.limitations],
  };

  if (!settings.includeContentText) {
    delete clone.finalWorkingCaption;
  }
  if (!settings.includeAltText) {
    delete clone.altText;
  }
  if (!settings.includeImageThumbnail) {
    delete clone.imageThumbnailDataUrl;
  }
  if (!settings.includeFullVideoTranscript) {
    delete clone.fullTranscript;
  }
  if (!settings.includeInternalNotes) {
    clone.projectInfo = { ...clone.projectInfo, internalNotes: undefined };
  }

  let imageAccessibility = clone.imageAccessibility;
  if (!settings.includeAiFindings) {
    imageAccessibility = stripAiFindings(imageAccessibility);
  }
  let videoAccessibility = clone.videoAccessibility;
  if (!settings.includeAiFindings) {
    videoAccessibility = stripAiFindings(videoAccessibility);
  }

  if (!settings.includeDetailedFindings) {
    clone.textAccessibility = filterDetailedFindings(
      clone.textAccessibility,
      false,
    );
    clone.imageAccessibility = filterDetailedFindings(imageAccessibility, false);
    clone.visualAccessibility = filterDetailedFindings(
      clone.visualAccessibility,
      false,
    );
    clone.screenReaderPreview = filterDetailedFindings(
      clone.screenReaderPreview,
      false,
    );
    clone.videoAccessibility = filterDetailedFindings(
      videoAccessibility,
      false,
    );
    clone.platformPublishing = filterDetailedFindings(
      clone.platformPublishing,
      false,
    );
  } else {
    clone.imageAccessibility = imageAccessibility;
    clone.videoAccessibility = videoAccessibility;
  }

  if (!settings.includeAiRemediationAppendix) {
    delete clone.aiRemediationAppendix;
    delete clone.aiRemediationIncludedSummary;
    clone.limitations = clone.limitations.filter(
      (line) => !line.startsWith("AI-assisted remediation included for"),
    );
  }

  if (!settings.includeTechnicalDetails) {
    const stripTechnical = (section: ReportSection | undefined) => {
      if (!section) return section;
      return {
        ...section,
        findings: section.findings.map((finding) => {
          const { technicalId, ...rest } = finding;
          void technicalId;
          return rest;
        }),
      };
    };
    clone.textAccessibility = stripTechnical(clone.textAccessibility);
    clone.imageAccessibility = stripTechnical(clone.imageAccessibility);
  }

  return clone;
}
