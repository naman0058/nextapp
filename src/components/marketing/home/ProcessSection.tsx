const STEPS = [
  {
    title: "Choose platform & add content",
    description:
      "Pick Instagram, Facebook, LinkedIn, X, or the neutral checker. Add caption, optional image, and alt text.",
  },
  {
    title: "Run local preflight",
    description:
      "Deterministic checks run in your browser—hashtags, emoji patterns, readability, and alt-text readiness.",
  },
  {
    title: "Enhance with visual & preview tools",
    description:
      "Sample contrast on graphics, review screen reader experience, and complete platform publishing checklists.",
  },
  {
    title: "Optional AI & publish confidently",
    description:
      "Analyze images with AI when you choose, copy your package, and publish in the native app with human review.",
  },
] as const;

export function ProcessSection() {
  return (
    <ol className="relative grid gap-6 md:grid-cols-2 xl:grid-cols-4">
      <div
        className="pointer-events-none absolute left-0 right-0 top-8 hidden h-0.5 bg-gradient-to-r from-transparent via-border to-transparent xl:block"
        aria-hidden="true"
      />
      {STEPS.map((step, index) => (
        <li key={step.title} className="relative list-none">
          <div className="surface-soft h-full rounded-2xl border border-border bg-white p-6">
            <span className="relative z-10 inline-flex h-10 w-10 items-center justify-center rounded-2xl bg-primary text-sm font-bold text-primary-foreground shadow-md shadow-primary/25">
              {index + 1}
            </span>
            <h3 className="font-display mt-5 text-lg font-bold text-foreground">
              {step.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">{step.description}</p>
          </div>
        </li>
      ))}
    </ol>
  );
}
