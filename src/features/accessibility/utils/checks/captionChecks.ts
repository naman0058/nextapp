import { CHECK_IDS } from "@/features/accessibility/constants/checkIds";
import { CAPS_CHECK } from "@/features/accessibility/constants/thresholds";
import type { AccessibilityCheckResult } from "@/features/accessibility/types/preflight";
import { isAcronymWord } from "@/features/accessibility/utils/helpers/textHelpers";

export function checkEmptyCaption(caption: string): AccessibilityCheckResult {
  const trimmed = caption.trim();
  if (trimmed.length > 0) {
    return {
      id: CHECK_IDS.EMPTY_CAPTION,
      category: "caption",
      title: "Caption provided",
      status: "pass",
      severity: "info",
      summary: "A caption was provided for review.",
      referenceLabel: "Accessibility best practice",
    };
  }
  return {
    id: CHECK_IDS.EMPTY_CAPTION,
    category: "caption",
    title: "Empty caption",
    status: "review",
    severity: "warning",
    summary:
      "No caption was provided. If the image contains meaningful information, make sure that information is available through alternative text or surrounding content.",
    recommendation:
      "Add a caption when it helps convey context, or ensure alt text and surrounding content carry the message.",
    referenceLabel: "Accessibility best practice",
  };
}

export function checkExcessiveCaps(caption: string): AccessibilityCheckResult {
  const trimmed = caption.trim();
  if (trimmed.length < CAPS_CHECK.minCaptionLength) {
    return {
      id: CHECK_IDS.EXCESSIVE_CAPS,
      category: "caption",
      title: "All-caps usage",
      status: "pass",
      severity: "info",
      summary: "Caption is short; all-caps ratio was not evaluated.",
    };
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  let meaningful = 0;
  let uppercase = 0;

  for (const word of words) {
    const alpha = word.replace(/[^A-Za-z]/g, "");
    if (alpha.length < CAPS_CHECK.minWordLength) continue;
    if (isAcronymWord(alpha)) continue;
    meaningful++;
    if (alpha === alpha.toUpperCase() && alpha !== alpha.toLowerCase()) {
      uppercase++;
    }
  }

  if (meaningful === 0) {
    return {
      id: CHECK_IDS.EXCESSIVE_CAPS,
      category: "caption",
      title: "All-caps usage",
      status: "pass",
      severity: "info",
      summary: "No long alphabetic words found for all-caps analysis.",
    };
  }

  const ratio = uppercase / meaningful;
  if (ratio >= CAPS_CHECK.uppercaseWordRatioThreshold) {
    return {
      id: CHECK_IDS.EXCESSIVE_CAPS,
      category: "caption",
      title: "Excessive all-caps text",
      status: "review",
      severity: "warning",
      summary:
        "A significant portion of words appear in ALL CAPS, which can be harder to read and may be announced emphatically by some assistive technology.",
      recommendation: "Use normal sentence casing for improved readability.",
      referenceLabel: "Accessibility best practice",
    };
  }

  return {
    id: CHECK_IDS.EXCESSIVE_CAPS,
    category: "caption",
    title: "All-caps usage",
    status: "pass",
    severity: "info",
    summary: "All-caps usage appears within a typical range.",
  };
}
