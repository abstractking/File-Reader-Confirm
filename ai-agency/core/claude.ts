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

/**
 * Core inference call — used by every agent
 * Defaults to claude-sonnet-4-5 for best quality/cost ratio
 */
export async function askClaude(opts: AskClaudeOptions): Promise<string> {
  const response = await client.messages.create({
    model:      opts.model ?? "claude-sonnet-4-5",
    max_tokens: opts.maxTokens ?? 2048,
    system:     opts.system,
    messages:   opts.messages,
  });

  const block = response.content[0];
  if (block.type !== "text") throw new Error("Unexpected Claude response type");
  return block.text;
}

/**
 * Ask Claude to return structured JSON
 * Strips markdown fences, parses safely
 */
export async function askClaudeJSON<T = any>(
  opts: AskClaudeOptions
): Promise<T> {
  const raw = await askClaude({
    ...opts,
    system: (opts.system ?? "") +
      "\n\nIMPORTANT: Respond with ONLY valid JSON. No markdown, no backticks, no explanation.",
  });

  // Strip accidental ```json fences
  const clean = raw
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/, "")
    .trim();

  return JSON.parse(clean) as T;
}

export { client as claudeClient };
