# Match playwright version in root package.json
FROM mcr.microsoft.com/playwright:v1.64.1-noble

WORKDIR /app

# Root deps: playwright, @axe-core/playwright, shared scanner imports.
# services/scanner deps: tsx (runtime transpiler, no runtime npx fetch).
COPY package.json package-lock.json ./
COPY services/scanner/package.json services/scanner/package-lock.json ./services/scanner/
RUN npm ci --omit=dev && npm ci --omit=dev --prefix services/scanner

COPY . .

ENV NODE_ENV=production
ENV PORT=8787

# Chromium is preinstalled in the Playwright base image (v1.64.1-noble).

USER pwuser

EXPOSE 8787

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://127.0.0.1:8787/health || exit 1

CMD ["npm", "--prefix", "services/scanner", "start"]
