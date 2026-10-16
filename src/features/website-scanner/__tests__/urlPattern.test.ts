import { describe, expect, it } from "vitest";
import { deriveUrlPattern } from "@/features/website-scanner/utils/urlPatterns/deriveUrlPattern";
import { buildUrlPatternGroups } from "@/features/website-scanner/utils/urlPatterns/buildUrlPatternGroups";

describe("deriveUrlPattern", () => {
  it("groups product slugs", () => {
    expect(deriveUrlPattern("https://shop.test/products/red-shirt")).toContain(
      ":slug",
    );
    expect(deriveUrlPattern("https://shop.test/about")).toBe("/about");
    expect(deriveUrlPattern("https://shop.test/contact")).toBe("/contact");
  });
});

describe("buildUrlPatternGroups", () => {
  it("groups repeated product URLs", () => {
    const groups = buildUrlPatternGroups([
      {
        url: "https://shop.test/products/red-shirt",
        normalizedKey: "a",
        source: "sitemap",
      },
      {
        url: "https://shop.test/products/blue-shirt",
        normalizedKey: "b",
        source: "sitemap",
      },
    ]);
    expect(groups.some((g) => g.urlCount >= 2)).toBe(true);
  });
});
