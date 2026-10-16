/**
 * Dev-only draft placeholders for editorial topics (does not publish).
 *
 * Usage: npx tsx scripts/seed-blog.ts
 */
import { connectMongo } from "../src/lib/db/mongodb";
import { ensureBlogPostIndexes, getBlogPostModel } from "../src/lib/blog/models/BlogPost";
import { computeReadingTimeMinutes } from "../src/lib/blog/utils/readingTime";

const DRAFTS = [
  {
    slug: "how-to-write-alt-text-for-social-posts",
    title: "How to write alt text for social posts",
    category: "Social Media Accessibility",
    focus_keyword: "alt text social media",
  },
  {
    slug: "wcag-color-contrast-basics",
    title: "WCAG color contrast basics for content teams",
    category: "Color Contrast",
    focus_keyword: "WCAG contrast",
  },
  {
    slug: "keyboard-accessibility-quick-check",
    title: "A quick keyboard accessibility check before launch",
    category: "Website Accessibility",
    focus_keyword: "keyboard accessibility",
  },
] as const;

async function main() {
  const connect = await connectMongo();
  if (!connect.ok) {
    console.error("MongoDB not configured");
    process.exit(1);
  }

  await ensureBlogPostIndexes();
  const model = getBlogPostModel();
  const now = new Date();

  for (const draft of DRAFTS) {
    const exists = await model.findOne({ slug: draft.slug });
    if (exists) {
      console.log(`Skip existing ${draft.slug}`);
      continue;
    }

    const content = `# ${draft.title}\n\nDraft placeholder — replace with reviewed editorial content before publishing.\n\n## Next steps\n\n- Add answer summary and key takeaways\n- Link to relevant preflight tools\n`;
    const reading = computeReadingTimeMinutes(content);

    await model.create({
      id: `blog_seed_${draft.slug}`,
      title: draft.title,
      slug: draft.slug,
      content,
      meta_title: draft.title,
      meta_description: `Draft guide: ${draft.title}.`,
      category: draft.category,
      author_id: "editorial",
      status: "draft",
      reading_time_minutes: reading,
      internal_links_count: 0,
      language_code: "en-US",
      target_country: "US",
      focus_keyword: draft.focus_keyword,
      meta_keywords: [],
      tags: [],
      key_takeaways: [],
      entities_json: [],
      sources_json: [],
      created_at: now,
      updated_at: now,
    });
    console.log(`Seeded draft ${draft.slug}`);
  }

  await connect.connection.disconnect();
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
