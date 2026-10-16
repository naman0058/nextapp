import "server-only";
import { slugifyCategoryName } from "@/lib/blog/categorySlug";
import { connectMongo } from "@/lib/db/mongodb";
import { getBlogPostModel } from "@/lib/blog/models/BlogPost";
import type { BlogCategorySummary, BlogRepositoryResult } from "@/lib/blog/types";

export async function getBlogCategories(): Promise<BlogRepositoryResult<BlogCategorySummary[]>> {
  const connect = await connectMongo();
  if (!connect.ok) {
    return { ok: false, reason: connect.reason };
  }

  try {
    const model = getBlogPostModel();
    const rows = await model.aggregate<{ _id: string; count: number }>([
      { $match: { status: "published" } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { _id: 1 } },
    ]);

    const data: BlogCategorySummary[] = rows.map((row) => ({
      category: row._id,
      categorySlug: slugifyCategoryName(row._id),
      count: row.count,
    }));

    return { ok: true, data };
  } catch {
    return { ok: false, reason: "query_failed" };
  }
}
