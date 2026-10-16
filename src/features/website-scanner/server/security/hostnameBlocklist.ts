const BLOCKED_HOSTNAMES = new Set([
  "localhost",
  "localhost.localdomain",
  "metadata.google.internal",
  "metadata",
]);

export function isBlockedHostname(hostname: string): boolean {
  const host = hostname.trim().toLowerCase().replace(/\.$/, "");
  if (!host) return true;
  if (BLOCKED_HOSTNAMES.has(host)) return true;
  if (host.endsWith(".localhost")) return true;
  if (host.endsWith(".local")) return true;
  if (host.endsWith(".internal")) return true;
  if (host === "127.0.0.1" || host === "::1" || host === "0.0.0.0") return true;
  if (host.startsWith("[") && host.endsWith("]")) {
    const bracketed = host.slice(1, -1);
    if (
      bracketed === "::ffff:127.0.0.1" ||
      bracketed.toLowerCase() === "::ffff:7f00:1"
    ) {
      return true;
    }
  }
  if (host.includes("::ffff:127.0.0.1")) return true;
  if (host.includes("169.254.169.254")) return true;
  return false;
}
