import type { Metadata } from "next";
import { getSiteUrl } from "@/lib/env";
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

export type BuildPageMetadataInput = {
  title: string;
  description: string;
  path: string;
  /** Editorial planning only — not used for Google ranking meta keywords tag by default */
  keywords?: string[];
  robots?: Metadata["robots"];
  ogImage?: string;
  ogImageAlt?: string;
  ogType?: "website" | "article";
  canonicalOverride?: string;
};

function ogLocaleFromDefault(): string {
  return SEO_DEFAULT_LOCALE.replace("-", "_");
}

export function buildPageMetadata(input: BuildPageMetadataInput): Metadata {
  const seo = getSiteSeoConfig();
  const base = getSiteUrl();
  const canonical =
    input.canonicalOverride?.trim() ||
    (input.path ? `${base}${input.path.startsWith("/") ? input.path : `/${input.path}`}` : base);
  const description = input.description.trim();
  const ogImage = input.ogImage ?? seo.defaultOgImage;
  const ogType = input.ogType ?? "website";
  const robots = input.robots ?? getDefaultRobotsMetadata();

  return {
    title: input.title,
    description,
    alternates: {
      canonical,
    },
    robots,
    verification: getSiteVerificationMetadata(),
    openGraph: {
      title: input.title,
      description,
      url: canonical,
      siteName: seo.siteName,
      type: ogType,
      locale: ogLocaleFromDefault(),
      images: [
        {
          url: ogImage,
          width: OG_IMAGE_WIDTH,
          height: OG_IMAGE_HEIGHT,
          alt: input.ogImageAlt ?? `${input.title} — ${seo.siteName}`,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: input.title,
      description,
      images: [ogImage],
    },
    ...(input.keywords?.length
      ? { keywords: input.keywords }
      : {}),
  };
}
