# Match playwright version in root package.json
FROM mcr.microsoft.com/playwright:v1.64.1-noble

WORKDIR /app

COPY package.json package-lock.json* ./
COPY services/scanner/package.json ./services/scanner/
RUN npm ci --omit=dev 2>/dev/null || npm install --omit=dev

COPY . .

ENV NODE_ENV=production
ENV PORT=8080

RUN npx playwright install chromium

USER pwuser

EXPOSE 8080

HEALTHCHECK --interval=30s --timeout=5s --retries=3 \
  CMD curl -f http://127.0.0.1:8080/health || exit 1

CMD ["npx", "tsx", "services/scanner/server.ts"]
