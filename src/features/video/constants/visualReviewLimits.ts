const DEFAULT_MAX_FRAMES = 8;
const DEFAULT_LONG_EDGE = 896;

export function getMaxVisualReviewFrames(): number {
  const raw = process.env.VIDEO_MAX_VISUAL_FRAMES?.trim();
  if (raw) {
    const n = Number.parseInt(raw, 10);
    if (Number.isFinite(n) && n >= 1 && n <= 16) return n;
  }
  return DEFAULT_MAX_FRAMES;
}

export function getVisualFrameLongEdgePx(): number {
  const raw = process.env.VIDEO_FRAME_LONG_EDGE_PX?.trim();
  if (raw) {
    const n = Number.parseInt(raw, 10);
    if (Number.isFinite(n) && n >= 256 && n <= 2048) return n;
  }
  return DEFAULT_LONG_EDGE;
}

export const MAX_VISUAL_REVIEW_FRAMES = DEFAULT_MAX_FRAMES;
