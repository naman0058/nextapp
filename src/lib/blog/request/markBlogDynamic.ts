import { connection } from "next/server";

/** Opt into per-request rendering when `cacheComponents` is enabled (Mongo-backed blog). */
export async function markBlogDynamic(): Promise<void> {
  await connection();
}
