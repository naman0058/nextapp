import type { HashtagPreviewItem } from "@/features/accessibility/types/screenReaderPreview";
import { suggestHashtagReadability } from "@/features/accessibility/utils/helpers/hashtagSegmentation";
import { extractHashtags } from "@/features/accessibility/utils/helpers/textHelpers";

export function analyzeHashtagPreview(caption: string): HashtagPreviewItem[] {
  return extractHashtags(caption).map((original) => {
    const suggestion = suggestHashtagReadability(original);
    if (!suggestion) {
      return { original, suggestedReadable: null, ambiguous: false };
    }
    if (!suggestion.confident) {
      return {
        original,
        suggestedReadable: null,
        ambiguous: true,
      };
    }
    return {
      original,
      suggestedReadable: suggestion.suggested,
      ambiguous: false,
    };
  });
}
