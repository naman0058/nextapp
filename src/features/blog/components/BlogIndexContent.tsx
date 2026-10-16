import { BlogCategoryStrip } from "@/features/blog/components/BlogCategoryStrip";
import { BlogEmptyState } from "@/features/blog/components/BlogEmptyState";
import { BlogPagination } from "@/features/blog/components/BlogPagination";
import { BlogPostCard } from "@/features/blog/components/BlogPostCard";
import { BlogUnavailable } from "@/features/blog/components/BlogUnavailable";
import { BLOG_POSTS_PER_PAGE } from "@/lib/blog/constants";
import { getBlogCategories } from "@/lib/blog/repository/getBlogCategories";
import { getPublishedBlogPosts } from "@/lib/blog/repository/getPublishedBlogPosts";
import { markBlogDynamic } from "@/lib/blog/request/markBlogDynamic";

type BlogIndexContentProps = {
  searchParams: Promise<{ page?: string }>;
};

export async function BlogIndexContent({ searchParams }: BlogIndexContentProps) {
  await markBlogDynamic();
  const params = await searchParams;
  const page = Math.max(1, Number.parseInt(params.page ?? "1", 10) || 1);

  const [postsResult, categoriesResult] = await Promise.all([
    getPublishedBlogPosts({ page, limit: BLOG_POSTS_PER_PAGE }),
    getBlogCategories(),
  ]);

  if (!postsResult.ok) {
    return <BlogUnavailable />;
  }

  const { posts, total, limit } = postsResult.data;
  const totalPages = Math.max(1, Math.ceil(total / limit));
  const categories = categoriesResult.ok ? categoriesResult.data : [];

  return (
    <>
      {categories.length > 0 ? (
        <div className="mt-8">
          <BlogCategoryStrip categories={categories} />
        </div>
      ) : null}

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
          <BlogPagination basePath="/blog" page={page} totalPages={totalPages} />
        </>
      )}
    </>
  );
}
