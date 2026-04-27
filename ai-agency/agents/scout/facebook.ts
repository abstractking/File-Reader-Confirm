// agents/scout/facebook.ts
// ═════════════════════════════════════════════
//  Facebook Business Page Search
//
//  Uses DuckDuckGo HTML search (no API key needed)
//  with site:facebook.com filtering to find
//  local businesses with only a Facebook presence.
//
//  No secrets required — works out of the box.
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
// Uses DuckDuckGo to find Facebook business pages
// for [keyword] in [location]. No API key needed.
// ─────────────────────────────────────────────
export async function searchFacebookPages(
  location: string,
  keyword:  string,
  limit:    number = 10,
): Promise<RawLead[]> {
  // Parse "Orlando, Florida" → city + state
  const parts = location.split(",").map(s => s.trim());
  const city  = parts[0] ?? location;
  const state = parts[1] ?? "";

  // Build DuckDuckGo query with site:facebook.com filter
  const q = `site:facebook.com "${keyword}" "${city}"${state ? ` "${state}"` : ""} -login -groups -events -marketplace`;

  try {
    const url = new URL("https://html.duckduckgo.com/html/");
    url.searchParams.set("q", q);

    const res = await fetch(url.toString(), {
      method:  "GET",
      headers: {
        "User-Agent": "Mozilla/5.0 (compatible; LeadBot/1.0; +https://leadbot.io)",
        "Accept":     "text/html,application/xhtml+xml",
      },
      signal: AbortSignal.timeout(15_000),
    });

    if (!res.ok) {
      await log("SCOUT", "fb_search_error", {
        keyword, location, status: res.status,
      }, "error", null);
      return [];
    }

    const html = await res.text();
    const leads = parseDDGResults(html, location, keyword, limit);

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
// Parse DDG HTML response for Facebook URLs
// ─────────────────────────────────────────────
function parseDDGResults(
  html:     string,
  location: string,
  keyword:  string,
  limit:    number,
): RawLead[] {
  const leads: RawLead[] = [];
  const seen  = new Set<string>();

  // DDG result links appear in <a class="result__url"> or href attributes
  // pointing to facebook.com pages
  const linkPattern  = /href="(https?:\/\/(?:www\.)?facebook\.com\/[^"?\s]+)"/gi;
  const titlePattern = /<a[^>]+class="result__a"[^>]*>([^<]+)<\/a>/gi;
  const snippetPat   = /<a[^>]+class="result__snippet"[^>]*>([^<]+)<\/a>/gi;

  const urls:     string[] = [];
  const titles:   string[] = [];
  const snippets: string[] = [];

  let m: RegExpExecArray | null;

  while ((m = linkPattern.exec(html)) !== null)  urls.push(m[1]);
  while ((m = titlePattern.exec(html)) !== null)  titles.push(m[1]);
  while ((m = snippetPat.exec(html)) !== null)    snippets.push(m[1]);

  for (let i = 0; i < urls.length && leads.length < limit; i++) {
    const fbUrl = decodeURIComponent(urls[i]).split("?")[0];

    if (!isFacebookBusinessPage(fbUrl)) continue;
    if (seen.has(fbUrl)) continue;
    seen.add(fbUrl);

    const rawTitle  = (titles[i]   ?? "").replace(/&#x27;/g, "'").replace(/&amp;/g, "&").trim();
    const snippet   = (snippets[i] ?? "").replace(/&#x27;/g, "'").replace(/&amp;/g, "&").trim();
    const name      = parseTitleToName(rawTitle);

    if (!name || name.length < 3) continue;

    const phone = extractPhone(snippet);

    leads.push({
      business_name: name,
      contact_name:  null,
      phone,
      email:         null,
      website_url:   fbUrl,   // Facebook IS their website
      address:       null,
      location,
      niche:         keyword,
      rating:        null,
      review_count:  null,
      place_id:      `fb_${Buffer.from(fbUrl).toString("base64").slice(0, 20)}`,
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

/**
 * "Joe's Plumbing | Orlando, FL | Facebook" → "Joe's Plumbing"
 * "Joe's Plumbing - Facebook"               → "Joe's Plumbing"
 */
function parseTitleToName(title: string): string {
  return title
    .replace(/\s*[|\-]\s*Facebook\s*$/i, "")
    .replace(/\s*[|\-]\s*Home\s*$/i,     "")
    .replace(/\s*\|.*$/,                  "")
    .replace(/\s*-\s*Home\s*$/i,          "")
    .trim();
}

function extractPhone(text: string): string | null {
  const match = text.match(/\(?\d{3}\)?[\s.\-]\d{3}[\s.\-]\d{4}/);
  return match ? match[0].trim() : null;
}
