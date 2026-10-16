import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import rehypeSanitize from "rehype-sanitize";
import { blogMarkdownSanitizeSchema } from "@/lib/blog/markdown/sanitizeSchema";
import { slugifyCategoryName } from "@/lib/blog/categorySlug";

function slugifyHeading(text: string): string {
  return slugifyCategoryName(text.replace(/\s+#+\s*$/, ""));
}

type BlogMarkdownProps = {
  content: string;
  headingIds?: Map<string, string>;
};

function getHeadingId(text: string, headingIds?: Map<string, string>): string | undefined {
  const plain = String(text).replace(/<[^>]+>/g, "");
  if (headingIds?.has(plain)) {
    return headingIds.get(plain);
  }
  return slugifyHeading(plain) || undefined;
}

function isExternalHref(href: string): boolean {
  return /^https?:\/\//i.test(href) || href.startsWith("//");
}

export function BlogMarkdown({ content, headingIds }: BlogMarkdownProps) {
  return (
    <div className="blog-prose prose prose-neutral max-w-none dark:prose-invert">
      <ReactMarkdown
        remarkPlugins={[remarkGfm]}
        rehypePlugins={[[rehypeSanitize, blogMarkdownSanitizeSchema]]}
        components={{
          h2: ({ children }) => {
            const id = getHeadingId(String(children), headingIds);
            return (
              <h2 id={id} className="scroll-mt-24 text-2xl font-semibold tracking-tight">
                {children}
              </h2>
            );
          },
          h3: ({ children }) => {
            const id = getHeadingId(String(children), headingIds);
            return (
              <h3 id={id} className="scroll-mt-24 text-xl font-semibold tracking-tight">
                {children}
              </h3>
            );
          },
          a: ({ href, children }) => {
            const safeHref = href ?? "#";
            const external = isExternalHref(safeHref);
            return (
              <a
                href={safeHref}
                className="font-medium text-primary underline-offset-4 hover:underline"
                {...(external
                  ? { target: "_blank", rel: "noopener noreferrer" }
                  : {})}
              >
                {children}
              </a>
            );
          },
          table: ({ children }) => (
            <div className="my-6 overflow-x-auto rounded-lg border border-border">
              <table className="min-w-full divide-y divide-border text-sm">{children}</table>
            </div>
          ),
        }}
      >
        {content}
      </ReactMarkdown>
    </div>
  );
}
