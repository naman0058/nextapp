import { describe, expect, it } from "vitest";
import { CHECK_IDS } from "@/features/accessibility/constants/checkIds";
import { runPreflightAnalysis } from "@/features/accessibility/utils/runPreflightAnalysis";

function statusFor(id: string, input: Parameters<typeof runPreflightAnalysis>[0]) {
  return runPreflightAnalysis(input).checks.find((c) => c.id === id)?.status;
}

const base = {
  platform: "instagram" as const,
  hasImage: false,
  altText: "",
};

describe("runPreflightAnalysis", () => {
  it("Case A: normal caption mostly passes", () => {
    const caption =
      "Join us Friday for our community workshop. #CommunityWorkshop";
    const result = runPreflightAnalysis({ ...base, caption });
    expect(result.score).toBeGreaterThanOrEqual(75);
    expect(statusFor(CHECK_IDS.EXCESSIVE_CAPS, { ...base, caption })).toBe(
      "pass",
    );
  });

  it("Case B: emoji, caps, punctuation, hashtag issues", () => {
    const caption = "🔥🔥🔥🔥 OUR BIGGEST SALE!!!!!! #blackfridaysale";
    const result = runPreflightAnalysis({ ...base, caption });
    expect(statusFor(CHECK_IDS.CONSECUTIVE_EMOJI, { ...base, caption })).toBe(
      "review",
    );
    expect(statusFor(CHECK_IDS.EXCESSIVE_CAPS, { ...base, caption })).toBe(
      "review",
    );
    expect(statusFor(CHECK_IDS.REPEATED_PUNCTUATION, { ...base, caption })).toBe(
      "review",
    );
    expect(statusFor(CHECK_IDS.HASHTAG_READABILITY, { ...base, caption })).toBe(
      "review",
    );
    expect(result.score).toBeLessThan(90);
  });

  it("Case C: fancy Unicode", () => {
    const caption = "𝗢𝘂𝗿 𝗻𝗲𝘄 𝗽𝗿𝗼𝗱𝘂𝗰𝘁 𝗶𝘀 𝗵𝗲𝗿𝗲";
    expect(statusFor(CHECK_IDS.FANCY_UNICODE, { ...base, caption })).toMatch(
      /fail|review/,
    );
  });

  it("Case D: image uploaded, alt blank", () => {
    expect(
      statusFor(CHECK_IDS.ALT_TEXT_PRESENCE, {
        ...base,
        caption: "Photo post",
        hasImage: true,
        altText: "",
      }),
    ).toBe("review");
  });

  it("Case E: alt looks like filename", () => {
    expect(
      statusFor(CHECK_IDS.ALT_TEXT_FILENAME, {
        ...base,
        caption: "Post",
        hasImage: true,
        altText: "IMG_8348.jpg",
      }),
    ).toBe("fail");
  });

  it("Case F: alt image-of prefix", () => {
    expect(
      statusFor(CHECK_IDS.ALT_TEXT_PREFIX, {
        ...base,
        caption: "Post",
        hasImage: true,
        altText: "Image of a woman using a laptop.",
      }),
    ).toBe("review");
  });

  it("Case G: duplicate caption and alt", () => {
    const text = "Community workshop on Friday.";
    expect(
      statusFor(CHECK_IDS.DUPLICATE_CAPTION_ALT, {
        ...base,
        caption: text,
        hasImage: true,
        altText: text,
      }),
    ).toBe("review");
  });

  it("Case H: generic link language", () => {
    expect(
      statusFor(CHECK_IDS.GENERIC_LINK_LANGUAGE, {
        ...base,
        caption: "Click here: https://example.com",
      }),
    ).toBe("review");
  });

  it("preserves acronyms in caps check", () => {
    const caption =
      "NASA and the USA CEO discussed WCAG FAQ items at the ADA meeting.";
    expect(statusFor(CHECK_IDS.EXCESSIVE_CAPS, { ...base, caption })).toBe(
      "pass",
    );
  });

  it("does not flag normal celebratory caption as excessive caps", () => {
    expect(
      statusFor(CHECK_IDS.EXCESSIVE_CAPS, {
        ...base,
        caption: "Great news! 🎉",
      }),
    ).toBe("pass");
  });

  it("does not over-flag single hashtag SEO", () => {
    expect(
      statusFor(CHECK_IDS.HASHTAG_OVERLOAD, {
        ...base,
        caption: "#SEO",
      }),
    ).not.toBe("fail");
  });

  it("does not over-flag moderate punctuation", () => {
    expect(
      statusFor(CHECK_IDS.REPEATED_PUNCTUATION, {
        ...base,
        caption: "Thanks!!!",
      }),
    ).not.toBe("fail");
  });

  it("text-only post does not require alt text", () => {
    expect(
      statusFor(CHECK_IDS.ALT_TEXT_PRESENCE, {
        ...base,
        caption: "Text only",
        hasImage: false,
        altText: "",
      }),
    ).toBe("not_checked");
  });
});
