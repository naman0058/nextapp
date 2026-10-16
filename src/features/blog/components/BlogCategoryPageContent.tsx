import { notFound } from "next/navigation";
import { BlogCategoryStrip } from "@/features/blog/components/BlogCategoryStrip";
import { BlogEmptyState } from "@/features/blog/components/BlogEmptyState";
import { BlogPagination } from "@/features/blog/components/BlogPagination";
import { BlogPostCard } from "@/features/blog/components/BlogPostCard";
import { BlogUnavailable } from "@/features/blog/components/BlogUnavailable";
import { BLOG_POSTS_PER_PAGE } from "@/lib/blog/constants";
import { resolveCategoryDisplayName } from "@/lib/blog/categorySlug";
import { getBlogCategories } from "@/lib/blog/repository/getBlogCategories";
import { getBlogPostsByCategory } from "@/lib/blog/repository/getBlogPostsByCategory";
import { markBlogDynamic } from "@/lib/blog/request/markBlogDynamic";

type BlogCategoryPageContentProps = {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function BlogCategoryPageContent({
  params,
  searchParams,
}: BlogCategoryPageContentProps) {
  await markBlogDynamic();
  const { categorySlug } = await params;
  const query = await searchParams;
  const page = Math.max(1, Number.parseInt(query.page ?? "1", 10) || 1);

  const categoriesResult = await getBlogCategories();
  if (!categoriesResult.ok) {
    return <BlogUnavailable />;
  }

  const categoryNames = categoriesResult.data.map((c) => c.category);
  const displayName = resolveCategoryDisplayName(categorySlug, categoryNames);
  if (!displayName) {
    notFound();
  }

  const categoryMeta = categoriesResult.data.find((c) => c.categorySlug === categorySlug);
  if (!categoryMeta || categoryMeta.count === 0) {
    notFound();
  }

  const postsResult = await getBlogPostsByCategory({
    categoryDisplayName: displayName,
    page,
    limit: BLOG_POSTS_PER_PAGE,
  });

  if (!postsResult.ok) {
    return <BlogUnavailable />;
  }

  const { posts, total, limit } = postsResult.data;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const basePath = `/blog/category/${categorySlug}`;

  return (
    <>
      <header>
        <h1 className="text-3xl font-semibold tracking-tight">{displayName}</h1>
        <p className="mt-2 text-muted-foreground">
          {total} published {total === 1 ? "guide" : "guides"}
        </p>
      </header>

      <div className="mt-8">
        <BlogCategoryStrip categories={categoriesResult.data} activeSlug={categorySlug} />
      </div>

      {posts.length === 0 ? (
        <div className="mt-10">
          <BlogEmptyState />
        </div>
      ) : (
        <>
          <ul className="mt-10 grid gap-6 sm:grid-cols-2">
            {posts.map((post) => (
              <li key={post.id}>
                <BlogPostCard post={post} />
              </li>
            ))}
          </ul>
          <BlogPagination basePath={basePath} page={page} totalPages={totalPages} />
        </>
      )}
    </>
  );
}
