import { CAPTION_STYLE } from "@/features/video/constants/captionStyle";
import type { CaptionCue, TimedSegment, TimedWord } from "@/features/video/types/captions";

type BuildOptions = {
  videoDuration?: number;
};

function newCueId(): string {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
    return crypto.randomUUID();
  }
  return `cue-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function wrapLines(text: string): string {
  const words = text.split(/\s+/).filter(Boolean);
  const lines: string[] = [];
  let current = "";

  for (const word of words) {
    const next = current ? `${current} ${word}` : word;
    if (next.length <= CAPTION_STYLE.targetMaxCharsPerLine) {
      current = next;
    } else {
      if (current) lines.push(current);
      current = word;
    }
    if (lines.length >= CAPTION_STYLE.maxLines) break;
  }
  if (current && lines.length < CAPTION_STYLE.maxLines) {
    lines.push(current);
  }
  return lines.join("\n");
}

function shouldBreakAfter(word: string, nextWord?: string): boolean {
  if (/[.!?]$/.test(word)) return true;
  if (/[,;:]$/.test(word)) return true;
  if (nextWord && /^[-–—]/.test(nextWord)) return true;
  return false;
}

function wordsToCues(words: TimedWord[], options: BuildOptions): CaptionCue[] {
  const cues: CaptionCue[] = [];
  if (words.length === 0) return cues;

  let bucket: TimedWord[] = [];

  const flush = () => {
    if (bucket.length === 0) return;
    const text = bucket.map((w) => w.word).join(" ").trim();
    if (!text) {
      bucket = [];
      return;
    }
    const start = bucket[0]!.start;
    let end = bucket[bucket.length - 1]!.end;
    const duration = end - start;
    if (duration < CAPTION_STYLE.minCueDurationSeconds) {
      end = start + CAPTION_STYLE.minCueDurationSeconds;
    }
    if (duration > CAPTION_STYLE.maxCueDurationSeconds) {
      end = start + CAPTION_STYLE.maxCueDurationSeconds;
    }
    const speaker = bucket.find((w) => w.speaker)?.speaker;
    cues.push({
      id: newCueId(),
      start,
      end,
      text: wrapLines(text),
      speaker,
    });
    bucket = [];
  };

  for (let i = 0; i < words.length; i++) {
    const w = words[i]!;
    const prev = bucket[bucket.length - 1];
    if (prev && prev.speaker && w.speaker && prev.speaker !== w.speaker) {
      flush();
    }
    bucket.push(w);
    const charCount = bucket.map((x) => x.word).join(" ").length;
    const next = words[i + 1];
    if (
      charCount >= CAPTION_STYLE.targetMaxCharsPerLine * CAPTION_STYLE.maxLines ||
      shouldBreakAfter(w.word, next?.word)
    ) {
      flush();
    }
  }
  flush();

  if (options.videoDuration != null) {
    for (const cue of cues) {
      if (cue.end > options.videoDuration) cue.end = options.videoDuration;
    }
  }
  return cues;
}

function segmentsToCues(segments: TimedSegment[], options: BuildOptions): CaptionCue[] {
  return segments
    .filter((s) => s.text.trim())
    .map((s) => {
      let end = s.end;
      const duration = end - s.start;
      if (duration < CAPTION_STYLE.minCueDurationSeconds) {
        end = s.start + CAPTION_STYLE.minCueDurationSeconds;
      }
      if (duration > CAPTION_STYLE.maxCueDurationSeconds) {
        end = s.start + CAPTION_STYLE.maxCueDurationSeconds;
      }
      if (options.videoDuration != null && end > options.videoDuration) {
        end = options.videoDuration;
      }
      return {
        id: newCueId(),
        start: s.start,
        end,
        text: wrapLines(s.text.trim()),
        speaker: s.speaker,
      };
    });
}

export function buildCaptionCues(
  words: TimedWord[],
  segments: TimedSegment[],
  options: BuildOptions = {},
): CaptionCue[] {
  if (words.length > 0) {
    return wordsToCues(words, options);
  }
  return segmentsToCues(segments, options);
}
