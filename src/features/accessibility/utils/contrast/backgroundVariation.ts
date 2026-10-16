import type { RGBColor } from "@/features/accessibility/types/visualAccessibility";

export function backgroundColorSpread(samples: RGBColor[]): number {
  if (samples.length < 2) return 0;
  const avg = {
    r: samples.reduce((s, c) => s + c.r, 0) / samples.length,
    g: samples.reduce((s, c) => s + c.g, 0) / samples.length,
    b: samples.reduce((s, c) => s + c.b, 0) / samples.length,
  };
  const variance =
    samples.reduce((sum, c) => {
      const dr = c.r - avg.r;
      const dg = c.g - avg.g;
      const db = c.b - avg.b;
      return sum + dr * dr + dg * dg + db * db;
    }, 0) / samples.length;
  return Math.sqrt(variance);
}

export function hasSignificantBackgroundVariation(
  samples: RGBColor[],
  threshold = 35,
): boolean {
  return backgroundColorSpread(samples) >= threshold;
}
