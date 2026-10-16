type Props = { priority: "high" | "medium" | "low" };

export function PriorityBadge({ priority }: Props) {
  const label =
    priority === "high"
      ? "High priority"
      : priority === "medium"
        ? "Medium priority"
        : "Low priority";
  return (
    <span className="inline-flex items-center rounded border border-border bg-background px-2 py-0.5 text-xs font-medium text-foreground">
      {label}
    </span>
  );
}
