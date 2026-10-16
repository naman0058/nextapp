type ResultMetricTileProps = {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "success" | "warning" | "danger" | "muted";
};

const TONE_CLASS: Record<NonNullable<ResultMetricTileProps["tone"]>, string> = {
  default: "bg-white text-foreground",
  success: "bg-teal-50 text-teal-950",
  warning: "bg-amber-50 text-amber-950",
  danger: "bg-rose-50 text-rose-950",
  muted: "bg-muted-bg text-muted",
};

export function ResultMetricTile({
  label,
  value,
  hint,
  tone = "default",
}: ResultMetricTileProps) {
  return (
    <div
      className={`rounded-2xl border border-border px-4 py-3 ${TONE_CLASS[tone]}`}
    >
      <p className="text-xs font-semibold uppercase tracking-wide text-muted">{label}</p>
      <p className="font-display mt-1 text-2xl font-bold tabular-nums">{value}</p>
      {hint && <p className="mt-1 text-xs text-muted">{hint}</p>}
    </div>
  );
}
