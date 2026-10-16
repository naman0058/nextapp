import { NextResponse } from "next/server";
import {
  analyzeImageWithOpenAI,
  OpenAiAnalysisError,
} from "@/features/accessibility/server/analyzeImageWithOpenAI";
import { parseAnalyzeImageRequest } from "@/features/accessibility/server/parseAnalyzeImageRequest";
import { isOpenAiConfigured } from "@/lib/openai/config";
import { OpenAiConfigError } from "@/lib/openai/client";
import { checkAIRateLimit } from "@/lib/rateLimit/checkAIRateLimit";

function noStoreJson(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

function getClientKey(request: Request): string {
  const forwarded = request.headers.get("x-forwarded-for");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim() || "unknown";
  }
  return request.headers.get("x-real-ip") ?? "unknown";
}

export async function POST(request: Request) {
  const started = Date.now();

  if (!isOpenAiConfigured()) {
    return noStoreJson(
      {
        error:
          "AI image analysis is not configured. Local accessibility checks remain available.",
      },
      503,
    );
  }

  const clientKey = getClientKey(request);
  const limit = checkAIRateLimit(clientKey);
  if (!limit.allowed) {
    return noStoreJson(
      {
        error: "Too many requests. Please wait before trying again.",
        retryAfterMs: limit.retryAfterMs,
      },
      429,
    );
  }

  let formData: FormData;
  try {
    formData = await request.formData();
  } catch {
    return noStoreJson({ error: "Invalid form data." }, 400);
  }

  const parsed = await parseAnalyzeImageRequest(formData);
  if ("status" in parsed) {
    return noStoreJson({ error: parsed.message }, parsed.status);
  }

  try {
    const analysis = await analyzeImageWithOpenAI({
      imageBase64: parsed.imageBytes.toString("base64"),
      mimeType: parsed.mimeType,
      platform: parsed.platform,
      caption: parsed.caption,
      altText: parsed.altText,
    });

    const durationMs = Date.now() - started;
    console.info("[analyze-image] success", { durationMs, status: 200 });

    return noStoreJson(analysis, 200);
  } catch (error) {
    const durationMs = Date.now() - started;

    if (error instanceof OpenAiConfigError) {
      console.info("[analyze-image] config", { durationMs, status: 503 });
      return noStoreJson(
        {
          error:
            "AI image analysis is not configured. Local accessibility checks remain available.",
        },
        503,
      );
    }

    if (error instanceof OpenAiAnalysisError) {
      const status = error.code === "timeout" ? 504 : 502;
      console.info("[analyze-image] ai_error", {
        durationMs,
        status,
        code: error.code,
      });
      const message =
        error.code === "timeout"
          ? "AI image analysis timed out. Try again with a smaller image or retry later."
          : "AI image analysis could not be completed. Your local accessibility checks are still available.";

      return noStoreJson({ error: message }, status);
    }

    console.info("[analyze-image] error", { durationMs, status: 500 });
    return noStoreJson(
      {
        error:
          "Something went wrong during AI analysis. Please try again later.",
      },
      500,
    );
  }
}

export async function GET() {
  return noStoreJson({ error: "Method not allowed." }, 405);
}
