# AI Agency CRM - Implementation Manual

Build order. No timelines.

## Stack

**Backend:** Node 24, Express 5, TypeScript, PostgreSQL 16, Redis, BullMQ
**Frontend:** Next.js 15, React 19, Tailwind 4, shadcn/ui  
**Browser:** Puppeteer + Docker  
**AI:** Claude API  
**Storage:** MinIO/S3

## Build Parts

### 1. Foundation
- Monorepo: apps/api, apps/web, packages/db, packages/ui
- PostgreSQL + Redis (Docker Compose)
- Express: health, CORS, JWT auth
- Next.js scaffold + Drizzle ORM
- 6 DB tables: leads, projects, tasks, approvals, assets, audit_logs
- Query functions (typed, validated)
- Port agents from Replit
- BullMQ: 5 workers, cron polling
- Dashboard UI, Leads, Kanban, Project detail

### 2. Browser System  
- Puppeteer Docker container
- Session API (create/destroy/list)
- Redis session store (4hr TTL)
- Preview UI: iframe, viewport selector, toolbar
- rrweb recording: start/stop, S3 chunks, playback
- DevTools: remote debug, console stream, perf metrics

### 3. Advanced
- Asset management: library, viewers, versions
- Socket.io: real-time task updates, presence
- Analytics: funnel, revenue, agent performance
- Polish: error boundaries, Suspense, a11y, E2E tests

### 4. Multi-User
- Roles: Owner, Admin, Agent, Client
- Permissions middleware
- Client portal (public URLs)
- Email automation (proposals, follow-ups)
- Slack integration (cards, slash commands)

## Database Schema

```sql
leads: id, business_name, email, phone, website_url, niche, location, score, status
projects: id, lead_id, client_name, package, price, current_stage, metadata
tasks: id, project_id, agent, task_type, status, input_data, output_data
assets: id, project_id, asset_type, content, file_url, version
browser_sessions: id, project_id, session_token, status, viewport, expires_at
audit_logs: id, project_id, agent, action, details, status
```

## API Endpoints

```
/api/auth/login, /api/leads, /api/projects, /api/tasks
/api/browser/sessions, /api/browser/sessions/:id/screenshot
/api/assets/:id/download
```

## Agents

**SCOUT:** URL scraper → lead scoring → Slack card  
**PROPOSER:** Site analysis → Claude proposal → approval  
**DESIGNER:** Genre selection → wireframe + style guide  
**BUILDER:** Design → React code → ZIP  
**MARKETER:** SEO content → sitemap

## Deployment

1. Build Docker images
2. Provision PostgreSQL, Redis, S3
3. Deploy: 3 API, 3 Web, 5 Workers, 10 Browsers
4. nginx load balancer
5. ENV vars, migrations, SSL

## Performance Targets

- API: <200ms p95
- Page load: <2s
- Browser start: <3s cold
- Socket latency: <100ms

## Security

- bcrypt passwords (10 rounds)
- JWT: 15min access, 7 day refresh
- Rate limit: 1000 req/min
- Browser isolation
- TLS 1.3, PostgreSQL TDE

