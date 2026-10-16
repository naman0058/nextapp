import "server-only";

import {
  getAiImageRateLimiter,
  getVideoTranscribeRateLimiter,
  getVideoVisualRateLimiter,
} from "@/lib/rateLimit/bestEffortMemoryLimiter";
import type { RateLimitResult } from "@/lib/rateLimit/types";

/**
 * Server entry point for AI image analysis rate limiting.
 * Replace implementation with a durable store (e.g. Redis) when scaling beyond single-instance.
 */
export function checkAIRateLimit(clientKey: string): RateLimitResult {
  return getAiImageRateLimiter().check(clientKey);
}

export function checkVideoTranscribeRateLimit(
  clientKey: string,
): RateLimitResult {
  return getVideoTranscribeRateLimiter().check(clientKey);
}

export function checkVideoVisualRateLimit(clientKey: string): RateLimitResult {
  return getVideoVisualRateLimiter().check(clientKey);
}
