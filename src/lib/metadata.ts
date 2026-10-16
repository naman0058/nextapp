import type { Metadata } from "next";
import { siteConfig } from "@/config/site";
import { getSiteUrl } from "@/lib/env";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";
import {
  getDefaultRobotsMetadata,
  getSiteVerificationMetadata,
} from "@/lib/seo/indexing";
import {
  getSiteSeoConfig,
  OG_IMAGE_HEIGHT,
  OG_IMAGE_WIDTH,
  SEO_DEFAULT_LOCALE,
} from "@/lib/seo/site-config";

export function createPageMetadata(options: {
  title: string;
  description?: string;
  path?: string;
}): Metadata {
  return buildPageMetadata({
    title: options.title,
    description: options.description ?? siteConfig.seo.defaultDescription,
    path: options.path ?? "/",
  });
}

export function createRootMetadata(): Metadata {
  const seo = getSiteSeoConfig();
  const base = getSiteUrl();

  return {
    metadataBase: new URL(base),
    title: {
      default: seo.defaultTitle,
      template: seo.titleTemplate,
    },
    description: seo.defaultDescription,
    robots: getDefaultRobotsMetadata(),
    verification: getSiteVerificationMetadata(),
    alternates: {
      canonical: base,
      types: {
        "application/rss+xml": `${base}/blog/rss.xml`,
      },
    },
    openGraph: {
      title: seo.defaultTitle,
      description: seo.defaultDescription,
      url: base,
      siteName: seo.siteName,
      type: "website",
      locale: SEO_DEFAULT_LOCALE.replace("-", "_"),
      images: [
        {
          url: seo.defaultOgImage,
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          alt: `${seo.siteName} — accessibility preflight tools`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: seo.defaultTitle,
      description: seo.defaultDescription,
      images: [seo.defaultOgImage],
    },
  };
}
