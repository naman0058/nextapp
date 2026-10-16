import type { DiscoveredUrl, UrlPatternGroup } from "@/features/website-scanner/types/websiteDiscovery";
import { deriveUrlPattern } from "@/features/website-scanner/utils/urlPatterns/deriveUrlPattern";

export function buildUrlPatternGroups(
  discovered: DiscoveredUrl[],
): UrlPatternGroup[] {
  const byPattern = new Map<string, string[]>();
  for (const d of discovered) {
    const pattern = deriveUrlPattern(d.url);
    const list = byPattern.get(pattern) ?? [];
    list.push(d.url);
    byPattern.set(pattern, list);
  }
  const groups: UrlPatternGroup[] = [];
  let idx = 0;
  for (const [pattern, urls] of byPattern.entries()) {
    const unique = [...new Set(urls)];
    const confidence: UrlPatternGroup["confidence"] =
      unique.length >= 3 && pattern.includes(":") ? "high" : unique.length >= 2 ? "medium" : "low";
    groups.push({
      id: `pg-${idx++}`,
      pattern,
      urls: unique,
      urlCount: unique.length,
      representativeUrls: pickRepresentatives(unique, pattern),
      confidence,
    });
  }
  return groups.sort((a, b) => b.urlCount - a.urlCount);
}

function pickRepresentatives(urls: string[], pattern: string): string[] {
  const sorted = [...urls].sort((a, b) => a.length - b.length);
  if (pattern === "/" && sorted.length > 0) return [sorted[0]!];
  const reps = [sorted[0]!];
  if (urls.length >= 4 && sorted[1]) reps.push(sorted[1]);
  return reps.slice(0, 2);
}
