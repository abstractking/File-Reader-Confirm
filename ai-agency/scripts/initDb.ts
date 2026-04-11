// scripts/initDb.ts
// ─────────────────────────────────────────────
// Run once to create all tables in Replit PostgreSQL
// Usage: npm run db:init
// ─────────────────────────────────────────────

import "dotenv/config";
import { pool } from "../core/db";

const SCHEMA = `
-- Enable UUID generation
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- ════════════════════════════════════════════
-- LEADS
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS leads (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  source        TEXT        NOT NULL    DEFAULT 'manual',
  business_name TEXT        NOT NULL,
  contact_name  TEXT,
  email         TEXT,
  phone         TEXT,
  website_url   TEXT,
  niche         TEXT,
  location      TEXT,
  notes         TEXT,
  score         INTEGER     NOT NULL    DEFAULT 0,
  status        TEXT        NOT NULL    DEFAULT 'new'
    CHECK (status IN ('new','qualified','rejected','converted'))
);

-- ════════════════════════════════════════════
-- PROJECTS
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS projects (
  id            UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at    TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  lead_id       UUID        REFERENCES leads(id) ON DELETE SET NULL,
  client_name   TEXT        NOT NULL,
  client_email  TEXT,
  project_name  TEXT        NOT NULL,
  niche         TEXT,
  package       TEXT        CHECK (package IN ('starter','growth','pro')),
  price         NUMERIC(10,2),
  tech_stack    TEXT        NOT NULL    DEFAULT 'React / TypeScript / Tailwind',
  status        TEXT        NOT NULL    DEFAULT 'active'
    CHECK (status IN ('active','on_hold','complete','cancelled')),
  current_stage TEXT        NOT NULL    DEFAULT 'PROPOSAL'
    CHECK (current_stage IN ('PROPOSAL','DESIGN','BUILD','LAUNCH','MARKET','COMPLETE')),
  deadline      DATE,
  notes         TEXT,
  metadata      JSONB       NOT NULL    DEFAULT '{}'
);

-- ════════════════════════════════════════════
-- TASKS
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS tasks (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  updated_at   TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  project_id   UUID        NOT NULL    REFERENCES projects(id) ON DELETE CASCADE,
  agent        TEXT        NOT NULL
    CHECK (agent IN ('SCOUT','PROPOSER','DESIGNER','BUILDER','MARKETER','PRODUCER')),
  task_type    TEXT        NOT NULL,
  status       TEXT        NOT NULL    DEFAULT 'pending'
    CHECK (status IN ('pending','in_progress','awaiting_approval','approved','rejected','complete','failed')),
  priority     INTEGER     NOT NULL    DEFAULT 5 CHECK (priority BETWEEN 1 AND 10),
  input_data   JSONB       NOT NULL    DEFAULT '{}',
  output_data  JSONB,
  error_log    TEXT,
  retries      INTEGER     NOT NULL    DEFAULT 0
);

-- Auto-update updated_at
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tasks_updated_at ON tasks;
CREATE TRIGGER tasks_updated_at
  BEFORE UPDATE ON tasks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- ════════════════════════════════════════════
-- APPROVALS
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS approvals (
  id                UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at        TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  resolved_at       TIMESTAMPTZ,
  task_id           UUID        NOT NULL    REFERENCES tasks(id) ON DELETE CASCADE,
  project_id        UUID        NOT NULL    REFERENCES projects(id) ON DELETE CASCADE,
  slack_message_ts  TEXT,
  slack_channel     TEXT,
  stage             TEXT        NOT NULL,
  decision          TEXT        NOT NULL    DEFAULT 'pending'
    CHECK (decision IN ('pending','approved','rejected')),
  reviewer_notes    TEXT,
  requested_by      TEXT        NOT NULL    DEFAULT 'PRODUCER'
);

-- ════════════════════════════════════════════
-- ASSETS
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS assets (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  project_id   UUID        NOT NULL    REFERENCES projects(id) ON DELETE CASCADE,
  task_id      UUID        NOT NULL    REFERENCES tasks(id)    ON DELETE CASCADE,
  asset_type   TEXT        NOT NULL,
  title        TEXT        NOT NULL,
  content      TEXT,
  file_url     TEXT,
  version      INTEGER     NOT NULL    DEFAULT 1,
  is_approved  BOOLEAN     NOT NULL    DEFAULT FALSE,
  metadata     JSONB       NOT NULL    DEFAULT '{}'
);

-- ════════════════════════════════════════════
-- AUDIT LOGS
-- ════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS audit_logs (
  id           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at   TIMESTAMPTZ NOT NULL    DEFAULT NOW(),
  project_id   UUID        REFERENCES projects(id) ON DELETE SET NULL,
  agent        TEXT        NOT NULL,
  action       TEXT        NOT NULL,
  details      JSONB       NOT NULL    DEFAULT '{}',
  status       TEXT        NOT NULL    DEFAULT 'success'
    CHECK (status IN ('success','error','warning'))
);

-- ════════════════════════════════════════════
-- INDEXES for query performance
-- ════════════════════════════════════════════
CREATE INDEX IF NOT EXISTS idx_tasks_status     ON tasks(status);
CREATE INDEX IF NOT EXISTS idx_tasks_project    ON tasks(project_id);
CREATE INDEX IF NOT EXISTS idx_tasks_priority   ON tasks(priority, created_at);
CREATE INDEX IF NOT EXISTS idx_approvals_task   ON approvals(task_id);
CREATE INDEX IF NOT EXISTS idx_approvals_decision ON approvals(decision);
CREATE INDEX IF NOT EXISTS idx_assets_project   ON assets(project_id);
CREATE INDEX IF NOT EXISTS idx_logs_project     ON audit_logs(project_id);
CREATE INDEX IF NOT EXISTS idx_logs_created     ON audit_logs(created_at DESC);
`;

async function init() {
  console.log("🚀 Initializing Replit PostgreSQL schema...\n");

  const client = await pool.connect();
  try {
    await client.query(SCHEMA);
    console.log("✅ All tables created successfully!\n");

    // Quick verification
    const tables = ["leads","projects","tasks","approvals","assets","audit_logs"];
    for (const t of tables) {
      const res = await client.query(`SELECT COUNT(*) FROM ${t}`);
      console.log(`  📋 ${t}: ${res.rows[0].count} rows`);
    }
    console.log("\n✅ Database ready. Run: npm run db:seed to add test data.");
  } catch (err) {
    console.error("❌ Schema init failed:", err);
    process.exit(1);
  } finally {
    client.release();
    await pool.end();
  }
}

init();
