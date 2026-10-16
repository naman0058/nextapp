# Blog SEO architecture

## Routes

| URL | Purpose |
|-----|---------|
| `/blog` | Index, pagination, category strip |
| `/blog/[slug]` | Article (Markdown, JSON-LD, OG article metadata) |
| `/blog/category/[categorySlug]` | Category archive (`noindex` when &lt; 2 posts) |
| `/blog/rss.xml` | RSS 2.0 (published only) |

## Metadata

- Index/category: [`createPageMetadata`](src/lib/metadata.ts)
- Articles: [`createBlogArticleMetadata`](src/lib/blog/metadata/createBlogArticleMetadata.ts) with `openGraph.type: article`

## Canonical

[`resolveBlogPostCanonical`](src/lib/blog/seo/canonical.ts) — override when valid http(s), else `{NEXT_PUBLIC_SITE_URL}/blog/{slug}`.

## Structured data

- `BlogPosting` via [`buildBlogPostingJsonLd`](src/lib/blog/seo/buildBlogPostingJsonLd.ts)
- Breadcrumbs via [`buildBreadcrumbJsonLd`](src/lib/blog/seo/buildBreadcrumbJsonLd.ts)
- Optional stored `schema_markup` merged with [`mergeSchemaMarkup`](src/lib/blog/seo/mergeSchemaMarkup.ts) (whitelist types, strip `@context` / `@graph` abuse)

## Sitemap

[`src/app/sitemap.ts`](src/app/sitemap.ts) — static routes plus `/blog`, indexable categories (≥ 2 posts), and published posts with `lastModified: updated_at`. On DB failure, static routes only.

## Caching

With Next.js 16 `cacheComponents`, blog data loads inside `<Suspense>` boundaries via `connection()` ([`markBlogDynamic`](src/lib/blog/request/markBlogDynamic.ts)). `BLOG_REVALIDATE_SECONDS` remains available for future cache tuning.

## Indexing

- Published posts: indexable
- Draft/archived: not linked, not in sitemap/RSS
- Thin category pages (&lt; 2 posts): `robots: noindex, follow`
