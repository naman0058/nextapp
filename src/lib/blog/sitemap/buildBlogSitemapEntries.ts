import { BLOG_INDEXABLE_CATEGORY_MIN_POSTS } from "@/lib/blog/constants";
import { slugifyCategoryName } from "@/lib/blog/categorySlug";
import { resolveBlogPostCanonical } from "@/lib/blog/seo/canonical";
import type { BlogCategorySummary, BlogSitemapEntry } from "@/lib/blog/types";

export type BlogSitemapUrl = {
  path: string;
  lastModified?: Date;
};

export function buildBlogSitemapUrls(
  posts: BlogSitemapEntry[],
  categories: BlogCategorySummary[],
): BlogSitemapUrl[] {
  const urls: BlogSitemapUrl[] = [{ path: "/blog" }];

  for (const cat of categories) {
    if (cat.count >= BLOG_INDEXABLE_CATEGORY_MIN_POSTS) {
      urls.push({ path: `/blog/category/${cat.categorySlug}` });
    }
  }

  for (const post of posts) {
    const canonical = resolveBlogPostCanonical(post.slug, post.canonical_url);
    try {
      const path = new URL(canonical).pathname;
      urls.push({ path, lastModified: post.updated_at });
    } catch {
      urls.push({ path: `/blog/${post.slug}`, lastModified: post.updated_at });
    }
  }

  return urls;
}

export function filterPublishedSitemapPosts<T extends { status?: string }>(
  posts: T[],
): T[] {
  return posts.filter((p) => p.status === "published" || p.status === undefined);
}

export function categorySummariesFromNames(
  categoryCounts: { category: string; count: number }[],
): BlogCategorySummary[] {
  return categoryCounts.map(({ category, count }) => ({
    category,
    categorySlug: slugifyCategoryName(category),
    count,
  }));
}
