import { getVerificationStepsForRule } from "@/features/accessibility-intelligence/knowledge/ruleKnowledge";

type Props = { ruleId: string };

const TOOL_LINKS: { match: RegExp; href: string; label: string }[] = [
  {
    match: /contrast/i,
    href: "/image-contrast-checker",
    label: "Image contrast checker",
  },
];

export function VerificationChecklist({ ruleId }: Props) {
  const steps = getVerificationStepsForRule(ruleId);
  const tool = TOOL_LINKS.find((t) => t.match.test(ruleId));
  return (
    <div className="mt-3 rounded border border-border bg-background p-3 text-sm">
      <p className="font-medium">How to verify</p>
      {steps.length > 0 ? (
        <ol className="mt-2 list-decimal pl-5">
          {steps.map((s) => (
            <li key={s.slice(0, 48)}>{s}</li>
          ))}
        </ol>
      ) : (
        <p className="mt-2 text-muted">
          Re-run the scan after fixing, then spot-check with keyboard and a
          screen reader where relevant.
        </p>
      )}
      {tool && (
        <p className="mt-2">
          <a href={tool.href} className="font-medium text-primary underline">
            {tool.label}
          </a>
        </p>
      )}
    </div>
  );
}
