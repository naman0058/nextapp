import type OpenAI from "openai";

/** Returns true if the Responses API output indicates a model policy refusal. */
export function detectResponseRefusal(response: OpenAI.Responses.Response): boolean {
  for (const item of response.output ?? []) {
    if (item.type === "message") {
      for (const part of item.content ?? []) {
        if (part.type === "refusal") return true;
      }
    }
  }
  return false;
}
