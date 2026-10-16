import { VIDEO_TEMP_PATH_PREFIX } from "@/features/video/constants/videoLimits";

const UUID_RE =
  /^tmp\/video\/[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}\.(mp4|webm)$/i;

export function isValidMediaRef(mediaRef: string): boolean {
  if (!mediaRef.startsWith(VIDEO_TEMP_PATH_PREFIX)) return false;
  if (mediaRef.includes("..") || mediaRef.includes("\\")) return false;
  if (/^https?:\/\//i.test(mediaRef)) return false;
  return UUID_RE.test(mediaRef);
}

export function extensionForMime(mime: string): "mp4" | "webm" {
  return mime === "video/webm" ? "webm" : "mp4";
}

export function createMediaRefPathname(uuid: string, ext: "mp4" | "webm"): string {
  return `${VIDEO_TEMP_PATH_PREFIX}${uuid}.${ext}`;
}
