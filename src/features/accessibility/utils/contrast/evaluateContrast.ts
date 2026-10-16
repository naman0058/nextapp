import {
  WCAG_AA_LARGE_TEXT,
  WCAG_AA_NORMAL_TEXT,
  WCAG_AAA_LARGE_TEXT,
  WCAG_AAA_NORMAL_TEXT,
  WCAG_NON_TEXT,
} from "@/features/accessibility/constants/wcagContrast";
import type {
  ContrastEvaluation,
  ContrastTextType,
  ContrastVerdict,
  RGBColor,
} from "@/features/accessibility/types/visualAccessibility";
import {
  calculateContrastRatio,
  formatContrastRatio,
} from "@/features/accessibility/utils/contrast/contrastRatio";

function verdict(ratio: number, required: number): ContrastVerdict {
  return ratio >= required ? "pass" : "fail";
}

export function getRequiredRatio(textType: ContrastTextType): number {
  if (textType === "large") return WCAG_AA_LARGE_TEXT;
  if (textType === "non_text") return WCAG_NON_TEXT;
  return WCAG_AA_NORMAL_TEXT;
}

export function evaluateContrast(
  foreground: RGBColor,
  background: RGBColor,
  textType: ContrastTextType,
): ContrastEvaluation {
  const ratio = calculateContrastRatio(foreground, background);
  const requiredRatio = getRequiredRatio(textType);

  const aaNormal = verdict(ratio, WCAG_AA_NORMAL_TEXT);
  const aaLarge = verdict(ratio, WCAG_AA_LARGE_TEXT);
  const aaaNormal = verdict(ratio, WCAG_AAA_NORMAL_TEXT);
  const aaaLarge = verdict(ratio, WCAG_AAA_LARGE_TEXT);

  const primaryVerdict: ContrastVerdict = verdict(ratio, requiredRatio);
  let primaryLabel = "";

  if (textType === "normal") {
    primaryLabel =
      primaryVerdict === "pass"
        ? "PASS — Normal Text AA"
        : "FAIL — Normal Text AA";
  } else if (textType === "large") {
    primaryLabel =
      primaryVerdict === "pass"
        ? "PASS — Large Text AA"
        : "FAIL — Large Text AA";
  } else {
    primaryLabel =
      primaryVerdict === "pass"
        ? "PASS — Non-text UI reference (3:1)"
        : "FAIL — Non-text UI reference (3:1)";
  }

  return {
    ratio,
    displayRatio: formatContrastRatio(ratio),
    aaNormal,
    aaLarge,
    aaaNormal,
    aaaLarge,
    requiredRatio,
    primaryVerdict,
    primaryLabel,
  };
}
