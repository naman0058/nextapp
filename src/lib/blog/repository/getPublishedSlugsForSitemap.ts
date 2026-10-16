import "server-only";
import { connectMongo } from "@/lib/db/mongodb";
import { getBlogPostModel } from "@/lib/blog/models/BlogPost";
import type { BlogRepositoryResult, BlogSitemapEntry } from "@/lib/blog/types";

export async function getPublishedSlugsForSitemap(): Promise<
  BlogRepositoryResult<BlogSitemapEntry[]>
> {
  const connect = await connectMongo();
  if (!connect.ok) {
    return { ok: false, reason: connect.reason };
  }

  try {
    const model = getBlogPostModel();
    const docs = await model
      .find(
        { status: "published" },
        { slug: 1, updated_at: 1, canonical_url: 1 },
      )
      .sort({ updated_at: -1 })
      .lean();

    const data: BlogSitemapEntry[] = docs.map((d) => {
      const raw = d as Record<string, unknown>;
      return {
        slug: String(raw.slug),
        updated_at:
          raw.updated_at instanceof Date
            ? raw.updated_at
            : new Date(String(raw.updated_at)),
        canonical_url: (raw.canonical_url as string | null | undefined) ?? null,
      };
    });

    return { ok: true, data };
  } catch {
    return { ok: false, reason: "query_failed" };
  }
}
