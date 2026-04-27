// agents/scout/facebook.ts
// ═════════════════════════════════════════════
//  Facebook Business Page Search
//
//  Uses Google Custom Search (CSE) with a
//  site:facebook.com filter to find Facebook-
//  only businesses (no dedicated website).
//
//  Required secrets:
//    GOOGLE_PLACES_API_KEY — reused as CSE key
//    GOOGLE_CSE_CX         — Custom Search Engine ID
//                            (create at programmablesearchengine.google.com)
// ═════════════════════════════════════════════

import { RawLead } from "./scraper";
import { log }     from "../../core/logger";

const CSE_BASE = "https://www.googleapis.com/customsearch/v1";

// Excluded Facebook URL patterns that aren't business pages
const FB_NOISE = [
  "/watch", "/groups/", "/events/", "/login",
  "/marketplace", "/ads/", "/help/", "/policies/",
  "/gaming/", "/video/", "m.facebook.com",
];

// ─────────────────────────────────────────────
// searchFacebookPages
// Searches Google CSE for Facebook business pages
// matching [keyword] in [location].
// Returns up to [limit] RawLeads (max 10 per CSE call).
// ─────────────────────────────────────────────
export async function searchFacebookPages(
  location: string,
  keyword:  string,
  limit:    number = 10,
): Promise<RawLead[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  const cx     = process.env.GOOGLE_CSE_CX;

  if (!apiKey) {
    await log("SCOUT", "fb_search_skipped", { reason: "GOOGLE_PLACES_API_KEY not set" }, "warning", null);
    return [];
  }

  if (!cx) {
    await log("SCOUT", "fb_search_skipped", { reason: "GOOGLE_CSE_CX not configured" }, "warning", null);
    return [];
  }

  // Parse "Orlando, Florida" → city: "Orlando"  state: "Florida"
  const parts = location.split(",").map(s => s.trim());
  const city  = parts[0] ?? location;
  const state = parts[1] ?? "";

  // Build query — search facebook.com for business pages in the city
  // Exclude noise like login pages, watch, groups, events
  const query = `"${keyword}" "${city}"${state ? ` "${state}"` : ""} -login -watch -groups -events -marketplace`;

  try {
    const url = new URL(CSE_BASE);
    url.searchParams.set("key",              apiKey);
    url.searchParams.set("cx",               cx);
    url.searchParams.set("q",                query);
    url.searchParams.set("num",              String(Math.min(limit, 10)));
    url.searchParams.set("siteSearch",       "facebook.com");
    url.searchParams.set("siteSearchFilter", "i");

    const res = await fetch(url.toString());

    if (!res.ok) {
      const body = await res.text().catch(() => "");
      await log("SCOUT", "fb_search_api_error", {
        status:   res.status,
        keyword,
        location,
        body:     body.slice(0, 300),
      }, "error", null);
      return [];
    }

    const data  = await res.json();
    const items = (data.items ?? []) as any[];

    await log("SCOUT", "fb_search_results", {
      keyword,
      location,
      raw:      items.length,
    }, "success", null);

    const leads: RawLead[] = [];

    for (const item of items) {
      const fbUrl = item.link as string;
      if (!isBusinessPage(fbUrl)) continue;

      const businessName = parseTitleToName(item.title ?? "");
      if (!businessName || businessName.length < 3) continue;

      const snippet = (item.snippet ?? "") as string;
      const phone   = extractPhone(snippet);

      leads.push({
        business_name: businessName,
        contact_name:  null,
        phone,
        email:         null,
        website_url:   fbUrl,          // Facebook page IS their website
        address:       null,
        location,
        niche:         keyword,
        rating:        null,
        review_count:  null,
        place_id:      `fb_${Buffer.from(fbUrl).toString("base64").slice(0, 20)}`,
        google_url:    "",
        notes:         `📘 Facebook page only — no dedicated website.\n"${snippet.slice(0, 200)}"`,
      });
    }

    return leads;

  } catch (err: any) {
    await log("SCOUT", "fb_search_error", { error: err.message, keyword, location }, "error", null);
    return [];
  }
}

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────

function isBusinessPage(url: string): boolean {
  return !FB_NOISE.some(noise => url.toLowerCase().includes(noise));
}

/**
 * Extract the business name from a CSE result title.
 * Formats seen:
 *   "Joe's Plumbing | Orlando, FL | Facebook"
 *   "Joe's Plumbing - Facebook"
 *   "Joe's Plumbing - Home | Facebook"
 */
function parseTitleToName(title: string): string {
  return title
    .replace(/\s*[|\-]\s*Facebook\s*$/i, "")
    .replace(/\s*[|\-]\s*Home\s*$/i, "")
    .replace(/\s*\|.*$/,              "")
    .replace(/\s*-\s*Home\s*$/i,     "")
    .trim();
}

function extractPhone(text: string): string | null {
  const match = text.match(/\(?\d{3}\)?[\s.\-]\d{3}[\s.\-]\d{4}/);
  return match ? match[0].trim() : null;
}
