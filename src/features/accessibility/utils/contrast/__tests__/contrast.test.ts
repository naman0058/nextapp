import { describe, expect, it } from "vitest";
import {
  calculateContrastRatio,
  evaluateContrast,
  formatContrastRatio,
  parseHexColor,
  suggestAccessibleForeground,
} from "@/features/accessibility/utils/contrast";

describe("contrast utilities", () => {
  it("calculates 21:1 for black on white", () => {
    const fg = parseHexColor("#000000");
    const bg = parseHexColor("#FFFFFF");
    const ratio = calculateContrastRatio(fg, bg);
    expect(ratio).toBeCloseTo(21, 1);
  });

  it("calculates 1:1 for same color", () => {
    const c = parseHexColor("#777777");
    expect(calculateContrastRatio(c, c)).toBeCloseTo(1, 5);
  });

  it("fails AA normal below 4.5 using raw precision", () => {
    const fg = parseHexColor("#888888");
    const bg = parseHexColor("#FFFFFF");
    const evaluation = evaluateContrast(fg, bg, "normal");
    expect(evaluation.ratio).toBeLessThan(4.5);
    expect(evaluation.primaryVerdict).toBe("fail");
    expect(formatContrastRatio(4.499)).toBe("4.50:1");
    expect(4.499 >= 4.5).toBe(false);
  });

  it("parses shorthand hex", () => {
    expect(parseHexColor("#fff")).toEqual({ r: 255, g: 255, b: 255 });
  });

  it("rejects invalid hex", () => {
    expect(() => parseHexColor("#GGGGGG")).toThrow();
    expect(() => parseHexColor("12345")).toThrow();
  });

  it("suggests compliant foreground on white", () => {
    const fg = parseHexColor("#888888");
    const bg = parseHexColor("#FFFFFF");
    const suggestion = suggestAccessibleForeground(fg, bg, 4.5);
    expect(suggestion).not.toBeNull();
    expect(suggestion!.ratio).toBeGreaterThanOrEqual(4.5);
  });
});
