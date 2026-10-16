import dns from "node:dns/promises";
import { isBlockedHostname } from "@/features/website-scanner/server/security/hostnameBlocklist";
import {
  isBlockedIpString,
  parseIpAddress,
} from "@/features/website-scanner/server/security/isBlockedIp";
import { allowLoopbackForTests } from "@/features/website-scanner/server/security/testBypass";

export async function resolveAndValidateHostname(
  hostname: string,
): Promise<{ ok: true } | { ok: false; reason: string }> {
  const host = hostname.toLowerCase();

  if (allowLoopbackForTests(host)) {
    return { ok: true };
  }

  if (isBlockedHostname(host)) {
    return { ok: false, reason: "This destination is not allowed." };
  }

  if (isBlockedIpString(host)) {
    return { ok: false, reason: "This destination is not allowed." };
  }

  const literalIp = parseIpAddress(host);
  if (literalIp && isBlockedIpString(literalIp.toString())) {
    return { ok: false, reason: "This destination is not allowed." };
  }

  try {
    const records = await dns.lookup(host, { all: true, verbatim: true });
    if (records.length === 0) {
      return { ok: false, reason: "Could not resolve this hostname." };
    }
    for (const rec of records) {
      if (isBlockedIpString(rec.address)) {
        return { ok: false, reason: "This destination is not allowed." };
      }
    }
    return { ok: true };
  } catch {
    return { ok: false, reason: "Could not resolve this hostname." };
  }
}
