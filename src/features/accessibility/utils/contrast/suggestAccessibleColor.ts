import type { RGBColor } from "@/features/accessibility/types/visualAccessibility";
import { calculateContrastRatio } from "@/features/accessibility/utils/contrast/contrastRatio";
import { rgbToHex } from "@/features/accessibility/utils/contrast/parseColor";

export type ColorSuggestion = {
  original: RGBColor;
  suggested: RGBColor;
  suggestedHex: string;
  ratio: number;
};

function mixChannel(from: number, to: number, t: number): number {
  return Math.round(from + (to - from) * t);
}

function mixColors(a: RGBColor, b: RGBColor, t: number): RGBColor {
  return {
    r: mixChannel(a.r, b.r, t),
    g: mixChannel(a.g, b.g, t),
    b: mixChannel(a.b, b.b, t),
  };
}

function findCompliantForeground(
  foreground: RGBColor,
  background: RGBColor,
  requiredRatio: number,
  toward: RGBColor,
): ColorSuggestion | null {
  for (let step = 1; step <= 100; step++) {
    const candidate = mixColors(foreground, toward, step / 100);
    const ratio = calculateContrastRatio(candidate, background);
    if (ratio >= requiredRatio) {
      return {
        original: foreground,
        suggested: candidate,
        suggestedHex: rgbToHex(candidate),
        ratio,
      };
    }
  }
  return null;
}

function findCompliantBackground(
  foreground: RGBColor,
  background: RGBColor,
  requiredRatio: number,
  toward: RGBColor,
): ColorSuggestion | null {
  for (let step = 1; step <= 100; step++) {
    const candidate = mixColors(background, toward, step / 100);
    const ratio = calculateContrastRatio(foreground, candidate);
    if (ratio >= requiredRatio) {
      return {
        original: background,
        suggested: candidate,
        suggestedHex: rgbToHex(candidate),
        ratio,
      };
    }
  }
  return null;
}

export function suggestAccessibleForeground(
  foreground: RGBColor,
  background: RGBColor,
  requiredRatio: number,
): ColorSuggestion | null {
  const black: RGBColor = { r: 0, g: 0, b: 0 };
  const white: RGBColor = { r: 255, g: 255, b: 255 };
  return (
    findCompliantForeground(foreground, background, requiredRatio, black) ??
    findCompliantForeground(foreground, background, requiredRatio, white)
  );
}

export function suggestAccessibleBackground(
  foreground: RGBColor,
  background: RGBColor,
  requiredRatio: number,
): ColorSuggestion | null {
  const black: RGBColor = { r: 0, g: 0, b: 0 };
  const white: RGBColor = { r: 255, g: 255, b: 255 };
  return (
    findCompliantBackground(foreground, background, requiredRatio, black) ??
    findCompliantBackground(foreground, background, requiredRatio, white)
  );
}
