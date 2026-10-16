import type { PlatformAccessibilityConfig } from "@/features/accessibility/config/platformAccessibility/types";
import { AppPanel } from "@/components/app/AppPanel";

type PlatformFaqProps = {
  config: PlatformAccessibilityConfig;
};

export function PlatformFaq({ config }: PlatformFaqProps) {
  return (
    <AppPanel
      title={`${config.name} FAQ`}
      description="Based on current platform help documentation and accessibility best practices."
    >
      <ul className="space-y-3">
        {config.faq.map((item) => (
          <li key={item.question} className="list-none">
            <details className="group rounded-xl border border-border bg-white px-4 py-3">
              <summary className="cursor-pointer list-none font-semibold text-foreground marker:content-none [&::-webkit-details-marker]:hidden">
                <span className="flex items-center justify-between gap-3">
                  {item.question}
                  <span
                    className="text-primary transition-transform group-open:rotate-45"
                    aria-hidden="true"
                  >
                    +
                  </span>
                </span>
              </summary>
              <p className="mt-3 text-sm leading-relaxed text-muted">{item.answer}</p>
            </details>
          </li>
        ))}
      </ul>
      <p className="mt-4 text-xs leading-relaxed text-muted">
        Platform guidance last reviewed {config.sourceMetadata.lastReviewed}. UIs change;
        verify steps in the official app before publishing.
      </p>
    </AppPanel>
  );
}
