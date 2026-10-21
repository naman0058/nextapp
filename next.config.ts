import type { NextConfig } from "next";
import { getBlogImageRemotePatterns } from "./src/lib/blog/images/getBlogImageRemotePatterns";

const securityHeaders = [
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), interest-cohort=()",
  },
  { key: "X-Frame-Options", value: "SAMEORIGIN" },
];

function publicAiRemediationEnabled(): string {
  const flag = process.env.AI_REMEDIATION_ENABLED?.trim().toLowerCase();
  if (flag === "0" || flag === "false") return "0";
  if (process.env.OPENAI_REMEDIATION_MODEL?.trim()) return "1";
  return "0";
}

const nextConfig: NextConfig = {
  /* config options here */
  env: {
    NEXT_PUBLIC_AI_REMEDIATION_ENABLED: publicAiRemediationEnabled(),
  },
  serverExternalPackages: ["playwright", "@axe-core/playwright", "mongoose"],
  images: {
    remotePatterns: getBlogImageRemotePatterns(),
  },
  cacheComponents: true,
  partialPrefetching: true,
  async headers() {
    return [
      {
        source: "/:path*",
        headers: securityHeaders,
      },
    ];
  },
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
