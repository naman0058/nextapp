import Link from "next/link";
import { MARKETING_TOOLS } from "@/config/marketing";
import { Badge } from "@/components/ui/Badge";
import { cn } from "@/lib/utils";

const CATEGORY_LABEL: Record<string, string> = {
  social: "Social preflight",
  visual: "Visual",
  preview: "Preview",
};

export function ToolsGrid() {
  return (
    <ul className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
      {MARKETING_TOOLS.map((tool) => (
        <li key={tool.name} className="list-none">
          <article
            className={cn(
              "surface-soft group flex h-full flex-col rounded-2xl border border-border bg-card p-6 transition-transform hover:-translate-y-0.5",
              tool.badge === "planned" && "opacity-90",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <p className="text-xs font-semibold uppercase tracking-wide text-primary">
                {CATEGORY_LABEL[tool.category]}
              </p>
              <Badge
                className={cn(
                  "shrink-0 border text-xs",
                  tool.badge === "live"
                    ? "border-teal-200 bg-teal-50 text-teal-900"
                    : "border-border bg-muted-bg text-muted",
                )}
              >
                {tool.badge === "live" ? "Live" : "Planned"}
              </Badge>
            </div>
            <h3 className="font-display mt-3 text-lg font-bold text-foreground">
              {tool.name}
            </h3>
            <p className="mt-2 flex-1 text-sm leading-relaxed text-muted">
              {tool.description}
            </p>
            {tool.badge === "live" ? (
              <Link
                href={tool.href}
                className="mt-5 inline-flex text-sm font-semibold text-primary hover:underline"
              >
                Open tool →
              </Link>
            ) : (
              <span className="mt-5 text-sm font-medium text-muted">
                Coming in a future release
              </span>
            )}
          </article>
        </li>
      ))}
    </ul>
  );
}
