import { query } from "./core/db";

async function main() {
  await query("ALTER TABLE approvals ALTER COLUMN project_id DROP NOT NULL");
  console.log("Done — approvals.project_id is now nullable");
  process.exit(0);
}

main().catch(e => { console.error(e.message); process.exit(1); });
