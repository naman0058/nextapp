import {
  getScannerServiceToken,
  getScannerServiceUrl,
} from "@/features/website-scanner/server/playwright/scannerConfig";
import type { WebsiteScannerRuntime } from "@/features/website-scanner/server/runtime/types";
import { WebsiteScanError } from "@/features/website-scanner/types/scanErrors";
import type {
  WebsitePageScanRequest,
  WebsitePageScanResult,
} from "@/features/website-scanner/types/scanTypes";
import {
  PAGE_TOTAL_SCAN_TIMEOUT_MS,
} from "@/features/website-scanner/constants/scanLimits";
import { VISUAL_LOCATOR_TIMEOUT_MS } from "@/features/website-scanner/constants/visualLocatorLimits";
import type {
  WebsiteVisualLocatorRequest,
  WebsiteVisualLocatorResult,
} from "@/features/website-scanner/types/visualLocator";

export class RemoteScannerClient implements WebsiteScannerRuntime {
  async scanPage(
    request: WebsitePageScanRequest,
  ): Promise<WebsitePageScanResult> {
    const base = getScannerServiceUrl();
    const token = getScannerServiceToken();
    if (!base || !token) {
      throw new WebsiteScanError(
        "SCANNER_UNAVAILABLE",
        "Website scanning is temporarily unavailable.",
      );
    }

    const url = `${base.replace(/\/$/, "")}/v1/scan-page`;
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      PAGE_TOTAL_SCAN_TIMEOUT_MS + 10_000,
    );

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      if (res.status === 401 || res.status === 403) {
        throw new WebsiteScanError(
          "SCANNER_UNAVAILABLE",
          "Website scanning is temporarily unavailable.",
        );
      }

      const body = (await res.json()) as
        | WebsitePageScanResult
        | { error?: string; code?: string };

      if (!res.ok) {
        const code = (body as { code?: string }).code;
        const message =
          (body as { error?: string }).error ??
          "Website scanning failed.";
        throw new WebsiteScanError(
          (code as WebsiteScanError["code"]) ?? "SCANNER_UNAVAILABLE",
          message,
        );
      }

      return body as WebsitePageScanResult;
    } catch (err) {
      if (err instanceof WebsiteScanError) throw err;
      throw new WebsiteScanError(
        "SCANNER_UNAVAILABLE",
        "Website scanning is temporarily unavailable.",
      );
    } finally {
      clearTimeout(timer);
    }
  }

  async visualizeIssue(
    request: WebsiteVisualLocatorRequest,
  ): Promise<WebsiteVisualLocatorResult> {
    const base = getScannerServiceUrl();
    const token = getScannerServiceToken();
    if (!base || !token) {
      throw new WebsiteScanError(
        "SCANNER_UNAVAILABLE",
        "Website scanning is temporarily unavailable.",
      );
    }

    const url = `${base.replace(/\/$/, "")}/v1/visualize-accessibility-issue`;
    const controller = new AbortController();
    const timer = setTimeout(
      () => controller.abort(),
      VISUAL_LOCATOR_TIMEOUT_MS + 10_000,
    );

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(request),
        signal: controller.signal,
      });

      if (res.status === 401 || res.status === 403) {
        throw new WebsiteScanError(
          "SCANNER_UNAVAILABLE",
          "Website scanning is temporarily unavailable.",
        );
      }

      if (!res.ok) {
        let code: WebsiteScanError["code"] = "SCANNER_UNAVAILABLE";
        let message = "Visual location failed.";
        try {
          const j = (await res.json()) as { code?: string; error?: string };
          if (j.code && typeof j.code === "string") {
            code = j.code as WebsiteScanError["code"];
          }
          if (j.error) message = j.error;
        } catch {
          /* binary or empty */
        }
        throw new WebsiteScanError(code, message);
      }

      const arrayBuffer = await res.arrayBuffer();
      const contentTypeHeader = res.headers.get("content-type") ?? "";
      const contentType: "image/webp" | "image/png" = contentTypeHeader.includes(
        "png",
      )
        ? "image/png"
        : "image/webp";
      const matchHeader = res.headers.get("x-locator-match");
      const match =
        matchHeader === "strong" ? "strong" : ("exact" as const);
      const occHeader = res.headers.get("x-locator-occurrence");
      const occurrenceIndex = occHeader
        ? Number.parseInt(occHeader, 10)
        : request.occurrenceIndex;

      return {
        image: Buffer.from(arrayBuffer),
        contentType,
        match,
        occurrenceIndex: Number.isFinite(occurrenceIndex)
          ? occurrenceIndex
          : request.occurrenceIndex,
      };
    } catch (err) {
      if (err instanceof WebsiteScanError) throw err;
      throw new WebsiteScanError(
        "SCANNER_UNAVAILABLE",
        "Visual location is temporarily unavailable.",
      );
    } finally {
      clearTimeout(timer);
    }
  }
}
