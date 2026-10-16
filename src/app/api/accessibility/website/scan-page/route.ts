import { NextResponse } from "next/server";
import { getScanViewport } from "@/features/website-scanner/constants/viewports";
import { parseScanPageRequestBody } from "@/features/website-scanner/server/parseScanPageRequest";
import {
  sanitizeUrlForLog,
  waitForDomainPoliteness,
} from "@/features/website-scanner/server/politeness";
import { getWebsiteScannerRuntime } from "@/features/website-scanner/server/runtime/getWebsiteScannerRuntime";
import { isUrlAllowedByRobots } from "@/features/website-scanner/server/robots/robotsCache";
import {
  assertSameOrigin,
  validateScanTargetUrl,
} from "@/features/website-scanner/server/security/validateScanTarget";
import { WebsiteScanError } from "@/features/website-scanner/types/scanErrors";
import { assertScannerProductionConfig } from "@/features/website-scanner/server/config/assertScannerProductionConfig";
import { getWebsiteScannerAvailability } from "@/features/website-scanner/server/config/websiteScannerAvailability";
import { websiteScanPageRequestCost } from "@/features/website-scanner/server/websiteScanRateLimitCost";
import { checkWebsiteScanRateLimit } from "@/lib/rateLimit/checkWebsiteScanRateLimit";

function noStoreJson(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  const scanId = crypto.randomUUID();
  const started = Date.now();

  const clientKey = getClientKey(request);

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return noStoreJson({ code: "INVALID_URL", error: "Invalid JSON body." }, 400);
  }

  const parsed = parseScanPageRequestBody(body);
  if ("error" in parsed) {
    return noStoreJson({ code: "INVALID_URL", error: parsed.error }, parsed.status);
  }

  const availability = getWebsiteScannerAvailability();
  if (!availability.available) {
    return noStoreJson(
      { code: "SCANNER_UNAVAILABLE", error: availability.userMessage },
      503,
    );
  }

  const limit = checkWebsiteScanRateLimit(
    clientKey,
    websiteScanPageRequestCost(parsed.siteBatch ?? undefined),
  );
  if (!limit.allowed) {
    return noStoreJson(
      {
        code: "RATE_LIMITED",
        error: "Too many scan requests. Please wait before trying again.",
        retryAfterMs: limit.retryAfterMs,
      },
      429,
    );
  }

  try {
    assertScannerProductionConfig();
    const validated = await validateScanTargetUrl(parsed.url);

    if (parsed.mode === "small_site" && parsed.rootOrigin) {
      assertSameOrigin(validated.href, parsed.rootOrigin);
      const allowed = await isUrlAllowedByRobots(validated.href);
      if (!allowed) {
        return noStoreJson(
          {
            code: "ROBOTS_BLOCKED",
            error: "This page is disallowed by robots.txt for automated crawling.",
          },
          403,
        );
      }
    }

    await waitForDomainPoliteness(validated.hostname, {
      applyDelay: parsed.applyPolitenessDelay,
    });

    const runtime = await getWebsiteScannerRuntime();
    const result = await runtime.scanPage({
      url: validated.href,
      viewport: getScanViewport(parsed.viewportId),
      mode: parsed.mode,
      rootOrigin: parsed.rootOrigin,
      includeBestPractices: parsed.includeBestPractices,
      scanId,
    });

    console.info(
      "[website-scan]",
      JSON.stringify({
        scanId,
        hostname: validated.hostname,
        url: sanitizeUrlForLog(validated.href),
        durationMs: Date.now() - started,
        violations: result.violations.length,
        incomplete: result.incomplete.length,
      }),
    );

    return noStoreJson({ scanId, result }, 200);
  } catch (err) {
    if (err instanceof WebsiteScanError) {
      const status =
        err.code === "RATE_LIMITED"
          ? 429
          : err.code === "SCANNER_UNAVAILABLE"
            ? 503
            : 400;
      return noStoreJson({ code: err.code, error: err.userMessage }, status);
    }
    console.error("[website-scan]", scanId, "unexpected");
    return noStoreJson(
      {
        code: "SCANNER_UNAVAILABLE",
        error: "Website scanning failed. Please try again later.",
      },
      503,
    );
  }
}
