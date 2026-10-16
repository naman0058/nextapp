import type { PlatformAccessibilityConfig } from "@/features/accessibility/config/platformAccessibility/types";
import {
  EXTERNAL_UI_NOTE,
  NON_AFFILIATION,
} from "@/features/accessibility/config/platformAccessibility/sharedChecklist";
import Link from "next/link";
import { Card } from "@/components/ui/Card";

type PlatformGuidanceAccordionProps = {
  config: PlatformAccessibilityConfig;
};

export function PlatformGuidanceAccordion({
  config,
}: PlatformGuidanceAccordionProps) {
  return (
    <Card className="space-y-3 p-4">
      <h3 className="text-sm font-semibold text-foreground">
        How to apply this on {config.name}
      </h3>
      <ol className="list-decimal space-y-1 pl-5 text-sm text-muted">
        {config.helpSteps.map((step) => (
          <li key={step}>{step}</li>
        ))}
      </ol>
      <p className="text-xs text-muted">{EXTERNAL_UI_NOTE}</p>

      <details className="text-sm">
        <summary className="cursor-pointer font-medium text-foreground">
          {config.name} capabilities
        </summary>
        <ul className="mt-2 space-y-2">
          {Object.entries(config.capabilities).map(([key, cap]) => (
            <li key={key} className="text-muted">
              <span className="font-medium text-foreground">{cap.label}:</span>{" "}
              {cap.status.replace("_", " ")}
              {cap.note ? ` — ${cap.note}` : ""}
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-muted">
          <Link href="/video-accessibility-checker" className="font-semibold text-primary hover:underline">
            Video Accessibility Checker
          </Link>{" "}
          — transcripts, timed captions, and SRT/WebVTT export for MP4/WebM.
        </p>
      </details>

      {config.publishingGuidance.map((g) => (
        <details key={g.id} className="text-sm">
          <summary className="cursor-pointer font-medium text-foreground">
            {g.title}
          </summary>
          <p className="mt-2 text-muted">{g.body}</p>
        </details>
      ))}

      <p className="text-xs text-muted">{NON_AFFILIATION}</p>
    </Card>
  );
}
