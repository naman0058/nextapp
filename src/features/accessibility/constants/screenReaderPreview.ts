export const SPEECH_RATE_OPTIONS = [0.75, 1, 1.25, 1.5] as const;

export const DEFAULT_SPEECH_RATE = 1;

export const SPEECH_INCLUDE_IMAGE_DESCRIPTION_LABEL = true;

/** Token overlap at or above this ratio → preview-only "substantially similar" (Phase 1 exact check unchanged). */
export const CAPTION_ALT_SIMILARITY_THRESHOLD = 0.85;

/** Experience summary: review findings at or above → review_recommended (unless high_verbosity). */
export const EXPERIENCE_REVIEW_FINDING_THRESHOLD = 3;

/** Mild findings: 1–2 review-mapped items → mostly_clear. */
export const EXPERIENCE_MOSTLY_CLEAR_MAX = 2;

/** Check IDs / categories that contribute to high verbosity when combined. */
export const HIGH_VERBOSITY_SIGNALS = [
  "consecutive-emoji",
  "emoji-heavy-start",
  "hashtag-overload",
  "fancy-unicode",
  "repeated-punctuation",
  "excessive-caps",
  "long-unbroken-text",
] as const;

export const EXPERIENCE_LABELS: Record<
  import("@/features/accessibility/types/screenReaderPreview").ExperienceSummaryLevel,
  string
> = {
  clear: "Clear",
  mostly_clear: "Mostly Clear",
  review: "Review Recommended",
  high_verbosity: "High Verbosity",
};
