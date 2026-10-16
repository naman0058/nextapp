import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  clearAllPublishingConfirmations,
  loadPublishingConfirmations,
  upsertPublishingConfirmation,
} from "@/features/accessibility/utils/publishingConfirmationsSession";

describe("publishingConfirmationsSession", () => {
  const memory = new Map<string, string>();

  beforeEach(() => {
    memory.clear();
    vi.stubGlobal("sessionStorage", {
      getItem: (key: string) => memory.get(key) ?? null,
      setItem: (key: string, value: string) => {
        memory.set(key, value);
      },
      removeItem: (key: string) => {
        memory.delete(key);
      },
    });
  });

  afterEach(() => {
    clearAllPublishingConfirmations();
    vi.unstubAllGlobals();
  });

  it("creates and reads confirmations per platform", () => {
    upsertPublishingConfirmation("instagram", "confirm-final-review", true);
    expect(loadPublishingConfirmations("instagram")["confirm-final-review"]).toBe(
      true,
    );
    expect(loadPublishingConfirmations("facebook")["confirm-final-review"]).toBe(
      undefined,
    );
  });

  it("clears all platforms", () => {
    upsertPublishingConfirmation("x", "confirm-hashtags", true);
    clearAllPublishingConfirmations();
    expect(loadPublishingConfirmations("x")).toEqual({});
  });
});
