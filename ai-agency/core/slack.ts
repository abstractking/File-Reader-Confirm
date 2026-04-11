// core/slack.ts
// ─────────────────────────────────────────────
// Slack helpers — approval cards, alerts, updates
// ─────────────────────────────────────────────

import { WebClient, Block, KnownBlock } from "@slack/web-api";
import { Task, AgentName } from "./types";

export const slack = new WebClient(process.env.SLACK_BOT_TOKEN!);

const CHANNEL = process.env.SLACK_CHANNEL_ID!;

const AGENT_EMOJI: Record<AgentName, string> = {
  SCOUT:    "🔍",
  PROPOSER: "📝",
  DESIGNER: "🎨",
  BUILDER:  "⚙️",
  MARKETER: "📣",
  PRODUCER: "🧠",
};

// ─────────────────────────────────────────────
// Send approval card to #approvals
// ─────────────────────────────────────────────
export async function sendApprovalCard(
  task: Task,
  result: Record<string, any>,
  approvalId: string
): Promise<string | undefined> {
  const project = task.project!;
  const emoji   = AGENT_EMOJI[task.agent] ?? "🤖";

  // Build a readable preview — prefer summary over raw JSON
  const previewObj = result?.summary
    ? { summary: result.summary }
    : result?.data ?? result;
  const preview = JSON.stringify(previewObj, null, 2).slice(0, 700);

  const blocks: (Block | KnownBlock)[] = [
    {
      type: "header",
      text: { type: "plain_text", text: `${emoji} ${task.agent} — Approval Needed` }
    },
    {
      type: "section",
      fields: [
        { type: "mrkdwn", text: `*Project:*\n${project.project_name}` },
        { type: "mrkdwn", text: `*Client:*\n${project.client_name}` },
        { type: "mrkdwn", text: `*Stage:*\n${project.current_stage}` },
        { type: "mrkdwn", text: `*Package:*\n${project.package ?? "—"} ${project.price ? `($${project.price})` : ""}` },
      ]
    },
    {
      type: "section",
      text: {
        type: "mrkdwn",
        text: `*Task:* \`${task.task_type}\`\n\n*Output Preview:*\n\`\`\`${preview}\`\`\``
      }
    },
    {
      type: "actions",
      block_id: `approval::${approvalId}`,
      elements: [
        {
          type: "button",
          text:      { type: "plain_text", text: "✅  Approve" },
          style:     "primary",
          action_id: "producer_approve",
          value:     approvalId,
          confirm: {
            title:   { type: "plain_text", text: "Approve this output?" },
            text:    { type: "mrkdwn",     text: "This will advance the project to the next stage." },
            confirm: { type: "plain_text", text: "Yes, approve" },
            deny:    { type: "plain_text", text: "Cancel" }
          }
        },
        {
          type:      "button",
          text:      { type: "plain_text", text: "❌  Reject" },
          style:     "danger",
          action_id: "producer_reject",
          value:     approvalId
        }
      ]
    },
    { type: "divider" },
    {
      type: "context",
      elements: [
        {
          type: "mrkdwn",
          text: `Approval \`${approvalId}\` • Task \`${task.id}\` • Retries: ${task.retries}`
        }
      ]
    }
  ];

  const msg = await slack.chat.postMessage({
    channel: CHANNEL,
    text:    `${emoji} ${task.agent} output ready for review — ${project.project_name}`,
    blocks,
  });

  return msg.ts ?? undefined;
}

// ─────────────────────────────────────────────
// Update an existing Slack message (post-decision)
// ─────────────────────────────────────────────
export async function updateApprovalCard(
  ts: string,
  channel: string,
  decision: "approved" | "rejected",
  taskType: string
): Promise<void> {
  const icon = decision === "approved" ? "✅" : "❌";
  const verb = decision === "approved"
    ? "Approved — next stage queued"
    : "Rejected — awaiting manual re-trigger";

  await slack.chat.update({
    channel,
    ts,
    text:   `${icon} ${verb} — \`${taskType}\``,
    blocks: [
      {
        type: "section",
        text: { type: "mrkdwn", text: `${icon} *${verb}*\nTask: \`${taskType}\`` }
      }
    ]
  });
}

// ─────────────────────────────────────────────
// Alert — task failure, project complete, etc.
// ─────────────────────────────────────────────
export async function sendAlert(text: string): Promise<void> {
  await slack.chat.postMessage({ channel: CHANNEL, text });
}

export async function sendProjectComplete(
  projectName: string,
  clientName: string
): Promise<void> {
  await slack.chat.postMessage({
    channel: CHANNEL,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: "🎉 Project Complete!" }
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Project:*\n${projectName}` },
          { type: "mrkdwn", text: `*Client:*\n${clientName}` },
        ]
      },
      {
        type: "section",
        text: { type: "mrkdwn", text: "All stages approved and complete. Time to invoice! 💰" }
      }
    ]
  });
}

export { CHANNEL as SLACK_CHANNEL };
