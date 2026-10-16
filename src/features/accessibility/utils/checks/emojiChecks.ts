import { CHECK_IDS } from "@/features/accessibility/constants/checkIds";
import { EMOJI_CHECK } from "@/features/accessibility/constants/thresholds";
import type { AccessibilityCheckResult } from "@/features/accessibility/types/preflight";
import {
  collapseRepeatedEmoji,
  countLeadingEmojis,
  hasExcessiveConsecutiveEmoji,
} from "@/features/accessibility/utils/helpers/textHelpers";

export function checkConsecutiveEmoji(
  caption: string,
): AccessibilityCheckResult {
  if (!hasExcessiveConsecutiveEmoji(caption)) {
    return {
      id: CHECK_IDS.CONSECUTIVE_EMOJI,
      category: "emoji",
      title: "Emoji repetition",
      status: "pass",
      severity: "info",
      summary: "No excessive consecutive emoji repetition detected.",
    };
  }

  const preview = collapseRepeatedEmoji(caption);
  return {
    id: CHECK_IDS.CONSECUTIVE_EMOJI,
    category: "emoji",
    title: "Consecutive emoji overload",
    status: "review",
    severity: "warning",
    summary:
      "Repeated emoji characters were detected. Screen readers may announce emoji names individually, which can make the message noisy.",
    recommendation:
      "Reduce repeated identical emoji or move decorative emoji after the main message.",
    referenceLabel: "Accessibility best practice",
    autoFix:
      preview !== caption
        ? {
            fixId: "reduce-emoji-runs",
            label: "Reduce repeated emoji",
            previewCaption: preview,
          }
        : undefined,
  };
}

export function checkEmojiHeavyStart(
  caption: string,
): AccessibilityCheckResult {
  const leading = countLeadingEmojis(caption);
  if (leading < EMOJI_CHECK.startSequenceThreshold) {
    return {
      id: CHECK_IDS.EMOJI_HEAVY_START,
      category: "emoji",
      title: "Opening emoji sequence",
      status: "pass",
      severity: "info",
      summary: "The caption does not begin with a long emoji-only sequence.",
    };
  }

  return {
    id: CHECK_IDS.EMOJI_HEAVY_START,
    category: "emoji",
    title: "Emoji-heavy beginning",
    status: "review",
    severity: "warning",
    summary:
      "The caption starts with several emoji before meaningful text, which can delay important information for screen-reader users.",
    recommendation:
      "Consider putting important text before decorative emoji sequences.",
    referenceLabel: "Accessibility best practice",
  };
}
