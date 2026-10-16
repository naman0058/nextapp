import type { CaptionCue } from "@/features/video/types/captions";

export function generatePlainTranscript(cues: CaptionCue[]): string {
  const sorted = [...cues].sort((a, b) => a.start - b.start);
  const parts: string[] = [];
  let paragraph = "";

  for (const cue of sorted) {
    const text = cue.text.trim();
    if (!text) continue;
    if (paragraph && !paragraph.endsWith("\n")) {
      paragraph += " ";
    }
    paragraph += text;
    if (/[.!?]$/.test(text)) {
      parts.push(paragraph.trim());
      paragraph = "";
    }
  }
  if (paragraph.trim()) {
    parts.push(paragraph.trim());
  }
  return parts.join("\n\n");
}
