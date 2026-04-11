// core/types.ts
// ─────────────────────────────────────────────
// Shared TypeScript types for all agents
// ─────────────────────────────────────────────

export type AgentName =
  | "SCOUT"
  | "PROPOSER"
  | "DESIGNER"
  | "BUILDER"
  | "MARKETER"
  | "PRODUCER";

export type TaskStatus =
  | "pending"
  | "in_progress"
  | "awaiting_approval"
  | "approved"
  | "rejected"
  | "complete"
  | "failed";

export type ProjectStage =
  | "PROPOSAL"
  | "DESIGN"
  | "BUILD"
  | "LAUNCH"
  | "MARKET"
  | "COMPLETE";

export type ProjectStatus =
  | "active"
  | "on_hold"
  | "complete"
  | "cancelled";

export type LeadStatus =
  | "new"
  | "qualified"
  | "rejected"
  | "converted";

// ── Database row shapes ──────────────────────

export interface Lead {
  id:            string;
  created_at:    Date;
  source:        string;
  business_name: string;
  contact_name:  string | null;
  email:         string | null;
  phone:         string | null;
  website_url:   string | null;
  niche:         string | null;
  location:      string | null;
  notes:         string | null;
  score:         number;
  status:        LeadStatus;
}

export interface Project {
  id:            string;
  created_at:    Date;
  lead_id:       string | null;
  client_name:   string;
  client_email:  string | null;
  project_name:  string;
  niche:         string | null;
  package:       string | null;
  price:         number | null;
  tech_stack:    string;
  status:        ProjectStatus;
  current_stage: ProjectStage;
  deadline:      Date | null;
  notes:         string | null;
  metadata:      Record<string, any>;
}

export interface Task {
  id:           string;
  created_at:   Date;
  updated_at:   Date;
  project_id:   string;
  agent:        AgentName;
  task_type:    string;
  status:       TaskStatus;
  priority:     number;
  input_data:   Record<string, any>;
  output_data:  Record<string, any> | null;
  error_log:    string | null;
  retries:      number;
  // Joined
  project?:     Project;
}

export interface Approval {
  id:               string;
  created_at:       Date;
  resolved_at:      Date | null;
  task_id:          string;
  project_id:       string;
  slack_message_ts: string | null;
  slack_channel:    string | null;
  stage:            string;
  decision:         "pending" | "approved" | "rejected";
  reviewer_notes:   string | null;
  requested_by:     string;
}

export interface Asset {
  id:          string;
  created_at:  Date;
  project_id:  string;
  task_id:     string;
  asset_type:  string;
  title:       string;
  content:     string | null;
  file_url:    string | null;
  version:     number;
  is_approved: boolean;
  metadata:    Record<string, any>;
}

export interface AuditLog {
  id:         string;
  created_at: Date;
  project_id: string | null;
  agent:      string;
  action:     string;
  details:    Record<string, any>;
  status:     "success" | "error" | "warning";
}

// ── Stage progression map type ───────────────

export interface StageTransition {
  nextStage: ProjectStage;
  agent:     AgentName;
  task_type: string;
}

// ── Agent run function signature ─────────────

export interface AgentRunResult {
  summary:  string;
  data:     Record<string, any>;
  metadata?: Record<string, any>;
}
