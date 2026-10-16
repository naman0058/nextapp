import {
  buildPlatformChecklist,
  summarizePlatformReadiness,
} from "@/features/accessibility/utils/platform/buildPlatformChecklist";
import type { ReportSection } from "@/features/reports/types/reportModel";
import type { PreflightReportSourceSnapshot } from "@/features/reports/types/reportSource";
import { mapPlatformChecklistStatus } from "@/features/reports/types/reportStatus";
import {
  countFindings,
  deriveSectionStatus,
} from "@/features/reports/utils/sectionUtils";

const USER_CONFIRM_IDS = new Set([
  "platform-alt-added",
  "platform-final-review",
  "all-images-reviewed",
]);

export function buildPlatformSection(
  source: PreflightReportSourceSnapshot,
): ReportSection {
  if (!source.platform) {
    return {
      id: "platform-publishing",
      title: "Platform publishing readiness",
      sectionStatus: "Not Checked",
      findings: [
        {
          id: "platform-missing",
          section: "platform-publishing",
          title: "Platform context",
          status: "not_checked",
          sourceType: "human",
          finding: "Select a platform to generate publishing checklist items.",
        },
      ],
    };
  }

  const items = buildPlatformChecklist({
    platform: source.platform,
    caption: source.workingCaption,
    altText: source.altText,
    hasImage: source.hasImage,
    phase1: source.phase1,
    phase2: {
      aiStatus: source.aiStatus,
      hasAnalysis: Boolean(source.aiAnalysis),
    },
    phase3: source.contrastSnapshot,
    phase4: source.screenReaderPreview
      ? { experienceLevel: source.screenReaderPreview.experienceSummary.level }
      : null,
    userPublishingConfirmations: source.publishingConfirmations,
  });

  const readiness = summarizePlatformReadiness(items);
  const findings = items.map((item) => {
    const confirmed = USER_CONFIRM_IDS.has(item.id)
      ? Boolean(source.publishingConfirmations[item.id])
      : undefined;
    const prepared =
      item.status === "ready" && !confirmed && USER_CONFIRM_IDS.has(item.id)
        ? false
        : item.status === "ready";

    let finding = item.detail ?? item.label;
    if (USER_CONFIRM_IDS.has(item.id)) {
      finding = confirmed
        ? "User confirmed in this session."
        : prepared
          ? "Prepared by automated checks — user confirmation still required."
          : (item.detail ?? "Requires user confirmation before publishing.");
    }

    return {
      id: `platform-${item.id}`,
      section: "platform-publishing",
      title: item.label,
      status: mapPlatformChecklistStatus(item.status),
      sourceType: USER_CONFIRM_IDS.has(item.id)
        ? ("human" as const)
        : ("rule" as const),
      finding,
      userConfirmed: confirmed,
    };
  });

  const counts = countFindings(findings);
  return {
    id: "platform-publishing",
    title: "Platform publishing readiness",
    sectionStatus: deriveSectionStatus(findings),
    summaryLabel: readiness.label,
    counts,
    findings,
    notes: [
      `Ready: ${readiness.readyCount}, review: ${readiness.reviewCount}, not checked: ${readiness.notCheckedCount}, not applicable: ${readiness.notApplicableCount}.`,
    ],
  };
}
