# AI Agency — PRODUCER Setup Guide

## Stack
- **Runtime**: Replit (Node.js)
- **Database**: Replit PostgreSQL (built-in, free with Core)
- **AI**: Claude API (claude-sonnet-4-5)
- **Notifications**: Slack

---

## Step 1 — Replit Project Setup

1. Create a new Replit → choose **Node.js** template
2. Upload all files from this folder maintaining the directory structure
3. Open the **Shell** tab

---

## Step 2 — Enable Replit PostgreSQL

1. In your Repl, click **Tools** in the sidebar
2. Click **Database**
3. Click **Create a database**
4. Replit automatically injects `DATABASE_URL` into your environment ✅

---

## Step 3 — Add Secrets

In Replit sidebar → **Secrets**, add each key from `.env.example`:

| Secret Key | Where to get it |
|---|---|
| `DATABASE_URL` | Replit → Tools → Database → Connection string |
| `ANTHROPIC_API_KEY` | console.anthropic.com |
| `SLACK_BOT_TOKEN` | api.slack.com → Your App → OAuth & Permissions |
| `SLACK_SIGNING_SECRET` | api.slack.com → Your App → Basic Information |
| `SLACK_CHANNEL_ID` | Right-click #approvals in Slack → View details |

---

## Step 4 — Slack App Setup

1. Go to https://api.slack.com/apps → **Create New App** → **From Scratch**
2. Name: `Producer Bot` → select your workspace
3. **OAuth & Permissions** → Bot Token Scopes → add:
   - `chat:write`
   - `chat:write.public`
   - `channels:read`
4. **Interactivity & Shortcuts** → toggle ON
   - Request URL: `https://YOUR-REPLIT-URL.replit.app/webhooks/slack`
5. **Install to Workspace** → copy Bot User OAuth Token
6. Create `#approvals` channel in Slack → invite your bot

---

## Step 5 — Install & Initialize

```bash
# Install dependencies
npm install

# Create all database tables
npm run db:init

# Seed test data (creates a sample project + queues first task)
npm run db:seed
```

---

## Step 6 — Run PRODUCER

```bash
# Development (with hot reload)
npm run dev

# You should see:
# ╔═══════════════════════════════════════════╗
# ║         🧠  PRODUCER  ONLINE              ║
# ╚═══════════════════════════════════════════╝
```

---

## Step 7 — Update Slack Webhook URL

1. Copy your Replit URL from the browser (e.g. `https://ai-agency.yourname.replit.app`)
2. Go to your Slack App → **Interactivity & Shortcuts**
3. Paste: `https://ai-agency.yourname.replit.app/webhooks/slack`
4. Click **Save Changes**

---

## Step 8 — Test It

1. Server starts → you get a "🟢 PRODUCER is online" message in #approvals
2. Within 2 minutes, PRODUCER picks up the seeded task
3. Sends approval card to #approvals in Slack
4. Click **✅ Approve** → project advances to DESIGN stage
5. New task queued for DESIGNER agent

---

## API Endpoints

| Method | Path | Description |
|---|---|---|
| `GET` | `/health` | Server + DB health check |
| `GET` | `/status` | Pending tasks + recent logs |
| `POST` | `/webhooks/slack` | Slack button handler (auto) |
| `POST` | `/retrigger` | Re-queue a rejected/failed task |

### Re-trigger a rejected task:
```bash
curl -X POST https://YOUR-URL.replit.app/retrigger \
  -H "Content-Type: application/json" \
  -d '{"task_id": "your-task-uuid-here"}'
```

---

## Deploy as Always-On

1. In Replit → click **Deploy**
2. Choose **Reserved VM** (always-on)
3. Set run command: `npm start`
4. Your PRODUCER stays live 24/7 ✅

---

## Adding New Agents

Each agent just needs to export a `run(task)` function:

```typescript
// agents/YOUR_AGENT/index.ts
import { Task, AgentRunResult } from "../../core/types";

export async function run(task: Task): Promise<AgentRunResult> {
  // your logic here
  return {
    summary: "What the agent did",
    data:    { /* output */ }
  };
}
```

PRODUCER will automatically pick it up — no changes needed to PRODUCER.
