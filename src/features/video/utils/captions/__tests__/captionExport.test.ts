import { describe, expect, it } from "vitest";
import { generateSRT } from "@/features/video/utils/captions/generateSRT";
import { generateVTT } from "@/features/video/utils/captions/generateVTT";
import { formatSrtTimestamp } from "@/features/video/utils/captions/timestampFormat";
import type { CaptionCue } from "@/features/video/types/captions";

const sampleCues: CaptionCue[] = [
  { id: "1", start: 1.2, end: 4.5, text: "Welcome to our fall\nenrollment event." },
  { id: "2", start: 65, end: 70, text: "Second cue." },
];

describe("timestamp formatting", () => {
  it("formats zero and sub-minute", () => {
    expect(formatSrtTimestamp(0)).toBe("00:00:00,000");
    expect(formatSrtTimestamp(65.123)).toBe("00:01:05,123");
  });

  it("formats hours", () => {
    expect(formatSrtTimestamp(3661.987)).toMatch(/^01:01:01,/);
  });
});

describe("generateSRT", () => {
  it("includes sequence numbers and blank lines", () => {
    const srt = generateSRT(sampleCues);
    expect(srt.startsWith("1\n")).toBe(true);
    expect(srt).toContain("00:00:01,200 --> 00:00:04,500");
    expect(srt).toContain("Welcome to our fall");
    expect(srt.split("\n\n").length).toBeGreaterThan(1);
  });
});

describe("generateVTT", () => {
  it("starts with WEBVTT and uses dot milliseconds", () => {
    const vtt = generateVTT(sampleCues);
    expect(vtt.startsWith("WEBVTT")).toBe(true);
    expect(vtt).toContain("00:00:01.200 --> 00:00:04.500");
  });
});
