import { describe, expect, it } from "vitest";
import {
  parseWhisperVerboseJson,
  parseDiarizedJson,
} from "@/features/video/server/parseTranscriptionResponse";

describe("parseWhisperVerboseJson", () => {
  it("parses words and segments", () => {
    const result = parseWhisperVerboseJson({
      text: "Hello world",
      words: [
        { word: "Hello", start: 0, end: 0.5 },
        { word: "world", start: 0.5, end: 1 },
      ],
      segments: [{ start: 0, end: 1, text: "Hello world" }],
    });
    expect(result.fullText).toBe("Hello world");
    expect(result.words).toHaveLength(2);
    expect(result.segments).toHaveLength(1);
  });
});

describe("parseDiarizedJson", () => {
  it("parses speaker segments", () => {
    const result = parseDiarizedJson({
      segments: [
        { start: 0, end: 2, text: "Hi", speaker: "A" },
        { start: 2, end: 4, text: "There", speaker: "B" },
      ],
    });
    expect(result.mode).toBe("diarize");
    expect(result.segments[0]?.speaker).toBe("A");
    expect(result.words.length).toBeGreaterThan(0);
  });
});
