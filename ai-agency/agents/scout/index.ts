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
import { scrapeFromUrl, RawLead }       from "./scraper";
import { scoreLead }                    from "./scorer";
import { sendAlert }                    from "../../core/slack";
import { appendLeadRow }                from "../../core/sheets";

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

  await appendLeadRow(dbLead);
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
// runAllTargets — Google Places API batch mode
// Called by cron and by manual scout:once trigger
// ─────────────────────────────────────────────
export async function runAllTargets(): Promise<void> {
  const { resolveTargetLocations, TARGET_NICHES, BATCH_TARGET } = await import("./config");

  const locations = resolveTargetLocations();
  const location  = locations[0];

  await log("SCOUT", "batch_started", { location, niches: TARGET_NICHES.length }, "success", null);
  await sendAlert(`🔍 *SCOUT* — Starting batch in *${location}* across ${TARGET_NICHES.length} niches`);

  // Pre-load existing leads for deduplication
  const existingLeads = await getLeadsByStatus("new");
  const existingUrls  = new Set(existingLeads.map(r => (r.website_url ?? "").toLowerCase()).filter(Boolean));
  const existingNames = new Set(existingLeads.map(r => r.business_name.toLowerCase()));

  let totalFound = 0;

  for (const niche of TARGET_NICHES) {
    if (totalFound >= BATCH_TARGET) {
      await log("SCOUT", "batch_limit_reached", { total: totalFound }, "success", null);
      break;
    }

    await log("SCOUT", "niche_search", { location, keyword: niche.keyword }, "success", null);
    const leads = await searchPlaces(location, niche.keyword);

    for (const lead of leads) {
      if (totalFound >= BATCH_TARGET) break;

      // Deduplicate before scoring
      const isDuplicate =
        (lead.website_url && existingUrls.has(lead.website_url.toLowerCase())) ||
        existingNames.has(lead.business_name.toLowerCase());

      if (isDuplicate) {
        await log("SCOUT", "duplicate_skipped", { business: lead.business_name }, "warning", null);
        continue;
      }

      const scored = await scoreLead(lead);
      if (scored.score < niche.minScore) continue;

      const dbLead = await insertLead({
        source:        "google_places",
        business_name: scored.business_name,
        contact_name:  scored.contact_name  ?? null,
        email:         scored.email         ?? null,
        phone:         scored.phone         ?? null,
        website_url:   scored.website_url   ?? null,
        niche:         scored.niche,
        location:      scored.location,
        notes:         scored.notes         ?? null,
        score:         scored.score,
        status:        "new",
      });

      // Track for in-run dedup
      if (dbLead.website_url) existingUrls.add(dbLead.website_url.toLowerCase());
      existingNames.add(dbLead.business_name.toLowerCase());

      await appendLeadRow(dbLead);
      await sendLeadCard(dbLead);
      totalFound++;

      await sleep(500);
    }
  }

  await log("SCOUT", "batch_complete", { total: totalFound, location }, "success", null);
  await sendAlert(`🔍 *SCOUT* — Batch complete. *${totalFound} leads* sent to Slack for review.`);
}

// ─────────────────────────────────────────────
// Parametric Batch Run
// Called by /scout/batch-run endpoint for
// one-off market searches (e.g. Orlando, FL)
// ─────────────────────────────────────────────
export interface BatchRunOptions {
  location:          string;
  niches:            Array<{ keyword: string; label: string; minScore: number }>;
  limit:             number;
  inactivityYears?:  number;   // skip businesses with no review newer than N years
  facebookBias?:     boolean;  // add broad "local services" queries to surface no-website leads
}

