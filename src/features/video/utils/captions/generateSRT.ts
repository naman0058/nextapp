import type { CaptionCue } from "@/features/video/types/captions";
import { formatSrtTimestamp } from "@/features/video/utils/captions/timestampFormat";

export function generateSRT(cues: CaptionCue[]): string {
  const sorted = [...cues].sort((a, b) => a.start - b.start);
  const blocks: string[] = [];
  sorted.forEach((cue, index) => {
    const text = cue.text.trim();
    if (!text) return;
    blocks.push(
      String(index + 1),
      `${formatSrtTimestamp(cue.start)} --> ${formatSrtTimestamp(cue.end)}`,
      text,
      "",
    );
  });
  return blocks.join("\n");
}
