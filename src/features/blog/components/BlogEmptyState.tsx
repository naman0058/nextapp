export function BlogEmptyState() {
  return (
    <div className="rounded-xl border border-dashed border-border p-10 text-center">
      <h2 className="text-lg font-semibold">No published guides yet</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Check back soon for WCAG and accessibility preflight articles.
      </p>
    </div>
  );
}
