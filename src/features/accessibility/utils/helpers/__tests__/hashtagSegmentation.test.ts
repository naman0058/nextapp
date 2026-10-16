import { describe, expect, it } from "vitest";
import { suggestHashtagReadability } from "@/features/accessibility/utils/helpers/hashtagSegmentation";

describe("hashtagSegmentation", () => {
  it("does not auto-fix ambiguous therapistfinder tag", () => {
    const result = suggestHashtagReadability("#therapistfinder");
    expect(result?.confident).toBe(false);
  });

  it("confidently segments known compound tags", () => {
    const result = suggestHashtagReadability("#digitalmarketing");
    expect(result?.confident).toBe(true);
    expect(result?.suggested).toBe("#DigitalMarketing");
  });
});
