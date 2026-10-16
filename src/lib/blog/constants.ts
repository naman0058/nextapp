export const BLOG_COLLECTION_NAME = "blog_posts";

export const BLOG_POSTS_PER_PAGE = 10;

export const BLOG_REVALIDATE_SECONDS = Number.parseInt(
  process.env.BLOG_REVALIDATE_SECONDS ?? "900",
  10,
);

export const RELATED_POSTS_LIMIT = 4;

export const BLOG_TOC_COLLAPSE_THRESHOLD = 8;

export const BLOG_INDEXABLE_CATEGORY_MIN_POSTS = 2;

export const BLOG_RSS_ITEM_LIMIT = 50;

export const BLOG_LATEST_HOMEPAGE_COUNT = 3;

export const BLOG_SLUG_MAX_LENGTH = 120;

export const BLOG_DEFAULT_LANGUAGE = "en-US";

export const BLOG_DEFAULT_TARGET_COUNTRY = "US";

export type BlogPostStatus = "draft" | "published" | "archived";
