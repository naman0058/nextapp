import Link from "next/link";
import type { ToolPageDefinition } from "@/config/toolPages";
import { Container } from "@/components/ui/Container";

type ToolPremiumHeroProps = {
  tool: ToolPageDefinition;
};

export function ToolPremiumHero({ tool }: ToolPremiumHeroProps) {
  return (
    <section className="marketing-gradient relative overflow-hidden border-b border-white/10">
      <div className="landing-grid absolute inset-0 opacity-30" aria-hidden="true" />
      <Container className="relative py-10 sm:py-12 lg:py-14">
        <nav aria-label="Breadcrumb" className="text-sm text-indigo-200/80">
          <ol className="flex flex-wrap items-center gap-2">
            <li>
              <Link href="/" className="hover:text-white">
                Home
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li>
              <Link href="/tools" className="hover:text-white">
                Tools
              </Link>
            </li>
            <li aria-hidden="true">/</li>
            <li className="font-medium text-white">{tool.navLabel}</li>
          </ol>
        </nav>

        <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-teal-200">
          {tool.eyebrow}
        </p>
        <h1 className="font-display mt-3 max-w-4xl text-3xl font-bold tracking-tight text-white sm:text-4xl lg:text-[2.75rem] lg:leading-tight">
          {tool.title}
        </h1>
        <p className="mt-4 max-w-3xl text-lg leading-relaxed text-indigo-100/90">
          {tool.description}
        </p>

        <ul className="mt-8 flex flex-wrap gap-2">
          {tool.highlights.map((item) => (
            <li
              key={item}
              className="list-none rounded-full border border-white/15 bg-white/10 px-4 py-1.5 text-sm font-medium text-white"
            >
              {item}
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
