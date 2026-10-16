import { MAX_IMAGE_SIZE_BYTES } from "@/features/accessibility/constants/thresholds";

export const MAX_BATCH_ROWS = 100;
export const MAX_CSV_FILE_SIZE_MB = 5;
export const MAX_CSV_FILE_SIZE_BYTES = MAX_CSV_FILE_SIZE_MB * 1024 * 1024;

export const MAX_BATCH_ZIP_SIZE_MB = 100;
export const MAX_BATCH_ZIP_SIZE_BYTES = MAX_BATCH_ZIP_SIZE_MB * 1024 * 1024;

export const MAX_BATCH_IMAGE_COUNT = 100;
export const MAX_BATCH_EXTRACTED_IMAGE_BYTES =
  MAX_BATCH_IMAGE_COUNT * MAX_IMAGE_SIZE_BYTES;

export const MAX_AI_BATCH_ITEMS_PER_RUN = 20;
export const MAX_AI_BATCH_ITEMS_PER_SESSION = 50;
export const BATCH_AI_CONCURRENCY = 2;

export const MAX_AI_BATCH_REMEDIATION_PER_RUN = 5;
export const MAX_AI_BATCH_REMEDIATION_PER_SESSION = 20;

export const BATCH_PAGE_SIZE_DEFAULT = 25;
export const BATCH_PAGE_SIZE_OPTIONS = [25, 50, 100] as const;

export const BATCH_THUMBNAIL_MAX_EDGE = 320;

export const BATCH_LOCAL_CHUNK_SIZE = 10;

export const BATCH_ACCEPTED_IMAGE_MIME = [
  "image/png",
  "image/jpeg",
  "image/jpg",
  "image/webp",
] as const;

export const BATCH_ZIP_REJECT_EXTENSIONS = new Set([
  ".exe",
  ".js",
  ".mjs",
  ".html",
  ".htm",
  ".svg",
  ".php",
  ".sh",
  ".bat",
  ".cmd",
  ".ps1",
]);
