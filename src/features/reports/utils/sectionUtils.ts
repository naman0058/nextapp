import type {
  ReportFinding,
  ReportSection,
  ReportSectionCounts,
} from "@/features/reports/types/reportModel";
import type { ReportStatus } from "@/features/reports/types/reportStatus";

export function emptyCounts(): ReportSectionCounts {
  return {
    ready: 0,
    review: 0,
    attention: 0,
    not_checked: 0,
    not_applicable: 0,
  };
}

export function countFindings(findings: ReportFinding[]): ReportSectionCounts {
  const counts = emptyCounts();
  for (const f of findings) {
    if (f.status === "ready") counts.ready++;
    else if (f.status === "review" || f.status === "human_review")
      counts.review++;
    else if (f.status === "attention" || f.status === "error")
      counts.attention++;
    else if (f.status === "not_applicable") counts.not_applicable++;
    else counts.not_checked++;
  }
  return counts;
}

export function deriveSectionStatus(
  findings: ReportFinding[],
  opts?: { emptyMeans?: "not_checked" | "not_applicable" },
): ReportSection["sectionStatus"] {
  if (findings.length === 0) {
    return opts?.emptyMeans === "not_applicable"
      ? "Not Applicable"
      : "Not Checked";
  }
  const counts = countFindings(findings);
  if (counts.attention > 0) return "Review Required";
  if (counts.review > 0) return "Review Required";
  const checked = findings.filter(
    (f) => f.status !== "not_checked" && f.status !== "not_applicable",
  );
  if (checked.length === 0) return "Not Checked";
  if (
    counts.not_checked > 0 &&
    checked.length > 0 &&
    counts.ready === checked.length
  ) {
    return "Completed";
  }
  if (counts.not_checked > 0) return "Review Required";
  return counts.ready === findings.length ? "Completed" : "Review Required";
}

export function sectionTone(status: ReportSection["sectionStatus"]): string {
  switch (status) {
    case "Completed":
      return "ready";
    case "Review Required":
      return "review";
    case "Not Applicable":
      return "muted";
    case "Unavailable":
      return "error";
    default:
      return "muted";
  }
}

export function worstStatus(statuses: ReportStatus[]): ReportStatus {
  const rank: Record<ReportStatus, number> = {
    error: 6,
    attention: 5,
    human_review: 4,
    review: 3,
    not_checked: 2,
    ready: 1,
    not_applicable: 0,
  };
  let worst: ReportStatus = "not_applicable";
  let score = -1;
  for (const s of statuses) {
    if (rank[s] > score) {
      score = rank[s];
      worst = s;
    }
  }
  return worst;
}
