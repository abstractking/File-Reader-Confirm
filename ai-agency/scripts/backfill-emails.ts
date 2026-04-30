// scripts/backfill-emails.ts
// One-shot script: re-scrape emails for leads that are missing one.
// Run with: pnpm exec tsx scripts/backfill-emails.ts
// ──────────────────────────────────────────────────────────────────
import { query } from "../core/db";

const CONCURRENCY = 10;
const FETCH_TIMEOUT_MS = 8_000;
const CONTACT_TIMEOUT_MS = 5_000;

// ── helpers (mirrors upgraded extractEmail in scraper.ts) ──────────

function isValidBusinessEmail(email: string): boolean {
  const invalid = ["noreply", "no-reply", "example", "sentry", "wixpress", "squarespace"];
  if (invalid.some(s => email.includes(s))) return false;
  if (/\.(png|jpg|svg|gif|webp)$/.test(email)) return false;
  return true;
}

function extractEmail(html: string): string | null {
  const mailtoMatches = [...html.matchAll(/href=["']mailto:([^"'?\s]+)/gi)];
  for (const m of mailtoMatches) {
    const email = m[1].toLowerCase().trim();
    if (isValidBusinessEmail(email)) return email;
  }
  const allMatches = [...html.matchAll(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/g)];
  for (const m of allMatches) {
    const email = m[0].toLowerCase();
    if (isValidBusinessEmail(email)) return email;
  }
  return null;
}

async function fetchHtml(url: string, timeoutMs: number): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LeadBot/1.0)" },
      signal: AbortSignal.timeout(timeoutMs),
    });
    if (!res.ok) return null;
    return await res.text();
  } catch {
    return null;
  }
}

async function findEmail(websiteUrl: string): Promise<string | null> {
  const html = await fetchHtml(websiteUrl, FETCH_TIMEOUT_MS);
  if (html) {
    const email = extractEmail(html);
    if (email) return email;
  }
  // fallback: try /contact
  try {
    const contactUrl = new URL("/contact", websiteUrl).href;
    const contactHtml = await fetchHtml(contactUrl, CONTACT_TIMEOUT_MS);
    if (contactHtml) return extractEmail(contactHtml);
  } catch {
    // invalid base URL — skip
  }
  return null;
}

// ── main ───────────────────────────────────────────────────────────

async function main() {
  const leads = await query<{ id: string; website_url: string; business_name: string }>(
    `SELECT id, website_url, business_name
     FROM leads
     WHERE email IS NULL AND website_url IS NOT NULL
     ORDER BY created_at DESC`
  );

  console.log(`Found ${leads.length} leads missing emails — scraping in batches of ${CONCURRENCY}…\n`);

  let found = 0;
  let failed = 0;

  for (let i = 0; i < leads.length; i += CONCURRENCY) {
    const batch = leads.slice(i, i + CONCURRENCY);

    await Promise.all(batch.map(async (lead) => {
      const email = await findEmail(lead.website_url);
      if (email) {
        await query(
          `UPDATE leads SET email = $1 WHERE id = $2`,
          [email, lead.id]
        );
        console.log(`  ✓  ${lead.business_name.padEnd(40)} → ${email}`);
        found++;
      } else {
        failed++;
      }
    }));

    const done = Math.min(i + CONCURRENCY, leads.length);
    console.log(`  [${done}/${leads.length}] processed…`);
  }

  console.log(`\nDone. Found emails for ${found}/${leads.length} leads (${failed} still missing).`);
  process.exit(0);
}

main().catch(err => {
  console.error("Fatal:", err);
  process.exit(1);
});
