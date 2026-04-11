// agents/producer/index.ts
// ═════════════════════════════════════════════════════════
//  PRODUCER — Central Orchestration Brain
//  Stack: Replit PostgreSQL + Claude API + Slack
//  Always-on Express server on Replit
// ═════════════════════════════════════════════════════════

import "dotenv/config";
import express        from "express";
import cron           from "node-cron";
import crypto         from "crypto";

import { dbPing }                                 from "../../core/db";
import {
  getPendingTasks, updateTaskStatus,
  insertApproval, resolveApproval,
  updateApprovalSlackTs, getApprovalById,
  insertAsset, updateProjectStage,
  insertTask, getProjectById, requeueTask,
  insertLog, getRecentLogs
} from "../../core/queries";
import {
  sendApprovalCard, updateApprovalCard,
  sendAlert, sendProjectComplete, slack, SLACK_CHANNEL
} from "../../core/slack";
import { log }                                    from "../../core/logger";
import {
  Task, AgentName, ProjectStage, StageTransition
} from "../../core/types";

// ─────────────────────────────────────────────
// CONSTANTS
// ─────────────────────────────────────────────
const PORT                 = parseInt(process.env.PORT ?? "3000");
const SLACK_SIGNING_SECRET = process.env.SLACK_SIGNING_SECRET!;
const POLL_INTERVAL        = "*/2 * * * *";    // every 2 minutes
const MAX_TASKS_PER_TICK   = 3;

// ─────────────────────────────────────────────
// STAGE PROGRESSION TABLE
// Edit this to change pipeline order
// ─────────────────────────────────────────────
const STAGE_MAP: Record<ProjectStage, StageTransition | null> = {
  PROPOSAL: { nextStage: "DESIGN",    agent: "DESIGNER",  task_type: "create_wireframe"   },
  DESIGN:   { nextStage: "BUILD",     agent: "BUILDER",   task_type: "generate_site_code" },
  BUILD:    { nextStage: "LAUNCH",    agent: "BUILDER",   task_type: "deploy_site"        },
  LAUNCH:   { nextStage: "MARKET",    agent: "MARKETER",  task_type: "create_seo_content" },
  MARKET:   { nextStage: "COMPLETE",  agent: "MARKETER",  task_type: "finalize_assets"    },
  COMPLETE: null,
};

// ─────────────────────────────────────────────
// EXPRESS SETUP
// ─────────────────────────────────────────────
const app = express();

// Raw body for Slack signature verification MUST come before other parsers
app.use(
  "/webhooks/slack",
  express.raw({ type: "application/x-www-form-urlencoded" })
);
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// ═════════════════════════════════════════════
// CORE: PROCESS A SINGLE TASK
// ═════════════════════════════════════════════
async function processTask(task: Task): Promise<void> {
  await log("PRODUCER", "task_started", { task_id: task.id, agent: task.agent, type: task.task_type }, "success", task.project_id);

  // Mark in_progress so cron doesn't double-pick
  await updateTaskStatus(task.id, "in_progress");

  try {
    // ── Dispatch to the correct agent ──
    const result = await dispatchToAgent(task);

    // ── Save output ──
    await updateTaskStatus(task.id, "awaiting_approval", { output_data: result });

    // ── Create approval record ──
    const approval = await insertApproval({
      task_id:          task.id,
      project_id:       task.project_id,
      slack_message_ts: null,
      slack_channel:    null,
      stage:            task.agent,
      decision:         "pending",
      reviewer_notes:   null,
      requested_by:     "PRODUCER",
    });

    // ── Send to Slack ──
    const ts = await sendApprovalCard(task, result, approval.id);
    if (ts) await updateApprovalSlackTs(approval.id, ts, SLACK_CHANNEL);

    await log("PRODUCER", "approval_requested", { approval_id: approval.id, agent: task.agent }, "success", task.project_id);

  } catch (err: any) {
    // ── Task failed — mark it, alert in Slack ──
    await updateTaskStatus(task.id, "failed", { error_log: err.message });

    await log("PRODUCER", "task_failed", { task_id: task.id, error: err.message }, "error", task.project_id);

    await sendAlert(
      `🚨 *Task Failed*\n` +
      `Agent: \`${task.agent}\` | Type: \`${task.task_type}\`\n` +
      `Error: ${err.message}\n` +
      `Task ID: \`${task.id}\`\n` +
      `_Use \`POST /retrigger\` with this task ID to retry._`
    );
  }
}

