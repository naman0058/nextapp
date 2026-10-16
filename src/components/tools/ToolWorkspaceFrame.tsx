import type { ReactNode } from "react";

type ToolWorkspaceFrameProps = {
  children: ReactNode;
  title?: string;
};

export function ToolWorkspaceFrame({
  children,
  title = "Live workspace",
}: ToolWorkspaceFrameProps) {
  return (
    <section aria-labelledby="tool-workspace-heading" className="relative">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-wider text-primary">
            {title}
          </p>
          <h2
            id="tool-workspace-heading"
            className="font-display mt-1 text-xl font-bold text-foreground sm:text-2xl"
          >
            Run your preflight below
          </h2>
          <p className="mt-1 text-sm text-muted">
            Results update as you edit. Nothing is sent to our servers unless you
            explicitly run AI image analysis.
          </p>
        </div>
        <span className="inline-flex items-center gap-2 rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-900">
          <span className="h-2 w-2 rounded-full bg-teal-500" aria-hidden="true" />
          Live
        </span>
      </div>
      <div className="surface-card rounded-3xl border border-border bg-card p-1 sm:p-2">
        <div className="rounded-[1.25rem] bg-gradient-to-b from-muted-bg/40 to-background p-4 sm:p-6 lg:p-8">
          {children}
        </div>
      </div>
    </section>
  );
}
