import type { BlogAuthorConfig } from "@/config/blog-authors";

type AuthorCardProps = {
  author: BlogAuthorConfig;
};

export function AuthorCard({ author }: AuthorCardProps) {
  return (
    <aside
      aria-label="About the author"
      className="rounded-xl border border-border bg-card p-5 sm:p-6"
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
        Written by
      </p>
      <p className="mt-1 text-lg font-semibold">
        {author.url ? (
          <a href={author.url} className="hover:underline">
            {author.name}
          </a>
        ) : (
          author.name
        )}
      </p>
      {author.title ? <p className="text-sm text-muted-foreground">{author.title}</p> : null}
      {author.bio ? <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{author.bio}</p> : null}
    </aside>
  );
}
