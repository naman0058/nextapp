const WORDS_PER_MINUTE = 220;

export function computeReadingTimeMinutes(content: string): number {
  const text = content.replace(/```[\s\S]*?```/g, " ").replace(/[#>*_\[\]()!`~-]/g, " ");
  const words = text
    .split(/\s+/)
    .map((w) => w.trim())
    .filter(Boolean);
  const minutes = Math.ceil(words.length / WORDS_PER_MINUTE);
  return Math.max(1, minutes);
}
