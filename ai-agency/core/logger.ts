// core/logger.ts
// ─────────────────────────────────────────────
// Structured logger — writes to DB + console
// ─────────────────────────────────────────────

import { insertLog } from "./queries";
import { AgentName } from "./types";

type LogStatus = "success" | "error" | "warning";

export async function log(
  agent:      AgentName | "PRODUCER",
  action:     string,
  details:    Record<string, any> = {},
  status:     LogStatus = "success",
  projectId?: string | null
): Promise<void> {
  const ts = new Date().toISOString();
  const prefix = status === "error" ? "❌" : status === "warning" ? "⚠️" : "✅";
  console.log(`[${ts}] ${prefix} [${agent}] ${action}`, Object.keys(details).length ? details : "");

  try {
    await insertLog({ project_id: projectId ?? null, agent, action, details, status });
  } catch (err) {
    // Never let logging crash the agent
    console.error("[logger] Failed to write log:", err);
  }
}
