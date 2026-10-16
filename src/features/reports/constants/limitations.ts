export const BASE_REPORT_LIMITATIONS = [
  "Automated tools cannot identify every accessibility issue.",
  "AI-generated descriptions and transcripts can contain errors and require human review.",
  "Platform publishing interfaces may change; verify steps in the official app before publishing.",
] as const;

export const CONTRAST_LIMITATION =
  "Contrast results apply only to selected color samples or manually entered colors, not entire designs.";

export const SCREEN_READER_LIMITATION =
  "Screen reader preview is an approximation; actual output varies across assistive technologies, browsers, operating systems, and user settings.";

export const VIDEO_TRANSCRIPT_LIMITATION =
  "Video transcription and captions require human accuracy review before publishing.";

export const VIDEO_FRAME_LIMITATION =
  "Sampled-frame visual review may miss brief or unsampled visual information.";
