// agents/builder/slack.ts
// ═════════════════════════════════════════════
//  BUILDER Slack Cards
//  sendBuilderCard  — rich approval card with file list, palette, Approve/Reject
//  postApprovedCode — zips all generated files and uploads as a single Slack file
// ═════════════════════════════════════════════

import { WebClient } from "@slack/web-api";
import JSZip         from "jszip";
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
          text: `*How to review:*\n✅ *Approve* → site zip posted to Slack, project advances to LAUNCH\n❌ *Reject* → mark for revision`
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
              text:    { type: "mrkdwn",     text: "A zip of all generated files will be posted to Slack and the project advances to LAUNCH." },
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
// Post-approval: zip all files and upload as one Slack file
// ─────────────────────────────────────────────
export async function postApprovedCode(
  asset:   Asset,
  project: any
): Promise<void> {
  const raw = asset.content ?? "{}";
  let files: Record<string, string>;
  try {
    files = JSON.parse(raw);
  } catch {
    files = {};
  }

  const fileKeys = Object.keys(files);

  // ── Build zip in memory ──────────────────────
  const zip = new JSZip();
  const slug = (project.client_name as string)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  const folder = zip.folder(slug)!;
  for (const [filename, code] of Object.entries(files)) {
    folder.file(filename, code);
  }

  const zipBuffer = await zip.generateAsync({
    type:               "nodebuffer",
    compression:        "DEFLATE",
    compressionOptions: { level: 6 },
  });

  const zipFilename = `${slug}-site.zip`;

  // ── Upload to Slack ──────────────────────────
  await (slack as any).filesUploadV2({
    channel_id:      CHANNEL,
    filename:        zipFilename,
    file:            zipBuffer,
    initial_comment: `✅ *${project.client_name}* — site code ready!\n📦 \`${zipFilename}\` · ${fileKeys.length} files · React + TypeScript + Tailwind\n\nTo run:\n\`\`\`\nnpm install\nnpm run dev\n\`\`\``,
  });

  await log(
    "BUILDER", "zip_posted_to_slack",
    { client: project.client_name, files: fileKeys.length, zip: zipFilename },
    "success", project.id
  );
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
void sleep; // suppress unused warning
