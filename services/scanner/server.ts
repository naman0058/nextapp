import http from "node:http";
import { randomUUID } from "node:crypto";
import { checkChromiumReady } from "./chromiumReady";
import { assertLoopbackBypassDisabledInProduction } from "../../src/features/website-scanner/server/security/testBypass";
import { LocalPlaywrightScanner } from "@/features/website-scanner/server/runtime/localPlaywrightScanner";
import type { WebsiteScannerRuntime } from "@/features/website-scanner/server/runtime/types";
import { parseVisualLocatorWorkerRequest } from "@/features/website-scanner/server/visualLocator/parseVisualLocatorWorkerRequest";
import type { WebsitePageScanRequest } from "@/features/website-scanner/types/scanTypes";
import { WebsiteScanError } from "@/features/website-scanner/types/scanErrors";
import { SCAN_VIEWPORTS } from "@/features/website-scanner/constants/viewports";
import { verifyScannerBearerToken } from "./auth";

export { isScannerRequestAuthorized, verifyScannerBearerToken } from "./auth";

assertLoopbackBypassDisabledInProduction();

const PORT = Number.parseInt(process.env.PORT ?? "8080", 10);
const MAX_REQUEST_BODY_BYTES = 256 * 1024;

function unauthorized(res: http.ServerResponse) {
  res.writeHead(401, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Unauthorized" }));
}

function payloadTooLarge(res: http.ServerResponse) {
  res.writeHead(413, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Request body too large." }));
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    let total = 0;
    req.on("data", (c) => {
      total += c.length;
      if (total > MAX_REQUEST_BODY_BYTES) {
        reject(new Error("PAYLOAD_TOO_LARGE"));
        req.removeAllListeners("data");
        req.on("data", () => undefined);
        req.resume();
        return;
      }
      chunks.push(c);
    });
    req.on("end", () => resolve(Buffer.concat(chunks).toString("utf8")));
    req.on("error", reject);
  });
}

function parseRequest(raw: string): WebsitePageScanRequest | null {
  try {
    const body = JSON.parse(raw) as Record<string, unknown>;
    const url = typeof body.url === "string" ? body.url : "";
    const viewportRaw = body.viewport as { id?: string } | undefined;
    const id = viewportRaw?.id === "mobile" ? "mobile" : "desktop";
    const mode =
      body.mode === "small_site" ? "small_site" : "single_page";
    return {
      url,
      viewport: SCAN_VIEWPORTS[id],
      mode,
      rootOrigin:
        typeof body.rootOrigin === "string" ? body.rootOrigin : null,
      includeBestPractices: body.includeBestPractices !== false,
      scanId: typeof body.scanId === "string" ? body.scanId : undefined,
    };
  } catch {
    return null;
  }
}

function statusForScanError(code: WebsiteScanError["code"]): number {
  if (code === "SCANNER_UNAVAILABLE" || code === "RATE_LIMITED") return 503;
  return 400;
}

function logScanComplete(
  requestId: string,
  started: number,
  violationCount: number,
) {
  console.info(
    "[scanner-service]",
    JSON.stringify({
      requestId,
      durationMs: Date.now() - started,
      violations: violationCount,
    }),
  );
}

function logDiscoverCrawlComplete(
  requestId: string,
  started: number,
  urlCount: number,
) {
  console.info(
    "[scanner-service]",
    JSON.stringify({
      requestId,
      op: "discover-crawl",
      durationMs: Date.now() - started,
      urlCount,
    }),
  );
}

function parseDiscoverCrawlRequest(raw: string): string | null {
  try {
    const body = JSON.parse(raw) as Record<string, unknown>;
    const siteUrl = typeof body.siteUrl === "string" ? body.siteUrl.trim() : "";
    return siteUrl || null;
  } catch {
    return null;
  }
}

