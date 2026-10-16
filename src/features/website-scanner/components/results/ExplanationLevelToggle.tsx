"use client";

import type { ExplanationLevel } from "@/features/website-scanner/types/resultUx";

type Props = {
  level: ExplanationLevel;
  onChange: (level: ExplanationLevel) => void;
};

const OPTIONS: { id: ExplanationLevel; label: string }[] = [
  { id: "simple", label: "Simple" },
  { id: "developer", label: "Developer" },
  { id: "standard", label: "Standard" },
];

export function ExplanationLevelToggle({ level, onChange }: Props) {
  return (
    <fieldset className="text-sm">
      <legend className="sr-only">Explanation detail level</legend>
      <div className="flex flex-wrap gap-2">
        {OPTIONS.map((opt) => (
          <button
            key={opt.id}
            type="button"
            aria-pressed={level === opt.id}
            className={`rounded-lg border px-3 py-1.5 ${
              level === opt.id
                ? "border-primary bg-primary/10 font-semibold"
                : "border-border"
            }`}
            onClick={() => onChange(opt.id)}
          >
            {opt.label}
          </button>
        ))}
      </div>
    </fieldset>
  );
}
