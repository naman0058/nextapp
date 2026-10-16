import ipaddr from "ipaddr.js";

const METADATA_IPV4 = "169.254.169.254";

export function parseIpAddress(raw: string): ipaddr.IPv4 | ipaddr.IPv6 | null {
  const trimmed = raw.trim();
  if (!trimmed) return null;
  try {
    if (ipaddr.isValid(trimmed)) {
      return ipaddr.parse(trimmed);
    }
    // Decimal integer IPv4 (e.g. 2130706433)
    if (/^\d+$/.test(trimmed)) {
      const n = Number(trimmed);
      if (n >= 0 && n <= 0xffffffff) {
        const octets = [
          (n >>> 24) & 0xff,
          (n >>> 16) & 0xff,
          (n >>> 8) & 0xff,
          n & 0xff,
        ];
        return ipaddr.parse(octets.join("."));
      }
    }
    // Hex IPv4
    if (/^0x[0-9a-f]+$/i.test(trimmed)) {
      const n = Number.parseInt(trimmed, 16);
      if (n >= 0 && n <= 0xffffffff) {
        const octets = [
          (n >>> 24) & 0xff,
          (n >>> 16) & 0xff,
          (n >>> 8) & 0xff,
          n & 0xff,
        ];
        return ipaddr.parse(octets.join("."));
      }
    }
  } catch {
    return null;
  }
  return null;
}

function isPrivateOrReservedIpv4(addr: ipaddr.IPv4): boolean {
  const range = addr.range();
  if (range !== "unicast") return true;
  const octets = addr.octets;
  const [a, b] = octets;
  if (a === 127) return true;
  if (a === 10) return true;
  if (a === 172 && b >= 16 && b <= 31) return true;
  if (a === 192 && b === 168) return true;
  if (a === 169 && b === 254) return true;
  if (a === 100 && b >= 64 && b <= 127) return true;
  if (a === 0) return true;
  if (a >= 224) return true;
  if (octets.join(".") === METADATA_IPV4) return true;
  return false;
}

function isPrivateOrReservedIpv6(addr: ipaddr.IPv6): boolean {
  const range = addr.range();
  if (range !== "unicast") return true;
  if (addr.isIPv4MappedAddress()) {
    return isPrivateOrReservedIpv4(addr.toIPv4Address());
  }
  const kind = addr.kind();
  if (kind === "ipv6") {
    const [head] = addr.parts;
    if (head === 0xfe80) return true;
    if ((head & 0xfe00) === 0xfc00) return true;
    if (addr.toString() === "::1") return true;
    if (addr.toString() === "::") return true;
  }
  return false;
}

export function isBlockedIpString(ip: string): boolean {
  if (ip === METADATA_IPV4) return true;
  const parsed = parseIpAddress(ip);
  if (!parsed) return false;
  if (parsed.kind() === "ipv4") {
    return isPrivateOrReservedIpv4(parsed as ipaddr.IPv4);
  }
  return isPrivateOrReservedIpv6(parsed as ipaddr.IPv6);
}
