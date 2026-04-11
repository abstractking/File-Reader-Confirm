// agents/scout/runOnce.ts
// Run SCOUT once against all targets immediately
// Usage: npm run scout:once

import "dotenv/config";
import { runAllTargets } from "./index";

console.log("[SCOUT] Running one-time lead search...\n");

runAllTargets()
  .then(() => {
    console.log("\n[SCOUT] Done. Check your Slack #approvals channel for new leads.");
    process.exit(0);
  })
  .catch(err => {
    console.error("[SCOUT] Fatal error:", err);
    process.exit(1);
  });
