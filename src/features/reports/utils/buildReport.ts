import {
  APPLICATION_NAME,
  REPORT_VERSION,
} from "@/features/reports/constants/reportVersion";
import { REPORT_DISCLAIMER } from "@/features/reports/constants/disclaimer";
import {
  BASE_REPORT_LIMITATIONS,
  CONTRAST_LIMITATION,
  SCREEN_READER_LIMITATION,
  VIDEO_FRAME_LIMITATION,
  VIDEO_TRANSCRIPT_LIMITATION,
} from "@/features/reports/constants/limitations";
import { REPORT_METHODOLOGY } from "@/features/reports/constants/methodology";
import type {
  AccessibilityPreflightReport,
  ReportProjectInfo,
} from "@/features/reports/types/reportModel";
import type { ReportSettings } from "@/features/reports/types/reportSettings";
import type { PreflightReportSourceSnapshot } from "@/features/reports/types/reportSource";
import { aggregateHumanReview } from "@/features/reports/utils/aggregateHumanReview";
import { detectReportContentType } from "@/features/reports/utils/detectContentType";
import {
  buildReportSummaryCounts,
  deriveOverallStatus,
} from "@/features/reports/utils/deriveOverallStatus";
import { buildImageSection } from "@/features/reports/utils/sections/buildImageSection";
import { buildPlatformSection } from "@/features/reports/utils/sections/buildPlatformSection";
import { buildScreenReaderSection } from "@/features/reports/utils/sections/buildScreenReaderSection";
import { buildTextSection } from "@/features/reports/utils/sections/buildTextSection";
import { buildVideoSection } from "@/features/reports/utils/sections/buildVideoSection";
import { buildVisualSection } from "@/features/reports/utils/sections/buildVisualSection";
import { sectionTone } from "@/features/reports/utils/sectionUtils";
import { generatePlainTranscript } from "@/features/video/utils/captions/generatePlainTranscript";
import { attachAiRemediationAppendix } from "@/features/reports/utils/attachAiRemediationAppendix";
import { collectAllFromReportSource } from "@/lib/ai/remediation/report";
import type { AiRemediationSelectionInput } from "@/lib/ai/remediation/report";

function createReportId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return `rpt-${crypto.randomUUID()}`;
  }
  return `rpt-${Date.now().toString(36)}`;
}

function formatGeneratedDisplay(iso: string): string {
  try {
    return new Intl.DateTimeFormat(undefined, {
      dateStyle: "medium",
      timeStyle: "short",
    }).format(new Date(iso));
  } catch {
    return iso;
  }
}

function buildLimitations(source: PreflightReportSourceSnapshot): string[] {
  const list: string[] = [...BASE_REPORT_LIMITATIONS];
  if (source.hasImage) list.push(CONTRAST_LIMITATION);
  if (source.screenReaderEngaged) list.push(SCREEN_READER_LIMITATION);
  if (source.video) {
    list.push(VIDEO_TRANSCRIPT_LIMITATION, VIDEO_FRAME_LIMITATION);
  }
  return list;
}

export function buildAccessibilityPreflightReport(
  source: PreflightReportSourceSnapshot,
  projectInfo: ReportProjectInfo,
  settings: ReportSettings,
  extras?: {
    imageThumbnailDataUrl?: string | null;
    aiRemediationSelection?: AiRemediationSelectionInput;
    sampleLabel?: string;
  },
): AccessibilityPreflightReport {
  const generatedAt = new Date().toISOString();
  const contentType = detectReportContentType(source);

  const textAccessibility = buildTextSection(
    source,
    settings.includeTechnicalDetails,
  );
  const imageAccessibility = buildImageSection(
    source,
    settings.includeTechnicalDetails,
  );
  const visualAccessibility = buildVisualSection(source);
  const screenReaderPreview = buildScreenReaderSection(source);
  const videoAccessibility =
    contentType === "video_post" || source.video
      ? buildVideoSection(source)
      : undefined;
  const platformPublishing = buildPlatformSection(source);

  const partial = {
    textAccessibility,
    imageAccessibility,
    visualAccessibility,
    screenReaderPreview,
    videoAccessibility,
    platformPublishing,
  };

  const humanReview = aggregateHumanReview(partial);

  const reportWithoutSummary: AccessibilityPreflightReport = {
    reportId: createReportId(),
    generatedAt,
    generatedAtDisplay: formatGeneratedDisplay(generatedAt),
    reportVersion: REPORT_VERSION,
    contentType,
    platform: source.platform,
    projectInfo,
    summary: {
      overallStatus: "Incomplete Preflight",
      platform: source.platform,
      contentType,
      checksCompleted: 0,
      itemsReady: 0,
      itemsRequiringReview: 0,
      importantIssues: 0,
      humanReviewRemaining: humanReview.remainingCount,
      ruleBasedReadinessScore: source.phase1?.score,
      ruleBasedReadinessBand: source.phase1?.scoreBandLabel,
      sectionSummaries: [],
    },
    ...partial,
    humanReview,
    methodology: settings.includeMethodology
      ? REPORT_METHODOLOGY
      : { version: REPORT_METHODOLOGY.version, categories: [] },
    limitations: buildLimitations(source),
    disclaimer: REPORT_DISCLAIMER,
    finalWorkingCaption: source.workingCaption,
    altText: source.altText,
    fullTranscript:
      source.video && source.video.cues.length > 0
        ? generatePlainTranscript(source.video.cues)
        : undefined,
    imageThumbnailDataUrl: extras?.imageThumbnailDataUrl ?? undefined,
  };

  const counts = buildReportSummaryCounts(reportWithoutSummary);
  const overallStatus = deriveOverallStatus(reportWithoutSummary, source);
  const sectionSummaries = [
    textAccessibility,
    imageAccessibility,
    visualAccessibility,
    screenReaderPreview,
    videoAccessibility,
    platformPublishing,
  ]
    .filter(Boolean)
    .map((s) => ({
      id: s!.id,
      label: s!.summaryLabel ?? s!.sectionStatus,
      tone: sectionTone(s!.sectionStatus),
    }));

  reportWithoutSummary.summary = {
    ...reportWithoutSummary.summary,
    ...counts,
    overallStatus,
    sectionSummaries,
  };

  const aiSelection: AiRemediationSelectionInput =
    extras?.aiRemediationSelection ?? {
      includeAppendix: false,
      selectedIds: [],
      allowStaleWhenSelected: true,
      sampleLabel: extras?.sampleLabel,
    };
  if (!settings.includeAiRemediationAppendix) {
    aiSelection.includeAppendix = false;
  }

  return attachAiRemediationAppendix(
    reportWithoutSummary,
    collectAllFromReportSource(source),
    aiSelection,
  );
}

export function reportDocumentTitle(report: AccessibilityPreflightReport): string {
  const title =
    report.projectInfo.reportTitle?.trim() ||
    `${APPLICATION_NAME} Preflight Report`;
  return title;
}
