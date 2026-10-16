"use client";

import {
  PHASE1_SOCIAL_PLATFORMS,
  SOCIAL_PLATFORM_LABELS,
} from "@/features/accessibility/constants/platforms";
import type { SocialPlatform } from "@/types";
import { cn } from "@/lib/utils";

type PlatformSelectorProps = {
  value: SocialPlatform | null;
  onChange: (platform: SocialPlatform) => void;
  platforms?: SocialPlatform[];
};

export function PlatformSelector({
  value,
  onChange,
  platforms = PHASE1_SOCIAL_PLATFORMS,
}: PlatformSelectorProps) {
  return (
    <fieldset>
      <legend className="font-display text-sm font-bold text-foreground">
        Publishing platform
      </legend>
      <p className="mt-1 text-xs text-muted">
        Checklists and guidance update when you switch platforms.
      </p>
      <div className="mt-4 grid grid-cols-2 gap-2 sm:flex sm:flex-wrap">
        {platforms.map((platform) => {
          const selected = value === platform;
          return (
            <button
              key={platform}
              type="button"
              aria-pressed={selected}
              onClick={() => onChange(platform)}
              className={cn(
                "rounded-xl border px-4 py-3 text-sm font-semibold transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ring",
                selected
                  ? "border-primary bg-primary text-primary-foreground shadow-md shadow-primary/20"
                  : "border-border bg-white text-foreground hover:border-primary/30 hover:bg-muted-bg",
              )}
            >
              {SOCIAL_PLATFORM_LABELS[platform]}
            </button>
          );
        })}
      </div>
    </fieldset>
  );
}
