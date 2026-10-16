import { siteConfig } from "@/config/site";
import { getSiteUrl } from "@/lib/env";

export const SEO_DEFAULT_LOCALE = "en-US";
export const SEO_TARGET_COUNTRY = "US";

export const OG_IMAGE_WIDTH = 1200;
export const OG_IMAGE_HEIGHT = 630;

/** Default Open Graph image (Next.js file convention). */
export const DEFAULT_OG_IMAGE_PATH = "/opengraph-image";

export function getDefaultOgImageUrl(): string {
  return `${getSiteUrl()}${DEFAULT_OG_IMAGE_PATH}`;
}

export function getOrganizationLogoUrl(): string {
  return `${getSiteUrl()}/icon`;
}

export function getSiteSeoConfig() {
  const sameAs: string[] = [];
  for (const url of [
    siteConfig.social.twitter,
    siteConfig.social.linkedin,
    siteConfig.social.github,
  ]) {
    if (typeof url === "string" && url.length > 0) sameAs.push(url);
  }

  return {
    siteName: siteConfig.name,
    siteUrl: getSiteUrl(),
    defaultLocale: SEO_DEFAULT_LOCALE,
    targetCountry: SEO_TARGET_COUNTRY,
    defaultTitle: siteConfig.seo.defaultTitle,
    titleTemplate: siteConfig.seo.titleTemplate,
    defaultDescription: siteConfig.seo.defaultDescription,
    defaultOgImage: getDefaultOgImageUrl(),
    organizationName: siteConfig.name,
    logoUrl: getOrganizationLogoUrl(),
    contactEmail: siteConfig.contact.email,
    sameAs,
  };
}
