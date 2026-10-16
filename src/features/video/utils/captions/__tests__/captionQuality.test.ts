import { describe, expect, it } from "vitest";
import { analyzeCaptionQuality } from "@/features/video/utils/captions/analyzeCaptionQuality";
import type { CaptionCue } from "@/features/video/types/captions";

describe("analyzeCaptionQuality", () => {
  it("flags invalid times and overlap", () => {
    const cues: CaptionCue[] = [
      { id: "a", start: 0, end: 5, text: "Hello world" },
      { id: "b", start: 4, end: 3, text: "Bad" },
    ];
    const result = analyzeCaptionQuality(cues, 60);
    expect(result.error).toBeGreaterThan(0);
    expect(result.findings.some((f) => f.title === "Invalid timing")).toBe(true);
  });

  it("flags fast reading speed", () => {
    const cues: CaptionCue[] = [
      {
        id: "c",
        start: 0,
        end: 1,
        text: "This is a very long line of caption text for speed test",
      },
    ];
    const result = analyzeCaptionQuality(cues, 60);
    expect(result.findings.some((f) => f.title === "Fast reading speed")).toBe(true);
  });
});
