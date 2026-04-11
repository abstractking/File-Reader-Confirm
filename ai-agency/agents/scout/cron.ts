// agents/scout/cron.ts
// ═════════════════════════════════════════════
//  SCOUT Standalone Cron
//  Runs every 6 hours, cycles through all
//  niches × locations defined in config.ts
//
//  Run manually:  npx tsx agents/scout/cron.ts
//  Or add to PRODUCER's cron schedule
// ═════════════════════════════════════════════

import "dotenv/config";
import cron                    from "node-cron";
import { runAllTargets }       from "./index";
import { SCOUT_CRON_SCHEDULE } from "./config";
import { log }                 from "../../core/logger";
import { sendAlert }           from "../../core/slack";

console.log(`[SCOUT CRON] Starting — schedule: ${SCOUT_CRON_SCHEDULE}`);

// Run immediately on start
runAllTargets().catch(console.error);

// Then run on schedule
cron.schedule(SCOUT_CRON_SCHEDULE, async () => {
  console.log("[SCOUT CRON] Scheduled run starting...");
  await sendAlert("🔍 *SCOUT* — Starting scheduled lead search across all targets...");

  try {
    await runAllTargets();
    await sendAlert("🔍 *SCOUT* — Lead search complete. Check above for new leads to review.");
  } catch (err: any) {
    await log("SCOUT", "cron_error", { error: err.message }, "error");
    await sendAlert(`🚨 *SCOUT cron failed:* ${err.message}`);
  }
});
