// core/queries.ts
// ─────────────────────────────────────────────
// Typed query helpers for every table
// All SQL lives here — agents import these
// ─────────────────────────────────────────────

import { query, queryOne, transaction } from "./db";
import {
  Lead, Project, Task, Approval, Asset, AuditLog,
  TaskStatus, ProjectStage, LeadStatus
} from "./types";

// ══════════════════════════════════════════════
// LEADS
// ══════════════════════════════════════════════

export async function insertLead(data: Omit<Lead, "id" | "created_at">): Promise<Lead> {
  const row = await queryOne<Lead>(`
    INSERT INTO leads
      (source, business_name, contact_name, email, phone, website_url, niche, location, notes, score, status)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11)
    RETURNING *
  `, [
    data.source, data.business_name, data.contact_name, data.email,
    data.phone, data.website_url, data.niche, data.location,
    data.notes, data.score, data.status
  ]);
  return row!;
}

export async function getLeadsByStatus(status: LeadStatus): Promise<Lead[]> {
  return query<Lead>("SELECT * FROM leads WHERE status = $1 ORDER BY created_at DESC", [status]);
}

export async function updateLeadStatus(id: string, status: LeadStatus): Promise<void> {
  await query("UPDATE leads SET status = $1 WHERE id = $2", [status, id]);
}

// ══════════════════════════════════════════════
// PROJECTS
// ══════════════════════════════════════════════

export async function insertProject(
  data: Omit<Project, "id" | "created_at">
): Promise<Project> {
  const row = await queryOne<Project>(`
    INSERT INTO projects
      (lead_id, client_name, client_email, project_name, niche, package, price,
       tech_stack, status, current_stage, deadline, notes, metadata)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)
    RETURNING *
  `, [
    data.lead_id, data.client_name, data.client_email, data.project_name,
    data.niche, data.package, data.price, data.tech_stack,
    data.status, data.current_stage, data.deadline, data.notes,
    JSON.stringify(data.metadata)
  ]);
  return row!;
}

export async function getProjectById(id: string): Promise<Project | null> {
  return queryOne<Project>("SELECT * FROM projects WHERE id = $1", [id]);
}

export async function getActiveProjects(): Promise<Project[]> {
  return query<Project>(
    "SELECT * FROM projects WHERE status = 'active' ORDER BY created_at DESC"
  );
}

export async function updateProjectStage(
  id: string,
  stage: ProjectStage,
  status?: string
): Promise<void> {
  if (status) {
    await query(
      "UPDATE projects SET current_stage = $1, status = $2 WHERE id = $3",
      [stage, status, id]
    );
  } else {
    await query(
      "UPDATE projects SET current_stage = $1 WHERE id = $2",
      [stage, id]
    );
  }
}

// ══════════════════════════════════════════════
// TASKS
// ══════════════════════════════════════════════

export async function insertTask(
  data: Omit<Task, "id" | "created_at" | "updated_at" | "project">
): Promise<Task> {
  const row = await queryOne<Task>(`
    INSERT INTO tasks
      (project_id, agent, task_type, status, priority, input_data, output_data, error_log, retries)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *
  `, [
    data.project_id, data.agent, data.task_type, data.status,
    data.priority, JSON.stringify(data.input_data),
    data.output_data ? JSON.stringify(data.output_data) : null,
    data.error_log, data.retries
  ]);
  return row!;
}

/** Fetch pending tasks joined with their project — the main queue query */
export async function getPendingTasks(limit = 3): Promise<Task[]> {
  const rows = await query<any>(`
    SELECT
      t.*,
      row_to_json(p.*) AS project
    FROM tasks t
    LEFT JOIN projects p ON p.id = t.project_id
    WHERE t.status = 'pending'
    ORDER BY t.priority ASC, t.created_at ASC
    LIMIT $1
  `, [limit]);

  // Parse JSONB fields
  return rows.map(normalizeTask);
}

export async function updateTaskStatus(
  id: string,
  status: TaskStatus,
  extra: Partial<Pick<Task, "output_data" | "error_log" | "retries" | "input_data">> = {}
): Promise<void> {
  const sets: string[] = ["status = $2", "updated_at = NOW()"];
  const vals: any[]    = [id, status];
  let   idx            = 3;

  if (extra.output_data !== undefined) { sets.push(`output_data = $${idx++}`); vals.push(JSON.stringify(extra.output_data)); }
  if (extra.error_log   !== undefined) { sets.push(`error_log = $${idx++}`);   vals.push(extra.error_log); }
  if (extra.retries     !== undefined) { sets.push(`retries = $${idx++}`);     vals.push(extra.retries); }
  if (extra.input_data  !== undefined) { sets.push(`input_data = $${idx++}`);  vals.push(JSON.stringify(extra.input_data)); }

  await query(`UPDATE tasks SET ${sets.join(", ")} WHERE id = $1`, vals);
}

