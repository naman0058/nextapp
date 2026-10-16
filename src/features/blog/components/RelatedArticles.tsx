import { BlogPostCard } from "@/features/blog/components/BlogPostCard";
import type { BlogPostCard as BlogPostCardType } from "@/lib/blog/types";

type RelatedArticlesProps = {
  posts: BlogPostCardType[];
};

export function RelatedArticles({ posts }: RelatedArticlesProps) {
  if (posts.length === 0) return null;

  return (
    <section aria-labelledby="related-articles-heading">
      <h2 id="related-articles-heading" className="text-xl font-semibold">
        Related guides
      </h2>
      <ul className="mt-4 grid gap-4 sm:grid-cols-2">
        {posts.map((post) => (
          <li key={post.id}>
            <BlogPostCard post={post} />
          </li>
        ))}
      </ul>
    </section>
  );
}
