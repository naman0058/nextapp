import type { BlogSource } from "@/lib/blog/types";

type SourcesListProps = {
  sources: BlogSource[];
};

export function SourcesList({ sources }: SourcesListProps) {
  if (!sources.length) return null;

  return (
    <section aria-labelledby="sources-heading" className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <h2 id="sources-heading" className="text-lg font-semibold">
        Sources
      </h2>
      <ol className="mt-3 list-decimal space-y-3 pl-5 text-sm">
        {sources.map((source) => (
          <li key={`${source.url}-${source.title}`}>
            <a
              href={source.url}
              className="font-medium text-primary underline-offset-4 hover:underline"
              rel="noopener noreferrer"
              target="_blank"
            >
              {source.title}
            </a>
            {source.publisher ? (
              <span className="text-muted-foreground"> — {source.publisher}</span>
            ) : null}
          </li>
        ))}
      </ol>
    </section>
  );
}