export async function runTargetBatch(options: BatchRunOptions): Promise<void> {
  const {
    location,
    niches,
    limit,
    inactivityYears = 2,
    facebookBias    = false,
  } = options;

  await log("SCOUT", "target_batch_started", { location, niches: niches.length, limit, facebookBias }, "success", null);
  await sendAlert(`🔍 *SCOUT* — Starting targeted batch in *${location}* | ${niches.length} niches | limit ${limit}${facebookBias ? " | Facebook-bias ON" : ""}`);

  const existingLeads = await getLeadsByStatus("new");
  const existingUrls  = new Set(existingLeads.map(r => (r.website_url ?? "").toLowerCase()).filter(Boolean));
  const existingNames = new Set(existingLeads.map(r => r.business_name.toLowerCase()));

  let totalFound = 0;

  // Build the full query list — niche queries first, broad "local services"
  // queries appended when facebookBias=true to surface Facebook-only businesses
  const queries: Array<{ keyword: string; label: string; minScore: number }> = [...niches];

  if (facebookBias) {
    const broadTerms = [
      "Local Services In",
      "home services",
      "local contractors",
      "local small business",
    ];
    for (const term of broadTerms) {
      queries.push({ keyword: term, label: "Broad / Local Services", minScore: 40 });
    }
  }

  for (const niche of queries) {
    if (totalFound >= limit) break;

    await log("SCOUT", "niche_search", { location, keyword: niche.keyword }, "success", null);
    const leads = await searchPlaces(location, niche.keyword, { maxInactivityYears: inactivityYears });

    for (const lead of leads) {
      if (totalFound >= limit) break;

      const isDuplicate =
        (lead.website_url && existingUrls.has(lead.website_url.toLowerCase())) ||
        existingNames.has(lead.business_name.toLowerCase());

      if (isDuplicate) {
        await log("SCOUT", "duplicate_skipped", { business: lead.business_name }, "warning", null);
        continue;
      }

      // Override niche label when broad query matched
      if (niche.label === "Broad / Local Services" && lead.niche === niche.keyword) {
        lead.niche = "Local Service Business";
      }

      const scored = await scoreLead(lead);
      if (scored.score < niche.minScore) continue;

      const dbLead = await insertLead({
        source:        "google_places",
        business_name: scored.business_name,
        contact_name:  scored.contact_name  ?? null,
        email:         scored.email         ?? null,
        phone:         scored.phone         ?? null,
        website_url:   scored.website_url   ?? null,
        niche:         scored.niche,
        location:      scored.location,
        notes:         scored.notes         ?? null,
        score:         scored.score,
        status:        "new",
      });

      if (dbLead.website_url) existingUrls.add(dbLead.website_url.toLowerCase());
      existingNames.add(dbLead.business_name.toLowerCase());

      await appendLeadRow(dbLead);
      await sendLeadCard(dbLead);
      totalFound++;

      await sleep(400);
    }
  }

  await log("SCOUT", "target_batch_complete", { total: totalFound, location }, "success", null);
  await sendAlert(`🔍 *SCOUT* — Targeted batch complete in *${location}*. *${totalFound} leads* sent to Slack for review.`);
}

// ─────────────────────────────────────────────
// Google Places API (New) — Text Search
// maxInactivityYears: skip businesses whose most
// recent review is older than N years.
// businessStatus CLOSED_PERMANENTLY are always skipped.
// ─────────────────────────────────────────────
async function searchPlaces(
  location: string,
  keyword:  string,
  opts:     { maxInactivityYears?: number } = {},
): Promise<RawLead[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) throw new Error("GOOGLE_PLACES_API_KEY not set");

  const { MAX_RESULTS_PER_SEARCH, GOOGLE_PLACES_BASE } = await import("./config");
  const cutoffMs = opts.maxInactivityYears
    ? Date.now() - opts.maxInactivityYears * 365.25 * 24 * 3600 * 1000
    : 0;

  const url = `${GOOGLE_PLACES_BASE}/places:searchText`;

  const response = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type":     "application/json",
      "X-Goog-Api-Key":   apiKey,
      "X-Goog-FieldMask": [
        "places.displayName",
        "places.formattedAddress",
        "places.nationalPhoneNumber",
        "places.websiteUri",
        "places.rating",
        "places.userRatingCount",
        "places.businessStatus",
        "places.reviews",
        "places.id",
        "places.googleMapsUri",
      ].join(","),
    },
    body: JSON.stringify({
      textQuery: `${keyword} in ${location}`,
      pageSize:  Math.min(MAX_RESULTS_PER_SEARCH, 20),
    }),
  });

  if (!response.ok) {
    const errBody = await response.text().catch(() => "");
    await log("SCOUT", "places_api_error", { status: response.status, keyword, location, body: errBody.slice(0, 300) }, "error", null);
    return [];
  }

  const data   = await response.json();
  const places = (data.places ?? []) as any[];

  const results: RawLead[] = [];

  for (const p of places) {
    // Skip permanently closed businesses
    if (p.businessStatus === "CLOSED_PERMANENTLY") continue;

    // Skip businesses inactive for more than maxInactivityYears
    // (only if they actually have reviews — no reviews = unknown, allow through)
    if (cutoffMs > 0 && p.reviews && p.reviews.length > 0) {
      const latestReviewMs = Math.max(
        ...p.reviews.map((r: any) => new Date(r.publishTime ?? 0).getTime())
      );
      if (latestReviewMs < cutoffMs) {
        await log("SCOUT", "inactive_skipped", { business: p.displayName?.text, latestReviewMs }, "warning", null);
        continue;
      }
    }

    const hasWebsite    = Boolean(p.websiteUri);
    const isFacebookOnly = p.websiteUri?.includes("facebook.com");

    const notes = !hasWebsite
      ? "❌ No website — Facebook/word-of-mouth only. Prime outreach target."
      : isFacebookOnly
        ? "📘 Facebook page only — no dedicated website."
        : `Website: ${p.websiteUri}`;

    results.push({
      business_name: p.displayName?.text ?? "Unknown",
      contact_name:  null,
      phone:         p.nationalPhoneNumber ?? null,
      email:         null,
      website_url:   p.websiteUri ?? null,
      address:       p.formattedAddress ?? null,
      location,
      niche:         keyword,
      rating:        p.rating ?? null,
      review_count:  p.userRatingCount ?? null,
      place_id:      p.id ?? `gp_${Date.now()}`,
      google_url:    p.googleMapsUri ?? "",
      notes,
    });
  }

  return results;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
