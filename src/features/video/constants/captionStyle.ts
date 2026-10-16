/**
 * Caption style heuristics for readable on-screen captions — not legal WCAG limits.
 */
export const CAPTION_STYLE = {
  maxLines: 2,
  targetMaxCharsPerLine: 42,
  minCueDurationSeconds: 1,
  maxCueDurationSeconds: 7,
  targetMinCharsPerSecond: 17,
  targetMaxCharsPerSecond: 20,
  /** Flag reading speed above this as REVIEW */
  reviewCharsPerSecond: 22,
} as const;
