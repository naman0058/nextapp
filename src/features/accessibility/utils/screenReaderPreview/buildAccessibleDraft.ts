import {
  applyHashtagCamelCase,
  suggestHashtagReadability,
} from "@/features/accessibility/utils/helpers/hashtagSegmentation";
import {
  collapseRepeatedEmoji,
  extractHashtags,
  normalizeFancyUnicode,
  reduceRepeatedPunctuation,
} from "@/features/accessibility/utils/helpers/textHelpers";

export function buildAccessibleDraft(caption: string): {
  draft: string;
  changed: boolean;
} {
  let draft = caption;
  const original = caption;

  draft = reduceRepeatedPunctuation(draft);
  draft = collapseRepeatedEmoji(draft);
  const fancy = normalizeFancyUnicode(draft);
  draft = fancy.normalized;

  for (const tag of extractHashtags(draft)) {
    const suggestion = suggestHashtagReadability(tag);
    if (suggestion?.confident && suggestion.suggested !== tag) {
      draft = applyHashtagCamelCase(draft, tag, suggestion.suggested);
    }
  }

  return { draft, changed: draft !== original };
}
