# Blog editorial workflow

No CMS or public write API in this release—content is imported via scripts.

## 1. Author content

- Write Markdown locally.
- Fill SEO fields (`meta_title`, `meta_description`, `answer_summary`, `key_takeaways`, `sources_json`).
- Start with `status: "draft"` in JSON.

See [`docs/BLOG_POST_EXAMPLE.json`](docs/BLOG_POST_EXAMPLE.json).

## 2. Import

```bash
npx tsx scripts/import-blog-post.ts docs/BLOG_POST_EXAMPLE.json
```

Update existing slug:

```bash
npx tsx scripts/import-blog-post.ts path/to/post.json --update-by-slug
```

Indexes (first deploy or after schema change):

```bash
npx tsx scripts/ensure-blog-indexes.ts
```

## 3. Review

- Preview locally with MongoDB configured and `status: "published"` on a staging database only, or temporarily publish in dev.
- Verify canonical, JSON-LD, internal tool links, and mobile layout.

## 4. Publish

- Set `status: "published"` and set `created_at` to the intended publication date.
- Re-import with `--update-by-slug`.
- Confirm sitemap/RSS entries after revalidate window.

## Dev seed (draft placeholders)

```bash
npx tsx scripts/seed-blog.ts
```

Draft-only—never ship seed slugs to production without full editorial review.
