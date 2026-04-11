// agents/scout/slack.ts
// ═════════════════════════════════════════════
//  SCOUT Slack cards
//  Each new lead gets its own Slack card with:
//  ✅ Qualify → converts lead, queues PROPOSER
//  ❌ Skip    → marks lead rejected, no further action
// ═════════════════════════════════════════════

import { WebClient }          from "@slack/web-api";
import { Lead }               from "../../core/types";
import { updateLeadStatus,
         insertProject,
         insertTask }         from "../../core/queries";
import { log }                from "../../core/logger";

const slack   = new WebClient(process.env.SLACK_BOT_TOKEN!);
const CHANNEL = process.env.SLACK_CHANNEL_ID!;

// Truncate text to Slack's block limits
function trunc(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

// Score → emoji bar visual (e.g. 70 → "███████░░░")
function scoreBar(score: number): string {
  const filled = Math.round(score / 10);
  return "█".repeat(filled) + "░".repeat(10 - filled);
}

// Score → color label
function scoreLabel(score: number): string {
  if (score >= 75) return "🔥 Hot lead";
  if (score >= 55) return "✅ Good lead";
  if (score >= 35) return "🤔 Warm lead";
  return "❄️ Cold lead";
}

// Package → price range string
function pkgPrice(pkg: string): string {
  const prices: Record<string, string> = {
    starter: "$500–800",
    growth:  "$900–1,500",
    pro:     "$1,600–2,500",
  };
  return prices[pkg] ?? "TBD";
}

// ─────────────────────────────────────────────
// Send a lead card to #approvals
// ─────────────────────────────────────────────
export async function sendLeadCard(lead: Lead): Promise<void> {
  const score    = lead.score;
  const notes    = lead.notes ?? "";

  // Parse outreach angle out of notes if present
  const outreachMatch = notes.match(/📣 Outreach: (.+)/);
  const outreach      = outreachMatch?.[1] ?? `Hi, I noticed your business could benefit from a professional website.`;

  // Parse recommended package from notes
  const pkgMatch = notes.match(/recommended_pkg[": ]+(\w+)/i);
  const pkg      = pkgMatch?.[1] ?? "growth";

  await slack.chat.postMessage({
    channel: CHANNEL,
    text:    `New lead: ${lead.business_name} — Score ${score}/100`,
    blocks: [
      // ── Header ──
      {
        type: "header",
        text: { type: "plain_text", text: trunc(`🔍 New Lead — ${lead.business_name}`, 150) }
      },

      // ── Score bar ──
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Score:* \`${scoreBar(score)}\` ${score}/100 — ${scoreLabel(score)}`
        }
      },

      // ── Business details ──
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Niche:*\n${lead.niche}` },
          { type: "mrkdwn", text: `*Location:*\n${lead.location}` },
          { type: "mrkdwn", text: `*Phone:*\n${lead.phone ?? "—"}` },
          { type: "mrkdwn", text: `*Website:*\n${lead.website_url ? `<${lead.website_url}|Visit site>` : "❗ None"}` },
          { type: "mrkdwn", text: `*Suggested Package:*\n${pkg} (${pkgPrice(pkg)})` },
          { type: "mrkdwn", text: `*Source:*\n${lead.source}` },
        ]
      },

      // ── Notes / AI reasoning ──
      ...(notes ? [{
        type: "section" as const,
        text: {
          type: "mrkdwn" as const,
          text: trunc(`*Why this lead:*\n${notes.split("\n\n💡")[1]?.split("\n📣")[0]?.trim() ?? notes.slice(0, 300)}`, 3000)
        }
      }] : []),

      // ── Outreach suggestion ──
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: trunc(`*💬 Suggested outreach opener:*\n_"${outreach}"_`, 3000)
        }
      },

      { type: "divider" },

      // ── Action buttons ──
      {
        type: "actions",
        block_id: `lead::${lead.id}`,
        elements: [
          {
            type:      "button",
            text:      { type: "plain_text", text: "✅  Qualify Lead" },
            style:     "primary",
            action_id: "scout_qualify",
            value:     `${lead.id}::${pkg}`,
            confirm: {
              title:   { type: "plain_text", text: "Qualify this lead?" },
              text:    { type: "mrkdwn",     text: `This will queue *${lead.business_name}* for a proposal from PROPOSER.` },
              confirm: { type: "plain_text", text: "Yes, qualify" },
              deny:    { type: "plain_text", text: "Cancel" },
            }
          },
          {
            type:      "button",
            text:      { type: "plain_text", text: "❌  Skip" },
            style:     "danger",
            action_id: "scout_reject",
            value:     lead.id,
          }
        ]
      },

      // ── Footer ──
      {
        type: "context",
        elements: [
          { type: "mrkdwn", text: `Lead ID: \`${lead.id}\` • Source: ${lead.source}` }
        ]
      }
    ]
  });
}

