import { allowLoopbackForTests } from "@/features/website-scanner/server/security/testBypass";

const ALLOWED_PROTOCOLS = new Set(["http:", "https:"]);
const ALLOWED_PORTS = new Set([80, 443]);

export type NormalizedScanUrl = {
  href: string;
  origin: string;
  hostname: string;
  port: number;
  protocol: string;
};

export function normalizeUserUrlInput(input: string): string {
  let trimmed = input.trim();
  if (!trimmed) return trimmed;
  if (!/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    trimmed = `https://${trimmed}`;
  }
  return trimmed;
}

export function parseAndNormalizeScanUrl(
  input: string,
): NormalizedScanUrl | { error: string } {
  const normalized = normalizeUserUrlInput(input);
  let parsed: URL;
  try {
    parsed = new URL(normalized);
  } catch {
    return { error: "Enter a valid website URL." };
  }

  if (!ALLOWED_PROTOCOLS.has(parsed.protocol)) {
    return { error: "Only http and https URLs are supported." };
  }

  if (parsed.username || parsed.password) {
    return {
      error: "URLs with embedded credentials are not supported.",
    };
  }

  const port =
    parsed.port === ""
      ? parsed.protocol === "https:"
        ? 443
        : 80
      : Number.parseInt(parsed.port, 10);

  if (!ALLOWED_PORTS.has(port)) {
    const loopbackTest =
      allowLoopbackForTests(parsed.hostname) &&
      process.env.WEBSITE_SCANNER_TEST_ALLOW_LOOPBACK === "1";
    if (!(loopbackTest && port >= 1024 && port <= 65535)) {
      return { error: "Only standard web ports (80 and 443) are supported." };
    }
  }

  return {
    href: parsed.href,
    origin: parsed.origin,
    hostname: parsed.hostname,
    port,
    protocol: parsed.protocol,
  };
}
