import { createHash } from "node:crypto";

export function hashRemediationMaterial(prefix: string, parts: unknown[]): string {
  const material = [prefix, ...parts.map((p) => JSON.stringify(p))].join("|");
  return createHash("sha256").update(material).digest("hex").slice(0, 24);
}
