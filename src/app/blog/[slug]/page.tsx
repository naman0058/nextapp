import { Suspense } from "react";
import { BlogArticlePageContent } from "@/features/blog/components/BlogArticlePageContent";
import { BlogIndexFallback } from "@/features/blog/components/BlogIndexFallback";
import { createBlogArticleMetadata } from "@/lib/blog/metadata/createBlogArticleMetadata";
import { getBlogPostBySlug } from "@/lib/blog/repository/getBlogPostBySlug";

type BlogArticlePageProps = {
  params: Promise<{ slug: string }>;
};

export async function generateMetadata({ params }: BlogArticlePageProps) {
  const { slug } = await params;
  const result = await getBlogPostBySlug(slug);
  if (!result.ok || !result.data) {
    return { title: "Guide not found" };
  }
  return createBlogArticleMetadata(result.data);
}

export default function BlogArticlePage({ params }: BlogArticlePageProps) {
  return (
    <Suspense fallback={<BlogIndexFallback />}>
      <BlogArticlePageContent params={params} />
    </Suspense>
  );
}