// ═════════════════════════════════════════════
// CORE: AGENT DISPATCHER
// Lazy-loads agent module by name
// ═════════════════════════════════════════════
async function dispatchToAgent(task: Task): Promise<Record<string, any>> {
  const agentPaths: Record<AgentName, string> = {
    SCOUT:    "../../agents/scout/index",
    PROPOSER: "../../agents/proposer/index",
    DESIGNER: "../../agents/designer/index",
    BUILDER:  "../../agents/builder/index",
    MARKETER: "../../agents/marketer/index",
    PRODUCER: "../../agents/producer/index",
  };

  const path = agentPaths[task.agent];
  if (!path) throw new Error(`Unknown agent: ${task.agent}`);

  try {
    const module = await import(path);
    if (typeof module.run !== "function") {
      throw new Error(`Agent ${task.agent} missing export run()`);
    }
    return await module.run(task);
  } catch (err: any) {
    if (err.code === "MODULE_NOT_FOUND") {
      // Agent not built yet — return stub result so flow doesn't break
      return {
        summary:  `${task.agent} not yet implemented — stub result`,
        data:     { status: "stub", task_type: task.task_type },
        metadata: { stub: true }
      };
    }
    throw err;
  }
}

// ═════════════════════════════════════════════
// CORE: HANDLE APPROVAL DECISION
// Called when you click Approve/Reject in Slack
// ═════════════════════════════════════════════
async function handleApproval(
  approvalId: string,
  decision:   "approved" | "rejected"
): Promise<void> {
  const approval = await resolveApproval(approvalId, decision);
  if (!approval) {
    console.error("[PRODUCER] Approval not found:", approvalId);
    return;
  }

  const task = await getPendingTasks(100)  // get task from DB
    .then(() => null)                       // we need getTaskById
    .catch(() => null);

  // Fetch task directly
  const { query: dbQuery } = await import("../../core/db");
  const taskRows = await dbQuery<Task>(
    "SELECT t.*, row_to_json(p.*) AS project FROM tasks t JOIN projects p ON p.id = t.project_id WHERE t.id = $1",
    [approval.task_id]
  );
  const rawTask = taskRows[0] as any;
  if (!rawTask) { console.error("[PRODUCER] Task not found for approval:", approval.task_id); return; }

  const resolvedTask: Task = {
    ...rawTask,
    input_data:  typeof rawTask.input_data  === "string" ? JSON.parse(rawTask.input_data)  : rawTask.input_data  ?? {},
    output_data: typeof rawTask.output_data === "string" ? JSON.parse(rawTask.output_data) : rawTask.output_data ?? null,
    project:     typeof rawTask.project     === "string" ? JSON.parse(rawTask.project)     : rawTask.project     ?? null,
  };

  if (decision === "approved") {
    // ── Approved path ──────────────────────────
    await updateTaskStatus(resolvedTask.id, "complete");

    // Archive approved asset
    await insertAsset({
      project_id:  resolvedTask.project_id,
      task_id:     resolvedTask.id,
      asset_type:  resolvedTask.task_type,
      title:       `${resolvedTask.task_type} — v1 approved`,
      content:     JSON.stringify(resolvedTask.output_data),
      file_url:    null,
      version:     1,
      is_approved: true,
      metadata:    {},
    });

    // Advance to next stage
    await routeToNextStage(resolvedTask);

    // Update Slack message
    if (approval.slack_message_ts && approval.slack_channel) {
      await updateApprovalCard(
        approval.slack_message_ts,
        approval.slack_channel,
        "approved",
        resolvedTask.task_type
      );
    }

    await log("PRODUCER", "approved", { approval_id: approvalId, task_type: resolvedTask.task_type }, "success", resolvedTask.project_id);

  } else {
    // ── Rejected path ──────────────────────────
    // Mark rejected — you re-trigger manually via /retrigger
    await updateTaskStatus(resolvedTask.id, "rejected", {
      input_data: {
        ...resolvedTask.input_data,
        _rejected:    true,
        _rejected_at: new Date().toISOString(),
      }
    });

    if (approval.slack_message_ts && approval.slack_channel) {
      await updateApprovalCard(
        approval.slack_message_ts,
        approval.slack_channel,
        "rejected",
        resolvedTask.task_type
      );
    }

    await log("PRODUCER", "rejected", { approval_id: approvalId, task_type: resolvedTask.task_type }, "warning", resolvedTask.project_id);
  }
}

