import { afterEach, describe, expect, it, vi } from "vitest";
import { assertLoopbackBypassDisabledInProduction } from "@/features/website-scanner/server/security/testBypass";

describe("assertLoopbackBypassDisabledInProduction", () => {
  afterEach(() => {
    vi.unstubAllEnvs();
  });

  it("throws when production and loopback bypass enabled", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("WEBSITE_SCANNER_TEST_ALLOW_LOOPBACK", "1");
    expect(() => assertLoopbackBypassDisabledInProduction()).toThrow(
      /must not be enabled in production/,
    );
  });

  it("allows production when bypass is unset", () => {
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("WEBSITE_SCANNER_TEST_ALLOW_LOOPBACK", "");
    expect(() => assertLoopbackBypassDisabledInProduction()).not.toThrow();
  });

});
