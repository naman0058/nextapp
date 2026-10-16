import Link from "next/link";
import { PageHeader } from "@/components/shared/PageHeader";
import { InteriorMarketingLayout } from "@/components/marketing/InteriorMarketingLayout";
import { TOOL_PAGE_LIST } from "@/config/toolPages";
import { siteConfig } from "@/config/site";
import { metadataForStaticRoute } from "@/lib/seo/getRouteSeoMetadata";
import { Button } from "@/components/ui/Button";
import { cn } from "@/lib/utils";

export const metadata = metadataForStaticRoute("/tools");

export default function AllToolsPage() {
  return (
    <>
      <PageHeader
        eyebrow="Tool directory"
        title="All accessibility tools"
        description="Every live checker in one place. Switch tools anytime—your caption and alt text can persist in the same browser session on social checkers."
        actions={[
          {
            label: "Start with social checker",
            href: siteConfig.nav.cta.href,
            variant: "primary",
          },
          { label: "Methodology", href: "/methodology", variant: "secondary" },
        ]}
      />
      <InteriorMarketingLayout>
        <div className="mb-8 rounded-xl border border-border bg-card p-5 text-sm text-muted-foreground">
          <h2 className="text-base font-semibold text-foreground">Quick answer</h2>
          <p className="mt-2">
            {siteConfig.name} offers free, browser-based preflight checkers for social posts,
            measured contrast, screen reader preview, video captions, batch CSV review, and
            public website scanning. Pick a tool below—no account required for local checks.
          </p>
        </div>
        <ul className="grid gap-4 sm:grid-cols-2">
          {TOOL_PAGE_LIST.map((tool) => (
            <li key={tool.path} className="list-none">
              <article
                className={cn(
                  "surface-soft flex h-full flex-col rounded-2xl border border-border bg-white p-6 transition-shadow hover:shadow-md",
                )}
              >
                <p className="text-xs font-bold uppercase tracking-wider text-primary">
                  {tool.eyebrow}
                </p>
                <h2 className="font-display mt-2 text-xl font-bold text-foreground">
                  <Link href={tool.path} className="hover:text-primary">
                    {tool.name}
                  </Link>
                </h2>
                <p className="mt-3 flex-1 text-sm leading-relaxed text-muted">
                  {tool.description}
                </p>
                <ul className="mt-4 space-y-1 text-xs text-muted">
                  {tool.highlights.map((h) => (
                    <li key={h}>• {h}</li>
                  ))}
                </ul>
                <div className="mt-6">
                  <Button href={tool.path} variant="secondary">
                    Open tool
                  </Button>
                </div>
              </article>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-sm text-muted">
          Need video captions? Use the{" "}
          <Link
            href="/video-accessibility-checker"
            className="font-semibold text-primary hover:underline"
          >
            Video Accessibility Checker
          </Link>
          .{" "}
          <Link href="/" className="font-semibold text-primary hover:underline">
            Return to homepage
          </Link>
          .
        </p>
      </InteriorMarketingLayout>
    </>
  );
}
