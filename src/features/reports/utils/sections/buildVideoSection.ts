import type { ReportFinding, ReportSection } from "@/features/reports/types/reportModel";
import type { PreflightReportSourceSnapshot } from "@/features/reports/types/reportSource";
import {
  VIDEO_FRAME_LIMITATION,
  VIDEO_TRANSCRIPT_LIMITATION,
} from "@/features/reports/constants/limitations";
import {
  countFindings,
  deriveSectionStatus,
} from "@/features/reports/utils/sectionUtils";

export function buildVideoSection(
  source: PreflightReportSourceSnapshot,
): ReportSection {
  const video = source.video;
  if (!video) {
    return {
      id: "video-accessibility",
      title: "Video accessibility",
      sectionStatus: "Not Applicable",
      findings: [],
      summaryLabel: "No video workflow data",
    };
  }

  const findings: ReportFinding[] = [];

  if (video.cues.length === 0) {
    findings.push({
      id: "video-no-captions",
      section: "video-accessibility",
      title: "Captions / transcript",
      status: "not_checked" as const,
      sourceType: "rule" as const,
      finding: "No caption cues were saved for this video session.",
    });
  } else {
    findings.push({
      id: "video-cue-count",
      section: "video-accessibility",
      title: "Captions / transcript",
      status: "review" as const,
      sourceType: "rule" as const,
      finding: `${video.cues.length} caption cue(s) prepared. Human accuracy review required before publishing.`,
    });
    if (video.fileName) {
      findings.push({
        id: "video-file",
        section: "video-accessibility",
        title: "Source file",
        status: "ready",
        sourceType: "rule",
        finding: `${video.fileName}${video.format ? ` (${video.format})` : ""}${video.durationSeconds ? `, ${Math.round(video.durationSeconds)}s` : ""}.`,
      });
    }
  }

  if (video.captionQuality) {
    const q = video.captionQuality;
    findings.push({
      id: "video-caption-quality",
      section: "video-accessibility",
      title: "Caption quality checks",
      status:
        q.error > 0 ? "attention" : q.review > 0 ? "review" : "ready",
      sourceType: "rule",
      finding: `Ready ${q.ready}, review ${q.review}, attention ${q.error}.`,
    });
    for (const [i, f] of q.findings.slice(0, 12).entries()) {
      findings.push({
        id: `video-qa-${i}`,
        section: "video-accessibility",
        title: f.title,
        status:
          f.status === "error"
            ? "attention"
            : f.status === "review"
              ? "review"
              : "ready",
        sourceType: "rule",
        finding: f.detail,
        recommendation: f.suggestion,
      });
    }
  }

  const review = video.review;
  const reviewItems: { key: keyof typeof review; label: string }[] = [
    { key: "transcriptReviewed", label: "Transcript accuracy reviewed" },
    { key: "timingReviewed", label: "Caption timing reviewed" },
    { key: "speakerLabelsReviewed", label: "Speaker labels reviewed" },
    { key: "nonSpeechReviewed", label: "Non-speech sounds reviewed" },
    { key: "visualInformationReviewed", label: "Visual information in captions reviewed" },
  ];
  for (const item of reviewItems) {
    const done = review[item.key];
    findings.push({
      id: `video-review-${item.key}`,
      section: "video-accessibility",
      title: item.label,
      status: done ? "ready" : "human_review",
      sourceType: "human",
      finding: done ? "Marked complete in video workflow." : "Not yet confirmed.",
    });
  }

  if (video.visualReview) {
    findings.push({
      id: "video-visual-ai",
      section: "video-accessibility",
      title: "Sampled-frame visual review",
      status: video.visualStale ? "review" : "review",
      sourceType: "ai",
      finding: video.visualStale
        ? "Frame review may be stale relative to current video — re-run if needed."
        : "AI-assisted frame observations available — verify manually.",
    });
  } else {
    findings.push({
      id: "video-visual-not-run",
      section: "video-accessibility",
      title: "Sampled-frame visual review",
      status: "not_checked",
      sourceType: "ai",
      finding: "Optional sampled-frame visual review was not run.",
    });
  }

  const counts = countFindings(findings);
  return {
    id: "video-accessibility",
    title: "Video accessibility",
    sectionStatus: deriveSectionStatus(findings),
    counts,
    findings,
    notes: [VIDEO_TRANSCRIPT_LIMITATION, VIDEO_FRAME_LIMITATION],
  };
}