// ─────────────────────────────────────────────
// Handle Qualify click
// Creates a project + queues PROPOSER task
// ─────────────────────────────────────────────
export async function handleQualify(
  leadId:  string,
  pkg:     string,
  ts:      string,
  channel: string
): Promise<void> {
  try {
    // 1. Mark lead as converted
    await updateLeadStatus(leadId, "converted");

    // 2. Get lead data (we'll refetch it)
    const { query } = await import("../../core/db");
    const rows = await query<Lead>("SELECT * FROM leads WHERE id = $1", [leadId]);
    const lead = rows[0];
    if (!lead) throw new Error(`Lead ${leadId} not found`);

    // 3. Create project from lead
    const priceMap: Record<string, number> = {
      starter: 650,
      growth:  1200,
      pro:     2000,
    };

    const project = await insertProject({
      lead_id:       lead.id,
      client_name:   lead.contact_name ?? lead.business_name,
      client_email:  lead.email ?? null,
      project_name:  `${lead.business_name} — Website`,
      niche:         lead.niche ?? "local_service",
      package:       pkg as any,
      price:         priceMap[pkg] ?? 1200,
      tech_stack:    "React / TypeScript / Tailwind",
      status:        "active",
      current_stage: "PROPOSAL",
      deadline:      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
      notes:         lead.notes ?? "",
      metadata: {
        phone:      lead.phone,
        address:    lead.location,
        google_url: "",
        source:     "scout_google_maps",
      }
    });

    // 4. Queue PROPOSER task
    await insertTask({
      project_id:  project.id,
      agent:       "PROPOSER",
      task_type:   "generate_proposal",
      status:      "pending",
      priority:    2,
      input_data: {
        project,
        lead,
        instructions: `Write a warm, confident proposal for a ${lead.niche} business 
                       in ${lead.location}. They ${lead.website_url ? "have a basic website that needs upgrading" : "have no website yet"}.
                       Tone: soothing, relaxed, professional. Package: ${pkg}.`,
      },
      output_data: null,
      error_log:   null,
      retries:     0,
    });

    // 5. Update Slack card to show qualified
    await slack.chat.update({
      channel,
      ts,
      text:   `✅ Qualified — ${lead.business_name} → PROPOSER queued`,
      blocks: [
        {
          type: "section",
          text: {
            type: "mrkdwn",
            text: `✅ *Qualified!* — ${lead.business_name} has been added as a project.\nPROPOSER will draft a proposal shortly.`
          }
        },
        {
          type: "context",
          elements: [
            { type: "mrkdwn", text: `Project ID: \`${project.id}\` • Package: ${pkg}` }
          ]
        }
      ]
    });

    await log("SCOUT", "lead_qualified", {
      lead_id:    leadId,
      project_id: project.id,
      package:    pkg
    }, "success");

  } catch (err: any) {
    await log("SCOUT", "qualify_error", { leadId, error: err.message }, "error");

    await slack.chat.update({
      channel, ts,
      text: `❌ Error qualifying lead: ${err.message}`
    });
  }
}

// ─────────────────────────────────────────────
// Handle Skip/Reject click
// ─────────────────────────────────────────────
export async function handleReject(
  leadId:  string,
  ts:      string,
  channel: string
): Promise<void> {
  await updateLeadStatus(leadId, "rejected");

  await slack.chat.update({
    channel,
    ts,
    text:   "❌ Lead skipped",
    blocks: [
      {
        type: "section",
        text: { type: "mrkdwn", text: `❌ *Skipped* — lead removed from queue.` }
      }
    ]
  });

  await log("SCOUT", "lead_rejected", { leadId }, "success");
}

