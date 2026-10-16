export function BlogIndexFallback() {
  return (
    <div className="mt-10 animate-pulse space-y-4" aria-busy="true" aria-label="Loading guides">
      <div className="h-10 rounded-lg bg-muted" />
      <div className="grid gap-6 sm:grid-cols-2">
        <div className="h-48 rounded-xl bg-muted" />
        <div className="h-48 rounded-xl bg-muted" />
      </div>
    </div>
  );
}
