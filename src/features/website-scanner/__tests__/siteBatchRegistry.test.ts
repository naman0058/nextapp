import { describe, expect, it } from "vitest";
import {
  registerSiteBatch,
  validateBatchPageRequest,
} from "@/features/website-scanner/server/batch/siteBatchRegistry";

describe("siteBatchRegistry", () => {
  it("rejects more than 25 pages", () => {
    const urls = Array.from({ length: 26 }, (_, i) => `https://example.com/p${i}`);
    const reg = registerSiteBatch({
      batchId: "b1",
      origin: "https://example.com",
      urls,
      viewportMode: "desktop",
    });
    expect(reg.ok).toBe(false);
  });

  it("validates registered url", () => {
    registerSiteBatch({
      batchId: "b2",
      origin: "https://example.com",
      urls: ["https://example.com/a"],
      viewportMode: "desktop",
    });
    const v = validateBatchPageRequest({
      batchId: "b2",
      url: "https://example.com/a",
      pageIndex: 0,
      pageTotal: 1,
      viewportMode: "desktop",
    });
    expect(v.ok).toBe(true);
  });
});
