import { MAX_SITE_SCAN_PAGES } from "@/features/website-scanner/constants/scanLimits";
import type { DiscoveredUrl, UrlPatternGroup } from "@/features/website-scanner/types/websiteDiscovery";

const CORE_PATH_HINTS = [
  "/",
  "/about",
  "/contact",
  "/pricing",
  "/services",
];

export function suggestRepresentativeUrls(
  discovered: DiscoveredUrl[],
  groups: UrlPatternGroup[],
  max = MAX_SITE_SCAN_PAGES,
): string[] {
  const selected = new Set<string>();
  const byPath = new Map<string, string>();
  for (const d of discovered) {
    try {
      const path = new URL(d.url).pathname || "/";
      if (!byPath.has(path)) byPath.set(path, d.url);
    } catch {
      /* skip */
    }
  }
  for (const hint of CORE_PATH_HINTS) {
    const url = byPath.get(hint);
    if (url) selected.add(url);
  }
  for (const g of groups) {
    if (selected.size >= max) break;
    for (const rep of g.representativeUrls) {
      if (selected.size >= max) break;
      selected.add(rep);
    }
  }
  if (selected.size < max) {
    for (const d of discovered) {
      if (selected.size >= max) break;
      selected.add(d.url);
    }
  }
  return [...selected].slice(0, max);
}
