import type { RGBColor } from "@/features/accessibility/types/visualAccessibility";
import { relativeLuminance } from "@/features/accessibility/utils/contrast/luminance";

export function calculateContrastRatio(
  foreground: RGBColor,
  background: RGBColor,
): number {
  const l1 = relativeLuminance(foreground);
  const l2 = relativeLuminance(background);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export function formatContrastRatio(ratio: number): string {
  const clamped = Math.max(1, Math.min(21, ratio));
  return `${clamped.toFixed(2)}:1`;
}
