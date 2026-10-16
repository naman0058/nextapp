import { describe, expect, it } from "vitest";
import { websiteScanPageRequestCost } from "@/features/website-scanner/server/websiteScanRateLimitCost";

describe("websiteScanPageRequestCost", () => {
  it("weights compare batches highest", () => {
    expect(
      websiteScanPageRequestCost({
        pageTotal: 5,
        viewportMode: "compare",
      }),
    ).toBe(3);
  });

  it("weights multi-page site scans above single page", () => {
    expect(
      websiteScanPageRequestCost({ pageTotal: 3, viewportMode: "desktop" }),
    ).toBe(2);
    expect(websiteScanPageRequestCost(undefined)).toBe(1);
  });
});
