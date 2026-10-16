import { describe, expect, it } from "vitest";
import { slugifyCategoryName, resolveCategoryDisplayName } from "@/lib/blog/categorySlug";
import { resolveBlogPostCanonical, isValidCanonicalOverride } from "@/lib/blog/seo/canonical";
import { computeReadingTimeMinutes } from "@/lib/blog/utils/readingTime";
import { countInternalLinksInMarkdown } from "@/lib/blog/utils/countInternalLinks";
import { validateBlogPostInput, isSafeSourceUrl } from "@/lib/blog/validation/validateBlogPostInput";
import { pickTopRelatedPosts } from "@/lib/blog/utils/relatedPostScore";
import { buildBlogPostingJsonLd } from "@/lib/blog/seo/buildBlogPostingJsonLd";
import { mergeSchemaMarkup } from "@/lib/blog/seo/mergeSchemaMarkup";
import { buildBlogRssXml } from "@/lib/blog/rss/buildRssXml";
import { buildBlogSitemapUrls } from "@/lib/blog/sitemap/buildBlogSitemapEntries";
import { getBlogAuthor } from "@/config/blog-authors";

describe("category slugs", () => {
  it("slugifies and resolves display names", () => {
    const slug = slugifyCategoryName("Website Accessibility");
    expect(slug).toBe("website-accessibility");
    const name = resolveCategoryDisplayName(slug, ["Website Accessibility", "Color Contrast"]);
    expect(name).toBe("Website Accessibility");
  });
});

describe("canonical", () => {
  it("rejects javascript overrides", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    const url = resolveBlogPostCanonical("my-post", "javascript:alert(1)");
    expect(url).toBe("https://example.com/blog/my-post");
    expect(isValidCanonicalOverride("https://ok.example/article")).toBe(true);
  });
});

describe("reading time and links", () => {
  it("computes minimum one minute", () => {
    expect(computeReadingTimeMinutes("hello")).toBe(1);
  });

  it("counts internal markdown links", () => {
    const md = "See [tool](/website-accessibility-scanner) and [ext](https://other.test).";
    expect(countInternalLinksInMarkdown(md, "example.com")).toBe(1);
  });
});

describe("validation", () => {
  it("blocks javascript source URLs", () => {
    expect(isSafeSourceUrl("javascript:evil()")).toBe(false);
    const result = validateBlogPostInput({
      title: "T",
      slug: "valid-slug",
      content: "body",
      meta_title: "T",
      meta_description: "D",
      category: "Cat",
      author_id: "editorial",
      sources_json: [{ title: "Bad", url: "javascript:alert(1)" }],
    });
    expect(result.ok).toBe(false);
  });
});

describe("related posts", () => {
  it("scores category and tags", () => {
    const post = {
      id: "1",
      title: "A",
      slug: "a",
      meta_description: "d",
      created_at: new Date(),
      category: "Website Accessibility",
      reading_time_minutes: 3,
      tags: ["wcag"],
    };
    const candidates = [
      {
        ...post,
        id: "2",
        slug: "b",
        tags: ["wcag", "keyboard"],
        entities_json: [{ name: "WCAG" }],
      },
    ];
    const picked = pickTopRelatedPosts(post, candidates, 4);
    expect(picked[0]?.slug).toBe("b");
  });
});

describe("JSON-LD", () => {
  it("builds BlogPosting without @graph injection", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    const post = {
      id: "x",
      title: "Title",
      slug: "slug",
      content: "# Hi",
      meta_title: "Meta",
      meta_description: "Desc",
      created_at: new Date("2024-01-01"),
      updated_at: new Date("2024-02-01"),
      category: "WCAG",
      meta_keywords: [],
      tags: [],
      author_id: "editorial",
      status: "published" as const,
      reading_time_minutes: 2,
      internal_links_count: 0,
      language_code: "en-US",
      key_takeaways: [],
    };
    const json = buildBlogPostingJsonLd(post, getBlogAuthor("editorial"));
    expect(json["@type"]).toBe("BlogPosting");
    expect(json["@graph"]).toBeUndefined();
  });

  it("strips malicious schema_markup", () => {
    const merged = mergeSchemaMarkup(
      { "@context": "https://schema.org", "@type": "BlogPosting", headline: "Safe" },
      {
        "@context": "http://evil.test",
        "@graph": [{ "@type": "Malware" }],
        "@type": "Article",
        wordCount: 100,
      },
    );
    expect(merged["@context"]).toBe("https://schema.org");
    expect(merged["@graph"]).toBeUndefined();
    expect(merged["@type"]).toBe("Article");
    expect(merged.wordCount).toBe(100);
  });
});

describe("RSS and sitemap helpers", () => {
  it("builds RSS xml with escaped titles", () => {
    process.env.NEXT_PUBLIC_SITE_URL = "https://example.com";
    const xml = buildBlogRssXml([
      {
        title: "Tom & Jerry",
        slug: "tom-jerry",
        meta_description: "Desc",
        created_at: new Date("2024-01-01T00:00:00.000Z"),
        updated_at: new Date("2024-01-02T00:00:00.000Z"),
        category: "Guides",
        author_id: "editorial",
      },
    ]);
    expect(xml).toContain("Tom &amp; Jerry");
    expect(xml).toContain("/blog/tom-jerry");
  });

  it("excludes thin categories from sitemap urls", () => {
    const urls = buildBlogSitemapUrls(
      [{ slug: "post-a", updated_at: new Date(), canonical_url: null }],
      [
        { category: "Thin", categorySlug: "thin", count: 1 },
        { category: "Full", categorySlug: "full", count: 2 },
      ],
    );
    const paths = urls.map((u) => u.path);
    expect(paths).toContain("/blog");
    expect(paths).not.toContain("/blog/category/thin");
    expect(paths).toContain("/blog/category/full");
    expect(paths).toContain("/blog/post-a");
  });
});
