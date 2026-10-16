import { getSiteUrl } from "@/lib/env";

function isSafeHttpUrl(value: string): boolean {
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

export function resolveBlogPostCanonical(slug: string, canonicalOverride?: string | null): string {
  if (canonicalOverride?.trim()) {
    const trimmed = canonicalOverride.trim();
    if (!isSafeHttpUrl(trimmed)) {
      return `${getSiteUrl()}/blog/${slug}`;
    }
    return trimmed.replace(/\/$/, "");
  }
  return `${getSiteUrl()}/blog/${slug}`;
}

export function isValidCanonicalOverride(url: string): boolean {
  return isSafeHttpUrl(url.trim());
}
