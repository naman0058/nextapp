import { AppPanel } from "@/components/app/AppPanel";

type ToolEducationPanelProps = {
  whatItChecks: readonly string[];
  whatItDoesNot: readonly string[];
};

export function ToolEducationPanel({
  whatItChecks,
  whatItDoesNot,
}: ToolEducationPanelProps) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <AppPanel title="What this tool checks" variant="inset">
        <ul className="space-y-2 text-sm text-muted">
          {whatItChecks.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="font-bold text-accent" aria-hidden="true">
                ✓
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
      </AppPanel>
      <AppPanel title="What it does not do" variant="inset">
        <ul className="space-y-2 text-sm text-muted">
          {whatItDoesNot.map((item) => (
            <li key={item} className="flex gap-2">
              <span className="font-bold text-muted" aria-hidden="true">
                —
              </span>
              <span>{item}</span>
            </li>
          ))}
        </ul>
        <p className="mt-4 text-xs leading-relaxed text-muted">
          Automated accessibility guidance is not legal advice or certification. Some
          criteria require human review in the native app.
        </p>
      </AppPanel>
    </div>
  );
}
