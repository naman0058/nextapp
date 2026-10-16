import Link from "next/link";
import { Container } from "@/components/ui/Container";

const CATEGORIES = [
  {
    title: "Measured",
    description: "WCAG contrast ratios computed with relative luminance in your browser.",
    examples: "Color sampling, ratio thresholds",
  },
  {
    title: "Rule-based",
    description: "Deterministic caption and alt-text heuristics—emoji, hashtags, readability.",
    examples: "Local preflight score",
  },
  {
    title: "AI-assisted",
    description: "Optional image review when you explicitly request analysis.",
    examples: "Alt suggestions, visible text",
  },
  {
    title: "Human review",
    description: "Publishing confirmations and platform composer checks only you can complete.",
    examples: "Final publish in native app",
  },
] as const;

export function CheckCategoriesBand() {
  return (
    <section className="marketing-gradient relative overflow-hidden py-16 sm:py-20">
      <Container className="relative">
        <div className="mx-auto max-w-3xl text-center">
          <p className="text-xs font-bold uppercase tracking-[0.2em] text-teal-200">
            Transparent methodology
          </p>
          <h2 className="font-display mt-3 text-3xl font-bold text-white sm:text-4xl">
            Know what kind of check you are seeing
          </h2>
          <p className="mt-4 text-lg text-indigo-100/90">
            We separate measured, automated, AI-assisted, and human steps—no blurred
            claims of certification.
          </p>
        </div>
        <ul className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {CATEGORIES.map((cat) => (
            <li key={cat.title} className="list-none">
              <article className="h-full rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur">
                <h3 className="font-display text-lg font-bold text-white">{cat.title}</h3>
                <p className="mt-2 text-sm leading-relaxed text-indigo-100/85">
                  {cat.description}
                </p>
                <p className="mt-3 text-xs font-medium text-teal-200/90">{cat.examples}</p>
              </article>
            </li>
          ))}
        </ul>
        <p className="mt-10 text-center">
          <Link
            href="/methodology"
            className="text-sm font-semibold text-white underline decoration-white/30 underline-offset-4 hover:decoration-white"
          >
            Read full methodology
          </Link>
        </p>
      </Container>
    </section>
  );
}
