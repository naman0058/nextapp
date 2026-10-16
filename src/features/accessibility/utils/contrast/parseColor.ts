import type { RGBColor } from "@/features/accessibility/types/visualAccessibility";

export class ColorParseError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ColorParseError";
  }
}

function parseHexChannel(value: string): number {
  const parsed = Number.parseInt(value, 16);
  if (Number.isNaN(parsed)) {
    throw new ColorParseError("Invalid hex color.");
  }
  return parsed;
}

export function parseHexColor(input: string): RGBColor {
  const trimmed = input.trim();
  if (!trimmed.startsWith("#")) {
    throw new ColorParseError("Hex colors must start with #.");
  }

  const hex = trimmed.slice(1);
  if (hex.length === 3) {
    return {
      r: parseHexChannel(hex[0] + hex[0]),
      g: parseHexChannel(hex[1] + hex[1]),
      b: parseHexChannel(hex[2] + hex[2]),
    };
  }

  if (hex.length === 6) {
    return {
      r: parseHexChannel(hex.slice(0, 2)),
      g: parseHexChannel(hex.slice(2, 4)),
      b: parseHexChannel(hex.slice(4, 6)),
    };
  }

  throw new ColorParseError("Hex must be #RGB or #RRGGBB.");
}

export function rgbToHex(color: RGBColor): string {
  const toHex = (n: number) =>
    Math.max(0, Math.min(255, Math.round(n)))
      .toString(16)
      .padStart(2, "0");
  return `#${toHex(color.r)}${toHex(color.g)}${toHex(color.b)}`.toUpperCase();
}

export function formatRgb(color: RGBColor): string {
  return `RGB(${color.r}, ${color.g}, ${color.b})`;
}
