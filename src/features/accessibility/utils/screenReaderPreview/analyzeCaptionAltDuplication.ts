import { CAPTION_ALT_SIMILARITY_THRESHOLD } from "@/features/accessibility/constants/screenReaderPreview";
import type { CaptionAltDuplicationPreview } from "@/features/accessibility/types/screenReaderPreview";
import { normalizeForComparison } from "@/features/accessibility/utils/helpers/textHelpers";

function tokenOverlapRatio(a: string, b: string): number {
  const tokensA = new Set(
    a.split(/\s+/).filter((t) => t.length > 2),
  );
  const tokensB = new Set(
    b.split(/\s+/).filter((t) => t.length > 2),
  );
  if (tokensA.size === 0 || tokensB.size === 0) return 0;
  let overlap = 0;
  for (const t of tokensA) {
    if (tokensB.has(t)) overlap++;
  }
  const union = new Set([...tokensA, ...tokensB]).size;
  return union === 0 ? 0 : overlap / union;
}

export function analyzeCaptionAltDuplication(
  caption: string,
  altText: string,
): CaptionAltDuplicationPreview | null {
  const cap = caption.trim();
  const alt = altText.trim();
  if (!cap || !alt) return null;

  const normCap = normalizeForComparison(cap);
  const normAlt = normalizeForComparison(alt);
  const isExactDuplicate = normCap === normAlt && normCap.length > 0;
  const similarityRatio = tokenOverlapRatio(normCap, normAlt);
  const isSubstantiallySimilar =
    !isExactDuplicate && similarityRatio >= CAPTION_ALT_SIMILARITY_THRESHOLD;

  return {
    isExactDuplicate,
    isSubstantiallySimilar,
    similarityRatio,
  };
}
