/** Maximum image upload size for Phase 1 (client-side only). */
export const MAX_IMAGE_SIZE_BYTES = 10 * 1024 * 1024;

export const SCORE_WEIGHTS = {
  fail: { error: 12, warning: 8, info: 0 },
  review: { error: 6, warning: 4, info: 0 },
  pass: { error: 0, warning: 0, info: 0 },
  not_checked: { error: 0, warning: 0, info: 0 },
} as const;

export const SCORE_BANDS = [
  { min: 90, label: "Strong preflight result" },
  { min: 75, label: "Good, with items to review" },
  { min: 50, label: "Several improvements recommended" },
  { min: 0, label: "Significant accessibility review recommended" },
] as const;

export const CAPS_CHECK = {
  minCaptionLength: 20,
  uppercaseWordRatioThreshold: 0.5,
  minWordLength: 3,
} as const;

export const EMOJI_CHECK = {
  consecutiveRepeatThreshold: 3,
  startSequenceThreshold: 4,
} as const;

export const HASHTAG_CHECK = {
  overloadCount: 8,
} as const;

export const PUNCTUATION_CHECK = {
  repeatThreshold: 4,
} as const;

export const READABILITY_CHECK = {
  longUnbrokenLength: 400,
  longWordLength: 50,
  longUrlLength: 80,
} as const;

export const ALT_TEXT_CHECK = {
  minMeaningfulLength: 8,
  maxRecommendedLength: 250,
  minWordCount: 2,
} as const;
