import { BLOG_SLUG_MAX_LENGTH, type BlogPostStatus } from "@/lib/blog/constants";
import type { BlogEntity, BlogSource } from "@/lib/blog/types";

const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

export type BlogPostInput = {
  id?: string;
  title: string;
  slug: string;
  content: string;
  meta_title: string;
  meta_description: string;
  created_at?: string | Date;
  updated_at?: string | Date;
  category: string;
  thumbnail_url?: string | null;
  meta_keywords?: string[];
  tags?: string[];
  meta_abstract?: string | null;
  author_id: string;
  focus_keyword?: string | null;
  canonical_url?: string | null;
  status?: BlogPostStatus;
  reading_time_minutes?: number;
  internal_links_count?: number;
  schema_markup?: Record<string, unknown> | null;
  language_code?: string;
  target_country?: string | null;
  answer_summary?: string | null;
  key_takeaways?: string[];
  entities_json?: BlogEntity[];
  sources_json?: BlogSource[];
  reviewed_at?: string | Date | null;
};

export type BlogPostValidationResult =
  | { ok: true; value: BlogPostInput }
  | { ok: false; errors: string[] };

function isSafeHttpUrl(value: string): boolean {
  const lower = value.trim().toLowerCase();
  if (lower.startsWith("javascript:") || lower.startsWith("data:")) {
    return false;
  }
  try {
    const url = new URL(value);
    return url.protocol === "http:" || url.protocol === "https:";
  } catch {
    return false;
  }
}

function validateSlug(slug: string, errors: string[]): void {
  if (!slug.trim()) {
    errors.push("slug is required");
    return;
  }
  if (slug.length > BLOG_SLUG_MAX_LENGTH) {
    errors.push(`slug must be at most ${BLOG_SLUG_MAX_LENGTH} characters`);
  }
  if (!SLUG_RE.test(slug)) {
    errors.push("slug must be lowercase hyphenated alphanumerics");
  }
}

function validateSource(source: BlogSource, index: number, errors: string[]): void {
  if (!source.title?.trim()) {
    errors.push(`sources_json[${index}].title is required`);
  }
  if (!source.url?.trim() || !isSafeHttpUrl(source.url)) {
    errors.push(`sources_json[${index}].url must be a safe http(s) URL`);
  }
}

export function validateBlogPostInput(input: unknown): BlogPostValidationResult {
  const errors: string[] = [];
  if (!input || typeof input !== "object") {
    return { ok: false, errors: ["input must be an object"] };
  }
  const raw = input as Record<string, unknown>;

  const title = String(raw.title ?? "").trim();
  const slug = String(raw.slug ?? "").trim();
  const content = String(raw.content ?? "");
  const meta_title = String(raw.meta_title ?? "").trim();
  const meta_description = String(raw.meta_description ?? "").trim();
  const category = String(raw.category ?? "").trim();
  const author_id = String(raw.author_id ?? "").trim();

  if (!title) errors.push("title is required");
  validateSlug(slug, errors);
  if (!content.trim()) errors.push("content is required");
  if (!meta_title) errors.push("meta_title is required");
  if (!meta_description) errors.push("meta_description is required");
  if (!category) errors.push("category is required");
  if (!author_id) errors.push("author_id is required");

  const status = raw.status as BlogPostStatus | undefined;
  if (status && !["draft", "published", "archived"].includes(status)) {
    errors.push("status must be draft, published, or archived");
  }

  if (raw.canonical_url != null && String(raw.canonical_url).trim()) {
    if (!isSafeHttpUrl(String(raw.canonical_url))) {
      errors.push("canonical_url must be http(s) when set");
    }
  }

  const sources = (raw.sources_json ?? []) as BlogSource[];
  if (Array.isArray(sources)) {
    sources.forEach((s, i) => validateSource(s, i, errors));
  } else {
    errors.push("sources_json must be an array when provided");
  }

  const entities = raw.entities_json;
  if (entities != null && !Array.isArray(entities)) {
    errors.push("entities_json must be an array when provided");
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    value: raw as unknown as BlogPostInput,
  };
}

export function isSafeSourceUrl(url: string): boolean {
  return isSafeHttpUrl(url);
}
