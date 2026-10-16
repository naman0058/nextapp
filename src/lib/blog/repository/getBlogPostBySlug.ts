import "server-only";
import { connectMongo } from "@/lib/db/mongodb";
import { getBlogPostModel } from "@/lib/blog/models/BlogPost";
import { mapLeanToBlogPost } from "@/lib/blog/repository/mapDocument";
import type { BlogPost, BlogRepositoryResult } from "@/lib/blog/types";

export async function getBlogPostBySlug(
  slug: string,
): Promise<BlogRepositoryResult<BlogPost | null>> {
  const connect = await connectMongo();
  if (!connect.ok) {
    return { ok: false, reason: connect.reason };
  }

  try {
    const model = getBlogPostModel();
    const doc = await model.findOne({ slug, status: "published" }).lean();
    if (!doc) {
      return { ok: true, data: null };
    }
    return { ok: true, data: mapLeanToBlogPost(doc as Record<string, unknown>) };
  } catch {
    return { ok: false, reason: "query_failed" };
  }
}
