import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const { getSharedBrowser } = vi.hoisted(() => ({
  getSharedBrowser: vi.fn(),
}));

vi.mock("@/features/website-scanner/server/playwright/browserPool", () => ({
  getSharedBrowser,
}));

import {
  checkChromiumReady,
  resetChromiumReadyState,
} from "../chromiumReady";

describe("checkChromiumReady", () => {
  beforeEach(() => {
    resetChromiumReadyState();
    getSharedBrowser.mockReset();
  });

  afterEach(() => {
    resetChromiumReadyState();
  });

  it("returns true when shared browser is connected", async () => {
    getSharedBrowser.mockResolvedValue({
      isConnected: () => true,
    });
    await expect(checkChromiumReady()).resolves.toBe(true);
    expect(getSharedBrowser).toHaveBeenCalledOnce();
  });

  it("returns false when browser launch fails", async () => {
    getSharedBrowser.mockRejectedValue(new Error("launch failed"));
    await expect(checkChromiumReady()).resolves.toBe(false);
  });

  it("returns false when browser is not connected", async () => {
    getSharedBrowser.mockResolvedValue({
      isConnected: () => false,
    });
    await expect(checkChromiumReady()).resolves.toBe(false);
  });

  it("uses cache within 60 seconds without second browser call", async () => {
    getSharedBrowser.mockResolvedValue({
      isConnected: () => true,
    });
    await checkChromiumReady();
    await checkChromiumReady();
    expect(getSharedBrowser).toHaveBeenCalledOnce();
  });

  it("concurrent probes share one in-flight browser launch", async () => {
    let resolveBrowser!: (browser: { isConnected: () => boolean }) => void;
    getSharedBrowser.mockImplementation(
      () =>
        new Promise((resolve) => {
          resolveBrowser = resolve;
        }),
    );
    const p1 = checkChromiumReady();
    const p2 = checkChromiumReady();
    resolveBrowser({ isConnected: () => true });
    await expect(Promise.all([p1, p2])).resolves.toEqual([true, true]);
    expect(getSharedBrowser).toHaveBeenCalledOnce();
  });

  it("caches failure briefly without exposing errors via HTTP layer", async () => {
    getSharedBrowser.mockRejectedValue(new Error("secret browser detail"));
    await expect(checkChromiumReady()).resolves.toBe(false);
    getSharedBrowser.mockClear();
    await expect(checkChromiumReady()).resolves.toBe(false);
    expect(getSharedBrowser).not.toHaveBeenCalled();
  });
});
