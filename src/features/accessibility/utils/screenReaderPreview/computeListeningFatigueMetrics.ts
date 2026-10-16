import type { ListeningFatigueMetrics } from "@/features/accessibility/types/screenReaderPreview";
import { extractHashtags } from "@/features/accessibility/utils/helpers/textHelpers";
import { detectRepeatedEmojiSequences } from "@/features/accessibility/utils/screenReaderPreview/detectRepeatedEmojiSequences";

export function computeListeningFatigueMetrics(
  caption: string,
): ListeningFatigueMetrics {
  const trimmed = caption.trim();
  const words = trimmed ? trimmed.split(/\s+/).filter(Boolean) : [];
  const paragraphs = trimmed
    ? trimmed.split(/\n\s*\n/).filter((p) => p.trim().length > 0)
    : [];
  const paragraphCount = paragraphs.length > 0 ? paragraphs.length : trimmed ? 1 : 0;

  const sentences = trimmed.split(/(?<=[.!?])\s+/).filter(Boolean);
  let longestSentenceWords = 0;
  for (const s of sentences.length > 0 ? sentences : [trimmed]) {
    const wc = s.split(/\s+/).filter(Boolean).length;
    if (wc > longestSentenceWords) longestSentenceWords = wc;
  }

  return {
    wordCount: words.length,
    paragraphCount,
    hashtagCount: extractHashtags(caption).length,
    emojiRepetitionGroups: detectRepeatedEmojiSequences(caption).length,
    longestSentenceWords,
  };
}
