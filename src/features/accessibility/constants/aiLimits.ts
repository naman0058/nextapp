import { MAX_IMAGE_SIZE_BYTES } from "@/features/accessibility/constants/thresholds";

export const MAX_AI_IMAGE_SIZE_BYTES = MAX_IMAGE_SIZE_BYTES;

export const MAX_CAPTION_LENGTH = 10_000;

export const MAX_ALT_TEXT_LENGTH = 2_000;

export const CLIENT_ANALYSIS_COOLDOWN_MS = 5_000;

export const AI_ANALYSIS_MAX_LONG_EDGE = 1920;

/** Default server timeout for a single vision analysis request. */
export const AI_REQUEST_TIMEOUT_MS = 120_000;

/** Best-effort in-memory rate limit window per client key. */
export const AI_RATE_LIMIT_WINDOW_MS = 60_000;

export const AI_RATE_LIMIT_MAX_REQUESTS = 10;

/** Stricter bucket for video transcription. */
export const VIDEO_TRANSCRIBE_RATE_LIMIT_WINDOW_MS = 60_000;
export const VIDEO_TRANSCRIBE_RATE_LIMIT_MAX_REQUESTS = 3;

export const VIDEO_VISUAL_RATE_LIMIT_WINDOW_MS = 60_000;
export const VIDEO_VISUAL_RATE_LIMIT_MAX_REQUESTS = 5;

/** Website Playwright scans — resource intensive. */
export const WEBSITE_SCAN_RATE_LIMIT_WINDOW_MS = 60_000;
export const WEBSITE_SCAN_RATE_LIMIT_MAX_REQUESTS = 8;

export const WEBSITE_AI_RATE_LIMIT_WINDOW_MS = 60_000;
export const WEBSITE_AI_RATE_LIMIT_MAX_REQUESTS = 5;

/** Shared AI Remediation Assistant (AI-R1) */
export const AI_REMEDIATION_RATE_LIMIT_WINDOW_MS = 60_000;
export const AI_REMEDIATION_RATE_LIMIT_MAX_REQUESTS = 5;

/** Visual Issue Locator — Playwright re-render + screenshot. */
export const VISUAL_LOCATOR_TOKEN_RATE_LIMIT_WINDOW_MS = 60_000;
export const VISUAL_LOCATOR_TOKEN_RATE_LIMIT_MAX_REQUESTS = 30;
export const VISUAL_LOCATOR_IMAGE_RATE_LIMIT_WINDOW_MS = 60_000;
export const VISUAL_LOCATOR_IMAGE_RATE_LIMIT_MAX_REQUESTS = 6;
