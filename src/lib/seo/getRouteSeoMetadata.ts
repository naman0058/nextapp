import type { Metadata } from "next";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";
import { getStaticRouteSeo } from "@/lib/seo/route-registry";

/** Metadata for a static route registered in route-registry.ts */
export function metadataForStaticRoute(path: string): Metadata {
  const entry = getStaticRouteSeo(path);
  if (!entry) {
    throw new Error(`Missing SEO registry entry for path: ${path}`);
  }
  return buildPageMetadata({
    title: entry.title,
    description: entry.description,
    path: entry.path,
    keywords: entry.editorialKeywords ?? entry.secondaryKeywords,
  });
}
