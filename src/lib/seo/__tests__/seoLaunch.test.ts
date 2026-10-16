import { describe, expect, it } from "vitest";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";
import { buildLlmsTxt } from "@/lib/seo/buildLlmsTxt";
import { buildOrganizationJsonLd } from "@/lib/seo/jsonld/buildOrganizationJsonLd";
import { buildWebSiteJsonLd } from "@/lib/seo/jsonld/buildWebSiteJsonLd";
import { STATIC_ROUTE_SEO, getIndexableStaticSitemapPaths } from "@/lib/seo/route-registry";

describe("SEO launch registry", () => {
  it("has unique titles and descriptions for static routes", () => {
    const titles = STATIC_ROUTE_SEO.map((r) => r.title);
    const descriptions = STATIC_ROUTE_SEO.map((r) => r.description);
    expect(new Set(titles).size).toBe(titles.length);
    expect(new Set(descriptions).size).toBe(descriptions.length);
  });

  it("includes homepage and major tools in sitemap paths", () => {
    const paths = getIndexableStaticSitemapPaths();
    expect(paths).toContain("");
    expect(paths).toContain("/website-accessibility-scanner");
    expect(paths).toContain("/sample-accessibility-report");
  });

  it("buildPageMetadata returns canonical and openGraph", () => {
    const meta = buildPageMetadata({
      title: "Test Page",
      description: "Test description for SEO unit test.",
      path: "/tools",
    });
    expect(meta.title).toBe("Test Page");
    expect(meta.alternates?.canonical).toMatch(/\/tools$/);
    expect(meta.openGraph?.title).toBe("Test Page");
  });

  it("llms.txt is concise and includes core tools", () => {
    const text = buildLlmsTxt();
    expect(text).toContain("Website Accessibility Scanner");
    expect(text).toContain("not relied upon for Google Search rankings");
    expect(text).not.toContain("/api/");
  });

  it("global JSON-LD avoids invented ratings", () => {
    const org = buildOrganizationJsonLd();
    expect(org).not.toHaveProperty("aggregateRating");
    const site = buildWebSiteJsonLd();
    expect(site["@type"]).toBe("WebSite");
  });
});
