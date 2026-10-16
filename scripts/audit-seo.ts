/**
 * SEO launch audit — registry integrity, duplicate titles/descriptions, sitemap coverage.
 * Usage: npx tsx scripts/audit-seo.ts
 */
import { writeFileSync } from "node:fs";
import { join } from "node:path";
import { buildLlmsTxt } from "../src/lib/seo/buildLlmsTxt";
import { buildOrganizationJsonLd } from "../src/lib/seo/jsonld/buildOrganizationJsonLd";
import { buildWebSiteJsonLd } from "../src/lib/seo/jsonld/buildWebSiteJsonLd";
import { STATIC_ROUTE_SEO, getIndexableStaticSitemapPaths } from "../src/lib/seo/route-registry";

type Status = "PASS" | "WARN" | "FAIL";

const BANNED_PHRASES = [
  "ada compliant",
  "100% compliant",
  "guaranteed compliance",
  "legal protection",
  "certified wcag",
];

function audit(): { lines: string[]; exitCode: number } {
  const lines: string[] = ["# SEO Launch Audit", "", `Generated: ${new Date().toISOString()}`, ""];
  let exitCode = 0;

  function row(status: Status, message: string) {
    lines.push(`- **${status}**: ${message}`);
    if (status === "FAIL") exitCode = 1;
  }

  const titles = STATIC_ROUTE_SEO.map((r) => r.title.trim());
  const descriptions = STATIC_ROUTE_SEO.map((r) => r.description.trim());
  const titleDupes = titles.filter((t, i) => titles.indexOf(t) !== i);
  const descDupes = descriptions.filter((d, i) => descriptions.indexOf(d) !== i);

  if (titleDupes.length === 0) row("PASS", "All static route titles are unique");
  else row("FAIL", `Duplicate titles: ${[...new Set(titleDupes)].join(", ")}`);

  if (descDupes.length === 0) row("PASS", "All static route descriptions are unique");
  else row("FAIL", `Duplicate descriptions detected (${descDupes.length})`);

  for (const route of STATIC_ROUTE_SEO) {
    if (!route.title || !route.description) {
      row("FAIL", `Missing title or description for ${route.path}`);
    }
    if (route.index && !route.includeInSitemap && route.path !== "/blog/[slug]") {
      row("WARN", `${route.path} is indexable but excluded from static sitemap list`);
    }
  }

  const missingFromSitemap = STATIC_ROUTE_SEO.filter(
    (r) => r.includeInSitemap && !getIndexableStaticSitemapPaths().includes(r.path === "/" ? "" : r.path),
  );
  if (missingFromSitemap.length === 0) {
    row("PASS", "All indexable static routes appear in sitemap path list");
  } else {
    row("FAIL", `Sitemap missing: ${missingFromSitemap.map((r) => r.path).join(", ")}`);
  }

  const corpus = STATIC_ROUTE_SEO.map((r) => `${r.title} ${r.description}`).join(" ").toLowerCase();
  const bannedHits = BANNED_PHRASES.filter((p) => corpus.includes(p));
  if (bannedHits.length === 0) row("PASS", "No banned legal/compliance phrases in registry copy");
  else row("FAIL", `Banned phrases in registry: ${bannedHits.join(", ")}`);

  try {
    JSON.stringify(buildWebSiteJsonLd());
    JSON.stringify(buildOrganizationJsonLd());
    row("PASS", "Global JSON-LD builders produce valid JSON");
  } catch {
    row("FAIL", "JSON-LD builder threw");
  }

  const llms = buildLlmsTxt();
  if (llms.includes("not relied upon for Google Search rankings")) {
    row("PASS", "llms.txt includes non-ranking disclaimer");
  } else {
    row("WARN", "llms.txt missing Google ranking disclaimer");
  }
  if (llms.includes("/api/")) {
    row("FAIL", "llms.txt must not list API routes");
  } else {
    row("PASS", "llms.txt excludes API routes");
  }

  if (!process.env.NEXT_PUBLIC_SITE_URL?.trim()) {
    row("WARN", "NEXT_PUBLIC_SITE_URL unset — canonicals use fallback until production env is set");
  } else {
    row("PASS", "NEXT_PUBLIC_SITE_URL is set");
  }

  lines.push("", "## Summary", "");
  lines.push(
    exitCode === 0
      ? "**SEO LAUNCH READY WITH POST-DEPLOYMENT VERIFICATION** (automated checks passed; verify live domain, GSC, and Bing manually)"
      : "**SEO LAUNCH BLOCKED** (fix FAIL items above)",
  );

  return { lines, exitCode };
}

const { lines, exitCode } = audit();
const out = join(process.cwd(), "SEO_LAUNCH_AUDIT.md");
writeFileSync(out, lines.join("\n"), "utf8");
console.log(lines.join("\n"));
process.exit(exitCode);
