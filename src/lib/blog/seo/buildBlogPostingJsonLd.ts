import type { BlogAuthorConfig } from "@/config/blog-authors";
import { resolveBlogPostCanonical } from "@/lib/blog/seo/canonical";
import { mergeSchemaMarkup } from "@/lib/blog/seo/mergeSchemaMarkup";
import type { BlogPost } from "@/lib/blog/types";
import { getSiteUrl } from "@/lib/env";

export function buildBlogPostingJsonLd(
  post: BlogPost,
  author: BlogAuthorConfig,
): Record<string, unknown> {
  const url = resolveBlogPostCanonical(post.slug, post.canonical_url);
  const base: Record<string, unknown> = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.meta_title || post.title,
    description: post.meta_description,
    datePublished: post.created_at.toISOString(),
    dateModified: post.updated_at.toISOString(),
    inLanguage: post.language_code,
    url,
    mainEntityOfPage: url,
    author: {
      "@type": "Person",
      name: author.name,
      ...(author.url ? { url: author.url } : {}),
    },
    publisher: {
      "@type": "Organization",
      name: author.publisherName,
      url: getSiteUrl(),
    },
    ...(post.thumbnail_url
      ? {
          image: [post.thumbnail_url],
        }
      : {}),
    keywords: [...post.meta_keywords, ...post.tags].filter(Boolean).join(", "),
  };

  return mergeSchemaMarkup(base, post.schema_markup ?? null);
}
