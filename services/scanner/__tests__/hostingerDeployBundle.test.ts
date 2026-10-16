import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { describe, expect, it } from "vitest";

const root = resolve(process.cwd());

function readRepo(relative: string): string {
  return readFileSync(resolve(root, relative), "utf8");
}

describe("Hostinger scanner deploy bundle", () => {
  it("compose uses deploy.resources.limits.pids, not top-level pids_limit", () => {
    const compose = readRepo("scanner-worker/docker-compose.yml");
    expect(compose).not.toMatch(/^\s*pids_limit:/m);
    expect(compose).toMatch(/pids:\s*256/);
    expect(compose).toMatch(/127\.0\.0\.1:8787:8787/);
    expect(compose).not.toMatch(/0\.0\.0\.0:8787/);
  });

  it("Dockerfile bakes tsx at build and does not start via npx tsx", () => {
    const dockerfile = readRepo("services/scanner/Dockerfile");
    expect(dockerfile).toMatch(
      /npm ci --omit=dev --prefix services\/scanner/,
    );
    expect(dockerfile).toMatch(/CMD \["npm", "--prefix", "services\/scanner", "start"\]/);
    expect(dockerfile).not.toMatch(/CMD.*npx.*tsx/);
    expect(dockerfile).not.toMatch(/playwright install chromium/);
  });
});
