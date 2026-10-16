import Image from "next/image";
import { notFound } from "next/navigation";
import { AnswerSummary } from "@/features/blog/components/AnswerSummary";
import { ArticleTableOfContents } from "@/features/blog/components/ArticleTableOfContents";
import { AuthorCard } from "@/features/blog/components/AuthorCard";
import { BlogArticleLayout } from "@/features/blog/components/BlogArticleLayout";
import { BlogBreadcrumbs } from "@/features/blog/components/BlogBreadcrumbs";
import { BlogMarkdown } from "@/features/blog/components/BlogMarkdown";
import { BlogUnavailable } from "@/features/blog/components/BlogUnavailable";
import { KeyTakeaways } from "@/features/blog/components/KeyTakeaways";
import { RelatedArticles } from "@/features/blog/components/RelatedArticles";
import { RelatedTools } from "@/features/blog/components/RelatedTools";
import { SourcesList } from "@/features/blog/components/SourcesList";
import { getBlogAuthor } from "@/config/blog-authors";
import { getRelatedToolsForPost } from "@/config/blog-related-tools";
import { slugifyCategoryName } from "@/lib/blog/categorySlug";
import { getBlogPostBySlug } from "@/lib/blog/repository/getBlogPostBySlug";
import { getRelatedBlogPosts } from "@/lib/blog/repository/getRelatedBlogPosts";
import { markBlogDynamic } from "@/lib/blog/request/markBlogDynamic";
import { buildBlogPostingJsonLd } from "@/lib/blog/seo/buildBlogPostingJsonLd";
import { buildBreadcrumbJsonLd } from "@/lib/blog/seo/buildBreadcrumbJsonLd";
import { buildHeadingIdMap } from "@/lib/blog/utils/buildHeadingIdMap";
import { extractMarkdownHeadings } from "@/lib/blog/utils/extractHeadings";

type BlogArticlePageContentProps = {
  params: Promise<{ slug: string }>;
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export async function BlogArticlePageContent({ params }: BlogArticlePageContentProps) {
  await markBlogDynamic();
  const { slug } = await params;
  const result = await getBlogPostBySlug(slug);

  if (!result.ok) {
    return (
      <BlogArticleLayout
        breadcrumbs={
          <BlogBreadcrumbs items={[{ label: "Blog", href: "/blog" }, { label: "Unavailable" }]} />
        }
        header={<h1 className="text-3xl font-semibold">Guide unavailable</h1>}
      >
        <BlogUnavailable />
      </BlogArticleLayout>
    );
  }

  if (!result.data) {
    notFound();
  }

  const post = result.data;
  const author = getBlogAuthor(post.author_id);
  const categorySlug = slugifyCategoryName(post.category);
  const headings = extractMarkdownHeadings(post.content);
  const headingIds = buildHeadingIdMap(headings);
  const relatedTools = getRelatedToolsForPost({ category: post.category, tags: post.tags });
  const relatedResult = await getRelatedBlogPosts(post);
  const relatedPosts = relatedResult.ok ? relatedResult.data : [];

  const breadcrumbItems = [
    { name: "Blog", path: "/blog" },
    { name: post.category, path: `/blog/category/${categorySlug}` },
    { name: post.title, path: `/blog/${post.slug}` },
  ];

  const blogPostingJsonLd = buildBlogPostingJsonLd(post, author);
  const breadcrumbJsonLd = buildBreadcrumbJsonLd(breadcrumbItems);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(blogPostingJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
      />
      <BlogArticleLayout
        breadcrumbs={
          <BlogBreadcrumbs
            items={[
              { label: "Blog", href: "/blog" },
              { label: post.category, href: `/blog/category/${categorySlug}` },
              { label: post.title },
            ]}
          />
        }
        header={
          <>
            <p className="text-sm font-medium text-muted-foreground">{post.category}</p>
            <h1 className="mt-2 text-3xl font-semibold tracking-tight sm:text-4xl">{post.title}</h1>
            <p className="mt-4 text-muted-foreground">{post.meta_description}</p>
            <p className="mt-4 text-sm text-muted-foreground">
              {formatDate(post.created_at)} · {post.reading_time_minutes} min read
            </p>
            {post.thumbnail_url ? (
              <div className="relative mt-8 aspect-[16/9] overflow-hidden rounded-xl bg-muted">
                <Image
                  src={post.thumbnail_url}
                  alt=""
                  fill
                  className="object-cover"
                  priority
                  sizes="(max-width: 768px) 100vw, 768px"
                />
              </div>
            ) : null}
          </>
        }
        aside={
          <>
            <ArticleTableOfContents headings={headings} />
            <RelatedTools tools={relatedTools} />
          </>
        }
        footer={<RelatedArticles posts={relatedPosts} />}
      >
        {post.answer_summary ? <AnswerSummary summary={post.answer_summary} /> : null}
        {post.key_takeaways.length > 0 ? <KeyTakeaways items={post.key_takeaways} /> : null}
        <BlogMarkdown content={post.content} headingIds={headingIds} />
        <SourcesList sources={post.sources_json ?? []} />
        <AuthorCard author={author} />
      </BlogArticleLayout>
    </>
  );
}
