import type { BlogPost, BlogPostCard } from "@/lib/blog/types";

function toDate(value: unknown): Date {
  if (value instanceof Date) return value;
  if (typeof value === "string" || typeof value === "number") {
    return new Date(value);
  }
  return new Date(0);
}

export function mapLeanToBlogPost(doc: Record<string, unknown>): BlogPost {
  return {
    id: String(doc.id),
    title: String(doc.title),
    slug: String(doc.slug),
    content: String(doc.content),
    meta_title: String(doc.meta_title),
    meta_description: String(doc.meta_description),
    created_at: toDate(doc.created_at),
    updated_at: toDate(doc.updated_at),
    category: String(doc.category),
    thumbnail_url: (doc.thumbnail_url as string | null | undefined) ?? null,
    meta_keywords: Array.isArray(doc.meta_keywords) ? (doc.meta_keywords as string[]) : [],
    tags: Array.isArray(doc.tags) ? (doc.tags as string[]) : [],
    meta_abstract: (doc.meta_abstract as string | null | undefined) ?? null,
    author_id: String(doc.author_id),
    focus_keyword: (doc.focus_keyword as string | null | undefined) ?? null,
    canonical_url: (doc.canonical_url as string | null | undefined) ?? null,
    status: doc.status as BlogPost["status"],
    reading_time_minutes: Number(doc.reading_time_minutes) || 1,
    internal_links_count: Number(doc.internal_links_count) || 0,
    schema_markup: (doc.schema_markup as Record<string, unknown> | null) ?? null,
    language_code: String(doc.language_code ?? "en-US"),
    target_country: (doc.target_country as string | null | undefined) ?? null,
    answer_summary: (doc.answer_summary as string | null | undefined) ?? null,
    key_takeaways: Array.isArray(doc.key_takeaways) ? (doc.key_takeaways as string[]) : [],
    entities_json: Array.isArray(doc.entities_json)
      ? (doc.entities_json as BlogPost["entities_json"])
      : [],
    sources_json: Array.isArray(doc.sources_json)
      ? (doc.sources_json as BlogPost["sources_json"])
      : [],
    reviewed_at: doc.reviewed_at ? toDate(doc.reviewed_at) : null,
  };
}

export function mapLeanToBlogPostCard(doc: Record<string, unknown>): BlogPostCard {
  return {
    id: String(doc.id),
    title: String(doc.title),
    slug: String(doc.slug),
    meta_description: String(doc.meta_description),
    created_at: toDate(doc.created_at),
    category: String(doc.category),
    thumbnail_url: (doc.thumbnail_url as string | null | undefined) ?? null,
    reading_time_minutes: Number(doc.reading_time_minutes) || 1,
    tags: Array.isArray(doc.tags) ? (doc.tags as string[]) : [],
  };
}
