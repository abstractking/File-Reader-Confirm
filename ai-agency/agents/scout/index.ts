// agents/scout/index.ts
// ═════════════════════════════════════════════════════════
//  SCOUT — Lead Qualification Agent (Website Input Mode)
//
//  You manually provide a business website URL.
//  SCOUT fetches the page, extracts info, scores
//  the lead with Claude, then sends a Slack card
//  for your Approve / Reject decision.
//
//  Input fields (all passed via task.input_data):
//    website_url  — required, e.g. "https://joesbarbershop.com"
//    business_name — optional override (if auto-detect is wrong)
//    niche        — optional, e.g. "barbershop"  (default: "local business")
//    location     — optional, e.g. "Lake Charles, LA" (default: "Unknown")
// ═════════════════════════════════════════════════════════

import { Task, AgentRunResult }         from "../../core/types";
import { log }                          from "../../core/logger";
import { insertLead, getLeadsByStatus } from "../../core/queries";
import { sendLeadCard }                 from "./slack";
import { scrapeFromUrl }                from "./scraper";
import { scoreLead }                    from "./scorer";

// ─────────────────────────────────────────────
// Main run() — called by PRODUCER dispatcher
// ─────────────────────────────────────────────
export async function run(task: Task): Promise<AgentRunResult> {
  const websiteUrl   = (task.input_data?.website_url   as string | undefined)?.trim();
  const niche        = (task.input_data?.niche         as string | undefined)?.trim() ?? "local business";
  const location     = (task.input_data?.location      as string | undefined)?.trim() ?? "Unknown";
  const nameOverride = (task.input_data?.business_name as string | undefined)?.trim();

  if (!websiteUrl) {
    return {
      summary: "SCOUT requires a website_url in input_data",
      data:    { error: "missing_website_url" },
    };
  }

  await log("SCOUT", "run_started", { websiteUrl, niche, location }, "success", task.project_id || null);

  // 1. Fetch and parse the business website
  const rawLead = await scrapeFromUrl(websiteUrl, niche, location);

  if (!rawLead) {
    return {
      summary: `Could not retrieve any data from ${websiteUrl}`,
      data:    { error: "scrape_failed", websiteUrl },
    };
  }

  // Allow manual business name override
  if (nameOverride) rawLead.business_name = nameOverride;

  // 2. Score with Claude
  const scoredLead = await scoreLead(rawLead);

  // 3. Deduplicate — skip if this website URL already exists
  const existingLeads = await getLeadsByStatus("new");
  const existingUrls  = new Set(existingLeads.map(r => (r.website_url ?? "").toLowerCase()).filter(Boolean));
  const existingNames = new Set(existingLeads.map(r => r.business_name.toLowerCase()));

  const isDuplicate =
    (scoredLead.website_url && existingUrls.has(scoredLead.website_url.toLowerCase())) ||
    existingNames.has(scoredLead.business_name.toLowerCase());

  if (isDuplicate) {
    await log("SCOUT", "duplicate_skipped", { business: scoredLead.business_name, url: websiteUrl }, "warning", null);
    return {
      summary: `${scoredLead.business_name} is already in the pipeline`,
      data:    { duplicate: true, business_name: scoredLead.business_name },
    };
  }

  // 4. Save to DB and send to Slack for your Approve / Reject
  const dbLead = await insertLead({
    source:        "manual_url",
    business_name: scoredLead.business_name,
    contact_name:  scoredLead.contact_name  ?? null,
    email:         scoredLead.email         ?? null,
    phone:         scoredLead.phone         ?? null,
    website_url:   scoredLead.website_url   ?? null,
    niche:         scoredLead.niche,
    location:      scoredLead.location,
    notes:         scoredLead.notes         ?? null,
    score:         scoredLead.score,
    status:        "new",
  });

  await sendLeadCard(dbLead);

  await log(
    "SCOUT", "lead_sent_to_slack",
    { business: dbLead.business_name, score: scoredLead.score, url: websiteUrl },
    "success",
    null
  );

  return {
    summary: `SCOUT qualified "${dbLead.business_name}" (score: ${scoredLead.score}) — check Slack to approve or reject`,
    data: {
      lead_id:       dbLead.id,
      business_name: dbLead.business_name,
      website_url:   websiteUrl,
      score:         scoredLead.score,
      niche,
      location,
    },
  };
}

// ─────────────────────────────────────────────
// runAllTargets — DISABLED in website-input mode
// Re-enable when Google Places API is activated
// ─────────────────────────────────────────────
export async function runAllTargets(): Promise<void> {
  await log("SCOUT", "cron_skipped", { reason: "Google Places API inactive — using manual URL input mode" }, "warning", null);
  console.log("SCOUT cron is disabled. Submit leads manually via website_url input.");
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