export async function getTaskById(id: string): Promise<Task | null> {
  const row = await queryOne<any>(`
    SELECT t.*, row_to_json(p.*) AS project
    FROM tasks t
    JOIN projects p ON p.id = t.project_id
    WHERE t.id = $1
  `, [id]);
  return row ? normalizeTask(row) : null;
}

/** Re-queue a rejected/failed task for manual retry */
export async function requeueTask(id: string): Promise<boolean> {
  const rows = await query<Task>(`
    UPDATE tasks
    SET status = 'pending', updated_at = NOW()
    WHERE id = $1 AND status IN ('rejected', 'failed')
    RETURNING id
  `, [id]);
  return rows.length > 0;
}

// ══════════════════════════════════════════════
// APPROVALS
// ══════════════════════════════════════════════

export async function insertApproval(
  data: Omit<Approval, "id" | "created_at" | "resolved_at">
): Promise<Approval> {
  const row = await queryOne<Approval>(`
    INSERT INTO approvals
      (task_id, project_id, slack_message_ts, slack_channel, stage, decision, reviewer_notes, requested_by)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8)
    RETURNING *
  `, [
    data.task_id, data.project_id, data.slack_message_ts,
    data.slack_channel, data.stage, data.decision,
    data.reviewer_notes, data.requested_by
  ]);
  return row!;
}

export async function resolveApproval(
  id: string,
  decision: "approved" | "rejected",
  notes: string = ""
): Promise<Approval | null> {
  return queryOne<Approval>(`
    UPDATE approvals
    SET decision = $2, reviewer_notes = $3, resolved_at = NOW()
    WHERE id = $1
    RETURNING *
  `, [id, decision, notes]);
}

export async function updateApprovalSlackTs(
  id: string,
  ts: string,
  channel: string
): Promise<void> {
  await query(
    "UPDATE approvals SET slack_message_ts = $2, slack_channel = $3 WHERE id = $1",
    [id, ts, channel]
  );
}

export async function getApprovalById(id: string): Promise<Approval | null> {
  return queryOne<Approval>("SELECT * FROM approvals WHERE id = $1", [id]);
}

// ══════════════════════════════════════════════
// ASSETS
// ══════════════════════════════════════════════

export async function insertAsset(
  data: Omit<Asset, "id" | "created_at">
): Promise<Asset> {
  const row = await queryOne<Asset>(`
    INSERT INTO assets
      (project_id, task_id, asset_type, title, content, file_url, version, is_approved, metadata)
    VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9)
    RETURNING *
  `, [
    data.project_id, data.task_id, data.asset_type, data.title,
    data.content, data.file_url, data.version, data.is_approved,
    JSON.stringify(data.metadata)
  ]);
  return row!;
}

export async function getAssetsByProject(projectId: string): Promise<Asset[]> {
  return query<Asset>(
    "SELECT * FROM assets WHERE project_id = $1 ORDER BY created_at DESC",
    [projectId]
  );
}

export async function getAssetByTaskId(taskId: string, assetType?: string): Promise<Asset | null> {
  if (assetType) {
    return queryOne<Asset>(
      "SELECT * FROM assets WHERE task_id = $1 AND asset_type = $2 ORDER BY version DESC LIMIT 1",
      [taskId, assetType]
    );
  }
  return queryOne<Asset>(
    "SELECT * FROM assets WHERE task_id = $1 ORDER BY version DESC LIMIT 1",
    [taskId]
  );
}

// ══════════════════════════════════════════════
// AUDIT LOGS
// ══════════════════════════════════════════════

export async function insertLog(
  data: Omit<AuditLog, "id" | "created_at">
): Promise<void> {
  await query(`
    INSERT INTO audit_logs (project_id, agent, action, details, status)
    VALUES ($1,$2,$3,$4,$5)
  `, [
    data.project_id, data.agent, data.action,
    JSON.stringify(data.details), data.status
  ]);
}

export async function getRecentLogs(limit = 50): Promise<AuditLog[]> {
  return query<AuditLog>(
    "SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT $1",
    [limit]
  );
}

// ══════════════════════════════════════════════
// INTERNAL UTILS
// ══════════════════════════════════════════════

/** Normalize raw DB row — parse JSONB fields returned as strings */
function normalizeTask(row: any): Task {
  return {
    ...row,
    input_data:  typeof row.input_data  === "string" ? JSON.parse(row.input_data)  : row.input_data  ?? {},
    output_data: typeof row.output_data === "string" ? JSON.parse(row.output_data) : row.output_data ?? null,
    metadata:    typeof row.metadata    === "string" ? JSON.parse(row.metadata)    : row.metadata    ?? {},
    project:     typeof row.project     === "string" ? JSON.parse(row.project)     : row.project     ?? null,
  };
}
