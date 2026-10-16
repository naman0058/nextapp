import { getSiteUrl } from "@/lib/env";
import { siteConfig } from "@/config/site";
import type { BlogRssItem } from "@/lib/blog/types";

function escapeXml(value: string): string {
  return value
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export function buildBlogRssXml(items: BlogRssItem[]): string {
  const base = getSiteUrl();
  const channelTitle = `${siteConfig.name} Blog`;
  const rows = items
    .map((item) => {
      const link = `${base}/blog/${item.slug}`;
      return `<item>
  <title>${escapeXml(item.title)}</title>
  <link>${escapeXml(link)}</link>
  <guid isPermaLink="true">${escapeXml(link)}</guid>
  <description>${escapeXml(item.meta_description)}</description>
  <pubDate>${item.created_at.toUTCString()}</pubDate>
  <category>${escapeXml(item.category)}</category>
</item>`;
    })
    .join("\n");

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>${escapeXml(channelTitle)}</title>
  <link>${escapeXml(`${base}/blog`)}</link>
  <description>${escapeXml(siteConfig.seo.defaultDescription)}</description>
  <language>en-us</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${rows}
</channel>
</rss>`;
}
