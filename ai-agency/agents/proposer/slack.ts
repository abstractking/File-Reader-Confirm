// agents/proposer/slack.ts
// ═════════════════════════════════════════════
//  PROPOSER Slack Cards
//  Sends the full proposal to #approvals with:
//  ✅ Approve  → saves as final, ready to copy/send
//  ✏️  Edit     → you type revision notes, Claude redrafts
//  ❌ Reject   → discards, marks task failed
// ═════════════════════════════════════════════

import { WebClient }           from "@slack/web-api";
import { GeneratedProposal }   from "./generator";
import { Project }             from "../../core/types";
import { log }                 from "../../core/logger";

const slack   = new WebClient(process.env.SLACK_BOT_TOKEN!);
const CHANNEL = process.env.SLACK_CHANNEL_ID!;

function trunc(text: string, max: number): string {
  return text.length > max ? text.slice(0, max - 1) + "…" : text;
}

// ─────────────────────────────────────────────
// Send proposal approval card to Slack
// ─────────────────────────────────────────────
export async function sendProposalCard(
  project:    Project,
  proposal:   GeneratedProposal,
  approvalId: string,
  taskId:     string
): Promise<string | undefined> {

  const preview     = proposal.proposal_text.slice(0, 2800);
  const isTruncated = proposal.proposal_text.length > 2800;

  const msg = await slack.chat.postMessage({
    channel: CHANNEL,
    text:    `📝 Proposal ready for review — ${project.client_name}`,
    blocks: [
      // ── Header ──
      {
        type: "header",
        text: { type: "plain_text", text: trunc(`📝 Proposal Ready — ${project.client_name}`, 150) }
      },

      // ── Project summary ──
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Business:*\n${project.client_name}`          },
          { type: "mrkdwn", text: `*Package:*\n${proposal.package_name}`          },
          { type: "mrkdwn", text: `*Price:*\n$${(proposal.price ?? 0).toLocaleString()}` },
          { type: "mrkdwn", text: `*Timeline:*\n${proposal.timeline}`             },
          { type: "mrkdwn", text: `*Niche:*\n${project.niche}`                    },
          { type: "mrkdwn", text: `*Words:*\n${proposal.word_count}`              },
        ]
      },

      { type: "divider" },

      // ── Subject line ──
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: trunc(`*📧 Email Subject Line:*\n\`${proposal.subject_line}\``, 3000)
        }
      },

      // ── Full proposal text ──
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*📄 Proposal Body:*\n\`\`\`${preview}${isTruncated ? "\n\n[... truncated — approve to see full version]" : ""}\`\`\``
        }
      },

      { type: "divider" },

      // ── Instructions ──
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*How to use:*\n✅ *Approve* → proposal saved, copy it and email the client yourself\n✏️ *Request Edit* → reply with revision notes and Claude will redraft\n❌ *Reject* → discard this proposal`
        }
      },

      // ── Action buttons ──
      {
        type: "actions",
        block_id: `proposal::${approvalId}`,
        elements: [
          {
            type:      "button",
            text:      { type: "plain_text", text: "✅  Approve & Copy" },
            style:     "primary",
            action_id: "producer_approve",
            value:     approvalId,
            confirm: {
              title:   { type: "plain_text", text: "Approve this proposal?" },
              text:    { type: "mrkdwn",     text: "The proposal will be saved. Copy it from the next message and email the client yourself." },
              confirm: { type: "plain_text", text: "Yes, approve it" },
              deny:    { type: "plain_text", text: "Cancel" },
            }
          },
          {
            type:      "button",
            text:      { type: "plain_text", text: "✏️  Request Edit" },
            action_id: "proposal_edit",
            value:     `${approvalId}::${taskId}`,
          },
          {
            type:      "button",
            text:      { type: "plain_text", text: "❌  Reject" },
            style:     "danger",
            action_id: "producer_reject",
            value:     approvalId,
          }
        ]
      },

      // ── Footer ──
      {
        type: "context",
        elements: [
          { type: "mrkdwn", text: `Approval \`${approvalId}\` • Task \`${taskId}\` • PROPOSER agent` }
        ]
      }
    ]
  });

  return msg.ts ?? undefined;
}

// ─────────────────────────────────────────────
// After approval — post the full copyable text
// ─────────────────────────────────────────────
export async function postApprovedProposal(
  proposal: GeneratedProposal,
  project:  Project
): Promise<void> {
  const fullText = `Subject: ${proposal.subject_line}\n\n${proposal.proposal_text}`;
  const chunks   = chunkText(fullText, 3800);

  await slack.chat.postMessage({
    channel: CHANNEL,
    text:    `✅ APPROVED PROPOSAL — ${project.client_name} (copy below)`,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: trunc(`✅ Approved — ${project.client_name}`, 150) }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Copy this proposal and email it to the client.*\n_Package: ${proposal.package_name} · $${(proposal.price ?? 0).toLocaleString()} · ${proposal.timeline}_`
        }
      },
    ]
  });

  for (const chunk of chunks) {
    await slack.chat.postMessage({ channel: CHANNEL, text: chunk });
    await sleep(300);
  }

  await slack.chat.postMessage({
    channel: CHANNEL,
    text:    `_— End of proposal for ${project.client_name}_`,
  });
}

// ─────────────────────────────────────────────
// Post edit request prompt
// ─────────────────────────────────────────────
export async function postEditPrompt(
  project:    Project,
  approvalId: string,
  taskId:     string
): Promise<void> {
  await slack.chat.postMessage({
    channel: CHANNEL,
    text:    `✏️ *Edit Requested — ${project.client_name}*\n\nReply to this message with your revision notes and PROPOSER will redraft.\n\nExample: _"Make the tone more casual, lower the price to $1,000, and emphasize the speed of delivery"_\n\n_Approval ID: \`${approvalId}\` · Task ID: \`${taskId}\`_`,
  });
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function chunkText(text: string, maxLen: number): string[] {
  const chunks: string[] = [];
  let start = 0;
  while (start < text.length) {
    chunks.push(text.slice(start, start + maxLen));
    start += maxLen;
  }
  return chunks;
}

function sleep(ms: number) {
  return new Promise(resolve => setTimeout(resolve, ms));
}
