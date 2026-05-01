# AI Agency — PRODUCER Setup Guide

## Stack
- **Runtime**: CodeSandbox Devbox (Node.js 24)
- **Database**: Neon PostgreSQL (free tier, always-on)
- **AI**: Claude API (claude-sonnet-4-5)
- **Notifications**: Slack

---

## Step 1 — Clone into CodeSandbox

1. Go to codesandbox.io → Create Devbox → Import from GitHub
2. Import: `abstractking/File-Reader-Confirm`
3. CodeSandbox will boot the devcontainer automatically

---

## Step 2 — Set Up Neon Database

1. Go to neon.tech → Sign up free → Create project
2. Copy the connection string (looks like `postgresql://user:pass@ep-xxx.neon.tech/dbname?sslmode=require`)
3. You will add this as `DATABASE_URL` in the next step

---

## Step 3 — Set Environment Variables

In CodeSandbox → Settings → Environment Variables, add:

| Variable | Value |
|---|---|
| `DATABASE_URL` | Your Neon connection string |
| `ANTHROPIC_API_KEY` | From console.anthropic.com |
| `SLACK_BOT_TOKEN` | From api.slack.com → OAuth & Permissions |
| `SLACK_SIGNING_SECRET` | From api.slack.com → Basic Information |
| `SLACK_CHANNEL_ID` | Right-click #approvals in Slack → View channel details |
| `PORT` | `8080` |
| `NODE_ENV` | `development` |

---

## Step 4 — Slack App Setup

1. Go to https://api.slack.com/apps → Create New App → From Scratch
2. Name: `Producer Bot` → select your workspace
3. OAuth & Permissions → Bot Token Scopes → add:
   - `chat:write`
   - `chat:write.public`
   - `channels:read`
4. Interactivity & Shortcuts → toggle ON
   - Request URL: `https://8080-YOUR-DEVBOX-ID.csb.app/webhooks/slack`
   (Copy this URL from CodeSandbox when your server is running)
5. Install to Workspace → copy Bot User OAuth Token
6. Create `#approvals` channel in Slack → invite your bot

---

## Step 5 — Install & Initialize

In the CodeSandbox terminal:

```bash
# Install all dependencies
pnpm install

# Push schema to Neon (creates all 6 tables)
pnpm --filter @workspace/db run push

# Seed test data
pnpm --filter ai-agency run db:seed
```

---

## Step 6 — Run PRODUCER

```bash
pnpm --filter ai-agency run dev
```

You should see:
```
╔═══════════════════════════════════════════╗
║         🧠  PRODUCER  ONLINE              ║
╠═══════════════════════════════════════════╣
║  Port:       8080                         ║
║  DB:         Neon PostgreSQL ✅           ║
║  AI:         Claude API ✅                ║
╚═══════════════════════════════════════════╝
```

---

## Step 7 — Update Slack Webhook URL

1. Copy your CodeSandbox public URL for port 8080
   (shown in the Ports tab of your Devbox)
2. Go to your Slack App → Interactivity & Shortcuts
3. Paste: `https://8080-YOUR-DEVBOX-ID.csb.app/webhooks/slack`
4. Save Changes

---

## Step 8 — Test It

```bash
curl -X POST http://localhost:8080/scout/submit \
  -H "Content-Type: application/json" \
  -d '{"business_name":"Test Biz","website_url":"https://example.com","niche":"plumber","location":"Lake Charles LA"}'
```
