import fs from "node:fs";
import http from "node:http";
import path from "node:path";

const FIXTURE_DIR = path.join(
  process.cwd(),
  "test-fixtures/website-scanner/ssrf",
);

function readHtml(name: string): string {
  return fs.readFileSync(path.join(FIXTURE_DIR, name), "utf8");
}

export type SsrfFixtureServer = {
  baseUrl: string;
  close: () => Promise<void>;
};

/**
 * Local HTTP fixture router for SSRF integration tests (127.0.0.1 only).
 * Requires WEBSITE_SCANNER_TEST_ALLOW_LOOPBACK=1 and non-production NODE_ENV.
 */
export async function startSsrfFixtureServer(): Promise<SsrfFixtureServer> {
  const server = http.createServer((req, res) => {
    const url = new URL(req.url ?? "/", "http://127.0.0.1");
    const pathname = url.pathname;

    const redirect = (location: string, status = 302) => {
      res.writeHead(status, { Location: location });
      res.end();
    };

    switch (pathname) {
      case "/redirect/private-ipv4":
        redirect("http://10.0.0.1/");
        return;
      case "/redirect/metadata":
        redirect("http://169.254.169.254/");
        return;
      case "/redirect/loop-a":
        redirect("/redirect/loop-b");
        return;
      case "/redirect/loop-b":
        redirect("/redirect/loop-a");
        return;
      case "/subresource/img-private":
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(readHtml("subresource-img-private.html"));
        return;
      case "/subresource/script-private":
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(readHtml("subresource-script-private.html"));
        return;
      case "/subresource/metadata-img":
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(readHtml("subresource-metadata-img.html"));
        return;
      case "/ok":
        res.writeHead(200, { "Content-Type": "text/html" });
        res.end(readHtml("ok.html"));
        return;
      default:
        res.writeHead(404);
        res.end("not found");
    }
  });

  await new Promise<void>((resolve) => {
    server.listen(0, "127.0.0.1", () => resolve());
  });
  const addr = server.address();
  if (!addr || typeof addr === "string") {
    throw new Error("SSRF fixture server failed to bind");
  }
  const baseUrl = `http://127.0.0.1:${addr.port}`;

  return {
    baseUrl,
    close: () =>
      new Promise<void>((resolve, reject) => {
        server.close((err) => (err ? reject(err) : resolve()));
      }),
  };
}
