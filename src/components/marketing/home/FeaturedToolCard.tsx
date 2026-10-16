import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";

export function FeaturedToolCard() {
  return (
    <article className="surface-card relative overflow-hidden rounded-3xl border border-primary/20 bg-gradient-to-br from-indigo-50 via-white to-teal-50 p-8 lg:p-10">
      <div className="absolute -right-16 -top-16 h-48 w-48 rounded-full bg-primary/10 blur-3xl" aria-hidden="true" />
      <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">
        Flagship tool
      </p>
      <h3 className="font-display mt-3 text-2xl font-bold text-foreground sm:text-3xl">
        Social Media Accessibility Checker
      </h3>
      <p className="mt-4 max-w-2xl text-base leading-relaxed text-muted">
        One workspace for captions, images, alt text, local preflight, contrast,
        screen reader preview, optional AI review, and platform publishing
        readiness—no account required.
      </p>
      <ul className="mt-6 grid gap-2 text-sm text-foreground sm:grid-cols-2">
        {[
          "4-step guided workflow",
          "Session saves caption & alt text",
          "Copy-ready publishing package",
          "Zero API cost for local checks",
        ].map((item) => (
          <li key={item} className="flex gap-2">
            <span className="text-accent" aria-hidden="true">
              ✓
            </span>
            {item}
          </li>
        ))}
      </ul>
      <div className="mt-8 flex flex-wrap gap-3">
        <Button href={siteConfig.nav.cta.href} variant="primary" className="px-6 py-3">
          Open checker
        </Button>
        <Button href="/tools" variant="secondary">
          Browse all tools
        </Button>
      </div>
    </article>
  );
}
