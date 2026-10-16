import { normalizeCrawlKey } from "@/features/website-scanner/utils/crawl/normalizeCrawlUrl";

export function safeCrawlKey(url: string): string {
  try {
    return normalizeCrawlKey(new URL(url));
  } catch {
    return url;
  }
}
