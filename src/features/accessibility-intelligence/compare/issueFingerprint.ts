import { createHash } from "node:crypto";

export function normalizePageUrlForFingerprint(url: string): string {
  try {
    const u = new URL(url);
    u.hash = "";
    return u.href;
  } catch {
    return url;
  }
}

export function buildIssueFingerprint(input: {
  pageUrl: string;
  ruleId: string;
  domSignature?: string;
  selectorLabel?: string;
}): string {
  const page = normalizePageUrlForFingerprint(input.pageUrl);
  const sig =
    input.domSignature ??
    input.selectorLabel ??
    "__unknown__";
  return createHash("sha256")
    .update(`${page}::${input.ruleId}::${sig}`)
    .digest("hex")
    .slice(0, 24);
}
