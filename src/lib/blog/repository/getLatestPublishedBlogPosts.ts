import "server-only";
import { connectMongo } from "@/lib/db/mongodb";
import { getBlogPostModel } from "@/lib/blog/models/BlogPost";
import { mapLeanToBlogPostCard } from "@/lib/blog/repository/mapDocument";
import type { BlogPostCard, BlogRepositoryResult } from "@/lib/blog/types";

export async function getLatestPublishedBlogPosts(
  limit: number,
): Promise<BlogRepositoryResult<BlogPostCard[]>> {
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
          id: 1,
          title: 1,
          slug: 1,
          meta_description: 1,
          created_at: 1,
          category: 1,
          thumbnail_url: 1,
          reading_time_minutes: 1,
          tags: 1,
        },
      )
      .sort({ created_at: -1 })
      .limit(Math.max(1, limit))
      .lean();

    return {
      ok: true,
      data: docs.map((d) => mapLeanToBlogPostCard(d as Record<string, unknown>)),
    };
  } catch {
    return { ok: false, reason: "query_failed" };
  }
}