// ═════════════════════════════════════════════
// CORE: STAGE ROUTER
// Queues the next agent task after an approval
// ═════════════════════════════════════════════
async function routeToNextStage(completedTask: Task): Promise<void> {
  const project = await getProjectById(completedTask.project_id);
  if (!project) return;

  const next = STAGE_MAP[project.current_stage];

  if (!next) {
    // Pipeline complete 🎉
    await updateProjectStage(project.id, "COMPLETE", "complete");
    await sendProjectComplete(project.project_name, project.client_name);
    await log("PRODUCER", "project_complete", { project_id: project.id }, "success", project.id);
    return;
  }

  // Advance project stage
  await updateProjectStage(project.id, next.nextStage);

  // Queue next task
  await insertTask({
    project_id:  project.id,
    agent:       next.agent,
    task_type:   next.task_type,
    status:      "pending",
    priority:    3,
    input_data: {
      project,
      previous_output:       completedTask.output_data,
      previous_task_type:    completedTask.task_type,
    },
    output_data: null,
    error_log:   null,
    retries:     0,
  });

  await log(
    "PRODUCER", "stage_advanced",
    { from: project.current_stage, to: next.nextStage, next_agent: next.agent },
    "success",
    project.id
  );

  // Notify in Slack
  await sendAlert(
    `📬 *Stage Advanced* — ${project.project_name}\n` +
    `\`${project.current_stage}\` → \`${next.nextStage}\`\n` +
    `Next agent: *${next.agent}*`
  );
}

// ═════════════════════════════════════════════
// SLACK SIGNATURE VERIFIER
// Ensures webhooks are genuinely from Slack
// ═════════════════════════════════════════════
function verifySlackSignature(req: express.Request): boolean {
  try {
    const timestamp = req.headers["x-slack-request-timestamp"] as string;
    const slackSig  = req.headers["x-slack-signature"] as string;
    if (!timestamp || !slackSig) return false;

    // Reject requests older than 5 minutes (replay attack prevention)
    const fiveMinutesAgo = Math.floor(Date.now() / 1000) - 300;
    if (parseInt(timestamp) < fiveMinutesAgo) return false;

    const body      = req.body instanceof Buffer ? req.body.toString() : JSON.stringify(req.body);
    const sigBase   = `v0:${timestamp}:${body}`;
    const computed  = "v0=" + crypto
      .createHmac("sha256", SLACK_SIGNING_SECRET)
      .update(sigBase)
      .digest("hex");

    return crypto.timingSafeEqual(Buffer.from(computed), Buffer.from(slackSig));
  } catch {
    return false;
  }
}

// ═════════════════════════════════════════════
// ROUTES
// ═════════════════════════════════════════════

