import type { RemotePattern } from "next/dist/shared/lib/image-config";

export function getBlogImageRemotePatterns(): RemotePattern[] {
  const raw = process.env.BLOG_IMAGE_HOSTS?.trim();
  if (!raw) return [];

  const patterns: RemotePattern[] = [];
  for (const part of raw.split(",")) {
    const host = part.trim();
    if (!host || host.includes("*")) continue;
    patterns.push({
      protocol: "https",
      hostname: host,
      pathname: "/**",
    });
  }
  return patterns;
}
