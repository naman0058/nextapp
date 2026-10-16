import { CHECK_IDS } from "@/features/accessibility/constants/checkIds";
import { HASHTAG_CHECK } from "@/features/accessibility/constants/thresholds";
import type { AccessibilityCheckResult } from "@/features/accessibility/types/preflight";
import { extractHashtags } from "@/features/accessibility/utils/helpers/textHelpers";
import {
  applyHashtagCamelCase,
  suggestHashtagReadability,
} from "@/features/accessibility/utils/helpers/hashtagSegmentation";

export function checkHashtagReadability(
  caption: string,
): AccessibilityCheckResult {
  const tags = extractHashtags(caption);
  if (tags.length === 0) {
    return {
      id: CHECK_IDS.HASHTAG_READABILITY,
      category: "hashtags",
      title: "Hashtag readability",
      status: "pass",
      severity: "info",
      summary: "No hashtags found.",
    };
  }

  const issues: string[] = [];
  let bestFix: { tag: string; suggested: string; preview: string } | null =
    null;

  for (const tag of tags) {
    const suggestion = suggestHashtagReadability(tag);
    if (!suggestion) continue;
    if (!suggestion.confident && suggestion.original === suggestion.suggested) {
      issues.push(
        `"${tag}" may be harder to interpret as multiple words when written in all lowercase.`,
      );
      continue;
    }
    if (suggestion.confident) {
      issues.push(
        `"${tag}" may be easier to read with word boundaries, for example ${suggestion.suggested}.`,
      );
      if (!bestFix) {
        bestFix = {
          tag: suggestion.original,
          suggested: suggestion.suggested,
          preview: applyHashtagCamelCase(
            caption,
            suggestion.original,
            suggestion.suggested,
          ),
        };
      }
    }
  }

  if (issues.length === 0) {
    return {
      id: CHECK_IDS.HASHTAG_READABILITY,
      category: "hashtags",
      title: "Hashtag readability",
      status: "pass",
      severity: "info",
      summary: "Hashtags appear readable or already use mixed casing.",
    };
  }

  return {
    id: CHECK_IDS.HASHTAG_READABILITY,
    category: "hashtags",
    title: "Hashtag readability",
    status: "review",
    severity: "warning",
    summary: issues.join(" "),
    recommendation:
      "Consider using capital letters at word boundaries where appropriate, for example #DigitalMarketing.",
    referenceLabel: "Accessibility best practice",
    autoFix: bestFix
      ? {
          fixId: `hashtag-camelcase-${bestFix.tag}`,
          label: `Apply ${bestFix.suggested}`,
          previewCaption: bestFix.preview,
        }
      : undefined,
  };
}

export function checkHashtagOverload(
  caption: string,
): AccessibilityCheckResult {
  const tags = extractHashtags(caption);
  if (tags.length < HASHTAG_CHECK.overloadCount) {
    return {
      id: CHECK_IDS.HASHTAG_OVERLOAD,
      category: "hashtags",
      title: "Hashtag count",
      status: "pass",
      severity: "info",
      summary: `Found ${tags.length} hashtag(s); count is within a typical range.`,
    };
  }

  return {
    id: CHECK_IDS.HASHTAG_OVERLOAD,
    category: "hashtags",
    title: "Hashtag overload",
    status: "review",
    severity: "warning",
    summary: `Found ${tags.length} hashtags. A large number of hashtags can create screen-reader verbosity and reduce readability.`,
    recommendation:
      "Use fewer, more focused hashtags or move extended tag lists out of the main message when possible.",
    referenceLabel: "Accessibility best practice",
  };
}
