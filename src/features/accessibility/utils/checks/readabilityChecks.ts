import { CHECK_IDS } from "@/features/accessibility/constants/checkIds";
import {
  PUNCTUATION_CHECK,
  READABILITY_CHECK,
} from "@/features/accessibility/constants/thresholds";
import type { AccessibilityCheckResult } from "@/features/accessibility/types/preflight";
import { reduceRepeatedPunctuation } from "@/features/accessibility/utils/helpers/textHelpers";

export function checkRepeatedPunctuation(
  caption: string,
): AccessibilityCheckResult {
  const excessive =
    /!{4,}|\?{4,}|\.{5,}/.test(caption) ||
    (() => {
      for (const match of caption.matchAll(/([!?\.])\1+/g)) {
        if (match[0].length >= PUNCTUATION_CHECK.repeatThreshold) return true;
      }
      return false;
    })();

  if (!excessive) {
    return {
      id: CHECK_IDS.REPEATED_PUNCTUATION,
      category: "readability",
      title: "Punctuation repetition",
      status: "pass",
      severity: "info",
      summary: "Punctuation repetition appears within a typical range.",
    };
  }

  const preview = reduceRepeatedPunctuation(caption);
  return {
    id: CHECK_IDS.REPEATED_PUNCTUATION,
    category: "readability",
    title: "Repeated punctuation",
    status: "review",
    severity: "warning",
    summary:
      "Excessive repeated punctuation was detected, which can affect clarity when read aloud.",
    recommendation: "Use punctuation sparingly for clearer reading.",
    referenceLabel: "Accessibility best practice",
    autoFix:
      preview !== caption
        ? {
            fixId: "reduce-punctuation",
            label: "Reduce repeated punctuation",
            previewCaption: preview,
          }
        : undefined,
  };
}

export function checkLongUnbrokenText(
  caption: string,
): AccessibilityCheckResult {
  const trimmed = caption.trim();
  const hasBreaks = /\n\n|\r\n\r\n/.test(trimmed);
  const singleBlock =
    trimmed.replace(/\s+/g, " ").length >= READABILITY_CHECK.longUnbrokenLength;

  if (!singleBlock || hasBreaks) {
    return {
      id: CHECK_IDS.LONG_UNBROKEN_TEXT,
      category: "readability",
      title: "Long unbroken text",
      status: "pass",
      severity: "info",
      summary: "Caption length and paragraph breaks appear reasonable.",
    };
  }

  return {
    id: CHECK_IDS.LONG_UNBROKEN_TEXT,
    category: "readability",
    title: "Long unbroken text",
    status: "review",
    severity: "warning",
    summary:
      "The caption is long without paragraph breaks, which can be harder to scan and listen to.",
    recommendation:
      "Break long content into short paragraphs or meaningful sections.",
    referenceLabel: "Accessibility best practice",
  };
}

export function checkLongWordOrUrl(
  caption: string,
): AccessibilityCheckResult {
  const tokens = caption.split(/\s+/);
  for (const token of tokens) {
    const cleaned = token.replace(/^[^\w]+|[^\w]+$/g, "");
    if (cleaned.length >= READABILITY_CHECK.longWordLength) {
      return {
        id: CHECK_IDS.LONG_WORD_OR_URL,
        category: "readability",
        title: "Long word or URL",
        status: "review",
        severity: "warning",
        summary:
          "An unusually long uninterrupted string or URL was detected, which may be harder to read or listen to.",
        recommendation:
          "Shorten link text, use a URL shortener with descriptive surrounding text, or break up very long strings.",
        referenceLabel: "Accessibility best practice",
      };
    }
    if (
      /^https?:\/\//i.test(cleaned) &&
      cleaned.length >= READABILITY_CHECK.longUrlLength
    ) {
      return {
        id: CHECK_IDS.LONG_WORD_OR_URL,
        category: "readability",
        title: "Long URL",
        status: "review",
        severity: "warning",
        summary:
          "A long raw URL was detected. Descriptive link text is usually easier to understand than the URL alone.",
        recommendation:
          "Add descriptive text near the link describing its destination.",
        referenceLabel: "WCAG 2.4.4 (Link Purpose)",
      };
    }
  }

  return {
    id: CHECK_IDS.LONG_WORD_OR_URL,
    category: "readability",
    title: "Long word or URL",
    status: "pass",
    severity: "info",
    summary: "No unusually long tokens detected.",
  };
}
