import "server-only";

import {
  getWebsiteAiRateLimiter,
  getWebsiteScanRateLimiter,
} from "@/lib/rateLimit/bestEffortMemoryLimiter";
import type { RateLimitResult } from "@/lib/rateLimit/types";

export function checkWebsiteScanRateLimit(
  clientKey: string,
  cost = 1,
): RateLimitResult {
  return getWebsiteScanRateLimiter().check(clientKey, cost);
}

export function checkWebsiteAiRateLimit(clientKey: string): RateLimitResult {
  return getWebsiteAiRateLimiter().check(clientKey);
}
