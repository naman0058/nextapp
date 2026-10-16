import { BLOG_TOC_COLLAPSE_THRESHOLD } from "@/lib/blog/constants";
import type { MarkdownHeading } from "@/lib/blog/utils/extractHeadings";
import { cn } from "@/lib/utils";

type ArticleTableOfContentsProps = {
  headings: MarkdownHeading[];
};

export function ArticleTableOfContents({ headings }: ArticleTableOfContentsProps) {
  if (headings.length === 0) {
    return null;
  }

  const collapsible = headings.length >= BLOG_TOC_COLLAPSE_THRESHOLD;

  const list = (
    <ol className="space-y-2 text-sm">
      {headings.map((h) => (
        <li
          key={h.id}
          className={cn(h.level === 3 && "ml-4 border-l border-border pl-3")}
        >
          <a href={`#${h.id}`} className="text-muted-foreground hover:text-foreground">
            {h.text}
          </a>
        </li>
      ))}
    </ol>
  );

  if (!collapsible) {
    return (
      <nav aria-label="Table of contents" className="rounded-xl border border-border bg-card p-4">
        <p className="mb-3 text-sm font-semibold">On this page</p>
        {list}
      </nav>
    );
  }

  return (
    <nav aria-label="Table of contents" className="rounded-xl border border-border bg-card p-4">
      <details className="group">
        <summary className="cursor-pointer text-sm font-semibold marker:content-none">
          <span className="inline-flex items-center gap-2">
            On this page
            <span className="text-xs font-normal text-muted-foreground group-open:hidden">
              (show)
            </span>
          </span>
        </summary>
        <div className="mt-3">{list}</div>
      </details>
    </nav>
  );
}
