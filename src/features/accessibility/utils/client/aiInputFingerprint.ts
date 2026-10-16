import type { SocialPlatform } from "@/types";

export function buildAiInputFingerprint(options: {
  platform: SocialPlatform;
  caption: string;
  altText: string;
  file: File | null;
}): string | null {
  if (!options.file) return null;
  return [
    options.platform,
    options.caption,
    options.altText,
    options.file.name,
    String(options.file.size),
    String(options.file.lastModified),
  ].join("|");
}
