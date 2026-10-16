import { NextResponse } from "next/server";
import {
  ACCEPTED_VIDEO_MIME_TYPES,
  getMaxVideoFileSizeBytes,
} from "@/features/video/constants/videoLimits";
import { getDevDirectUploadAdapter } from "@/lib/media-storage/devDirectUploadAdapter";
import { getActiveStorageKind } from "@/lib/media-storage";
import { isValidMediaRef } from "@/lib/media-storage/mediaRefUtils";

function noStoreJson(body: unknown, status: number) {
  return NextResponse.json(body, {
    status,
    headers: { "Cache-Control": "no-store" },
  });
}

export async function POST(request: Request) {
  if (getActiveStorageKind() !== "dev") {
    return noStoreJson({ error: "Dev upload is not available." }, 404);
  }

  const mediaRef = request.headers.get("x-media-ref")?.trim() ?? "";
  if (!isValidMediaRef(mediaRef)) {
    return noStoreJson({ error: "Invalid media reference." }, 400);
  }

  const contentType = request.headers.get("content-type")?.split(";")[0]?.trim() ?? "";
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

  const buffer = Buffer.from(await request.arrayBuffer());
  if (buffer.length === 0) {
    return noStoreJson({ error: "Empty upload." }, 400);
  }
  if (buffer.length > getMaxVideoFileSizeBytes()) {
    return noStoreJson({ error: "Video exceeds maximum upload size." }, 413);
  }

  const dev = getDevDirectUploadAdapter();
  dev.registerUpload(
    mediaRef,
    buffer,
    contentType as (typeof ACCEPTED_VIDEO_MIME_TYPES)[number],
  );

  return noStoreJson({ ok: true, mediaRef }, 200);
}

export async function GET() {
  return noStoreJson({ error: "Method not allowed." }, 405);
}
