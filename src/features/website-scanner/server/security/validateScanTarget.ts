import {
  parseAndNormalizeScanUrl,
  type NormalizedScanUrl,
} from "@/features/website-scanner/server/security/normalizeScanUrl";
import { resolveAndValidateHostname } from "@/features/website-scanner/server/security/resolveAndValidateHost";
import { WebsiteScanError } from "@/features/website-scanner/types/scanErrors";

export type ValidatedScanTarget = NormalizedScanUrl;

export async function validateScanTargetUrl(
  urlInput: string,
): Promise<ValidatedScanTarget> {
  const parsed = parseAndNormalizeScanUrl(urlInput);
  if ("error" in parsed) {
    throw new WebsiteScanError("INVALID_URL", parsed.error);
  }

  const dnsResult = await resolveAndValidateHostname(parsed.hostname);
  if (!dnsResult.ok) {
    if (dnsResult.reason.includes("resolve")) {
      throw new WebsiteScanError("DNS_FAILURE", dnsResult.reason);
    }
    throw new WebsiteScanError("BLOCKED_DESTINATION", dnsResult.reason);
  }

  return parsed;
}

export async function validateScanTargetForSubresource(
  urlString: string,
): Promise<boolean> {
  try {
    const parsed = parseAndNormalizeScanUrl(urlString);
    if ("error" in parsed) return false;
    const dnsResult = await resolveAndValidateHostname(parsed.hostname);
    return dnsResult.ok;
  } catch {
    return false;
  }
}

export function assertSameOrigin(
  pageUrl: string,
  rootOrigin: string,
): void {
  let origin: string;
  try {
    origin = new URL(pageUrl).origin;
  } catch {
    throw new WebsiteScanError("INVALID_URL", "Invalid page URL.");
  }
  if (origin !== rootOrigin) {
    throw new WebsiteScanError(
      "ORIGIN_MISMATCH",
      "This page is not on the allowed website origin.",
    );
  }
}
