import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { STATIC_ROUTE_SEO } from "../src/lib/seo/route-registry";

const header = `# SEO Route Inventory

Source of truth: \`src/lib/seo/route-registry.ts\` (static routes). Dynamic blog routes use MongoDB metadata.

| Route | Page Type | Primary Intent | Primary Keyword | Index | Sitemap | Title | SEO Status |
|-------|-----------|----------------|-----------------|-------|---------|-------|------------|
`;

const rows = STATIC_ROUTE_SEO.map(
  (r) =>
    `| ${r.path} | ${r.pageType} | ${r.primaryIntent.replace(/\|/g, "/")} | ${r.primaryKeyword} | ${r.index ? "INDEX" : "NOINDEX"} | ${r.includeInSitemap ? "Yes" : "No"} | ${r.title.replace(/\|/g, "/")} | Ready |`,
).join("\n");

const footer = `
| /blog/[slug] | BLOG_ARTICLE | Published guide | (per post) | INDEX when published | Yes when published | (DB meta_title) | Ready |
| /blog/category/[categorySlug] | BLOG_CATEGORY | Category hub | (per category) | INDEX when populated | Yes when ≥ min posts | (dynamic) | Ready |

## Excluded from index

- All \`/api/*\` routes (not public marketing)
- Non-production deployments (\`robots\` + \`noindex\` metadata when indexing disabled)
- Draft / unknown blog slugs (404)
- Thin blog categories (noindex via metadata)
`;

writeFileSync(join(process.cwd(), "SEO_ROUTE_INVENTORY.md"), header + rows + footer, "utf8");
console.log("Wrote SEO_ROUTE_INVENTORY.md");
