# Website scanner service

Isolated Playwright + axe-core worker for production deployments where the Next.js app cannot run Chromium (e.g. Vercel serverless).

## Endpoints

- `GET /health` — liveness (no secrets)
- `POST /v1/scan-page` — Bearer `SCANNER_SERVICE_TOKEN`, JSON body matching `WebsitePageScanRequest`

## Environment

- `SCANNER_SERVICE_TOKEN` (required)
- `PORT` (default 8080)
- `SCANNER_USER_AGENT` (optional)
- `SCANNER_MAX_CONCURRENT` (optional, max 2)

Do **not** set `OPENAI_API_KEY` on this service.

## Local run

From repository root:

```bash
set SCANNER_SERVICE_TOKEN=dev-token
npx tsx services/scanner/server.ts
```

Set Next.js `SCANNER_RUNTIME=remote`, `SCANNER_SERVICE_URL=http://127.0.0.1:8080`, same token.

## Docker Compose (production-style)

```bash
export SCANNER_SERVICE_TOKEN=your-long-random-token
docker compose -f services/scanner/docker-compose.yml up --build
```

On Vercel, set `SCANNER_RUNTIME=remote`, `SCANNER_SERVICE_URL` to the worker URL, and the same token server-side.

## Network isolation

Apply egress restrictions using your platform (see `deploy/network-policy.example.yaml` for Kubernetes). **Required** for production SSRF defense-in-depth.

## Security

- Authenticate every scan request.
- Block outbound traffic to private networks and cloud metadata at the **infrastructure** layer (required for production).
- Set CPU/memory limits and low concurrency.

See [WEBSITE_SCANNER_SECURITY.md](../../WEBSITE_SCANNER_SECURITY.md).
