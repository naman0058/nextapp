import { getSiteUrl } from "@/lib/env";

const INDEXNOW_ENDPOINT = "https://api.indexnow.org/indexnow";

export function getIndexNowKey(): string | undefined {
  const key = process.env.INDEXNOW_KEY?.trim();
  return key && key.length >= 8 ? key : undefined;
}

export function getIndexNowKeyFileName(): string | undefined {
  const key = getIndexNowKey();
  return key ? `${key}.txt` : undefined;
}

export function getIndexNowKeyLocationUrl(): string | undefined {
  const file = getIndexNowKeyFileName();
  if (!file) return undefined;
  const custom = process.env.INDEXNOW_KEY_LOCATION?.trim();
  if (custom) return custom;
  return `${getSiteUrl()}/${file}`;
}

/** Submit absolute URLs to IndexNow (Bing and partners). No-op when key unset. */
export async function submitIndexNowUrls(urls: string[]): Promise<{ ok: boolean; status?: number }> {
  const key = getIndexNowKey();
  const keyLocation = getIndexNowKeyLocationUrl();
  const host = new URL(getSiteUrl()).host;
  if (!key || !keyLocation || urls.length === 0) {
    return { ok: false };
  }
  const unique = [...new Set(urls.map((u) => u.trim()).filter(Boolean))];
  const res = await fetch(INDEXNOW_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/json; charset=utf-8" },
    body: JSON.stringify({
      host,
      key,
      keyLocation,
      urlList: unique,
    }),
  });
  return { ok: res.ok, status: res.status };
}
