import { describe, expect, it } from "vitest";
import { buildAiInputFingerprint } from "@/features/accessibility/utils/client/aiInputFingerprint";

describe("buildAiInputFingerprint", () => {
  it("returns null without a file", () => {
    expect(
      buildAiInputFingerprint({
        platform: "instagram",
        caption: "Hi",
        altText: "",
        file: null,
      }),
    ).toBeNull();
  });

  it("changes when caption changes", () => {
    const file = new File(["x"], "a.png", { type: "image/png" });
    const base = {
      platform: "instagram" as const,
      altText: "",
      file,
    };
    const a = buildAiInputFingerprint({ ...base, caption: "One" });
    const b = buildAiInputFingerprint({ ...base, caption: "Two" });
    expect(a).not.toBe(b);
  });

  it("is stable for identical inputs", () => {
    const file = new File(["x"], "a.png", { type: "image/png" });
    const opts = {
      platform: "instagram" as const,
      caption: "Same",
      altText: "Alt",
      file,
    };
    expect(buildAiInputFingerprint(opts)).toBe(buildAiInputFingerprint(opts));
  });
});
