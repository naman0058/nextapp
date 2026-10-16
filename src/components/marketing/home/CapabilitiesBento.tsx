const ITEMS = [
  {
    title: "Caption accessibility",
    description:
      "Surface ALL CAPS, repeated emoji, dense hashtags, fancy Unicode, and link wording before you post.",
    span: "lg:col-span-2",
  },
  {
    title: "Alt text readiness",
    description:
      "Catch missing alt text, filename-style descriptions, and duplicate caption/alt pairs.",
    span: "",
  },
  {
    title: "Measured contrast",
    description: "WCAG relative luminance ratios—not guesswork from RGB distance.",
    span: "",
  },
  {
    title: "Screen reader preview",
    description:
      "Approximate reading order and listening noise locally; optional browser speech.",
    span: "lg:col-span-2",
  },
  {
    title: "Platform publishing",
    description:
      "Checklists and copy packages for Instagram, Facebook, LinkedIn, and X.",
    span: "lg:col-span-3",
  },
] as const;

export function CapabilitiesBento() {
  return (
    <div className="grid gap-4 lg:grid-cols-3">
      {ITEMS.map((item) => (
        <article
          key={item.title}
          className={`surface-soft rounded-2xl border border-border bg-card p-6 ${item.span}`}
        >
          <h3 className="font-display text-lg font-bold text-foreground">
            {item.title}
          </h3>
          <p className="mt-2 text-sm leading-relaxed text-muted">
            {item.description}
          </p>
        </article>
      ))}
    </div>
  );
}
