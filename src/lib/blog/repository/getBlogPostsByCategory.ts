import "server-only";
import { connectMongo } from "@/lib/db/mongodb";
import { getBlogPostModel } from "@/lib/blog/models/BlogPost";
import { mapLeanToBlogPostCard } from "@/lib/blog/repository/mapDocument";
import type { BlogPostCard, BlogRepositoryResult } from "@/lib/blog/types";

const CARD_PROJECTION = {
  id: 1,
  title: 1,
  slug: 1,
  meta_description: 1,
  created_at: 1,
  category: 1,
  thumbnail_url: 1,
  reading_time_minutes: 1,
  tags: 1,
} as const;

export async function getBlogPostsByCategory(options: {
  categoryDisplayName: string;
  page: number;
  limit: number;
}): Promise<
  BlogRepositoryResult<{ posts: BlogPostCard[]; total: number; page: number; limit: number }>
> {
  const connect = await connectMongo();
  if (!connect.ok) {
    return { ok: false, reason: connect.reason };
  }

  try {
    const model = getBlogPostModel();
    const page = Math.max(1, options.page);
    const limit = Math.max(1, Math.min(50, options.limit));
    const skip = (page - 1) * limit;
    const filter = { status: "published" as const, category: options.categoryDisplayName };

    const [total, docs] = await Promise.all([
      model.countDocuments(filter),
      model
        .find(filter, CARD_PROJECTION)
        .sort({ created_at: -1 })
        .skip(skip)
        .limit(limit)
        .lean(),
    ]);

    return {
      ok: true,
      data: {
        posts: docs.map((d) => mapLeanToBlogPostCard(d as Record<string, unknown>)),
        total,
        page,
        limit,
      },
    };
  } catch {
    return { ok: false, reason: "query_failed" };
  }
}
