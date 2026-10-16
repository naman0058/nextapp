type Props = { impact: string };

export function ImpactBadge({ impact }: Props) {
  return (
    <span className="inline-flex items-center rounded bg-muted px-2 py-0.5 text-xs font-semibold uppercase text-foreground">
      Impact: {impact}
    </span>
  );
}
