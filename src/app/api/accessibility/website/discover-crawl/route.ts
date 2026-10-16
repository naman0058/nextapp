import { NextResponse } from "next/server";
import { WebsiteScanError } from "@/features/website-scanner/types/scanErrors";
import { WEBSITE_DISCOVER_CRAWL_RATE_COST } from "@/features/website-scanner/server/websiteScanRateLimitCost";
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
    WEBSITE_DISCOVER_CRAWL_RATE_COST,
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
  const siteUrl =
    typeof record.siteUrl === "string" ? record.siteUrl.trim() : "";
  if (!siteUrl) {
    return noStoreJson({ error: "Enter a website URL." }, 400);
  }
  try {
    const { discoverCrawlUrls } = await import(
      "@/features/website-scanner/server/discover/discoverCrawlUrls"
    );
    const result = await discoverCrawlUrls(siteUrl);
    return noStoreJson({ urls: result.urls }, 200);
  } catch (err) {
    if (err instanceof WebsiteScanError) {
      return noStoreJson({ code: err.code, error: err.userMessage }, 400);
    }
    return noStoreJson({ error: "Site discovery failed." }, 503);
  }
}
