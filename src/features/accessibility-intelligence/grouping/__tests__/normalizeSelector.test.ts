import { describe, expect, it } from "vitest";
import { normalizeSelectorForGrouping } from "@/features/accessibility-intelligence/grouping/normalizeSelectorForGrouping";

describe("normalizeSelectorForGrouping", () => {
  it("strips nth-child and unstable ids", () => {
    expect(
      normalizeSelectorForGrouping("#btn-92831:nth-child(2) > span"),
    ).toContain("#[id]");
    expect(normalizeSelectorForGrouping("#btn-92831:nth-child(2) > span")).not
      .toContain("nth-child");
  });

  it("hashes generated module classes conservatively", () => {
    expect(normalizeSelectorForGrouping(".css-1abc12")).toBe(".[hash]");
    expect(normalizeSelectorForGrouping(".btn-primary")).toBe(".btn-primary");
  });
});
