import { siteConfig } from "@/config/site";
import { Button } from "@/components/ui/Button";
import { Container } from "@/components/ui/Container";

export function CtaBand() {
  return (
    <section className="marketing-gradient relative overflow-hidden py-16 sm:py-20">
      <Container className="relative text-center">
        <h2 className="font-display text-3xl font-bold tracking-tight text-white sm:text-4xl">
          Ready to preflight your next post?
        </h2>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-indigo-100/90">
          Start with local checks at no API cost. Add optional AI image review
          when you need alt-text suggestions and caption coverage insight.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <Button
            href={siteConfig.nav.cta.href}
            className="bg-white px-6 py-3 text-base text-indigo-950 hover:bg-indigo-50"
          >
            Open social checker
          </Button>
          <Button
            href="/contact"
            variant="secondary"
            className="border-white/20 bg-white/10 px-6 py-3 text-base text-white hover:bg-white/15"
          >
            Contact us
          </Button>
        </div>
      </Container>
    </section>
  );
}
