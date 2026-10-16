import type { PreflightReportSourceSnapshot } from "@/features/reports/types/reportSource";

function stableSerialize(source: PreflightReportSourceSnapshot): string {
  const payload = {
    platform: source.platform,
    hasImage: source.hasImage,
    workingCaption: source.workingCaption,
    altText: source.altText,
    altTextSource: source.altTextSource,
    imageFileName: source.imageFileName ?? null,
    phase1: source.phase1,
    aiAnalysis: source.aiAnalysis,
    aiStatus: source.aiStatus,
    aiError: source.aiError ?? null,
    contrastSnapshot: source.contrastSnapshot,
    visualSession: source.visualSession,
    screenReaderEngaged: source.screenReaderEngaged,
    publishingConfirmations: source.publishingConfirmations,
    video: source.video
      ? {
          fileName: source.video.fileName,
          durationSeconds: source.video.durationSeconds,
          format: source.video.format,
          detectSpeakers: source.video.detectSpeakers,
          cues: source.video.cues,
          review: source.video.review,
          visualReview: source.video.visualReview,
          visualStale: source.video.visualStale,
          captionQuality: source.video.captionQuality,
          transcriptGenerated: source.video.transcriptGenerated,
        }
      : null,
  };
  return JSON.stringify(payload);
}

export function computeSourceFingerprint(
  source: PreflightReportSourceSnapshot,
): string {
  const serialized = stableSerialize(source);
  let hash = 5381;
  for (let i = 0; i < serialized.length; i++) {
    hash = (hash * 33) ^ serialized.charCodeAt(i);
  }
  return `fp-${(hash >>> 0).toString(16)}`;
}
