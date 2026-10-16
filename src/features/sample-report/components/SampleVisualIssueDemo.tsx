import { SAMPLE_VISUAL_DISCLAIMER } from "@/features/sample-report/constants";

export function SampleVisualIssueDemo() {
  return (
    <section aria-labelledby="sample-visual-heading" className="space-y-4">
      <h2 id="sample-visual-heading" className="text-2xl font-semibold">
        Visual issue evidence (example)
      </h2>
      <p className="text-sm text-muted-foreground">{SAMPLE_VISUAL_DISCLAIMER}</p>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="relative overflow-hidden rounded-xl border border-border bg-gradient-to-b from-sky-50 to-white p-4 dark:from-slate-900 dark:to-slate-950">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <span className="font-semibold">Northstar Community Library</span>
            <div className="relative">
              <span
                className="absolute -left-2 -top-2 flex h-6 w-6 items-center justify-center rounded-full bg-red-600 text-xs font-bold text-white"
                aria-hidden="true"
              >
                1
              </span>
              <button
                type="button"
                className="rounded border-2 border-red-600 bg-white p-2 shadow-sm"
                aria-label="Menu (example — missing accessible name in sample)"
              >
                <span aria-hidden="true">☰</span>
              </button>
            </div>
          </div>
          <div className="mt-4 space-y-2">
            <div className="h-3 w-2/3 rounded bg-muted" />
            <div className="h-20 rounded-lg bg-muted/80" />
            <div className="grid grid-cols-2 gap-2">
              <div className="h-16 rounded bg-muted/60" />
              <div className="h-16 rounded bg-muted/60" />
            </div>
          </div>
        </div>
        <div className="rounded-xl border border-border bg-card p-4 text-sm">
          <h3 className="font-semibold">Equivalent text evidence</h3>
          <dl className="mt-3 space-y-2">
            <div>
              <dt className="font-medium">Affected element</dt>
              <dd className="text-muted-foreground">Mobile navigation button</dd>
            </div>
            <div>
              <dt className="font-medium">Issue</dt>
              <dd className="text-muted-foreground">Accessible name missing</dd>
            </div>
            <div>
              <dt className="font-medium">Page</dt>
              <dd className="text-muted-foreground">Home (https://example.com/)</dd>
            </div>
            <div>
              <dt className="font-medium">Selector</dt>
              <dd>
                <code className="break-all text-xs">header nav button.menu-toggle</code>
              </dd>
            </div>
            <div>
              <dt className="font-medium">Rule</dt>
              <dd>
                <code className="text-xs">button-name</code>
              </dd>
            </div>
          </dl>
        </div>
      </div>
    </section>
  );
}
