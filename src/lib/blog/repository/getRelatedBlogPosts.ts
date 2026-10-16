import "server-only";
import { connectMongo } from "@/lib/db/mongodb";
import { RELATED_POSTS_LIMIT } from "@/lib/blog/constants";
import { getBlogPostModel } from "@/lib/blog/models/BlogPost";
import { mapLeanToBlogPostCard } from "@/lib/blog/repository/mapDocument";
import type { BlogPost, BlogPostCard, BlogRepositoryResult } from "@/lib/blog/types";
import { pickTopRelatedPosts } from "@/lib/blog/utils/relatedPostScore";

export async function getRelatedBlogPosts(
  post: BlogPost,
  limit = RELATED_POSTS_LIMIT,
): Promise<BlogRepositoryResult<BlogPostCard[]>> {
  const connect = await connectMongo();
  if (!connect.ok) {
    return { ok: false, reason: connect.reason };
  }

  try {
    const model = getBlogPostModel();
    const docs = await model
      .find(
        { status: "published", slug: { $ne: post.slug } },
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
          entities_json: 1,
        },
      )
      .sort({ created_at: -1 })
      .limit(80)
      .lean();

    const candidates = docs.map((d) => {
      const card = mapLeanToBlogPostCard(d as Record<string, unknown>);
      const raw = d as Record<string, unknown>;
      return {
        ...card,
        entities_json: Array.isArray(raw.entities_json)
          ? (raw.entities_json as { name: string }[])
          : [],
      };
    });

    const picked = pickTopRelatedPosts(post, candidates, limit);
    return { ok: true, data: picked };
  } catch {
    return { ok: false, reason: "query_failed" };
  }
}
