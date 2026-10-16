import { CHECK_IDS } from "@/features/accessibility/constants/checkIds";
import type { AccessibilityCheckResult } from "@/features/accessibility/types/preflight";
import { findGenericLinkPhrases } from "@/features/accessibility/utils/helpers/linkHelpers";

export function checkGenericLinkLanguage(
  caption: string,
): AccessibilityCheckResult {
  const trimmed = caption.trim();
  if (!trimmed) {
    return {
      id: CHECK_IDS.GENERIC_LINK_LANGUAGE,
      category: "links",
      title: "Link description language",
      status: "not_checked",
      severity: "info",
      summary: "No caption text to evaluate for link language.",
    };
  }

  const matched = findGenericLinkPhrases(trimmed).length > 0;

  if (!matched) {
    return {
      id: CHECK_IDS.GENERIC_LINK_LANGUAGE,
      category: "links",
      title: "Link description language",
      status: "pass",
      severity: "info",
      summary: "No generic standalone link phrases detected.",
    };
  }

  return {
    id: CHECK_IDS.GENERIC_LINK_LANGUAGE,
    category: "links",
    title: "Generic link language",
    status: "review",
    severity: "warning",
    summary:
      'Phrases such as "click here" or "read more here" may not describe the link destination when read out of context.',
    recommendation:
      'Use descriptive link text such as "Read the event registration details" rather than "Click here".',
    referenceLabel: "WCAG 2.4.4 (Link Purpose)",
  };
}
