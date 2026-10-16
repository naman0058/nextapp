import type { ReportContentType } from "@/features/reports/types/reportModel";
import type { PreflightReportSourceSnapshot } from "@/features/reports/types/reportSource";

export function detectReportContentType(
  source: PreflightReportSourceSnapshot,
): ReportContentType {
  const video = source.video;
  if (
    video &&
    (video.cues.length > 0 ||
      video.transcriptGenerated ||
      Boolean(video.fileName))
  ) {
    return "video_post";
  }
  if (source.hasImage) return "image_post";
  return "social_post";
}
