// agents/scout/scraper.ts
// ═════════════════════════════════════════════
//  SCOUT — Website Input Mode (active)
//
//  Accepts a business website URL as manual input,
//  fetches the page, extracts what it can, and
//  returns a RawLead for Claude to score.
//
//  Google Places API code is preserved below but
//  commented out — re-enable when ready.
// ═════════════════════════════════════════════

import { log } from "../../core/logger";

export interface RawLead {
  business_name: string;
  contact_name:  string | null;
  phone:         string | null;
  email:         string | null;
  website_url:   string | null;
  address:       string | null;
  location:      string;
  niche:         string;
  rating:        number | null;
  review_count:  number | null;
  place_id:      string;
  google_url:    string;
  notes:         string;
}

// ─────────────────────────────────────────────
// PRIMARY: Scrape a business from its website URL
// Called by index.ts when input_data.website_url is set
// ─────────────────────────────────────────────
export async function scrapeFromUrl(
  websiteUrl: string,
  niche:      string,
  location:   string
): Promise<RawLead | null> {
  try {
    const res = await fetch(websiteUrl, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; LeadBot/1.0)" },
      signal: AbortSignal.timeout(10_000),
    });

    if (!res.ok) {
      await log("SCOUT", "fetch_failed", { url: websiteUrl, status: res.status }, "warning");
      return buildMinimalLead(websiteUrl, niche, location, "Could not fetch page");
    }

    const html = await res.text();
    return extractLeadFromHtml(html, websiteUrl, niche, location);

  } catch (err: any) {
    await log("SCOUT", "scrape_url_error", { url: websiteUrl, error: err.message }, "error");
    // Still return a minimal lead so the user can review and fill in details
    return buildMinimalLead(websiteUrl, niche, location, `Fetch error: ${err.message}`);
  }
}

// ─────────────────────────────────────────────
// Extract business info from raw HTML
// ─────────────────────────────────────────────
function extractLeadFromHtml(
  html:       string,
  websiteUrl: string,
  niche:      string,
  location:   string
): RawLead {
  const businessName = extractTitle(html) ?? new URL(websiteUrl).hostname.replace(/^www\./, "");
  const phone        = extractPhone(html);
  const email        = extractEmail(html);
  const address      = extractAddress(html);
  const notes        = buildNotes({ websiteUrl, phone, email });

  return {
    business_name: businessName,
    contact_name:  null,
    phone,
    email,
    website_url:   websiteUrl,
    address,
    location,
    niche,
    rating:        null,
    review_count:  null,
    place_id:      `manual_${Date.now()}`,
    google_url:    `https://www.google.com/search?q=${encodeURIComponent(businessName + " " + location)}`,
    notes,
  };
}

// ─────────────────────────────────────────────
// Fallback lead when fetch completely fails
// ─────────────────────────────────────────────
function buildMinimalLead(
  websiteUrl: string,
  niche:      string,
  location:   string,
  reason:     string
): RawLead {
  const hostname = new URL(websiteUrl).hostname.replace(/^www\./, "");
  return {
    business_name: hostname,
    contact_name:  null,
    phone:         null,
    email:         null,
    website_url:   websiteUrl,
    address:       null,
    location,
    niche,
    rating:        null,
    review_count:  null,
    place_id:      `manual_${Date.now()}`,
    google_url:    `https://www.google.com/search?q=${encodeURIComponent(hostname + " " + location)}`,
    notes:         `⚠️ ${reason} — review manually`,
  };
}

