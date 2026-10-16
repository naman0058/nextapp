import { Suspense } from "react";
import { Container } from "@/components/ui/Container";
import { BlogIndexContent } from "@/features/blog/components/BlogIndexContent";
import { BlogIndexFallback } from "@/features/blog/components/BlogIndexFallback";
import { metadataForStaticRoute } from "@/lib/seo/getRouteSeoMetadata";

export const metadata = metadataForStaticRoute("/blog");

type BlogIndexPageProps = {
  searchParams: Promise<{ page?: string }>;
};

export default function BlogIndexPage({ searchParams }: BlogIndexPageProps) {
  return (
    <Container className="max-w-6xl py-14">
      <header className="max-w-2xl">
        <h1 className="text-3xl font-semibold tracking-tight sm:text-4xl">Accessibility guides</h1>
        <p className="mt-3 text-muted-foreground">
          Practical WCAG, alt text, contrast, keyboard, and social media accessibility articles.
        </p>
      </header>

      <Suspense fallback={<BlogIndexFallback />}>
        <BlogIndexContent searchParams={searchParams} />
      </Suspense>
    </Container>
  );
}
