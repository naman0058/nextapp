const PLATFORMS = [
  { name: "Instagram", abbr: "IG" },
  { name: "Facebook", abbr: "FB" },
  { name: "LinkedIn", abbr: "IN" },
  { name: "X", abbr: "X" },
] as const;

export function PlatformStrip() {
  return (
    <section className="border-y border-border bg-white py-8" aria-label="Supported platforms">
      <div className="mx-auto flex max-w-6xl flex-col items-center gap-6 px-4 sm:flex-row sm:justify-between lg:px-8">
        <p className="text-center text-sm font-semibold text-muted sm:text-left">
          Platform-specific publishing checklists for
        </p>
        <ul className="flex flex-wrap items-center justify-center gap-3">
          {PLATFORMS.map((p) => (
            <li key={p.name} className="list-none">
              <span className="inline-flex items-center gap-2 rounded-full border border-border bg-muted-bg/80 px-4 py-2 text-sm font-semibold text-foreground">
                <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary/10 text-xs font-bold text-primary">
                  {p.abbr}
                </span>
                {p.name}
              </span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
