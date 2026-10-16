import "server-only";

import { isVisualLocatorConfigured } from "@/features/website-scanner/server/visualLocator/getVisualLocatorSigningSecret";

/** Production: visual locator requires a strong signing secret (no default). */
export function assertVisualLocatorProductionConfig(): void {
  if (process.env.NODE_ENV !== "production") return;
  if (!isVisualLocatorConfigured()) {
    console.warn(
      "[visual-locator] VISUAL_LOCATOR_SIGNING_SECRET unset — Visual Issue Locator disabled in production.",
    );
  }
}
