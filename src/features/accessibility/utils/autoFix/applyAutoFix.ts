import {
  collapseRepeatedEmoji,
  normalizeFancyUnicode,
  reduceRepeatedPunctuation,
} from "@/features/accessibility/utils/helpers/textHelpers";

export type ApplyFixResult = {
  nextCaption: string;
  undoCaption: string;
};

export function applyAutoFix(
  caption: string,
  fixId: string,
  previewCaption?: string,
): ApplyFixResult | null {
  const undoCaption = caption;

  if (fixId === "reduce-punctuation") {
    return {
      nextCaption: reduceRepeatedPunctuation(caption),
      undoCaption,
    };
  }

  if (fixId === "reduce-emoji-runs") {
    return {
      nextCaption: collapseRepeatedEmoji(caption),
      undoCaption,
    };
  }

  if (fixId === "fancy-unicode-normalize") {
    const { normalized, changed } = normalizeFancyUnicode(caption);
    if (!changed) return null;
    return { nextCaption: normalized, undoCaption };
  }

  if (fixId.startsWith("hashtag-camelcase-") && previewCaption) {
    return { nextCaption: previewCaption, undoCaption };
  }

  if (previewCaption && previewCaption !== caption) {
    return { nextCaption: previewCaption, undoCaption };
  }

  return null;
}
