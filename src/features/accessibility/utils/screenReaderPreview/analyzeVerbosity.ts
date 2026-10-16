import { CHECK_IDS } from "@/features/accessibility/constants/checkIds";
import type { AccessibilityCheckResult } from "@/features/accessibility/types/preflight";
import type { NoiseFinding } from "@/features/accessibility/types/screenReaderPreview";
import { extractHttpUrls } from "@/features/accessibility/utils/helpers/linkHelpers";
import {
  hasFancyUnicode,
  normalizeFancyUnicode,
} from "@/features/accessibility/utils/helpers/textHelpers";
import { analyzeCaptionAltDuplication } from "@/features/accessibility/utils/screenReaderPreview/analyzeCaptionAltDuplication";
import { analyzeHashtagPreview } from "@/features/accessibility/utils/screenReaderPreview/analyzeHashtagPreview";
import { analyzePunctuationNoise } from "@/features/accessibility/utils/screenReaderPreview/analyzePunctuationNoise";
import { detectRepeatedEmojiSequences } from "@/features/accessibility/utils/screenReaderPreview/detectRepeatedEmojiSequences";

function fromCheck(check: AccessibilityCheckResult): NoiseFinding | null {
  if (check.status !== "review" && check.status !== "fail") return null;
  return {
    id: check.id,
    category: check.category,
    title: check.title,
    detail: check.summary,
    recommendation: check.recommendation,
  };
}

export function analyzeVerbosity(
  caption: string,
  altText: string,
  hasImage: boolean,
  preflightChecks: AccessibilityCheckResult[],
): NoiseFinding[] {
  const findings: NoiseFinding[] = [];
  const seen = new Set<string>();

  function add(f: NoiseFinding) {
    if (seen.has(f.id)) return;
    seen.add(f.id);
    findings.push(f);
  }

  for (const check of preflightChecks) {
    const mapped = fromCheck(check);
    if (mapped) add(mapped);
  }

  for (const { glyph, count } of detectRepeatedEmojiSequences(caption)) {
    add({
      id: `emoji-repeat-${glyph.codePointAt(0)}`,
      category: "emoji",
      title: "Repeated emoji (noise summary)",
      detail: `${glyph} repeated ${count} times. Screen reader behavior varies; repeated emoji may add listening time.`,
      recommendation:
        "Consider reducing repeated decorative emojis.",
    });
  }

  const punct = analyzePunctuationNoise(caption);
  if (punct && !seen.has(CHECK_IDS.REPEATED_PUNCTUATION)) {
    add({
      id: "punctuation-detail",
      category: "readability",
      title: "Repeated punctuation",
      detail: `Repeated punctuation detected: ${punct.count} "${punct.character}" characters.`,
      recommendation:
        "Assistive technology behavior varies, but excessive punctuation can reduce clarity.",
    });
  }

  for (const url of extractHttpUrls(caption)) {
    if (url.length > 40) {
      add({
        id: `url-${url.slice(0, 20)}`,
        category: "links",
        title: "Potential reading noise",
        detail: url,
        recommendation:
          "When the platform allows descriptive link labels, prefer meaningful link text.",
      });
    }
  }

  if (hasFancyUnicode(caption)) {
    const { normalized } = normalizeFancyUnicode(caption);
    add({
      id: "fancy-unicode-preview",
      category: "unicode",
      title: "Decorative Unicode",
      detail: `Original styled text may not normalize consistently. Normalized preview: ${normalized.slice(0, 120)}${normalized.length > 120 ? "…" : ""}`,
      recommendation:
        "Decorative Unicode characters can behave inconsistently with assistive technologies.",
    });
  }

  for (const tag of analyzeHashtagPreview(caption)) {
    if (tag.ambiguous) {
      add({
        id: `hashtag-ambig-${tag.original}`,
        category: "hashtags",
        title: "Hashtag readability",
        detail: `${tag.original}: Review capitalization at word boundaries.`,
      });
    } else if (tag.suggestedReadable && tag.suggestedReadable !== tag.original) {
      add({
        id: `hashtag-suggest-${tag.original}`,
        category: "hashtags",
        title: "Hashtag readability",
        detail: `Original: ${tag.original}. Suggested readable form: ${tag.suggestedReadable}. Capitalizing word boundaries can improve readability.`,
      });
    }
  }

  const dup = analyzeCaptionAltDuplication(caption, altText);
  if (hasImage && dup?.isSubstantiallySimilar && !dup.isExactDuplicate) {
    add({
      id: "caption-alt-similar",
      category: "alt_text",
      title: "Potential repetition",
      detail:
        "Caption and alt text appear substantially similar. Review whether the image description repeats information already in nearby text.",
    });
  }

  return findings;
}
