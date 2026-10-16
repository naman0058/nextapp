import Link from "next/link";

export function BlogUnavailable() {
  return (
    <div className="rounded-xl border border-amber-500/30 bg-amber-500/5 p-6 text-center">
      <h2 className="text-lg font-semibold">Blog temporarily unavailable</h2>
      <p className="mt-2 text-sm text-muted-foreground">
        Guides are not loaded right now. Accessibility tools are still available.
      </p>
      <p className="mt-4">
        <Link href="/tools" className="font-medium text-primary underline-offset-4 hover:underline">
          Browse tools
        </Link>
      </p>
    </div>
  );
}
