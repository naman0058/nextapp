/**
 * Import or update a blog post from JSON (editorial workflow — server-side only).
 *
 * Usage:
 *   npx tsx scripts/import-blog-post.ts docs/BLOG_POST_EXAMPLE.json
 *   npx tsx scripts/import-blog-post.ts path/to/post.json --update-by-slug
 */
import { readFileSync } from "node:fs";
import { randomUUID } from "node:crypto";
import { connectMongo } from "../src/lib/db/mongodb";
import { ensureBlogPostIndexes, getBlogPostModel } from "../src/lib/blog/models/BlogPost";
import {
  BLOG_DEFAULT_LANGUAGE,
  BLOG_DEFAULT_TARGET_COUNTRY,
} from "../src/lib/blog/constants";
import { validateBlogPostInput } from "../src/lib/blog/validation/validateBlogPostInput";
import { computeReadingTimeMinutes } from "../src/lib/blog/utils/readingTime";
import { countInternalLinksInMarkdown } from "../src/lib/blog/utils/countInternalLinks";

function parseArgs(argv: string[]) {
  const file = argv.find((a) => !a.startsWith("-"));
  const updateBySlug = argv.includes("--update-by-slug");
  return { file, updateBySlug };
}

function publicBlogId(): string {
  return `blog_${randomUUID().replace(/-/g, "").slice(0, 16)}`;
}

async function main() {
  const { file, updateBySlug } = parseArgs(process.argv.slice(2));
  if (!file) {
    console.error("Usage: npx tsx scripts/import-blog-post.ts <post.json> [--update-by-slug]");
    process.exit(1);
  }

  const raw = JSON.parse(readFileSync(file, "utf8"));
  const validated = validateBlogPostInput(raw);
  if (!validated.ok) {
    console.error(validated.errors.join("\n"));
    process.exit(1);
  }

  const input = validated.value;
  const connect = await connectMongo();
  if (!connect.ok) {
    console.error("MongoDB not configured (MONGODB_URI, MONGODB_DB_NAME)");
    process.exit(1);
  }

  await ensureBlogPostIndexes();
  const model = getBlogPostModel();

  const siteHost =
    process.env.NEXT_PUBLIC_SITE_URL?.replace(/^https?:\/\//, "").replace(/\/$/, "") ??
    "contentpreflight.example.com";

  const reading =
    input.reading_time_minutes && input.reading_time_minutes > 0
      ? input.reading_time_minutes
      : computeReadingTimeMinutes(input.content);

  const internalLinks =
    typeof input.internal_links_count === "number"
      ? input.internal_links_count
      : countInternalLinksInMarkdown(input.content, siteHost);

  const now = new Date();
  const doc = {
    id: input.id?.trim() || publicBlogId(),
    title: input.title.trim(),
    slug: input.slug.trim(),
    content: input.content,
    meta_title: input.meta_title.trim(),
    meta_description: input.meta_description.trim(),
    category: input.category.trim(),
    thumbnail_url: input.thumbnail_url ?? null,
    meta_keywords: input.meta_keywords ?? [],
    tags: input.tags ?? [],
    meta_abstract: input.meta_abstract ?? null,
    author_id: input.author_id.trim(),
    focus_keyword: input.focus_keyword ?? null,
    canonical_url: input.canonical_url ?? null,
    status: input.status ?? "draft",
    reading_time_minutes: reading,
    internal_links_count: internalLinks,
    schema_markup: input.schema_markup ?? null,
    language_code: input.language_code ?? BLOG_DEFAULT_LANGUAGE,
    target_country: input.target_country ?? BLOG_DEFAULT_TARGET_COUNTRY,
    answer_summary: input.answer_summary ?? null,
    key_takeaways: input.key_takeaways ?? [],
    entities_json: input.entities_json ?? [],
    sources_json: input.sources_json ?? [],
    reviewed_at: input.reviewed_at ? new Date(input.reviewed_at) : null,
    created_at: input.created_at ? new Date(input.created_at) : now,
    updated_at: input.updated_at ? new Date(input.updated_at) : now,
  };

  const existing = await model.findOne({ slug: doc.slug });
  if (existing && !updateBySlug) {
    console.error(`Slug collision: ${doc.slug}. Use --update-by-slug to overwrite.`);
    process.exit(1);
  }

  if (existing && updateBySlug) {
    doc.id = String(existing.id);
    await model.updateOne({ slug: doc.slug }, { $set: doc });
    console.log(`Updated post ${doc.slug} (${doc.status})`);
  } else {
    await model.create(doc);
    console.log(`Created post ${doc.slug} (${doc.status})`);
  }

  if (doc.status === "published") {
    const { submitIndexNowUrls } = await import("../src/lib/seo/indexnow");
    const { resolveBlogPostCanonical } = await import("../src/lib/blog/seo/canonical");
    const url = resolveBlogPostCanonical(doc.slug, doc.canonical_url ?? null);
    const result = await submitIndexNowUrls([url]);
    if (result.ok) {
      console.log("IndexNow: submitted URL");
    }
  }

  await connect.connection.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
