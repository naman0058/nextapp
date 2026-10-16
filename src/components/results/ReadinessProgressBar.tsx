type ReadinessProgressBarProps = {
  readyCount: number;
  totalApplicable: number;
  reviewCount: number;
};

export function ReadinessProgressBar({
  readyCount,
  totalApplicable,
  reviewCount,
}: ReadinessProgressBarProps) {
  const pct =
    totalApplicable > 0
      ? Math.round((readyCount / totalApplicable) * 100)
      : 0;

  return (
    <div className="space-y-2">
      <div className="flex flex-wrap items-center justify-between gap-2 text-sm">
        <span className="font-medium text-muted">Publishing checklist progress</span>
        <span className="font-display font-bold tabular-nums text-foreground">
          {readyCount}/{totalApplicable} ready
          {reviewCount > 0 ? (
            <span className="ml-2 text-sm font-semibold text-amber-700">
              · {reviewCount} need attention
            </span>
          ) : null}
        </span>
      </div>
      <div
        className="h-2.5 overflow-hidden rounded-full bg-muted-bg"
        role="progressbar"
        aria-valuenow={pct}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label={`${pct}% of applicable publishing checks ready`}
      >
        <div
          className="h-full rounded-full bg-gradient-to-r from-teal-500 to-teal-600 transition-[width] duration-500"
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}
