import { NextResponse } from "next/server";
import {
  ACCEPTED_VIDEO_MIME_TYPES,
  getMaxVideoFileSizeBytes,
} from "@/features/video/constants/videoLimits";
import {
  getTemporaryMediaStorage,
  isVideoProcessingConfigured,
} from "@/lib/media-storage";

function noStoreJson(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  if (!isVideoProcessingConfigured()) {
    return noStoreJson(
      {
        error:
          "Video processing is not configured on this deployment.",
      },
      503,
    );
  }

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return noStoreJson({ error: "Invalid JSON body." }, 400);
  }

  const contentType =
    typeof body === "object" &&
    body !== null &&
    "contentType" in body &&
    typeof (body as { contentType: unknown }).contentType === "string"
      ? (body as { contentType: string }).contentType
      : "";

  if (
    !ACCEPTED_VIDEO_MIME_TYPES.includes(
      contentType as (typeof ACCEPTED_VIDEO_MIME_TYPES)[number],
    )
  ) {
    return noStoreJson(
      {
        error:
          "This video format isn't supported yet. Please use MP4 or WebM.",
      },
      400,
    );
  }

  const storage = getTemporaryMediaStorage();
  const auth = await storage.createUploadAuthorization({
    contentType: contentType as (typeof ACCEPTED_VIDEO_MIME_TYPES)[number],
    maxBytes: getMaxVideoFileSizeBytes(),
  });

  return noStoreJson(
    {
      ...auth,
      maxBytes: getMaxVideoFileSizeBytes(),
    },
    200,
  );
}

export async function GET() {
  return noStoreJson({ error: "Method not allowed." }, 405);
}
