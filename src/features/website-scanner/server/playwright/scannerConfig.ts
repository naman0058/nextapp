import { DEFAULT_SCANNER_USER_AGENT } from "@/features/website-scanner/constants/scannerVersion";

export function getScannerUserAgent(): string {
  return process.env.SCANNER_USER_AGENT?.trim() || DEFAULT_SCANNER_USER_AGENT;
}

export function getScannerRuntimeMode(): "local" | "remote" {
  const mode = process.env.SCANNER_RUNTIME?.trim().toLowerCase();
  if (mode === "remote") return "remote";
  return "local";
}

export function getScannerServiceUrl(): string | undefined {
  const url = process.env.SCANNER_SERVICE_URL?.trim();
  return url || undefined;
}

export function getScannerServiceToken(): string | undefined {
  const token = process.env.SCANNER_SERVICE_TOKEN?.trim();
  return token || undefined;
}
