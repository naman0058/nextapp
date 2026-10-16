import { NextResponse } from "next/server";
import { getVisualLocatorAvailability } from "@/features/website-scanner/server/config/websiteScannerAvailability";
import { buildVisualLocatorPayload } from "@/features/website-scanner/server/visualLocator/buildVisualLocatorPayload";
import { parseVisualLocatorMintRequest } from "@/features/website-scanner/server/visualLocator/parseVisualLocatorMintRequest";
import { signVisualLocatorToken } from "@/features/website-scanner/server/visualLocator/signVisualLocatorToken";
import { validateScanTargetUrl } from "@/features/website-scanner/server/security/validateScanTarget";
import { checkVisualLocatorTokenRateLimit } from "@/lib/rateLimit/checkVisualLocatorRateLimit";

function noStoreJson(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) return forwarded.split(",")[0]?.trim() || "unknown";
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  const availability = getVisualLocatorAvailability();
  if (!availability.available) {
    return noStoreJson(
      { code: "VISUAL_LOCATOR_UNAVAILABLE", error: availability.userMessage },
      503,
    );
  }

  const limit = checkVisualLocatorTokenRateLimit(getClientKey(request));
  if (!limit.allowed) {
    return noStoreJson(
      {
        code: "RATE_LIMITED",
        error: "Too many requests. Please wait before trying again.",
        retryAfterMs: limit.retryAfterMs,
      },
      429,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return noStoreJson({ error: "Invalid JSON body." }, 400);
  }

  const parsed = parseVisualLocatorMintRequest(body);
  if ("error" in parsed) {
    return noStoreJson({ error: parsed.error }, 400);
  }

  try {
    await validateScanTargetUrl(parsed.url);
  } catch {
    return noStoreJson({ code: "INVALID_URL", error: "Invalid page URL." }, 400);
  }

  try {
    const payload = buildVisualLocatorPayload(parsed);
    const token = signVisualLocatorToken(payload);
    return noStoreJson({ token, expiresAt: payload.expiresAt }, 200);
  } catch {
    return noStoreJson(
      { code: "VISUAL_LOCATOR_UNAVAILABLE", error: "Visual locator is not configured." },
      503,
    );
  }
}