// ─────────────────────────────────────────────
// HTML extraction helpers
// ─────────────────────────────────────────────
function extractTitle(html: string): string | null {
  const og = html.match(/<meta[^>]+property=["']og:site_name["'][^>]+content=["']([^"']+)["']/i);
  if (og) return og[1].trim();
  const title = html.match(/<title[^>]*>([^<]+)<\/title>/i);
  if (title) return title[1].replace(/\s*[|\-–—].*$/, "").trim();
  return null;
}

function extractPhone(html: string): string | null {
  const strip = html.replace(/<[^>]+>/g, " ");
  const match = strip.match(/(\(?\d{3}\)?[\s.\-]\d{3}[\s.\-]\d{4})/);
  return match ? match[1].trim() : null;
}

function extractEmail(html: string): string | null {
  const match = html.match(/[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}/);
  if (!match) return null;
  const email = match[0].toLowerCase();
  // Filter out common noreply/asset emails
  if (email.includes("noreply") || email.includes("example") || email.endsWith(".png") || email.endsWith(".jpg")) return null;
  return email;
}

function extractAddress(html: string): string | null {
  const strip = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ");
  const match = strip.match(/\d+\s[\w\s]+(?:St|Ave|Blvd|Dr|Rd|Lane|Ln|Way|Court|Ct|Pkwy)[,.]?\s*[\w\s]+,\s*[A-Z]{2}\s*\d{5}/i);
  return match ? match[0].trim() : null;
}

function buildNotes(info: { websiteUrl: string; phone: string | null; email: string | null }): string {
  const parts: string[] = [];
  parts.push("📋 Manually submitted website lead");
  if (!info.phone) parts.push("📵 No phone found on page");
  if (!info.email) parts.push("📧 No email found on page");
  return parts.join(" | ");
}


// ═════════════════════════════════════════════
//  GOOGLE PLACES API — INACTIVE
//  Uncomment and re-enable when Places API (New)
//  is activated in Google Cloud Console.
// ═════════════════════════════════════════════

/*
import { GOOGLE_PLACES_BASE, MAX_RESULTS_PER_SEARCH } from "./config";

export async function scrapeGoogleMaps(
  niche:    string,
  location: string
): Promise<RawLead[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;
  if (!apiKey) {
    await log("SCOUT", "missing_api_key", { hint: "Add GOOGLE_PLACES_API_KEY to Replit Secrets" }, "warning");
    return [];
  }
  try {
    const query  = `${niche} in ${location}`;
    const places = await textSearch(query, apiKey);
    if (!places.length) return [];
    const detailed = await Promise.all(
      places.slice(0, MAX_RESULTS_PER_SEARCH).map(p =>
        getPlaceDetails(p.place_id, apiKey, niche, location)
      )
    );
    return detailed.filter((d): d is RawLead => d !== null);
  } catch (err: any) {
    await log("SCOUT", "scrape_error", { niche, location, error: err.message }, "error");
    return [];
  }
}

async function textSearch(query: string, apiKey: string): Promise<{ place_id: string; name: string }[]> {
  const res = await fetch(`${GOOGLE_PLACES_BASE}/places:searchText`, {
    method: "POST",
    headers: {
      "Content-Type":     "application/json",
      "X-Goog-Api-Key":   apiKey,
      "X-Goog-FieldMask": "places.id,places.displayName",
    },
    body: JSON.stringify({ textQuery: query }),
  });
  const data = await res.json() as any;
  if (!res.ok) throw new Error(`Places API error: ${data.error?.status} — ${data.error?.message}`);
  return (data.places ?? []).map((p: any) => ({ place_id: p.id, name: p.displayName?.text ?? "" }));
}

async function getPlaceDetails(placeId: string, apiKey: string, niche: string, location: string): Promise<RawLead | null> {
  const fieldMask = ["displayName","nationalPhoneNumber","websiteUri","formattedAddress","rating","userRatingCount","businessStatus","googleMapsUri"].join(",");
  const res = await fetch(`${GOOGLE_PLACES_BASE}/places/${placeId}`, {
    headers: { "X-Goog-Api-Key": apiKey, "X-Goog-FieldMask": fieldMask },
  });
  const r = await res.json() as any;
  if (!res.ok) return null;
  if (r.businessStatus === "PERMANENTLY_CLOSED") return null;
  return {
    business_name: r.displayName?.text ?? "Unknown",
    contact_name:  null,
    phone:         r.nationalPhoneNumber ?? null,
    email:         null,
    website_url:   r.websiteUri ?? null,
    address:       r.formattedAddress ?? null,
    location,
    niche,
    rating:        r.rating ?? null,
    review_count:  r.userRatingCount ?? null,
    place_id:      placeId,
    google_url:    r.googleMapsUri ?? `https://maps.google.com/?place_id=${placeId}`,
    notes:         "Sourced via Google Places API",
  };
}
*/
