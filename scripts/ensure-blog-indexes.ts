/**
 * Ensures MongoDB indexes for blog_posts. Run after connect during import/seed.
 *
 * Usage: npx tsx scripts/ensure-blog-indexes.ts
 */
import { connectMongo } from "../src/lib/db/mongodb";
import { ensureBlogPostIndexes } from "../src/lib/blog/models/BlogPost";

async function main() {
  const result = await connectMongo();
  if (!result.ok) {
    console.error("[ensure-blog-indexes] MongoDB not configured or connection failed");
    process.exit(1);
  }
  await ensureBlogPostIndexes();
  console.log("[ensure-blog-indexes] indexes ensured");
  await result.connection.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
