import type { EmojiSequenceSummary } from "@/features/accessibility/types/screenReaderPreview";

function segmentGraphemes(text: string): string[] {
  if (typeof Intl !== "undefined" && "Segmenter" in Intl) {
    const segmenter = new Intl.Segmenter(undefined, { granularity: "grapheme" });
    return [...segmenter.segment(text)].map((s) => s.segment);
  }
  return [...text];
}

const EMOJI_PATTERN = /\p{Extended_Pictographic}/u;

function isEmojiGrapheme(grapheme: string): boolean {
  return EMOJI_PATTERN.test(grapheme);
}

export function detectRepeatedEmojiSequences(
  caption: string,
): EmojiSequenceSummary[] {
  const graphemes = segmentGraphemes(caption);
  const counts = new Map<string, number>();

  for (const g of graphemes) {
    if (!isEmojiGrapheme(g)) continue;
    counts.set(g, (counts.get(g) ?? 0) + 1);
  }

  return [...counts.entries()]
    .filter(([, count]) => count >= 2)
    .map(([glyph, count]) => ({ glyph, count }))
    .sort((a, b) => b.count - a.count);
}
