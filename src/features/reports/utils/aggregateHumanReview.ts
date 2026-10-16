import type {
  AccessibilityPreflightReport,
  HumanReviewSummary,
  ReportSection,
} from "@/features/reports/types/reportModel";
import type { ReportPriority } from "@/features/reports/types/reportStatus";

function priorityFromStatus(
  status: string,
): ReportPriority {
  if (status === "attention" || status === "error") return "high";
  if (status === "human_review" || status === "review") return "medium";
  return "low";
}

function sectionPhaseLabel(sectionId: string): string {
  switch (sectionId) {
    case "text-accessibility":
      return "Caption preflight";
    case "image-accessibility":
      return "Image & AI review";
    case "visual-accessibility":
      return "Visual accessibility";
    case "screen-reader-preview":
      return "Screen reader preview";
    case "video-accessibility":
      return "Video workflow";
    case "platform-publishing":
      return "Platform publishing";
    default:
      return "Preflight";
  }
}

function collectFromSection(section: ReportSection | undefined): HumanReviewSummary["items"] {
  if (!section) return [];
  const items: HumanReviewSummary["items"] = [];
  for (const f of section.findings) {
    if (
      f.status === "human_review" ||
      f.status === "review" ||
      f.status === "attention"
    ) {
      items.push({
        id: `hr-${f.id}`,
        title: f.title,
        detail: f.finding,
        priority: priorityFromStatus(f.status),
        status: f.userConfirmed ? "completed" : "pending",
        phase: sectionPhaseLabel(section.id),
      });
    }
  }
  return items;
}

export function aggregateHumanReview(
  report: Pick<
    AccessibilityPreflightReport,
    | "textAccessibility"
    | "imageAccessibility"
    | "visualAccessibility"
    | "screenReaderPreview"
    | "videoAccessibility"
    | "platformPublishing"
  >,
): HumanReviewSummary {
  const sections = [
    report.textAccessibility,
    report.imageAccessibility,
    report.visualAccessibility,
    report.screenReaderPreview,
    report.videoAccessibility,
    report.platformPublishing,
  ];
  const items = sections.flatMap(collectFromSection);
  const order: Record<ReportPriority, number> = {
    high: 0,
    medium: 1,
    low: 2,
  };
  items.sort(
    (a, b) =>
      order[a.priority] - order[b.priority] ||
      a.phase.localeCompare(b.phase),
  );
  const remainingCount = items.filter((i) => i.status === "pending").length;
  return { items: items.slice(0, 40), remainingCount };
}
