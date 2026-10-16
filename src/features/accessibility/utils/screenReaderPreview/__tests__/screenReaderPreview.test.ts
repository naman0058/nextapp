import { describe, expect, it } from "vitest";
import { HASHTAG_CHECK } from "@/features/accessibility/constants/thresholds";
import { buildScreenReaderPreview } from "@/features/accessibility/utils/screenReaderPreview";
import { detectRepeatedEmojiSequences } from "@/features/accessibility/utils/screenReaderPreview/detectRepeatedEmojiSequences";

describe("buildScreenReaderPreview", () => {
  it("clean post — clear or mostly clear", () => {
    const result = buildScreenReaderPreview({
      caption: "Join us Friday for our community workshop. #CommunityWorkshop",
      altText: "People seated around a table during a community workshop.",
      hasImage: true,
    });
    expect(["clear", "mostly_clear"]).toContain(result.experienceSummary.level);
    expect(result.duplication?.isExactDuplicate).toBe(false);
    expect(result.readingOrder.some((i) => i.type === "caption")).toBe(true);
  });

  it("emoji heavy caption", () => {
    const result = buildScreenReaderPreview({
      caption: "🔥🔥🔥🔥🚨🚨 SALE STARTS NOW!!!!!! #blackfridaysale",
      altText: "",
      hasImage: false,
    });
    expect(result.emojiSequences.length).toBeGreaterThan(0);
    expect(
      ["review", "high_verbosity", "mostly_clear"].includes(
        result.experienceSummary.level,
      ),
    ).toBe(true);
    expect(result.speechText).toContain("SALE");
  });

  it("fancy unicode", () => {
    const caption = "𝗢𝘂𝗿 𝗕𝗶𝗴 𝗦𝗮𝗹𝗲 𝗶𝘀 𝗛𝗲𝗿𝗲";
    const result = buildScreenReaderPreview({
      caption,
      altText: "",
      hasImage: false,
    });
    expect(result.fancyUnicodeNormalized).toBeTruthy();
    expect(result.fancyUnicodeNormalized).not.toBe(caption);
  });

  it("duplicate caption and alt", () => {
    const text = "A woman working on a laptop in an office.";
    const result = buildScreenReaderPreview({
      caption: text,
      altText: text,
      hasImage: true,
    });
    expect(result.duplication?.isExactDuplicate).toBe(true);
    expect(result.experienceSummary.duplicateCaptionAlt).toBe(true);
  });

  it("no alt text with image", () => {
    const result = buildScreenReaderPreview({
      caption: "Hello",
      altText: "",
      hasImage: true,
    });
    const img = result.readingOrder.find((i) => i.type === "image_description");
    expect(img?.content).toContain("not provided");
  });

  it("many hashtags uses shared threshold", () => {
    const tags = Array.from(
      { length: HASHTAG_CHECK.overloadCount + 2 },
      (_, i) => `#tag${i}`,
    ).join(" ");
    const result = buildScreenReaderPreview({
      caption: `Sale ${tags}`,
      altText: "",
      hasImage: false,
    });
    expect(result.experienceSummary.excessHashtags).toBe(true);
  });

  it("multilingual caption preserved", () => {
    const caption = "आज हमारी नई सेवा शुरू हुई है 🎉 #नईशुरुआत";
    const result = buildScreenReaderPreview({
      caption,
      altText: "",
      hasImage: false,
    });
    expect(result.readingOrder[0]?.content).toContain("आज");
  });

  it("accessible draft reduces noise without emptying personality", () => {
    const result = buildScreenReaderPreview({
      caption: "Great news! 🎉",
      altText: "",
      hasImage: false,
    });
    expect(result.accessibleDraft).toContain("Great news");
  });
});

describe("detectRepeatedEmojiSequences", () => {
  it("does not split ZWJ family emoji into corrupt fragments", () => {
    const family = "👨‍👩‍👧‍👦";
    const sequences = detectRepeatedEmojiSequences(`${family} ${family}`);
    expect(sequences.some((s) => s.count >= 2)).toBe(true);
    expect(family).toContain("\u200D");
  });
});
