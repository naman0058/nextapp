import type { BlogPostStatus } from "@/lib/blog/constants";

export type BlogEntity = {
  name: string;
  type?: string;
  description?: string;
  url?: string;
};

export type BlogSource = {
  title: string;
  url: string;
  publisher?: string;
  published_at?: string;
  accessed_at?: string;
};

export type BlogPost = {
  id: string;
  title: string;
  slug: string;
  content: string;
  meta_title: string;
  meta_description: string;
  created_at: Date;
  updated_at: Date;
  category: string;
  thumbnail_url?: string | null;
  meta_keywords: string[];
  tags: string[];
  meta_abstract?: string | null;
  author_id: string;
  focus_keyword?: string | null;
  canonical_url?: string | null;
  status: BlogPostStatus;
  reading_time_minutes: number;
  internal_links_count: number;
  schema_markup?: Record<string, unknown> | null;
  language_code: string;
  target_country?: string | null;
  answer_summary?: string | null;
  key_takeaways: string[];
  entities_json?: BlogEntity[];
  sources_json?: BlogSource[];
  reviewed_at?: Date | null;
};

export type BlogPostCard = {
  id: string;
  title: string;
  slug: string;
  meta_description: string;
  created_at: Date;
  category: string;
  thumbnail_url?: string | null;
  reading_time_minutes: number;
  tags: string[];
};

export type BlogCategorySummary = {
  category: string;
  categorySlug: string;
  count: number;
};

export type BlogSitemapEntry = {
  slug: string;
  updated_at: Date;
  canonical_url?: string | null;
};

export type BlogRssItem = {
  title: string;
  slug: string;
  meta_description: string;
  created_at: Date;
  updated_at: Date;
  category: string;
  author_id: string;
};

export type BlogRepositoryFailureReason =
  | "not_configured"
  | "connect_failed"
  | "query_failed";

export type BlogRepositoryResult<T> =
  | { ok: true; data: T }
  | { ok: false; reason: BlogRepositoryFailureReason };
