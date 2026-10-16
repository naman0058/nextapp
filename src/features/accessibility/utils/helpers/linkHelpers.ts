export const GENERIC_LINK_PHRASES = [
  /\bclick here\b/i,
  /\bread more here\b/i,
  /\blink here\b/i,
  /\btap here\b/i,
  /\bmore here\b/i,
] as const;

export function captionHasHttpUrl(caption: string): boolean {
  return /https?:\/\//i.test(caption);
}

export function findGenericLinkPhrases(caption: string): string[] {
  const trimmed = caption.trim();
  if (!trimmed) return [];
  const hasUrl = captionHasHttpUrl(trimmed);
  const found: string[] = [];

  for (const pattern of GENERIC_LINK_PHRASES) {
    if (pattern.test(trimmed)) {
      if (hasUrl || /\bhere\s*[:\-–—]?\s*https?/i.test(trimmed)) {
        const match = trimmed.match(pattern);
        if (match?.[0]) found.push(match[0]);
      } else if (
        /\b(click|read|link|tap) here\b/i.test(trimmed) &&
        hasUrl
      ) {
        const match = trimmed.match(pattern);
        if (match?.[0]) found.push(match[0]);
      }
    }
  }

  if (
    found.length === 0 &&
    /\b(click here|read more here|link here)\b/i.test(trimmed) &&
    hasUrl
  ) {
    const m = trimmed.match(/\b(click here|read more here|link here)\b/i);
    if (m?.[0]) found.push(m[0]);
  }

  return [...new Set(found)];
}

export function extractHttpUrls(caption: string): string[] {
  const matches = caption.match(/https?:\/\/[^\s]+/gi);
  return matches ?? [];
}
