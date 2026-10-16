const AUDIENCES = [
  {
    title: "Social media managers",
    description:
      "Preflight posts across channels with platform-specific checklists and copy-ready outputs.",
  },
  {
    title: "Marketing & comms teams",
    description:
      "Catch readability and alt-text gaps before campaigns go live—without legal certification claims.",
  },
  {
    title: "Creators & small business",
    description:
      "Free local checks plus optional AI when you need help describing event posters and promo graphics.",
  },
  {
    title: "Accessibility champions",
    description:
      "Use measured contrast and screen reader preview to coach colleagues with concrete examples.",
  },
] as const;

export function AudiencesSection() {
  return (
    <ul className="grid gap-5 sm:grid-cols-2">
      {AUDIENCES.map((item) => (
        <li key={item.title} className="list-none">
          <article className="h-full rounded-2xl border border-border bg-card p-6">
            <h3 className="font-display text-lg font-bold text-foreground">
              {item.title}
            </h3>
            <p className="mt-2 text-sm leading-relaxed text-muted">
              {item.description}
            </p>
          </article>
        </li>
      ))}
    </ul>
  );
}
