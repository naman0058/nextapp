import { describe, expect, it } from "vitest";
import { parseSitemapXml } from "@/features/website-scanner/server/sitemap/parseSitemapXml";
import { filterSameOriginLocs } from "@/features/website-scanner/server/sitemap/filterSitemapLocs";

describe("parseSitemapXml", () => {
  it("parses urlset loc entries", () => {
    const doc = parseSitemapXml(`<?xml version="1.0"?>
      <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <url><loc>https://example.com/a</loc></url>
        <url><loc>https://example.com/b</loc><lastmod>2026-01-01</lastmod></url>
      </urlset>`);
    expect(doc.type).toBe("urlset");
    expect(doc.urls).toHaveLength(2);
  });

  it("parses sitemap index", () => {
    const doc = parseSitemapXml(`<?xml version="1.0"?>
      <sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
        <sitemap><loc>https://example.com/sitemap-1.xml</loc></sitemap>
      </sitemapindex>`);
    expect(doc.type).toBe("index");
    expect(doc.childSitemapUrls).toHaveLength(1);
  });
});

describe("filterSameOriginLocs", () => {
  it("ignores external origins", () => {
    const { accepted, externalIgnored } = filterSameOriginLocs(
      [
        { loc: "https://example.com/page" },
        { loc: "https://other.test/page" },
      ],
      "https://example.com",
    );
    expect(accepted).toHaveLength(1);
    expect(externalIgnored).toBe(1);
  });
});
