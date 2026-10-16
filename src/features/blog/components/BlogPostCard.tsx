import Link from "next/link";
import Image from "next/image";
import { slugifyCategoryName } from "@/lib/blog/categorySlug";
import type { BlogPostCard as BlogPostCardType } from "@/lib/blog/types";

type BlogPostCardProps = {
  post: BlogPostCardType;
};

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}

export function BlogPostCard({ post }: BlogPostCardProps) {
  const categorySlug = slugifyCategoryName(post.category);

  return (
    <article className="flex h-full flex-col overflow-hidden rounded-xl border border-border bg-card shadow-sm transition hover:border-primary/30">
      {post.thumbnail_url ? (
        <div className="relative aspect-[16/9] w-full bg-muted">
          <Image
            src={post.thumbnail_url}
            alt=""
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
      ) : null}
      <div className="flex flex-1 flex-col p-5">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
          <Link href={`/blog/category/${categorySlug}`} className="hover:text-foreground">
            {post.category}
          </Link>
        </p>
        <h2 className="mt-2 text-lg font-semibold leading-snug">
          <Link href={`/blog/${post.slug}`} className="hover:underline">
            {post.title}
          </Link>
        </h2>
        <p className="mt-2 flex-1 text-sm text-muted-foreground line-clamp-3">
          {post.meta_description}
        </p>
        <p className="mt-4 text-xs text-muted-foreground">
          {formatDate(post.created_at)} · {post.reading_time_minutes} min read
        </p>
      </div>
    </article>
  );
}
