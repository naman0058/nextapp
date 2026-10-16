import "server-only";
import mongoose from "mongoose";

declare global {
  var __mongooseCache: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null };
}

const cached = global.__mongooseCache ?? { conn: null, promise: null };
global.__mongooseCache = cached;

const CONNECT_TIMEOUT_MS = 10_000;
const SOCKET_TIMEOUT_MS = 45_000;

export type MongoConnectResult =
  | { ok: true; connection: typeof mongoose }
  | { ok: false; reason: "not_configured" | "connect_failed" };

function getMongoUri(): string | null {
  const uri = process.env.MONGODB_URI?.trim();
  return uri ? uri : null;
}

export function getMongoDbName(): string | null {
  const name = process.env.MONGODB_DB_NAME?.trim();
  return name ? name : null;
}

export async function connectMongo(): Promise<MongoConnectResult> {
  const uri = getMongoUri();
  const dbName = getMongoDbName();
  if (!uri || !dbName) {
    return { ok: false, reason: "not_configured" };
  }

  if (cached.conn) {
    return { ok: true, connection: cached.conn };
  }

  if (!cached.promise) {
    cached.promise = mongoose
      .connect(uri, {
        dbName,
        serverSelectionTimeoutMS: CONNECT_TIMEOUT_MS,
        socketTimeoutMS: SOCKET_TIMEOUT_MS,
        maxPoolSize: 10,
      })
      .then((m) => m)
      .catch((err: unknown) => {
        cached.promise = null;
        console.error("[mongodb] connection failed");
        throw err;
      });
  }

  try {
    cached.conn = await cached.promise;
    return { ok: true, connection: cached.conn };
  } catch {
    return { ok: false, reason: "connect_failed" };
  }
}
