import { getSiteSeoConfig } from "@/lib/seo/site-config";

export function buildWebSiteJsonLd(): Record<string, unknown> {
  const seo = getSiteSeoConfig();
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: seo.siteName,
    url: seo.siteUrl,
  };
}
