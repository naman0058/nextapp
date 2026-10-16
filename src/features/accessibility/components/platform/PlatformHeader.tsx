import type { PlatformAccessibilityConfig } from "@/features/accessibility/config/platformAccessibility/types";
import { SOURCE_NOTE } from "@/features/accessibility/config/platformAccessibility/sharedChecklist";

type PlatformHeaderProps = {
  config: PlatformAccessibilityConfig;
};

export function PlatformHeader({ config }: PlatformHeaderProps) {
  return (
    <div>
      <h2 className="text-xl font-bold text-foreground">
        {config.name} Accessibility Preflight
      </h2>
      <p className="mt-2 text-sm text-muted">{config.shortDescription}</p>
      <p className="mt-1 text-xs text-muted">{SOURCE_NOTE}</p>
    </div>
  );
}
