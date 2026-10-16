import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/env";
import { getBlogCategories } from "@/lib/blog/repository/getBlogCategories";
import { getPublishedSlugsForSitemap } from "@/lib/blog/repository/getPublishedSlugsForSitemap";
import { buildBlogSitemapUrls } from "@/lib/blog/sitemap/buildBlogSitemapEntries";
import { getIndexableStaticSitemapPaths } from "@/lib/seo/route-registry";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const base = getSiteUrl();
  const staticPaths = getIndexableStaticSitemapPaths();

  const staticEntries: MetadataRoute.Sitemap = staticPaths.map((path) => ({
    url: `${base}${path}`,
  }));

  const [postsResult, categoriesResult] = await Promise.all([
    getPublishedSlugsForSitemap(),
    getBlogCategories(),
  ]);

  if (!postsResult.ok || !categoriesResult.ok) {
    return staticEntries;
  }

  const blogUrls = buildBlogSitemapUrls(postsResult.data, categoriesResult.data);
  const blogEntries: MetadataRoute.Sitemap = blogUrls.map(({ path, lastModified }) => ({
    url: `${base}${path}`,
    ...(lastModified ? { lastModified } : {}),
  }));

  const withoutDuplicateBlog = staticEntries.filter((entry) => !entry.url.endsWith("/blog"));
  return [...withoutDuplicateBlog, ...blogEntries];
}
