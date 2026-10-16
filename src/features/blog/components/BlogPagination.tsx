import Link from "next/link";
import { cn } from "@/lib/utils";

type BlogPaginationProps = {
  basePath: string;
  page: number;
  totalPages: number;
};

export function BlogPagination({ basePath, page, totalPages }: BlogPaginationProps) {
  if (totalPages <= 1) return null;

  const prev = page > 1 ? page - 1 : null;
  const next = page < totalPages ? page + 1 : null;

  function hrefFor(p: number): string {
    if (p <= 1) return basePath;
    const sep = basePath.includes("?") ? "&" : "?";
    return `${basePath}${sep}page=${p}`;
  }

  return (
    <nav aria-label="Blog pagination" className="mt-10 flex items-center justify-between gap-4">
      {prev ? (
        <Link
          href={hrefFor(prev)}
          className="rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted"
        >
          Previous
        </Link>
      ) : (
        <span className="text-sm text-muted-foreground">Previous</span>
      )}
      <p className="text-sm text-muted-foreground">
        Page {page} of {totalPages}
      </p>
      {next ? (
        <Link
          href={hrefFor(next)}
          className={cn(
            "rounded-lg border border-border px-4 py-2 text-sm font-medium hover:bg-muted",
          )}
        >
          Next
        </Link>
      ) : (
        <span className="text-sm text-muted-foreground">Next</span>
      )}
    </nav>
  );
}
