import type { CaptionCue } from "@/features/video/types/captions";
import { formatVttTimestamp } from "@/features/video/utils/captions/timestampFormat";

export function generateVTT(cues: CaptionCue[]): string {
  const sorted = [...cues].sort((a, b) => a.start - b.start);
  const lines = ["WEBVTT", ""];
  for (const cue of sorted) {
    const text = cue.text.trim();
    if (!text) continue;
    lines.push(
      `${formatVttTimestamp(cue.start)} --> ${formatVttTimestamp(cue.end)}`,
      text,
      "",
    );
  }
  return lines.join("\n");
}
