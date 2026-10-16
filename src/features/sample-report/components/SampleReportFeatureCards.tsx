const CARDS = [
  { title: "Root-cause grouping", body: "See shared patterns instead of duplicate cards per element." },
  { title: "Visual evidence", body: "Illustrative highlights with selectors and rule context." },
  { title: "Prioritized fix plan", body: "Ordered remediation with read-only status examples." },
  { title: "Human review", body: "Guided checks that automation cannot fully decide." },
  { title: "Developer handoff", body: "Copy or download a markdown ticket for engineering." },
  { title: "Professional exports", body: "PDF, Excel, CSV, JSON, and evidence ZIP from one dataset." },
] as const;

export function SampleReportFeatureCards() {
  return (
    <section aria-labelledby="sample-features-heading" className="mt-10">
      <h2 id="sample-features-heading" className="sr-only">
        What this sample includes
      </h2>
      <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {CARDS.map((card) => (
          <li key={card.title} className="rounded-lg border border-border bg-card p-4">
            <h3 className="font-semibold">{card.title}</h3>
            <p className="mt-2 text-sm text-muted-foreground">{card.body}</p>
          </li>
        ))}
      </ul>
    </section>
  );
}
