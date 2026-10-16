import { PUNCTUATION_CHECK } from "@/features/accessibility/constants/thresholds";

export type PunctuationNoiseDetail = {
  character: string;
  count: number;
} | null;

export function analyzePunctuationNoise(caption: string): PunctuationNoiseDetail {
  let worst: PunctuationNoiseDetail = null;
  for (const match of caption.matchAll(/([!?\.])\1+/g)) {
    const run = match[0];
    const char = match[1] ?? "";
    if (run.length >= PUNCTUATION_CHECK.repeatThreshold) {
      if (!worst || run.length > worst.count) {
        worst = { character: char, count: run.length };
      }
    }
  }
  return worst;
}
