// agents/scout/facebook.ts
// ═════════════════════════════════════════════
//  Facebook Business Page Discovery
//
//  Uses Brave Web Search API (free tier: 2,000 searches/month)
//  Sign up at: https://api.search.brave.com/
//  Add key as secret: BRAVE_SEARCH_API_KEY
//
//  Falls back gracefully if key not configured.
// ═════════════════════════════════════════════

import { RawLead } from "./scraper";
import { log }     from "../../core/logger";

// Facebook URL patterns that aren't business pages
const FB_NOISE = [
  "/watch", "/groups/", "/events/", "/login",
  "/marketplace", "/ads/", "/help/", "/policies/",
  "/gaming/", "/video/", "/stories/", "/reel/",
  "m.facebook.com", "/sharer", "/share",
];

// ─────────────────────────────────────────────
// searchFacebookPages
// ─────────────────────────────────────────────
export async function searchFacebookPages(
  location: string,
  keyword:  string,
  limit:    number = 10,
): Promise<RawLead[]> {
  const apiKey = process.env.BRAVE_SEARCH_API_KEY;

  if (!apiKey) {
    await log("SCOUT", "fb_search_skipped", {
      reason: "BRAVE_SEARCH_API_KEY not configured",
      action: "Sign up free at https://api.search.brave.com/ — 2,000 searches/month, no credit card",
    }, "warn", null);
    return [];
  }

  // Parse "Orlando, Florida" → city + state
  const parts = location.split(",").map(s => s.trim());
  const city  = parts[0] ?? location;
  const state = parts[1] ?? "";

  // site:facebook.com restricts results to Facebook business pages
  const query = [
    `site:facebook.com`,
    `"${keyword}"`,
    `"${city}"`,
    state ? `"${state}"` : "",
    `-login -groups -events -marketplace -watch`,
  ].filter(Boolean).join(" ");

  try {
    const url = new URL("https://api.search.brave.com/res/v1/web/search");
    url.searchParams.set("q",     query);
    url.searchParams.set("count", String(Math.min(limit, 20)));

    const res = await fetch(url.toString(), {
      headers: {
        "Accept":               "application/json",
        "Accept-Encoding":      "gzip",
        "X-Subscription-Token": apiKey,
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      await log("SCOUT", "fb_search_error", {
        status: res.status, keyword, location, body: body.slice(0, 200),
      }, "error", null);
      return [];
    }

    const json    = await res.json() as BraveSearchResponse;
    const results = json.web?.results ?? [];
    const leads   = parseBraveResults(results, location, keyword, limit);

    await log("SCOUT", "fb_search_results", {
      keyword, location, found: leads.length,
    }, "success", null);

    return leads;

  } catch (err: any) {
    await log("SCOUT", "fb_search_error", {
      error: err.message, keyword, location,
    }, "error", null);
    return [];
  }
}

// ─────────────────────────────────────────────
// Parse Brave Search results into RawLeads
// ─────────────────────────────────────────────
function parseBraveResults(
  results:  BraveWebResult[],
  location: string,
  keyword:  string,
  limit:    number,
): RawLead[] {
  const leads: RawLead[] = [];
  const seen  = new Set<string>();

  for (const result of results) {
    if (leads.length >= limit) break;

    const url = result.url ?? "";
    if (!url.includes("facebook.com"))            continue;
    if (!isFacebookBusinessPage(url))             continue;

    const cleanUrl = url.split("?")[0];
    if (seen.has(cleanUrl)) continue;
    seen.add(cleanUrl);

    const name = parseTitleToName(result.title ?? "");
    if (!name || name.length < 3) continue;

    const snippet = result.description ?? "";
    const phone   = extractPhone(snippet);

    leads.push({
      business_name: name,
      contact_name:  null,
      phone,
      email:         null,
      website_url:   cleanUrl,
      address:       null,
      location,
      niche:         keyword,
      rating:        null,
      review_count:  null,
      place_id:      `fb_${Buffer.from(cleanUrl).toString("base64").slice(0, 20)}`,
      google_url:    "",
      notes:         `📘 Facebook page only — no dedicated website.\n${snippet.slice(0, 200)}`,
    });
  }

  return leads;
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function isFacebookBusinessPage(url: string): boolean {
  return !FB_NOISE.some(noise => url.toLowerCase().includes(noise));
}

function parseTitleToName(title: string): string {
  return title
    .replace(/\s*[|\-]\s*Facebook\s*$/i, "")
    .replace(/\s*[|\-]\s*Home\s*$/i,     "")
    .replace(/\s*\|.*$/,                  "")
    .replace(/\s*-\s*Home\s*$/i,          "")
    .trim();
}

function extractPhone(text: string): string | null {
  const m = text.match(/\(?\d{3}\)?[\s.\-]\d{3}[\s.\-]\d{4}/);
  return m ? m[0].trim() : null;
}

// ─────────────────────────────────────────────
// Brave Search API Types
// ─────────────────────────────────────────────

interface BraveSearchResponse {
  web?: { results: BraveWebResult[] };
}

interface BraveWebResult {
  url?:         string;
  title?:       string;
  description?: string;
}
