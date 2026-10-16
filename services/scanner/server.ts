import http from "node:http";
import { assertLoopbackBypassDisabledInProduction } from "../../src/features/website-scanner/server/security/testBypass";
import { LocalPlaywrightScanner } from "@/features/website-scanner/server/runtime/localPlaywrightScanner";
import { parseVisualLocatorWorkerRequest } from "@/features/website-scanner/server/visualLocator/parseVisualLocatorWorkerRequest";
import type { WebsitePageScanRequest } from "@/features/website-scanner/types/scanTypes";
import { WebsiteScanError } from "@/features/website-scanner/types/scanErrors";
import { SCAN_VIEWPORTS } from "@/features/website-scanner/constants/viewports";

assertLoopbackBypassDisabledInProduction();

const PORT = Number.parseInt(process.env.PORT ?? "8080", 10);

export function isScannerRequestAuthorized(
  authorizationHeader: string | undefined,
  token: string | undefined,
): boolean {
  const expected = token?.trim();
  if (!expected) return false;
  return authorizationHeader === `Bearer ${expected}`;
}

function unauthorized(res: http.ServerResponse) {
  res.writeHead(401, { "Content-Type": "application/json" });
  res.end(JSON.stringify({ error: "Unauthorized" }));
}

function readBody(req: http.IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on("data", (c) => chunks.push(c));
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

export function createScannerHttpServer(
  scanner = new LocalPlaywrightScanner(),
  token = process.env.SCANNER_SERVICE_TOKEN?.trim(),
): http.Server {
  return http.createServer(async (req, res) => {
    if (req.method === "GET" && req.url === "/health") {
      res.writeHead(200, { "Content-Type": "application/json" });
      res.end(JSON.stringify({ ok: true }));
      return;
    }

    if (req.method === "POST" && req.url === "/v1/scan-page") {
      if (!isScannerRequestAuthorized(req.headers.authorization, token)) {
        unauthorized(res);
        return;
      }

      const raw = await readBody(req);
      const request = parseRequest(raw);
      if (!request?.url) {
        res.writeHead(400, { "Content-Type": "application/json" });
        res.end(JSON.stringify({ code: "INVALID_URL", error: "Invalid request." }));
        return;
      }

      try {
        const result = await scanner.scanPage(request);
        res.writeHead(200, {
          "Content-Type": "application/json",
          "Cache-Control": "no-store",
        });
        res.end(JSON.stringify(result));
      } catch (err) {
        if (err instanceof WebsiteScanError) {
          res.writeHead(400, { "Content-Type": "application/json" });
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

    if (req.method === "POST" && req.url === "/v1/visualize-accessibility-issue") {
      if (!isScannerRequestAuthorized(req.headers.authorization, token)) {
        unauthorized(res);
        return;
      }

      const raw = await readBody(req);
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
          res.writeHead(400, { "Content-Type": "application/json" });
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
