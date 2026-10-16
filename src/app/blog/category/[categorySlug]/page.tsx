import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { BlogCategoryPageContent } from "@/features/blog/components/BlogCategoryPageContent";
import { BlogIndexFallback } from "@/features/blog/components/BlogIndexFallback";
import { BLOG_INDEXABLE_CATEGORY_MIN_POSTS } from "@/lib/blog/constants";
import { getBlogCategories } from "@/lib/blog/repository/getBlogCategories";
import { buildPageMetadata } from "@/lib/seo/buildPageMetadata";

type CategoryPageProps = {
  params: Promise<{ categorySlug: string }>;
  searchParams: Promise<{ page?: string }>;
};

export async function generateMetadata({ params }: CategoryPageProps) {
  const { categorySlug } = await params;
  const categoriesResult = await getBlogCategories();
  if (!categoriesResult.ok) {
    return buildPageMetadata({
      title: "Blog category",
      description: "Accessibility guides by category.",
      path: `/blog/category/${categorySlug}`,
    });
  }
  const match = categoriesResult.data.find((c) => c.categorySlug === categorySlug);
  if (!match) {
    return { title: "Category not found" };
  }
  const robots =
    match.count < BLOG_INDEXABLE_CATEGORY_MIN_POSTS ? { index: false, follow: true } : undefined;

  return {
    ...buildPageMetadata({
      title: `${match.category} guides`,
      description: `Accessibility articles in ${match.category}.`,
      path: `/blog/category/${categorySlug}`,
    }),
    ...(robots ? { robots } : {}),
  };
}

export default function BlogCategoryPage({ params, searchParams }: CategoryPageProps) {
  return (
    <Container className="max-w-6xl py-14">
      <Suspense fallback={<BlogIndexFallback />}>
        <BlogCategoryPageContent params={params} searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}
