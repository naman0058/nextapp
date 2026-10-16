import Link from "next/link";
import type { BlogCategorySummary } from "@/lib/blog/types";
import { cn } from "@/lib/utils";

type BlogCategoryStripProps = {
  categories: BlogCategorySummary[];
  activeSlug?: string;
};

export function BlogCategoryStrip({ categories, activeSlug }: BlogCategoryStripProps) {
  if (categories.length === 0) return null;

  return (
    <nav aria-label="Blog categories" className="flex flex-wrap gap-2">
      <Link
        href="/blog"
        className={cn(
          "rounded-full border px-3 py-1 text-sm",
          !activeSlug ? "border-primary bg-primary/10" : "border-border hover:bg-muted",
        )}
      >
        All
      </Link>
      {categories.map((cat) => (
        <Link
          key={cat.categorySlug}
          href={`/blog/category/${cat.categorySlug}`}
          className={cn(
            "rounded-full border px-3 py-1 text-sm",
            activeSlug === cat.categorySlug
              ? "border-primary bg-primary/10"
              : "border-border hover:bg-muted",
          )}
        >
          {cat.category} ({cat.count})
        </Link>
      ))}
    </nav>
  );
}
