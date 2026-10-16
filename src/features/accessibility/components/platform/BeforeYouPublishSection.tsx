"use client";

import { AppPanel } from "@/components/app/AppPanel";
import { cn } from "@/lib/utils";

const CONFIRMATION_ITEMS = [
  {
    id: "confirm-alt-on-platform",
    label: "I added or reviewed alt text / image description on the platform",
  },
  {
    id: "confirm-text-outside-graphic",
    label: "Important text is available outside the graphic where appropriate",
  },
  {
    id: "confirm-contrast",
    label: "I reviewed visual contrast for text on images",
  },
  {
    id: "confirm-hashtags",
    label: "I reviewed hashtags and caption clarity",
  },
  {
    id: "confirm-video-captions",
    label: "I reviewed captions if publishing video (not analyzed here)",
  },
  {
    id: "confirm-final-review",
    label: "I completed a final review in the platform composer",
  },
] as const;

type BeforeYouPublishSectionProps = {
  confirmations: Record<string, boolean>;
  onToggle: (id: string, checked: boolean) => void;
};

export function BeforeYouPublishSection({
  confirmations,
  onToggle,
}: BeforeYouPublishSectionProps) {
  return (
    <AppPanel
      title="Before you publish"
      description="Session-only confirmations—the tool cannot verify actions inside social apps."
      variant="inset"
    >
      <ul className="space-y-2">
        {CONFIRMATION_ITEMS.map((item) => {
          const checked = Boolean(confirmations[item.id]);
          return (
            <li key={item.id} className="list-none">
              <label
                className={cn(
                  "flex cursor-pointer items-start gap-3 rounded-xl border px-4 py-3 text-sm transition-colors",
                  checked
                    ? "border-teal-200 bg-teal-50/80"
                    : "border-border bg-white hover:border-primary/20",
                )}
              >
                <input
                  type="checkbox"
                  className="mt-0.5 h-4 w-4 rounded border-border text-primary focus:ring-primary"
                  checked={checked}
                  onChange={(e) => onToggle(item.id, e.target.checked)}
                />
                <span className="leading-relaxed text-foreground">{item.label}</span>
              </label>
            </li>
          );
        })}
      </ul>
    </AppPanel>
  );
}

export const PUBLISHING_CONFIRMATION_IDS = CONFIRMATION_ITEMS.map((i) => i.id);
