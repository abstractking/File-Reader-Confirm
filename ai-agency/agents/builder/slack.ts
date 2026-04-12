// agents/builder/slack.ts
// ═════════════════════════════════════════════
//  BUILDER Slack Cards
//  sendBuilderCard  — rich approval card with file list, palette, Approve/Reject
//  postApprovedCode — dumps every generated file as copyable Slack messages
// ═════════════════════════════════════════════

import { WebClient } from "@slack/web-api";
import { Asset }     from "../../core/types";
import { log }       from "../../core/logger";

const slack   = new WebClient(process.env.SLACK_BOT_TOKEN!);
const CHANNEL = process.env.SLACK_CHANNEL_ID!;

// ─────────────────────────────────────────────
// Approval card — sent by PRODUCER via processTask
// ─────────────────────────────────────────────
export async function sendBuilderCard(
  asset:      Asset,
  project:    any,
  approvalId: string,
  taskId:     string
): Promise<string | undefined> {
  const meta     = asset.metadata as any;
  const files    = (meta?.files ?? []) as string[];
  const fileList = files
    .slice(0, 12)
    .map((f: string) => `• \`${f}\``)
    .join("\n");
  const extra = files.length > 12 ? `\n• …and ${files.length - 12} more` : "";

  const msg = await slack.chat.postMessage({
    channel: CHANNEL,
    text:    `⚙️ Site code ready for review — ${project.client_name}`,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: "⚙️  BUILDER — Site Code Ready for Review" }
      },
      {
        type: "section",
        fields: [
          { type: "mrkdwn", text: `*Client:*\n${project.client_name}`                    },
          { type: "mrkdwn", text: `*Package:*\n${project.package ?? "—"}`                 },
          { type: "mrkdwn", text: `*Structure:*\n\`${meta?.structure ?? "—"}\``           },
          { type: "mrkdwn", text: `*Pages:*\n${(meta?.pages ?? []).join(", ")}`           },
          { type: "mrkdwn", text: `*Files:*\n${meta?.file_count ?? files.length} files`  },
          { type: "mrkdwn", text: `*Stack:*\n${meta?.tech_stack ?? "React/TS/Tailwind"}` },
        ]
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Generated Files:*\n${fileList}${extra}`
        }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*Color Palette:*\nPrimary: \`${meta?.palette?.primary ?? "—"}\`  Accent: \`${meta?.palette?.accent ?? "—"}\`  BG: \`${meta?.palette?.secondary ?? "—"}\``
        }
      },
      { type: "divider" },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*How to review:*\n✅ *Approve* → all files posted to Slack for copying, project advances to LAUNCH\n❌ *Reject* → mark for revision`
        }
      },
      {
        type: "actions",
        block_id: `builder::${approvalId}`,
        elements: [
          {
            type:      "button",
            text:      { type: "plain_text", text: "✅  Approve Code" },
            style:     "primary",
            action_id: "producer_approve",
            value:     approvalId,
            confirm: {
              title:   { type: "plain_text", text: "Approve this site code?" },
              text:    { type: "mrkdwn",     text: "All generated files will be posted to Slack and the project advances to LAUNCH." },
              confirm: { type: "plain_text", text: "Yes, approve" },
              deny:    { type: "plain_text", text: "Cancel" },
            }
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
      {
        type: "context",
        elements: [
          { type: "mrkdwn", text: `Approval \`${approvalId}\` • Task \`${taskId}\` • BUILDER agent` }
        ]
      }
    ]
  });

  return msg.ts ?? undefined;
}

// ─────────────────────────────────────────────
// Post-approval: dump every file to Slack
// ─────────────────────────────────────────────
export async function postApprovedCode(
  asset:   Asset,
  project: any
): Promise<void> {
  const raw   = asset.content ?? "{}";
  let files: Record<string, string>;
  try {
    files = JSON.parse(raw);
  } catch {
    files = {};
  }

  const fileKeys = Object.keys(files);

  await slack.chat.postMessage({
    channel: CHANNEL,
    text:    `✅ Site code approved — ${project.client_name}`,
    blocks: [
      {
        type: "header",
        text: { type: "plain_text", text: `✅ Code Approved — ${project.client_name}` }
      },
      {
        type: "section",
        text: {
          type: "mrkdwn",
          text: `*${fileKeys.length} files generated.*\nEach file is posted below as a separate message for easy copying.\n\nTo run locally:\n\`\`\`npm install\nnpm run dev\`\`\``
        }
      }
    ]
  });

  await sleep(400);

  for (const [filename, code] of Object.entries(files)) {
    const chunks = chunkText(code, 3800);

    await slack.chat.postMessage({
      channel: CHANNEL,
      text:    `📄 \`${filename}\`\n\`\`\`\n${chunks[0]}\n\`\`\``,
    });

    for (let i = 1; i < chunks.length; i++) {
      await sleep(300);
      await slack.chat.postMessage({
        channel: CHANNEL,
        text:    `📄 \`${filename}\` (continued)\n\`\`\`\n${chunks[i]}\n\`\`\``,
      });
    }

    await sleep(350);
  }

  await slack.chat.postMessage({
    channel: CHANNEL,
    text:    `_— End of site code for *${project.client_name}*. Deploy the \`dist/\` folder when ready._`,
  });

  await log("BUILDER", "code_posted_to_slack", { client: project.client_name, files: fileKeys.length }, "success", project.id);
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

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
