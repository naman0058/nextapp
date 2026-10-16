import {
  CHECK_IDS,
  type CheckId,
} from "@/features/accessibility/constants/checkIds";
import { ALT_TEXT_CHECK } from "@/features/accessibility/constants/thresholds";
import type { AccessibilityCheckResult } from "@/features/accessibility/types/preflight";
import {
  looksLikeFilenameAlt,
  normalizeForComparison,
} from "@/features/accessibility/utils/helpers/textHelpers";

function notChecked(id: CheckId, title: string): AccessibilityCheckResult {
  return {
    id,
    category: "alt_text",
    title,
    status: "not_checked",
    severity: "info",
    summary: "No image was uploaded; this check was not run.",
  };
}

export function checkAltTextPresence(
  hasImage: boolean,
  altText: string,
): AccessibilityCheckResult {
  if (!hasImage) {
    return notChecked(CHECK_IDS.ALT_TEXT_PRESENCE, "Alt text presence");
  }
  if (altText.trim().length > 0) {
    return {
      id: CHECK_IDS.ALT_TEXT_PRESENCE,
      category: "alt_text",
      title: "Alt text presence",
      status: "pass",
      severity: "info",
      summary: "Alt text was provided for the uploaded image.",
    };
  }
  return {
    id: CHECK_IDS.ALT_TEXT_PRESENCE,
    category: "alt_text",
    title: "Alt text presence",
    status: "review",
    severity: "warning",
    summary:
      "An image is included, but no alt text has been entered for this preflight. If the image communicates meaningful information, add an appropriate description when publishing.",
    recommendation:
      "Add alt text that describes the important information or purpose of the image.",
    referenceLabel: "Accessibility best practice",
  };
}

export function checkAltTextPrefix(
  hasImage: boolean,
  altText: string,
): AccessibilityCheckResult {
  if (!hasImage) {
    return notChecked(CHECK_IDS.ALT_TEXT_PREFIX, "Alt text prefix");
  }
  const trimmed = altText.trim();
  if (!trimmed) {
    return notChecked(CHECK_IDS.ALT_TEXT_PREFIX, "Alt text prefix");
  }

  const prefixPattern =
    /^(image of|picture of|photo of|photograph of)\b/i;
  if (!prefixPattern.test(trimmed)) {
    return {
      id: CHECK_IDS.ALT_TEXT_PREFIX,
      category: "alt_text",
      title: "Alt text prefix",
      status: "pass",
      severity: "info",
      summary: 'Alt text does not begin with "image of" or similar phrasing.',
    };
  }

  return {
    id: CHECK_IDS.ALT_TEXT_PREFIX,
    category: "alt_text",
    title: 'Alt text "image of" prefix',
    status: "review",
    severity: "info",
    summary:
      'Alt text begins with phrasing such as "image of". Screen readers often already identify an image, so the description can usually start with meaningful content.',
    recommendation:
      'Remove the prefix and begin with what matters, for example "A woman using a laptop at a desk."',
    referenceLabel: "Accessibility best practice",
  };
}

export function checkAltTextLength(
  hasImage: boolean,
  altText: string,
): AccessibilityCheckResult {
  if (!hasImage) {
    return notChecked(CHECK_IDS.ALT_TEXT_LENGTH, "Alt text length");
  }
  const trimmed = altText.trim();
  if (!trimmed) {
    return notChecked(CHECK_IDS.ALT_TEXT_LENGTH, "Alt text length");
  }

  const words = trimmed.split(/\s+/).filter(Boolean);
  if (
    trimmed.length < ALT_TEXT_CHECK.minMeaningfulLength ||
    words.length < ALT_TEXT_CHECK.minWordCount
  ) {
    return {
      id: CHECK_IDS.ALT_TEXT_LENGTH,
      category: "alt_text",
      title: "Alt text length",
      status: "review",
      severity: "warning",
      summary:
        "Alt text is very short and may not convey enough meaningful information.",
      recommendation:
        "Alt text should be concise enough to understand efficiently while still conveying the image's important purpose or information.",
      referenceLabel: "Accessibility best practice",
    };
  }

  if (trimmed.length > ALT_TEXT_CHECK.maxRecommendedLength) {
    return {
      id: CHECK_IDS.ALT_TEXT_LENGTH,
      category: "alt_text",
      title: "Alt text length",
      status: "review",
      severity: "warning",
      summary:
        "Alt text is quite long. Very long descriptions can be tedious to listen to.",
      recommendation:
        "Consider a concise summary of the most important visual information.",
      referenceLabel: "Accessibility best practice",
    };
  }

  return {
    id: CHECK_IDS.ALT_TEXT_LENGTH,
    category: "alt_text",
    title: "Alt text length",
    status: "pass",
    severity: "info",
    summary: "Alt text length appears within a reasonable range.",
  };
}

export function checkAltTextFilename(
  hasImage: boolean,
  altText: string,
): AccessibilityCheckResult {
  if (!hasImage) {
    return notChecked(CHECK_IDS.ALT_TEXT_FILENAME, "Alt text filename");
  }
  const trimmed = altText.trim();
  if (!trimmed) {
    return notChecked(CHECK_IDS.ALT_TEXT_FILENAME, "Alt text filename");
  }

  if (!looksLikeFilenameAlt(trimmed)) {
    return {
      id: CHECK_IDS.ALT_TEXT_FILENAME,
      category: "alt_text",
      title: "Alt text filename",
      status: "pass",
      severity: "info",
      summary: "Alt text does not appear to be a file name.",
    };
  }

  return {
    id: CHECK_IDS.ALT_TEXT_FILENAME,
    category: "alt_text",
    title: "Alt text looks like a file name",
    status: "fail",
    severity: "error",
    summary:
      "Alt text appears to be a file name rather than a description of the image content.",
    recommendation:
      "Replace the file name with a meaningful description where the image requires alternative text.",
    referenceLabel: "Accessibility best practice",
  };
}

export function checkDuplicateCaptionAlt(
  hasImage: boolean,
  caption: string,
  altText: string,
): AccessibilityCheckResult {
  if (!hasImage) {
    return notChecked(CHECK_IDS.DUPLICATE_CAPTION_ALT, "Caption and alt duplication");
  }
  const alt = altText.trim();
  const cap = caption.trim();
  if (!alt || !cap) {
    return notChecked(CHECK_IDS.DUPLICATE_CAPTION_ALT, "Caption and alt duplication");
  }

  const normAlt = normalizeForComparison(alt);
  const normCap = normalizeForComparison(cap);

  if (normAlt !== normCap) {
    return {
      id: CHECK_IDS.DUPLICATE_CAPTION_ALT,
      category: "alt_text",
      title: "Caption and alt duplication",
      status: "pass",
      severity: "info",
      summary: "Caption and alt text are not identical.",
    };
  }

  return {
    id: CHECK_IDS.DUPLICATE_CAPTION_ALT,
    category: "alt_text",
    title: "Duplicate caption and alt text",
    status: "review",
    severity: "warning",
    summary:
      "Caption and alt text are effectively identical, which may create repetitive screen-reader output.",
    recommendation:
      "Use alt text to describe visual information not already fully conveyed in the caption, when the image is meaningful.",
    referenceLabel: "Accessibility best practice",
  };
}
