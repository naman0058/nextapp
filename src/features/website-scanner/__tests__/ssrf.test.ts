import { describe, expect, it } from "vitest";
import { isBlockedIpString } from "@/features/website-scanner/server/security/isBlockedIp";
import { isBlockedHostname } from "@/features/website-scanner/server/security/hostnameBlocklist";
import { parseAndNormalizeScanUrl } from "@/features/website-scanner/server/security/normalizeScanUrl";
import { validateSubresourceUrl } from "@/features/website-scanner/server/security/validateSubresourceUrl";
import { validateScanTargetUrl } from "@/features/website-scanner/server/security/validateScanTarget";

describe("isBlockedIpString", () => {
  it("blocks private IPv4", () => {
    expect(isBlockedIpString("127.0.0.1")).toBe(true);
    expect(isBlockedIpString("10.0.0.1")).toBe(true);
    expect(isBlockedIpString("172.16.0.1")).toBe(true);
    expect(isBlockedIpString("192.168.1.1")).toBe(true);
    expect(isBlockedIpString("169.254.169.254")).toBe(true);
    expect(isBlockedIpString("0.0.0.0")).toBe(true);
  });

  it("blocks IPv6 loopback and unique local", () => {
    expect(isBlockedIpString("::1")).toBe(true);
    expect(isBlockedIpString("fc00::1")).toBe(true);
    expect(isBlockedIpString("fe80::1")).toBe(true);
  });

  it("allows public IPv4", () => {
    expect(isBlockedIpString("8.8.8.8")).toBe(false);
    expect(isBlockedIpString("93.184.216.34")).toBe(false);
  });

  it("blocks decimal and hex IPv4 literals", () => {
    expect(isBlockedIpString("2130706433")).toBe(true);
    expect(isBlockedIpString("0x7f000001")).toBe(true);
  });

  it("blocks IPv4-mapped loopback strings", () => {
    expect(isBlockedIpString("::ffff:127.0.0.1")).toBe(true);
  });
});

describe("parseAndNormalizeScanUrl", () => {
  it("normalizes bare hostname to https", () => {
    const r = parseAndNormalizeScanUrl("example.com");
    expect("error" in r).toBe(false);
    if (!("error" in r)) {
      expect(r.protocol).toBe("https:");
      expect(r.port).toBe(443);
    }
  });

  it("rejects credentials", () => {
    const r = parseAndNormalizeScanUrl("https://user:pass@example.com/");
    expect("error" in r).toBe(true);
  });

  it("rejects non-standard port", () => {
    const r = parseAndNormalizeScanUrl("https://example.com:3000/");
    expect("error" in r).toBe(true);
  });

  it("rejects file scheme", () => {
    const r = parseAndNormalizeScanUrl("file:///etc/passwd");
    expect("error" in r).toBe(true);
  });

  it("rejects javascript scheme", () => {
    const r = parseAndNormalizeScanUrl("javascript:alert(1)");
    expect("error" in r).toBe(true);
  });
});

describe("isBlockedHostname", () => {
  it("blocks localhost variants", () => {
    expect(isBlockedHostname("localhost")).toBe(true);
    expect(isBlockedHostname("localhost.")).toBe(true);
    expect(isBlockedHostname("foo.localhost")).toBe(true);
    expect(isBlockedHostname("internal.local")).toBe(true);
    expect(isBlockedHostname("[::ffff:127.0.0.1]")).toBe(true);
  });
});

describe("validateScanTargetUrl (hostname literals)", () => {
  it("rejects private IP hostnames without DNS", async () => {
    await expect(validateScanTargetUrl("http://10.0.0.1/")).rejects.toMatchObject({
      code: "BLOCKED_DESTINATION",
    });
  });

  it("rejects metadata IP hostname", async () => {
    await expect(
      validateScanTargetUrl("http://169.254.169.254/latest/meta-data/"),
    ).rejects.toMatchObject({ code: "BLOCKED_DESTINATION" });
  });
});

describe("validateSubresourceUrl", () => {
  it("returns false for private and metadata targets", async () => {
    expect(await validateSubresourceUrl("http://10.0.0.1/x")).toBe(false);
    expect(await validateSubresourceUrl("http://172.16.0.1/x")).toBe(false);
    expect(
      await validateSubresourceUrl("http://169.254.169.254/latest/meta-data/"),
    ).toBe(false);
  });

  it("returns false for blocked schemes", async () => {
    expect(await validateSubresourceUrl("file:///etc/passwd")).toBe(false);
  });
});
