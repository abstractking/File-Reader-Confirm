// agents/scout/index.ts
// ═════════════════════════════════════════════════════════
//  SCOUT — Lead Generation Agent
//  Scrapes Google Maps for local service businesses,
//  scores them with Claude, sends each to Slack for
//  your approval before anything enters the pipeline.
// ═════════════════════════════════════════════════════════

import { Task, AgentRunResult }         from "../../core/types";
import { log }                          from "../../core/logger";
import { insertLead, getLeadsByStatus } from "../../core/queries";
import { sendLeadCard }                 from "./slack";
import { scrapeGoogleMaps }             from "./scraper";
import { scoreLead }                    from "./scorer";
import { NICHES, TARGET_LOCATIONS }     from "./config";

// ─────────────────────────────────────────────
// Main run() — called by PRODUCER dispatcher
// ─────────────────────────────────────────────
export async function run(task: Task): Promise<AgentRunResult> {
  const location = (task.input_data?.location as string) ?? TARGET_LOCATIONS[0];
  const niche    = (task.input_data?.niche    as string) ?? NICHES[0].keyword;

  await log("SCOUT", "run_started", { location, niche }, "success", task.project_id || null);

  // 1. Scrape Google Maps for businesses in this niche + location
  const rawLeads = await scrapeGoogleMaps(niche, location);

  if (!rawLeads.length) {
    return {
      summary: `No leads found for "${niche}" in ${location}`,
      data:    { leads_found: 0, niche, location }
    };
  }

  // 2. Score each lead with Claude
  const scoredLeads = await Promise.all(
    rawLeads.map(lead => scoreLead(lead))
  );

  // 3. Deduplicate against existing leads already in DB
  const existingLeads = await getLeadsByStatus("new");
  const existingNames = new Set(existingLeads.map(r => r.business_name.toLowerCase()));
  const existingPhones = new Set(existingLeads.map(r => r.phone ?? "").filter(Boolean));

  const freshLeads = scoredLeads.filter(l =>
    !existingNames.has(l.business_name.toLowerCase()) &&
    !(l.phone && existingPhones.has(l.phone))
  );

  // 4. Save fresh leads to DB + send each to Slack for YOUR approval
  //    Nothing converts to a project until you click Approve
  let saved = 0;
  for (const lead of freshLeads) {
    try {
      const dbLead = await insertLead({
        source:        "google_maps",
        business_name: lead.business_name,
        contact_name:  lead.contact_name  ?? null,
        email:         lead.email         ?? null,
        phone:         lead.phone         ?? null,
        website_url:   lead.website_url   ?? null,
        niche:         lead.niche,
        location:      lead.location,
        notes:         lead.notes         ?? null,
        score:         lead.score,
        status:        "new",
      });

      // Send to Slack — you decide qualify/reject per lead
      await sendLeadCard(dbLead);
      saved++;

      // Avoid Slack rate limits between cards
      await sleep(800);

    } catch (err: any) {
      await log(
        "SCOUT", "lead_save_error",
        { error: err.message, business: lead.business_name },
        "error"
      );
    }
  }

  await log(
    "SCOUT", "run_complete",
    { scraped: rawLeads.length, saved, duplicates_skipped: scoredLeads.length - freshLeads.length },
    "success"
  );

  return {
    summary: `SCOUT found ${rawLeads.length} businesses, saved ${saved} new leads for your review in Slack`,
    data: {
      location,
      niche,
      total_scraped:       rawLeads.length,
      new_leads_saved:     saved,
      duplicates_skipped:  scoredLeads.length - freshLeads.length,
    }
  };
}

// ─────────────────────────────────────────────
// Standalone cron runner — SCOUT can also run
// on its own schedule independently of PRODUCER
// Usage: npx tsx agents/scout/cron.ts
// ─────────────────────────────────────────────
export async function runAllTargets(): Promise<void> {
  await log("SCOUT", "cron_started", { targets: TARGET_LOCATIONS.length * NICHES.length }, "success", null);

  for (const location of TARGET_LOCATIONS) {
    for (const niche of NICHES) {
      try {
        const fakeTask: Task = {
          id: "cron", created_at: new Date(), updated_at: new Date(),
          project_id: "", agent: "SCOUT", task_type: "scrape_leads",
          status: "in_progress", priority: 5, retries: 0,
          input_data: { location, niche: niche.keyword },
          output_data: null, error_log: null,
        };
        await run(fakeTask);
        await sleep(3000); // 3s between searches to be polite
      } catch (err: any) {
        await log("SCOUT", "niche_run_error", { location, niche: niche.keyword, error: err.message }, "error", null);
      }
    }
  }

  await log("SCOUT", "cron_complete", {}, "success", null);
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
