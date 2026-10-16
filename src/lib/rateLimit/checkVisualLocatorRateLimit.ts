import "server-only";

import {
  getVisualLocatorImageRateLimiter,
  getVisualLocatorTokenRateLimiter,
} from "@/lib/rateLimit/bestEffortMemoryLimiter";
import type { RateLimitResult } from "@/lib/rateLimit/types";

export function checkVisualLocatorTokenRateLimit(
  clientKey: string,
): RateLimitResult {
  return getVisualLocatorTokenRateLimiter().check(clientKey);
}

export function checkVisualLocatorImageRateLimit(
  clientKey: string,
  cost = 2,
): RateLimitResult {
  return getVisualLocatorImageRateLimiter().check(clientKey, cost);
}
