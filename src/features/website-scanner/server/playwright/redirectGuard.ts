import type { Page } from "playwright";
import { MAX_REDIRECTS } from "@/features/website-scanner/constants/scanLimits";
import { validateScanTargetUrl } from "@/features/website-scanner/server/security/validateScanTarget";
import { WebsiteScanError } from "@/features/website-scanner/types/scanErrors";

export type RedirectGuardHandle = {
  readonly documentRedirectCount: number;
  takeError: () => WebsiteScanError | null;
};

/**
 * Validates top-level redirect Location headers before navigation completes.
 */
export function attachRedirectGuard(page: Page): RedirectGuardHandle {
  const state = {
    documentRedirectCount: 0,
    error: null as WebsiteScanError | null,
  };

  page.on("response", (response) => {
    if (state.error) return;
    const request = response.request();
    if (request.resourceType() !== "document") return;
    const status = response.status();
    if (status < 300 || status >= 400) return;

    state.documentRedirectCount += 1;
    if (state.documentRedirectCount > MAX_REDIRECTS) {
      state.error = new WebsiteScanError(
        "BLOCKED_DESTINATION",
        "Too many redirects while loading this page.",
      );
      return;
    }

    const location = response.headers()["location"];
    if (!location) return;
    let target: string;
    try {
      target = new URL(location, response.url()).href;
    } catch {
      state.error = new WebsiteScanError("INVALID_URL", "Invalid redirect target.");
      return;
    }

    void validateScanTargetUrl(target).catch((err) => {
      state.error =
        err instanceof WebsiteScanError
          ? err
          : new WebsiteScanError(
              "BLOCKED_DESTINATION",
              "Redirect target is not allowed.",
            );
    });
  });

  return {
    get documentRedirectCount() {
      return state.documentRedirectCount;
    },
    takeError: () => {
      const e = state.error;
      state.error = null;
      return e;
    },
  };
}
