import { NextResponse } from "next/server";
import { registerSiteBatch } from "@/features/website-scanner/server/batch/siteBatchRegistry";
import { createSiteBatchTicket } from "@/features/website-scanner/server/batch/siteBatchTicket";
import { validateScanTargetUrl } from "@/features/website-scanner/server/security/validateScanTarget";
import { WEBSITE_REGISTER_BATCH_RATE_COST } from "@/features/website-scanner/server/websiteScanRateLimitCost";
import { getWebsiteScannerAvailability } from "@/features/website-scanner/server/config/websiteScannerAvailability";
import { checkWebsiteScanRateLimit } from "@/lib/rateLimit/checkWebsiteScanRateLimit";

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
  const availability = getWebsiteScannerAvailability();
  if (!availability.available) {
    return noStoreJson(
      { code: "SCANNER_UNAVAILABLE", error: availability.userMessage },
      503,
    );
  }
  const limit = checkWebsiteScanRateLimit(
    getClientKey(request),
    WEBSITE_REGISTER_BATCH_RATE_COST,
  );
  if (!limit.allowed) {
    return noStoreJson({ code: "RATE_LIMITED", error: "Too many requests." }, 429);
  }
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return noStoreJson({ error: "Invalid JSON." }, 400);
  }
  const record = body as Record<string, unknown>;
  const batchId = typeof record.batchId === "string" ? record.batchId : "";
  const originUrl = typeof record.originUrl === "string" ? record.originUrl : "";
  const urls = Array.isArray(record.urls)
    ? record.urls.filter((u): u is string => typeof u === "string")
    : [];
  const viewportMode =
    record.viewportMode === "compare" || record.viewportMode === "mobile"
      ? record.viewportMode
      : "desktop";
  if (!batchId || !originUrl) {
    return noStoreJson({ error: "Missing batch registration fields." }, 400);
  }
  try {
    const validated = await validateScanTargetUrl(originUrl);
    const origin = new URL(validated.href).origin;
    const reg = registerSiteBatch({
      batchId,
      origin,
      urls,
      viewportMode,
    });
    if (!reg.ok) {
      return noStoreJson({ code: "BATCH_INVALID", error: reg.error }, 400);
    }
    const batchTicket = createSiteBatchTicket(reg.batch);
    return noStoreJson({ ok: true, batchTicket }, 200);
  } catch {
    return noStoreJson({ error: "Invalid origin URL." }, 400);
  }
}
