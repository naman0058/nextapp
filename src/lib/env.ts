import { siteConfig } from "@/config/site";

/**
 * Public site URL safe for metadata and client-visible canonical links.
 * Prefer NEXT_PUBLIC_SITE_URL in production.
 */
const EXAMPLE_SITE_HOST = "contentpreflight.example.com";

let warnedMissingPublicSiteUrl = false;

export function getSiteUrl(): string {
  const fromEnv = process.env.NEXT_PUBLIC_SITE_URL?.trim();
  if (fromEnv) {
    return fromEnv.replace(/\/$/, "");
  }
  const fallback = siteConfig.url.replace(/\/$/, "");
  if (
    process.env.NODE_ENV === "production" &&
    !warnedMissingPublicSiteUrl &&
    fallback.includes(EXAMPLE_SITE_HOST)
  ) {
    warnedMissingPublicSiteUrl = true;
    console.warn(
      "[site] NEXT_PUBLIC_SITE_URL is not set; canonicals and sitemap use the example domain. Set NEXT_PUBLIC_SITE_URL before public launch.",
    );
  }
  return fallback;
}
