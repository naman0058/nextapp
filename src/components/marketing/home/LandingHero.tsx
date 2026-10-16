import { siteConfig } from "@/config/site";
import { TRUST_SIGNALS } from "@/config/marketing";
import { ProductWorkflowMock } from "@/components/marketing/home/ProductWorkflowMock";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function LandingHero() {
  return (
    <section className="landing-hero relative overflow-hidden">
      <div className="marketing-gradient absolute inset-0" aria-hidden="true" />
      <div className="landing-grid absolute inset-0 opacity-[0.35]" aria-hidden="true" />
      <div
        className="pointer-events-none absolute inset-0 opacity-60"
        aria-hidden="true"
        style={{
          backgroundImage:
            "radial-gradient(circle at 15% 90%, rgb(45 212 191 / 0.22), transparent 42%), radial-gradient(circle at 85% 15%, rgb(129 140 248 / 0.4), transparent 45%)",
        }}
      />

      <Container className="relative pt-14 pb-10 lg:pt-20 lg:pb-14">
        <div className="grid items-center gap-12 lg:grid-cols-2 lg:gap-16">
          <div>
            <p className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-teal-100">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" aria-hidden="true" />
              Live V1 — free to use
            </p>
            <h1 className="font-display mt-6 text-4xl font-bold tracking-tight text-white sm:text-5xl xl:text-[3.5rem] xl:leading-[1.06]">
              Free accessibility preflight for web and social publishing
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-relaxed text-indigo-100/90">
              {siteConfig.description} Preflight captions, alt text, contrast, and
              platform checklists before you post—locally by default, AI only when
              you choose it.
            </p>
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:items-center">
              <Button
                href={siteConfig.nav.cta.href}
                variant="primary"
                className="bg-white px-7 py-3.5 text-base font-bold text-indigo-950 shadow-lg shadow-black/20 hover:bg-indigo-50"
              >
                Start free preflight
              </Button>
              <Button
                href="/tools"
                variant="secondary"
                className="border-white/25 bg-white/10 px-7 py-3.5 text-base text-white hover:bg-white/15"
              >
                Explore tools
              </Button>
            </div>
            <p className="mt-6 text-sm text-indigo-200/75">
              No social login · No auto-posting · Not legal certification
            </p>
          </div>

          <div className="relative">
            <ProductWorkflowMock />
          </div>
        </div>
      </Container>

      <div className="relative border-t border-white/10 bg-black/25 backdrop-blur-sm">
        <Container className="grid grid-cols-2 gap-6 py-8 sm:grid-cols-4">
          {TRUST_SIGNALS.map((signal) => (
            <div key={signal.label}>
              <p className="font-display text-sm font-bold text-white">{signal.label}</p>
              <p className="mt-1 text-xs leading-relaxed text-indigo-200/80">
                {signal.detail}
              </p>
            </div>
          ))}
        </Container>
      </div>
    </section>
  );
}
