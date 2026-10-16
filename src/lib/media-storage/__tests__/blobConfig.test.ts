import { describe, expect, it, beforeEach, afterEach, vi } from "vitest";

vi.mock("server-only", () => ({}));
import {
  hasLegacyBlobReadWriteToken,
  isVercelBlobOidcConfigured,
  isVercelBlobStorageConfigured,
} from "@/lib/media-storage/blobConfig";

describe("blobConfig", () => {
  beforeEach(() => {
    vi.unstubAllEnvs();
  });

  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("detects legacy BLOB_READ_WRITE_TOKEN", () => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "vercel_blob_rw_test");
    expect(hasLegacyBlobReadWriteToken()).toBe(true);
    expect(isVercelBlobStorageConfigured()).toBe(true);
  });

  it("detects Vercel OIDC via BLOB_STORE_ID without token", () => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
    vi.stubEnv("VERCEL", "1");
    vi.stubEnv("BLOB_STORE_ID", "store_abc123");
    expect(hasLegacyBlobReadWriteToken()).toBe(false);
    expect(isVercelBlobOidcConfigured()).toBe(true);
    expect(isVercelBlobStorageConfigured()).toBe(true);
  });

  it("does not treat local dev as OIDC without token or store id", () => {
    vi.stubEnv("BLOB_READ_WRITE_TOKEN", "");
    vi.stubEnv("VERCEL", "");
    vi.stubEnv("BLOB_STORE_ID", "");
    expect(isVercelBlobOidcConfigured()).toBe(false);
    expect(isVercelBlobStorageConfigured()).toBe(false);
  });
});