export function createScannerHttpServer(
  scanner: WebsiteScannerRuntime = new LocalPlaywrightScanner(),
  token = process.env.SCANNER_SERVICE_TOKEN?.trim(),
): http.Server {
  return http.createServer(async (req, res) => {
    if (req.method === "GET" && req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true, runtime: "playwright" }));
      return;
    }

    if (req.method === "GET" && req.url === "/ready") {
      const ready = await checkChromiumReady();
      res.writeHead(ready ? 200 : 503, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: ready, chromium: ready }));
      return;
    }

    if (req.method === "POST" && req.url === "/v1/scan-page") {
      if (!verifyScannerBearerToken(req.headers.authorization, token)) {
        unauthorized(res);
        return;
      }

      let raw: string;
      try {
        raw = await readBody(req);
      } catch (err) {
        if (err instanceof Error && err.message === "PAYLOAD_TOO_LARGE") {
          payloadTooLarge(res);
          return;
        }
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid request." }));
        return;
      }

      const request = parseRequest(raw);
      if (!request?.url) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ code: "INVALID_URL", error: "Invalid request." }));
        return;
      }

      const requestId = request.scanId ?? randomUUID();
      const started = Date.now();
      try {
        const result = await scanner.scanPage(request);
        logScanComplete(requestId, started, result.violations.length);
        res.writeHead(200, {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        });
        res.end(JSON.stringify(result));
      } catch (err) {
        if (err instanceof WebsiteScanError) {
          res.writeHead(statusForScanError(err.code), {
            "Content-Type": "application/json",
          });
          res.end(
            JSON.stringify({ code: err.code, error: err.userMessage }),
          );
          return;
        }
        res.writeHead(503, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            code: "SCANNER_UNAVAILABLE",
            error: "Scan failed.",
          }),
        );
      }
      return;
    }

    if (req.method === "POST" && req.url === "/v1/discover-crawl") {
      if (!verifyScannerBearerToken(req.headers.authorization, token)) {
        unauthorized(res);
        return;
      }

      let raw: string;
      try {
        raw = await readBody(req);
      } catch (err) {
        if (err instanceof Error && err.message === "PAYLOAD_TOO_LARGE") {
          payloadTooLarge(res);
          return;
        }
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid request." }));
        return;
      }

      const siteUrl = parseDiscoverCrawlRequest(raw);
      if (!siteUrl) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ code: "INVALID_URL", error: "Invalid request." }));
        return;
      }

      const requestId = randomUUID();
      const started = Date.now();
      try {
        const result = await scanner.discoverCrawlUrls(siteUrl);
        logDiscoverCrawlComplete(requestId, started, result.urls.length);
        res.writeHead(200, {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        });
        res.end(JSON.stringify(result));
      } catch (err) {
        if (err instanceof WebsiteScanError) {
          res.writeHead(statusForScanError(err.code), {
            "Content-Type": "application/json",
          });
          res.end(
            JSON.stringify({ code: err.code, error: err.userMessage }),
          );
          return;
        }
        res.writeHead(503, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            code: "SCANNER_UNAVAILABLE",
            error: "Site discovery failed.",
          }),
        );
      }
      return;
    }

    if (req.method === "POST" && req.url === "/v1/visualize-accessibility-issue") {
      if (!verifyScannerBearerToken(req.headers.authorization, token)) {
        unauthorized(res);
        return;
      }

      let raw: string;
      try {
        raw = await readBody(req);
      } catch (err) {
        if (err instanceof Error && err.message === "PAYLOAD_TOO_LARGE") {
          payloadTooLarge(res);
          return;
        }
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ error: "Invalid request." }));
        return;
      }

      let parsedBody: unknown;
      try {
        parsedBody = JSON.parse(raw);
      } catch {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ code: "INVALID_URL", error: "Invalid request." }));
        return;
      }
      const vizRequest = parseVisualLocatorWorkerRequest(parsedBody);
      if (!vizRequest) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ code: "INVALID_URL", error: "Invalid request." }));
        return;
      }

      try {
        const result = await scanner.visualizeIssue(vizRequest);
        res.writeHead(200, {
          "Content-Type": result.contentType,
          "Cache-Control": "no-store",
          "X-Locator-Match": result.match,
          "X-Locator-Occurrence": String(result.occurrenceIndex),
        });
        res.end(result.image);
      } catch (err) {
        if (err instanceof WebsiteScanError) {
          res.writeHead(statusForScanError(err.code), {
            "Content-Type": "application/json",
          });
          res.end(
            JSON.stringify({ code: err.code, error: err.userMessage }),
          );
          return;
        }
        res.writeHead(503, { "Content-Type": "application/json" });
        res.end(
          JSON.stringify({
            code: "SCANNER_UNAVAILABLE",
            error: "Visual location failed.",
          }),
        );
      }
      return;
    }

    res.writeHead(404);
    res.end();
  });
}

export function startScannerServer(port = PORT): http.Server {
  const server = createScannerHttpServer();
  server.listen(port, () => {
    console.info(`[scanner-service] listening on ${port}`);
  });
  return server;
}

if (process.env.VITEST !== "true") {
  startScannerServer();
}
