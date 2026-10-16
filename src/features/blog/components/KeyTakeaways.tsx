type KeyTakeawaysProps = {
  items: string[];
};

export function KeyTakeaways({ items }: KeyTakeawaysProps) {
  if (items.length === 0) return null;

  return (
    <section aria-labelledby="key-takeaways-heading" className="rounded-xl border border-border bg-card p-5 sm:p-6">
      <h2 id="key-takeaways-heading" className="text-lg font-semibold">
        Key takeaways
      </h2>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-muted-foreground">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </section>
  );
}
