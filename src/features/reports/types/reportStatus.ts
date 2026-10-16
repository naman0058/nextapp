import type { PreflightStatus } from "@/types";
import type { AiStatus } from "@/features/accessibility/components/checker/checkerReducer";
import type { PlatformChecklistItemStatus } from "@/features/accessibility/config/platformAccessibility/types";

export type ReportStatus =
  | "ready"
  | "review"
  | "attention"
  | "not_checked"
  | "not_applicable"
  | "human_review"
  | "error";

export type ReportSourceType =
  | "rule"
  | "measurement"
  | "ai"
  | "human"
  | "automated_rule"
  | "manual_review"
  | "ai_guidance";

export type ReportPriority = "high" | "medium" | "low";

export type OverallReportStatus =
  | "Ready for Final Review"
  | "Review Recommended"
  | "Important Issues Identified"
  | "Incomplete Preflight";

export function mapPreflightStatus(status: PreflightStatus): ReportStatus {
  switch (status) {
    case "pass":
      return "ready";
    case "review":
      return "review";
    case "fail":
      return "attention";
    default:
      return "not_checked";
  }
}

export function mapPlatformChecklistStatus(
  status: PlatformChecklistItemStatus,
): ReportStatus {
  switch (status) {
    case "ready":
      return "ready";
    case "review":
      return "review";
    case "not_applicable":
      return "not_applicable";
    default:
      return "not_checked";
  }
}

export function mapAiRunStatus(aiStatus: AiStatus): ReportStatus {
  switch (aiStatus) {
    case "success":
      return "ready";
    case "error":
      return "error";
    case "stale":
      return "review";
    case "loading":
      return "not_checked";
    default:
      return "not_checked";
  }
}

export function reportStatusLabel(status: ReportStatus): string {
  switch (status) {
    case "ready":
      return "Ready";
    case "review":
      return "Review";
    case "attention":
      return "Attention";
    case "not_checked":
      return "Not Checked";
    case "not_applicable":
      return "Not Applicable";
    case "human_review":
      return "Human Review";
    case "error":
      return "Unavailable";
    default:
      return status;
  }
}
