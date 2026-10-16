import { MAX_DOMINANT_COLORS } from "@/features/accessibility/constants/wcagContrast";
import type { RGBColor } from "@/features/accessibility/types/visualAccessibility";
import { rgbToHex } from "@/features/accessibility/utils/contrast/parseColor";

export function extractDominantColorsFromImageData(
  data: ImageData,
  maxColors = MAX_DOMINANT_COLORS,
): RGBColor[] {
  const buckets = new Map<string, RGBColor & { count: number }>();
  const { width, height } = data;
  const step = Math.max(1, Math.floor(Math.sqrt((width * height) / 4000)));

  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      const i = (y * width + x) * 4;
      const r = data.data[i] ?? 0;
      const g = data.data[i + 1] ?? 0;
      const b = data.data[i + 2] ?? 0;
      const key = `${Math.round(r / 16)}-${Math.round(g / 16)}-${Math.round(b / 16)}`;
      const existing = buckets.get(key);
      if (existing) {
        existing.count += 1;
      } else {
        buckets.set(key, { r, g, b, count: 1 });
      }
    }
  }

  return [...buckets.values()]
    .sort((a, b) => b.count - a.count)
    .slice(0, maxColors)
    .map(({ r, g, b }) => ({ r, g, b }));
}

export function dominantColorsToHex(colors: RGBColor[]): string[] {
  return colors.map((c) => rgbToHex(c));
}
