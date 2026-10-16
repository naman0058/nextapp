import { CHECK_IDS } from "@/features/accessibility/constants/checkIds";
import type { AccessibilityCheckResult } from "@/features/accessibility/types/preflight";
import {
  hasFancyUnicode,
  normalizeFancyUnicode,
} from "@/features/accessibility/utils/helpers/textHelpers";

export function checkFancyUnicode(caption: string): AccessibilityCheckResult {
  if (!hasFancyUnicode(caption)) {
    return {
      id: CHECK_IDS.FANCY_UNICODE,
      category: "readability",
      title: "Styled Unicode text",
      status: "pass",
      severity: "info",
      summary: "No decorative mathematical/styled Unicode letters detected.",
    };
  }

  const { normalized, changed } = normalizeFancyUnicode(caption);
  const status = changed ? "fail" : "review";
  const severity = changed ? "error" : "warning";

  return {
    id: CHECK_IDS.FANCY_UNICODE,
    category: "readability",
    title: "Fancy Unicode / styled text",
    status,
    severity,
    summary:
      "Decorative Unicode characters (styled “fancy” letters) were detected. They can be read inconsistently by assistive technology and may not copy or search reliably.",
    recommendation:
      "Use standard Unicode letters and platform styling where available.",
    referenceLabel: "Accessibility best practice",
    autoFix: changed
      ? {
          fixId: "fancy-unicode-normalize",
          label: "Convert styled letters to standard text",
          previewCaption: normalized,
        }
      : undefined,
  };
}
