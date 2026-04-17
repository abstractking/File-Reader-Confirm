// core/claude.ts
// ─────────────────────────────────────────────
// Thin Claude API wrapper
// All agents import askClaude() for inference
// ─────────────────────────────────────────────

import Anthropic from "@anthropic-ai/sdk";

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY! });

export interface ClaudeMessage {
  role:    "user" | "assistant";
  content: string;
}

export interface AskClaudeOptions {
  system?:     string;
  messages:    ClaudeMessage[];
  maxTokens?:  number;
  model?:      string;
}

const MAX_RETRIES    = 3;
const BASE_DELAY_MS  = 5000; // 5s → 10s → 20s (doubles each attempt)

function isRetryableError(err: any): boolean {
  const status = err?.status ?? err?.statusCode ?? err?.response?.status;
  if (typeof status === "number" && status >= 500) return true;
  if (err?.error?.type === "overloaded_error")     return true;
  if (err?.message?.includes("overloaded"))        return true;
  if (err?.message?.includes("529"))               return true;
  return false;
}

export async function askClaude(opts: AskClaudeOptions): Promise<string> {
  let lastError: any;

  for (let attempt = 0; attempt <= MAX_RETRIES; attempt++) {
    try {
      const response = await client.messages.create({
        model:      opts.model ?? "claude-sonnet-4-5",
        max_tokens: opts.maxTokens ?? 2048,
        system:     opts.system,
        messages:   opts.messages,
      });

      const block = response.content[0];
      if (block.type !== "text") throw new Error("Unexpected Claude response type");
      return block.text;

    } catch (err: any) {
      lastError = err;

      if (!isRetryableError(err) || attempt === MAX_RETRIES) {
        throw err;
      }

      const delayMs = BASE_DELAY_MS * Math.pow(2, attempt); // 5s, 10s, 20s
      const status  = err?.status ?? err?.statusCode ?? "5xx";
      console.log(`[Claude] Error ${status} — retry ${attempt + 1}/${MAX_RETRIES} in ${delayMs / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delayMs));
    }
  }

  throw lastError;
}

export async function askClaudeJSON<T = any>(
  opts: AskClaudeOptions
): Promise<T> {
  const raw = await askClaude({
    ...opts,
    system: (opts.system ?? "") +
      "\n\nIMPORTANT: Respond with ONLY valid JSON. No markdown, no backticks, no explanation.",
  });

  const clean = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  return JSON.parse(clean) as T;
}

export { client as claudeClient };
