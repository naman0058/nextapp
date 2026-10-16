import { NextResponse } from "next/server";
import { assertScannerProductionConfig } from "@/features/website-scanner/server/config/assertScannerProductionConfig";
import { getVisualLocatorAvailability } from "@/features/website-scanner/server/config/websiteScannerAvailability";
import { getWebsiteScannerRuntime } from "@/features/website-scanner/server/runtime/getWebsiteScannerRuntime";
import { validateScanTargetUrl } from "@/features/website-scanner/server/security/validateScanTarget";
import { verifyVisualLocatorToken } from "@/features/website-scanner/server/visualLocator/verifyVisualLocatorToken";
import { WebsiteScanError } from "@/features/website-scanner/types/scanErrors";
import { checkVisualLocatorImageRateLimit } from "@/lib/rateLimit/checkVisualLocatorRateLimit";

function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  const availability = getVisualLocatorAvailability();
  if (!availability.available) {
    return NextResponse.json(
      { code: "VISUAL_LOCATOR_UNAVAILABLE", error: availability.userMessage },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }

  const limit = checkVisualLocatorImageRateLimit(getClientKey(request), 2);
  if (!limit.allowed) {
    return NextResponse.json(
      {
        code: "RATE_LIMITED",
        error: "Too many visual location requests. Please wait.",
        retryAfterMs: limit.retryAfterMs,
      },
      { status: 429, headers: { "Cache-Control": "no-store" } },
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json(
      { error: "Invalid JSON body." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const token =
    body && typeof body === "object" && typeof (body as { token?: string }).token === "string"
      ? (body as { token: string }).token
      : "";
  if (!token) {
    return NextResponse.json(
      { code: "VISUAL_LOCATOR_INVALID_TOKEN", error: "Missing locator token." },
      { status: 400, headers: { "Cache-Control": "no-store" } },
    );
  }

  const verified = verifyVisualLocatorToken(token);
  if (!verified.ok) {
    const code =
      verified.reason === "expired"
        ? "VISUAL_LOCATOR_TOKEN_EXPIRED"
        : "VISUAL_LOCATOR_INVALID_TOKEN";
    return NextResponse.json(
      { code, error: "Locator authorization is invalid or expired." },
      { status: 403, headers: { "Cache-Control": "no-store" } },
    );
  }

  const payload = verified.payload;

  try {
    assertScannerProductionConfig();
    await validateScanTargetUrl(payload.url);

    const runtime = getWebsiteScannerRuntime();
    const result = await runtime.visualizeIssue({
      url: payload.url,
      viewport: payload.viewport,
      ruleId: payload.ruleId,
      target: payload.target,
      selectorLabel: payload.selectorLabel,
      domSignature: payload.domSignature,
      occurrenceIndex: payload.occurrenceIndex,
      ruleTitle: payload.ruleTitle,
    });

    return new NextResponse(new Uint8Array(result.image), {
      status: 200,
      headers: {
        "Content-Type": result.contentType,
        "Cache-Control": "no-store, private",
        "X-Locator-Match": result.match,
        "X-Locator-Occurrence": String(result.occurrenceIndex),
      },
    });
  } catch (err) {
    if (err instanceof WebsiteScanError) {
      const status =
        err.code === "RATE_LIMITED"
          ? 429
          : err.code === "SCANNER_UNAVAILABLE"
            ? 503
            : 400;
      return NextResponse.json(
        { code: err.code, error: err.userMessage },
        { status, headers: { "Cache-Control": "no-store" } },
      );
    }
    return NextResponse.json(
      { code: "SCANNER_UNAVAILABLE", error: "Visual location failed." },
      { status: 503, headers: { "Cache-Control": "no-store" } },
    );
  }
}
