import { XMLParser } from "fast-xml-parser";

export type ParsedSitemapEntry = {
  loc: string;
  lastmod?: string;
};

export type ParsedSitemapDocument = {
  type: "urlset" | "index";
  urls: ParsedSitemapEntry[];
  childSitemapUrls: string[];
};

const parser = new XMLParser({
  ignoreAttributes: true,
  removeNSPrefix: true,
  processEntities: false,
  allowBooleanAttributes: true,
});

function asArray<T>(value: T | T[] | undefined): T[] {
  if (!value) return [];
  return Array.isArray(value) ? value : [value];
}

export function parseSitemapXml(xml: string): ParsedSitemapDocument {
  const trimmed = xml.trim();
  if (!trimmed.startsWith("<")) {
    throw new Error("Sitemap content is not valid XML.");
  }
  const doc = parser.parse(trimmed) as Record<string, unknown>;
  const urlset = doc.urlset as { url?: unknown } | undefined;
  if (urlset) {
    const urls = asArray(urlset.url as Record<string, unknown> | Record<string, unknown>[]).map(
      (u) => ({
        loc: String(u.loc ?? "").trim(),
        lastmod: u.lastmod ? String(u.lastmod) : undefined,
      }),
    ).filter((u) => u.loc);
    return { type: "urlset", urls, childSitemapUrls: [] };
  }
  const index = doc.sitemapindex as { sitemap?: unknown } | undefined;
  if (index) {
    const childSitemapUrls = asArray(
      index.sitemap as Record<string, unknown> | Record<string, unknown>[],
    )
      .map((s) => String(s.loc ?? "").trim())
      .filter(Boolean);
    return { type: "index", urls: [], childSitemapUrls };
  }
  throw new Error("Unrecognized sitemap XML structure.");
}
