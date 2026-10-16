import { describe, expect, it } from "vitest";
import { parseAnalyzeImageRequest } from "@/features/accessibility/server/parseAnalyzeImageRequest";

describe("parseAnalyzeImageRequest", () => {
  it("rejects SVG", async () => {
    const form = new FormData();
    form.append(
      "image",
      new File(["<svg></svg>"], "test.svg", { type: "image/svg+xml" }),
    );
    form.append("platform", "instagram");
    form.append("caption", "Hello");

    const result = await parseAnalyzeImageRequest(form);
    expect(result).toMatchObject({ status: 400 });
  });

  it("accepts valid png upload", async () => {
    const form = new FormData();
    form.append(
      "image",
      new File([new Uint8Array([1, 2, 3])], "test.png", {
        type: "image/png",
      }),
    );
    form.append("platform", "instagram");
    form.append("caption", "Hello");

    const result = await parseAnalyzeImageRequest(form);
    expect(result).not.toHaveProperty("status");
  });
});
