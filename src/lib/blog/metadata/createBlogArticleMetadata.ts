import type { Metadata } from "next";
import { resolveBlogPostCanonical } from "@/lib/blog/seo/canonical";
import type { BlogPost } from "@/lib/blog/types";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";
import { getDefaultOgImageUrl } from "@/lib/seo/site-config";

export function createBlogArticleMetadata(post: BlogPost): Metadata {
  const canonical = resolveBlogPostCanonical(post.slug, post.canonical_url);
  const title = post.meta_title || post.title;
  const path = (() => {
    try {
      return new URL(canonical).pathname;
    } catch {
      return `/blog/${post.slug}`;
    }
  })();

  const ogImage = post.thumbnail_url ?? getDefaultOgImageUrl();

  return buildPageMetadata({
    title,
    description: post.meta_description,
    path,
    canonicalOverride: canonical,
    ogType: "article",
    ogImage,
    ogImageAlt: title,
    keywords: post.meta_keywords?.length ? post.meta_keywords : undefined,
  });
}
