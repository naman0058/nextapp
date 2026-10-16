# Blog database schema

Collection: **`blog_posts`** (Mongoose model `BlogPost`).

MongoDB is used **only** for public editorial blog content—not accessibility scan data, uploads, or user sessions.

## Field reference

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `_id` | ObjectId | auto | Internal MongoDB identifier |
| `id` | string | yes | Public stable article ID (UUID/`blog_*`), unique index |
| `title` | string | yes | Display title |
| `slug` | string | yes | URL slug, unique index, lowercase hyphenated |
| `content` | string | yes | Markdown body |
| `meta_title` | string | yes | SEO title |
| `meta_description` | string | yes | SEO description |
| `created_at` | Date | yes | For **published** posts, original publication time |
| `updated_at` | Date | yes | Last editorial update |
| `category` | string | yes | Display category name |
| `thumbnail_url` | string | no | Optional hero/thumbnail |
| `meta_keywords` | string[] | default `[]` | SEO keywords |
| `tags` | string[] | default `[]` | Editorial tags (no public tag index routes) |
| `meta_abstract` | string | no | Optional abstract |
| `author_id` | string | yes | Maps to `src/config/blog-authors.ts` |
| `focus_keyword` | string | no | Primary SEO keyword |
| `canonical_url` | string | no | Override; must be http(s) |
| `status` | enum | yes | `draft` \| `published` \| `archived` |
| `reading_time_minutes` | number | yes | Computed on import if omitted |
| `internal_links_count` | number | default `0` | Computed on import if omitted |
| `schema_markup` | object | no | Optional JSON-LD merge (BlogPosting/Article only) |
| `language_code` | string | default `en-US` | |
| `target_country` | string | default `US` | |
| `answer_summary` | string | no | Quick answer block |
| `key_takeaways` | string[] | default `[]` | |
| `entities_json` | object[] | default `[]` | Structured entities |
| `sources_json` | object[] | default `[]` | Structured citations |
| `reviewed_at` | Date | no | Editorial review timestamp |

## Indexes

- Unique: `id`, `slug`
- Single: `status`, `created_at`, `category`
- Compound: `{ status: 1, created_at: -1 }`, `{ status: 1, category: 1, created_at: -1 }`

Ensure indexes: `npx tsx scripts/ensure-blog-indexes.ts`

## Public query rules

- List, RSS, sitemap, related, and article routes query **`status: "published"`** only.
- Draft/archived slugs return **404** on `/blog/[slug]`.