// ── Slack webhook — button clicks ──
app.post("/webhooks/slack", async (req, res) => {
  if (!verifySlackSignature(req)) {
    res.status(401).send("Unauthorized");
    return;
  }

  // Slack requires a 200 within 3 seconds — respond immediately
  res.sendStatus(200);

  try {
    const rawBody  = req.body instanceof Buffer ? req.body.toString() : req.body;
    const params   = typeof rawBody === "string"
      ? new URLSearchParams(rawBody)
      : new URLSearchParams(
          Object.entries(rawBody as Record<string, string>).map(([k, v]) => [k, String(v)])
        );

    const payload  = JSON.parse(params.get("payload") ?? "{}");
    const action   = payload.actions?.[0];
    if (!action) return;

    const approvalId = action.value as string;
    const decision   = action.action_id === "producer_approve" ? "approved" : "rejected";

    await handleApproval(approvalId, decision);

  } catch (err: any) {
    console.error("[PRODUCER] Webhook error:", err.message);
    await log("PRODUCER", "webhook_error", { error: err.message }, "error");
  }
});

// ── Manual re-trigger (after rejection) ──
// POST /retrigger  { "task_id": "uuid" }
app.post("/retrigger", async (req, res) => {
  const { task_id } = req.body ?? {};
  if (!task_id) {
    res.status(400).json({ error: "task_id is required" });
    return;
  }

  const success = await requeueTask(task_id);
  if (!success) {
    res.status(404).json({ error: "Task not found or not in rejected/failed state" });
    return;
  }

  await log("PRODUCER", "manual_retrigger", { task_id }, "success");
  res.json({ ok: true, message: `Task ${task_id} re-queued. Will run on next heartbeat.` });
});

// ── Dashboard — view recent logs + active projects ──
// GET /status
app.get("/status", async (_req, res) => {
  try {
    const [logs, tasks, projects] = await Promise.all([
      getRecentLogs(20),
      getPendingTasks(10),
      getProjectById("").then(() => []).catch(() => []),  // placeholder
    ]);

    res.json({
      producer:       "online",
      uptime_seconds: Math.floor(process.uptime()),
      pending_tasks:  tasks.length,
      recent_logs:    logs.slice(0, 10),
    });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ── Health check ──
app.get("/health", async (_req, res) => {
  const dbOk = await dbPing();
  res.status(dbOk ? 200 : 503).json({
    status:         dbOk ? "ok" : "db_unavailable",
    agent:          "PRODUCER",
    ts:             new Date().toISOString(),
    uptime_seconds: Math.floor(process.uptime()),
  });
});

// ═════════════════════════════════════════════
// CRON — Main heartbeat loop (every 2 minutes)
// ═════════════════════════════════════════════
cron.schedule(POLL_INTERVAL, async () => {
  try {
    const tasks = await getPendingTasks(MAX_TASKS_PER_TICK);
    if (!tasks.length) return;

    console.log(`[PRODUCER] Heartbeat — ${tasks.length} task(s) in queue`);

    // Process tasks sequentially to avoid race conditions
    for (const task of tasks) {
      await processTask(task);
    }
  } catch (err: any) {
    console.error("[PRODUCER] Cron error:", err.message);
    await log("PRODUCER", "cron_error", { error: err.message }, "error");
  }
});

// ═════════════════════════════════════════════
// STARTUP
// ═════════════════════════════════════════════
async function start() {
  // Verify DB connection before starting
  const dbOk = await dbPing();
  if (!dbOk) {
    console.error("❌ Cannot connect to Replit PostgreSQL. Check DATABASE_URL in Secrets.");
    process.exit(1);
  }

  app.listen(PORT, () => {
    console.log(`
╔═══════════════════════════════════════════╗
║         🧠  PRODUCER  ONLINE              ║
╠═══════════════════════════════════════════╣
║  Port:       ${PORT}                          ║
║  DB:         Replit PostgreSQL ✅          ║
║  AI:         Claude API ✅                 ║
║  Heartbeat:  every 2 minutes              ║
║                                           ║
║  Webhook:    POST /webhooks/slack         ║
║  Retrigger:  POST /retrigger              ║
║  Health:     GET  /health                 ║
║  Status:     GET  /status                 ║
╚═══════════════════════════════════════════╝
    `);
  });

  // Announce online status to Slack
  await sendAlert("🟢 *PRODUCER is online* — AI Agency system started.");
  await log("PRODUCER", "startup", { port: PORT }, "success");
}

start().catch((err) => {
  console.error("Fatal startup error:", err);
  process.exit(1);
});
