/**
 * Illustrative product chrome only — not live analysis data.
 */
export function ProductWorkflowMock() {
  return (
    <div
      className="surface-card relative overflow-hidden rounded-3xl border border-white/20 bg-slate-950/90 text-left shadow-2xl shadow-indigo-950/40"
      aria-hidden="true"
    >
      <div className="flex items-center gap-2 border-b border-white/10 px-4 py-3">
        <span className="h-2.5 w-2.5 rounded-full bg-rose-400/90" />
        <span className="h-2.5 w-2.5 rounded-full bg-amber-400/90" />
        <span className="h-2.5 w-2.5 rounded-full bg-emerald-400/90" />
        <span className="ml-2 text-xs font-medium text-indigo-200/80">
          Example preflight workspace
        </span>
      </div>
      <div className="grid gap-0 lg:grid-cols-5">
        <div className="space-y-3 border-b border-white/10 p-4 lg:col-span-2 lg:border-b-0 lg:border-r">
          <p className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
            Compose
          </p>
          <div className="rounded-xl bg-white/5 p-3">
            <div className="h-2 w-16 rounded bg-white/20" />
            <div className="mt-3 space-y-2">
              <div className="h-2 w-full rounded bg-white/10" />
              <div className="h-2 w-[92%] rounded bg-white/10" />
              <div className="h-2 w-[78%] rounded bg-white/10" />
            </div>
          </div>
          <div className="rounded-xl border border-dashed border-white/15 p-3 text-center text-[10px] text-indigo-200/70">
            Image upload area
          </div>
        </div>
        <div className="space-y-3 p-4 lg:col-span-3">
          <p className="text-[10px] font-bold uppercase tracking-wider text-teal-300">
            Results
          </p>
          <div className="flex items-center gap-4 rounded-xl bg-white/5 p-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-teal-400/60 text-lg font-bold text-white">
              82
            </div>
            <div>
              <div className="h-2 w-24 rounded bg-white/25" />
              <div className="mt-2 h-2 w-32 rounded bg-white/10" />
            </div>
          </div>
          <div className="grid gap-2 sm:grid-cols-2">
            {["Caption clarity", "Alt text", "Hashtags", "Contrast"].map((label) => (
              <div
                key={label}
                className="flex items-center justify-between rounded-lg bg-white/5 px-3 py-2 text-[10px] text-indigo-100"
              >
                <span>{label}</span>
                <span className="rounded-full bg-teal-500/20 px-2 py-0.5 text-teal-200">
                  Review
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
      <p className="border-t border-white/10 px-4 py-2 text-center text-[10px] text-indigo-300/60">
        Illustration only — run the live checker to analyze your content
      </p>
    </div>
  );
}
