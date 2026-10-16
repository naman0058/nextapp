/** Product limits for Phase 6 video (defaults; server may read env overrides). */

const DEFAULT_MAX_FILE_SIZE_MB = 24;
const DEFAULT_MAX_DURATION_SECONDS = 600;

export const ACCEPTED_VIDEO_MIME_TYPES = ["video/mp4", "video/webm"] as const;

export type AcceptedVideoMimeType = (typeof ACCEPTED_VIDEO_MIME_TYPES)[number];

export const VIDEO_UNSUPPORTED_FORMAT_MESSAGE =
  "This video format isn't supported yet. Please use MP4 or WebM.";

export const VIDEO_DURATION_LIMIT_MESSAGE =
  "This version currently supports videos up to 10 minutes.";

export function getMaxVideoFileSizeBytes(): number {
  const raw = process.env.VIDEO_MAX_FILE_SIZE_MB?.trim();
  if (raw) {
    const mb = Number.parseFloat(raw);
    if (Number.isFinite(mb) && mb > 0) {
      return Math.floor(mb * 1024 * 1024);
    }
  }
  return DEFAULT_MAX_FILE_SIZE_MB * 1024 * 1024;
}

export function getMaxVideoDurationSeconds(): number {
  const raw = process.env.VIDEO_MAX_DURATION_SECONDS?.trim();
  if (raw) {
    const sec = Number.parseInt(raw, 10);
    if (Number.isFinite(sec) && sec > 0) {
      return sec;
    }
  }
  return DEFAULT_MAX_DURATION_SECONDS;
}

/** Client-safe default used before server env is available. */
export const MAX_VIDEO_FILE_SIZE_BYTES = DEFAULT_MAX_FILE_SIZE_MB * 1024 * 1024;

export const MAX_VIDEO_DURATION_SECONDS = DEFAULT_MAX_DURATION_SECONDS;

export const MAX_VOCABULARY_HINTS_LENGTH = 500;

export const VIDEO_TEMP_PATH_PREFIX = "tmp/video/";
