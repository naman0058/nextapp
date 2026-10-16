import type { CaptionCue } from "@/features/video/types/captions";

function newCueId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `cue-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function splitCue(cue: CaptionCue): [CaptionCue, CaptionCue] {
  const words = cue.text.split(/\s+/).filter(Boolean);
  if (words.length < 2) {
    const mid = cue.start + (cue.end - cue.start) / 2;
    const a = cue.text.slice(0, Math.ceil(cue.text.length / 2)).trim();
    const b = cue.text.slice(Math.ceil(cue.text.length / 2)).trim();
    return [
      { ...cue, id: newCueId(), text: a || cue.text, end: mid },
      { ...cue, id: newCueId(), start: mid, text: b || cue.text },
    ];
  }
  const midIndex = Math.ceil(words.length / 2);
  const midTime =
    cue.start + ((cue.end - cue.start) * midIndex) / words.length;
  return [
    {
      ...cue,
      id: newCueId(),
      text: words.slice(0, midIndex).join(" "),
      end: midTime,
    },
    {
      ...cue,
      id: newCueId(),
      start: midTime,
      text: words.slice(midIndex).join(" "),
    },
  ];
}

export function mergeWithNext(cues: CaptionCue[], index: number): CaptionCue[] {
  const a = cues[index];
  const b = cues[index + 1];
  if (!a || !b) return cues;
  const merged: CaptionCue = {
    ...a,
    end: b.end,
    text: `${a.text}\n${b.text}`.trim(),
    speaker: a.speaker ?? b.speaker,
  };
  return [...cues.slice(0, index), merged, ...cues.slice(index + 2)];
}

export function applySpeakerRename(
  cues: CaptionCue[],
  fromLabel: string,
  toLabel: string,
): CaptionCue[] {
  const trimmed = toLabel.trim();
  return cues.map((c) =>
    c.speaker === fromLabel ? { ...c, speaker: trimmed || fromLabel } : c,
  );
}

export function downloadTextFile(content: string, filename: string): void {
  const blob = new Blob([content], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
