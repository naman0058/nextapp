import "server-only";

import {
  getScannerRuntimeMode,
  getScannerServiceToken,
  getScannerServiceUrl,
} from "@/features/website-scanner/server/playwright/scannerConfig";
import { isLocalPlaywrightSupportedOnPlatform } from "@/features/website-scanner/server/config/scannerPlatform";
import { isVisualLocatorConfigured } from "@/features/website-scanner/server/visualLocator/getVisualLocatorSigningSecret";

export type WebsiteScannerAvailability = {
  available: boolean;
  userMessage: string;
};

/** Server-side gate before expensive scan/discovery work. */
export function getWebsiteScannerAvailability(): WebsiteScannerAvailability {
  const mode = getScannerRuntimeMode();
  if (mode === "remote") {
    if (!getScannerServiceUrl() || !getScannerServiceToken()) {
      return {
        available: false,
        userMessage:
          "Website scanning is temporarily unavailable. Other accessibility tools remain available.",
      };
    }
    return { available: true, userMessage: "" };
  }

  if (!isLocalPlaywrightSupportedOnPlatform()) {
    return {
      available: false,
      userMessage:
        "Website scanning is temporarily unavailable. Other accessibility tools remain available.",
    };
  }

  return {
    available: true,
    userMessage: "",
  };
}

export function getVisualLocatorAvailability(): WebsiteScannerAvailability {
  const base = getWebsiteScannerAvailability();
  if (!base.available) return base;
  if (process.env.NODE_ENV === "production" && !isVisualLocatorConfigured()) {
    return {
      available: false,
      userMessage:
        "Visual Issue Locator is temporarily unavailable. Technical evidence remains available.",
    };
  }
  if (!isVisualLocatorConfigured()) {
    return {
      available: false,
      userMessage:
        "Visual Issue Locator requires VISUAL_LOCATOR_SIGNING_SECRET on the server.",
    };
  }
  return { available: true, userMessage: "" };
}
