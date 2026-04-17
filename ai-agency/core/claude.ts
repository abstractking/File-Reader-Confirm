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

const RETRY_DELAYS = [5000, 10000, 20000]; // 5s, 10s, 20s

export async function askClaude(opts: AskClaudeOptions): Promise<string> {
  let lastError: any;

  for (let attempt = 0; attempt <= RETRY_DELAYS.length; attempt++) {
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

      const is529 =
        err?.status === 529 ||
        err?.error?.type === "overloaded_error" ||
        err?.message?.includes("overloaded") ||
        err?.message?.includes("529");

      if (!is529 || attempt === RETRY_DELAYS.length) {
        throw err;
      }

      const delay = RETRY_DELAYS[attempt];
      console.log(`[Claude] Overloaded (529) — retry ${attempt + 1}/3 in ${delay / 1000}s...`);
      await new Promise(resolve => setTimeout(resolve, delay));
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
