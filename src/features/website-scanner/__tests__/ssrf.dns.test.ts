import { afterEach, describe, expect, it, vi } from "vitest";
import dns from "node:dns/promises";
import { validateScanTargetUrl } from "@/features/website-scanner/server/security/validateScanTarget";

vi.mock("node:dns/promises", () => ({
  default: {
    lookup: vi.fn(),
  },
}));

const lookupMock = vi.mocked(dns.lookup);

describe("validateScanTargetUrl DNS resolution", () => {
  afterEach(() => {
    vi.clearAllMocks();
  });

  it("blocks when any resolved address is private", async () => {
    lookupMock.mockResolvedValue([
      { address: "93.184.216.34", family: 4 },
      { address: "10.0.0.1", family: 4 },
    ] as unknown as Awaited<ReturnType<typeof dns.lookup>>);

    await expect(validateScanTargetUrl("https://dual-stack.example/")).rejects.toMatchObject(
      { code: "BLOCKED_DESTINATION" },
    );
  });

  it("allows when all resolved addresses are public", async () => {
    lookupMock.mockResolvedValue([
      { address: "93.184.216.34", family: 4 },
      { address: "2606:2800:220:1:248:1893:25c8:1946", family: 6 },
    ] as unknown as Awaited<ReturnType<typeof dns.lookup>>);

    const result = await validateScanTargetUrl("https://example.com/");
    expect(result.hostname).toBe("example.com");
  });

  it("fails when DNS returns no records", async () => {
    lookupMock.mockResolvedValue(
      [] as unknown as Awaited<ReturnType<typeof dns.lookup>>,
    );

    await expect(validateScanTargetUrl("https://empty.example/")).rejects.toMatchObject(
      { code: "DNS_FAILURE" },
    );
  });

  it("fails on DNS lookup error", async () => {
    lookupMock.mockRejectedValue(new Error("ENOTFOUND"));

    await expect(validateScanTargetUrl("https://missing.example/")).rejects.toMatchObject(
      { code: "DNS_FAILURE" },
    );
  });
});
