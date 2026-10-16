import Link from "next/link";
import type { RelatedToolLink } from "@/config/blog-related-tools";

type RelatedToolsProps = {
  tools: RelatedToolLink[];
};

export function RelatedTools({ tools }: RelatedToolsProps) {
  if (tools.length === 0) return null;

  return (
    <section aria-labelledby="related-tools-heading" className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <h2 id="related-tools-heading" className="text-lg font-semibold">
        Try these tools
      </h2>
      <ul className="mt-4 space-y-3">
        {tools.map((tool) => (
          <li key={tool.href}>
            <Link href={tool.href} className="group block rounded-lg border border-border p-4 hover:border-primary/40">
              <span className="font-medium group-hover:underline">{tool.label}</span>
              <p className="mt-1 text-sm text-muted-foreground">{tool.description}</p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
