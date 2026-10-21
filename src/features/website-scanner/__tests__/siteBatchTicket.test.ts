import { afterEach, describe, expect, it, vi } from "vitest";
import {
  createSiteBatchTicket,
  validateSiteBatchTicket,
} from "@/features/website-scanner/server/batch/siteBatchTicket";
import type { RegisteredSiteBatch } from "@/features/website-scanner/server/batch/siteBatchRegistry";
import { safeCrawlKey } from "@/features/website-scanner/utils/crawl/safeCrawlKey";

const batch: RegisteredSiteBatch = {
  batchId: "batch-1",
  origin: "https://example.com",
  urls: ["https://example.com/a"],
  urlKeys: new Set([safeCrawlKey("https://example.com/a")]),
  pageTotal: 1,
  viewportMode: "desktop",
  expiresAt: Date.now() + 60_000,
};

describe("siteBatchTicket", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("validates ticket without in-memory registry", () => {
    vi.stubEnv("NODE_ENV", "test");
    const ticket = createSiteBatchTicket(batch);
    const v = validateSiteBatchTicket({
      batchId: "batch-1",
      url: "https://example.com/a",
      pageIndex: 0,
      pageTotal: 1,
      viewportMode: "desktop",
      batchTicket: ticket,
    });
    expect(v.ok).toBe(true);
  });

  it("rejects tampered ticket", () => {
    vi.stubEnv("NODE_ENV", "test");
    const ticket = createSiteBatchTicket(batch);
    const v = validateSiteBatchTicket({
      batchId: "batch-1",
      url: "https://example.com/other",
      pageIndex: 0,
      pageTotal: 1,
      viewportMode: "desktop",
      batchTicket: ticket,
    });
    expect(v.ok).toBe(false);
  });
});
