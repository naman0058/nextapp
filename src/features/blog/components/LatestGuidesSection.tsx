import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { BlogPostCard } from "@/features/blog/components/BlogPostCard";
import { getLatestPublishedBlogPosts } from "@/lib/blog/repository/getLatestPublishedBlogPosts";
import { BLOG_LATEST_HOMEPAGE_COUNT } from "@/lib/blog/constants";
import { markBlogDynamic } from "@/lib/blog/request/markBlogDynamic";

export async function LatestGuidesSection() {
  await markBlogDynamic();
  const result = await getLatestPublishedBlogPosts(BLOG_LATEST_HOMEPAGE_COUNT);
  if (!result.ok || result.data.length === 0) {
    return null;
  }

  return (
    <section className="border-t border-border bg-muted/30 py-16 sm:py-20">
      <Container className="max-w-6xl">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
              Resources
            </p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight sm:text-3xl">
              Latest accessibility guides
            </h2>
          </div>
          <Link href="/blog" className="text-sm font-medium text-primary hover:underline">
            View all guides
          </Link>
        </div>
        <ul className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {result.data.map((post) => (
            <li key={post.id}>
              <BlogPostCard post={post} />
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
