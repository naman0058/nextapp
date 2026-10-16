import "server-only";
import { connectMongo } from "@/lib/db/mongodb";
import { BLOG_RSS_ITEM_LIMIT } from "@/lib/blog/constants";
import { getBlogPostModel } from "@/lib/blog/models/BlogPost";
import type { BlogRepositoryResult, BlogRssItem } from "@/lib/blog/types";

export async function getPublishedForRss(
  limit = BLOG_RSS_ITEM_LIMIT,
): Promise<BlogRepositoryResult<BlogRssItem[]>> {
  const connect = await connectMongo();
  if (!connect.ok) {
    return { ok: false, reason: connect.reason };
  }

  try {
    const model = getBlogPostModel();
    const docs = await model
      .find(
        { status: "published" },
        {
          title: 1,
          slug: 1,
          meta_description: 1,
          created_at: 1,
          updated_at: 1,
          category: 1,
          author_id: 1,
        },
      )
      .sort({ created_at: -1 })
      .limit(limit)
      .lean();

    const data: BlogRssItem[] = docs.map((d) => {
      const raw = d as Record<string, unknown>;
      return {
        title: String(raw.title),
        slug: String(raw.slug),
        meta_description: String(raw.meta_description),
        created_at:
          raw.created_at instanceof Date
            ? raw.created_at
            : new Date(String(raw.created_at)),
        updated_at:
          raw.updated_at instanceof Date
            ? raw.updated_at
            : new Date(String(raw.updated_at)),
        category: String(raw.category),
        author_id: String(raw.author_id),
      };
    });

    return { ok: true, data };
  } catch {
    return { ok: false, reason: "query_failed" };
  }
}
