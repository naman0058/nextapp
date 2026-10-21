import { createHmac, timingSafeEqual } from "node:crypto";
import { SITE_BATCH_REGISTRY_TTL_MS } from "@/features/website-scanner/constants/scanLimits";
import { getScannerServiceToken } from "@/features/website-scanner/server/playwright/scannerConfig";
import { safeCrawlKey } from "@/features/website-scanner/utils/crawl/safeCrawlKey";
import type { RegisteredSiteBatch } from "@/features/website-scanner/server/batch/siteBatchRegistry";

type BatchTicketPayload = {
  v: 1;
  batchId: string;
  origin: string;
  urlKeys: string[];
  pageTotal: number;
  viewportMode: "desktop" | "mobile" | "compare";
  exp: number;
};

function getBatchSigningSecret(): string {
  const dedicated = process.env.WEBSITE_SCAN_BATCH_SECRET?.trim();
  if (dedicated && dedicated.length >= 16) return dedicated;
  const scannerToken = getScannerServiceToken();
  if (scannerToken && scannerToken.length >= 16) return scannerToken;
  if (process.env.NODE_ENV !== "production") {
    return "dev-website-scan-batch-secret-16";
  }
  throw new Error(
    "[website-scan] Set WEBSITE_SCAN_BATCH_SECRET or SCANNER_SERVICE_TOKEN for batch signing.",
  );
}

function signPayload(payload: BatchTicketPayload): string {
  const json = JSON.stringify(payload);
  const body = Buffer.from(json, "utf8").toString("base64url");
  const sig = createHmac("sha256", getBatchSigningSecret())
    .update(body)
    .digest("base64url");
  return `${body}.${sig}`;
}

function parseTicket(ticket: string): BatchTicketPayload | null {
  const dot = ticket.lastIndexOf(".");
  if (dot <= 0) return null;
  const body = ticket.slice(0, dot);
  const sig = ticket.slice(dot + 1);
  const expected = createHmac("sha256", getBatchSigningSecret())
    .update(body)
    .digest("base64url");
  try {
    const a = Buffer.from(sig, "base64url");
    const b = Buffer.from(expected, "base64url");
    if (a.length !== b.length || !timingSafeEqual(a, b)) return null;
  } catch {
    return null;
  }
  try {
    const json = Buffer.from(body, "base64url").toString("utf8");
    const payload = JSON.parse(json) as BatchTicketPayload;
    if (payload.v !== 1 || typeof payload.exp !== "number") return null;
    if (Date.now() > payload.exp) return null;
    return payload;
  } catch {
    return null;
  }
}

export function createSiteBatchTicket(batch: RegisteredSiteBatch): string {
  const payload: BatchTicketPayload = {
    v: 1,
    batchId: batch.batchId,
    origin: batch.origin,
    urlKeys: [...batch.urlKeys],
    pageTotal: batch.pageTotal,
    viewportMode: batch.viewportMode,
    exp: batch.expiresAt,
  };
  return signPayload(payload);
}

export function validateSiteBatchTicket(input: {
  batchId: string;
  url: string;
  pageIndex: number;
  pageTotal: number;
  viewportMode: "desktop" | "mobile" | "compare";
  batchTicket: string;
}): { ok: true } | { ok: false; error: string } {
  const payload = parseTicket(input.batchTicket.trim());
  if (!payload) {
    return { ok: false, error: "Scan batch expired or unknown." };
  }
  if (payload.batchId !== input.batchId) {
    return { ok: false, error: "Scan batch expired or unknown." };
  }
  if (input.pageTotal !== payload.pageTotal) {
    return { ok: false, error: "Batch page count mismatch." };
  }
  if (input.viewportMode !== payload.viewportMode) {
    return { ok: false, error: "Scan batch expired or unknown." };
  }
  if (input.pageIndex < 0 || input.pageIndex >= payload.pageTotal) {
    return { ok: false, error: "Invalid page index in batch." };
  }
  const key = safeCrawlKey(input.url);
  if (!payload.urlKeys.includes(key)) {
    return { ok: false, error: "URL is not part of registered batch." };
  }
  return { ok: true };
}

export function defaultBatchExpiresAt(): number {
  return Date.now() + SITE_BATCH_REGISTRY_TTL_MS;
}
