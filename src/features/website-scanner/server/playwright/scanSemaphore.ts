import {
  SCANNER_GLOBAL_DEFAULT_CONCURRENT,
  SCANNER_GLOBAL_MAX_CONCURRENT,
} from "@/features/website-scanner/constants/scanLimits";
import { WebsiteScanError } from "@/features/website-scanner/types/scanErrors";

function readMaxConcurrent(): number {
  const raw = process.env.SCANNER_MAX_CONCURRENT?.trim();
  if (!raw) return SCANNER_GLOBAL_DEFAULT_CONCURRENT;
  const n = Number.parseInt(raw, 10);
  if (!Number.isFinite(n) || n < 1) return SCANNER_GLOBAL_DEFAULT_CONCURRENT;
  return Math.min(n, SCANNER_GLOBAL_MAX_CONCURRENT);
}

class ScanSemaphore {
  private active = 0;
  private readonly max = readMaxConcurrent();
  private queue: Array<() => void> = [];

  async acquire(timeoutMs = 120_000): Promise<() => void> {
    if (this.active < this.max) {
      this.active += 1;
      return () => this.release();
    }
    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => {
        reject(new Error("SCANNER_BUSY"));
      }, timeoutMs);
      this.queue.push(() => {
        clearTimeout(timer);
        resolve();
      });
    });
    this.active += 1;
    return () => this.release();
  }

  private release(): void {
    this.active = Math.max(0, this.active - 1);
    const next = this.queue.shift();
    if (next) next();
  }
}

const globalSemaphore = new ScanSemaphore();

export async function withScanConcurrency<T>(
  fn: () => Promise<T>,
): Promise<T> {
  let release: (() => void) | undefined;
  try {
    release = await globalSemaphore.acquire();
    return await fn();
  } catch (err) {
    if (err instanceof Error && err.message === "SCANNER_BUSY") {
      throw new WebsiteScanError(
        "SCANNER_UNAVAILABLE",
        "The scanner is busy. Please try again in a moment.",
      );
    }
    throw err;
  } finally {
    release?.();
  }
}
