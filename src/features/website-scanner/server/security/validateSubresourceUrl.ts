import { parseAndNormalizeScanUrl } from "@/features/website-scanner/server/security/normalizeScanUrl";
import { resolveAndValidateHostname } from "@/features/website-scanner/server/security/resolveAndValidateHost";

/**
 * Fast check for Playwright subresource routing (http/https only, no private targets).
 */
export async function validateSubresourceUrl(url: string): Promise<boolean> {
  try {
    const parsed = parseAndNormalizeScanUrl(url);
    if ("error" in parsed) return false;
    const dns = await resolveAndValidateHostname(parsed.hostname);
    return dns.ok;
  } catch {
    return false;
  }
}
