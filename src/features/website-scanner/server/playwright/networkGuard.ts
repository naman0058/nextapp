import type { Page, Route } from "playwright";
import { MAX_NETWORK_REQUESTS_PER_PAGE } from "@/features/website-scanner/constants/scanLimits";
import { validateSubresourceUrl } from "@/features/website-scanner/server/security/validateSubresourceUrl";

const HEAVY_MEDIA = /\.(mp4|webm|mp3|wav|m4v|mov)(\?|$)/i;

export type NetworkGuardState = {
  requestCount: number;
  warnings: string[];
};

export async function attachNetworkGuard(
  page: Page,
  state: NetworkGuardState,
): Promise<void> {
  await page.route("**/*", async (route: Route) => {
    const req = route.request();
    const url = req.url();
    state.requestCount += 1;

    if (state.requestCount > MAX_NETWORK_REQUESTS_PER_PAGE) {
      if (!state.warnings.some((w) => w.includes("network-resource limit"))) {
        state.warnings.push(
          "Page exceeded scanner network-resource limit. Results may be incomplete.",
        );
      }
      await route.abort("blockedbyclient");
      return;
    }

    const lower = url.toLowerCase();
    if (
      !lower.startsWith("http://") &&
      !lower.startsWith("https://")
    ) {
      await route.abort("blockedbyclient");
      return;
    }

    if (HEAVY_MEDIA.test(url) && req.resourceType() === "media") {
      await route.abort("blockedbyclient");
      return;
    }

    const allowed = await validateSubresourceUrl(url);
    if (!allowed) {
      await route.abort("blockedbyclient");
      return;
    }

    await route.continue();
  });
}
