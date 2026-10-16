import "server-only";

import OpenAI from "openai";
import { getOpenAiApiKey } from "@/lib/openai/config";

export class OpenAiConfigError extends Error {
  constructor(message = "OpenAI is not configured.") {
    super(message);
    this.name = "OpenAiConfigError";
  }
}

let client: OpenAI | null = null;

export function getOpenAiClient(): OpenAI {
  const key = getOpenAiApiKey();
  if (!key) {
    throw new OpenAiConfigError();
  }
  if (!client) {
    client = new OpenAI({ apiKey: key });
  }
  return client;
}
