// agents/scout/scraper.ts
// ═════════════════════════════════════════════
//  Google Places API (New) scraper
//  Uses Places API (New) — Text Search + Place Details
//
//  Required secret: GOOGLE_PLACES_API_KEY
//  Get free key: console.cloud.google.com
//  Enable: "Places API (New)"
//  Free tier: 1,000 requests/day → plenty for this system
// ═════════════════════════════════════════════

import { GOOGLE_PLACES_BASE, MAX_RESULTS_PER_SEARCH } from "./config";
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
// Main scrape function
// ─────────────────────────────────────────────
export async function scrapeGoogleMaps(
  niche:    string,
  location: string
): Promise<RawLead[]> {
  const apiKey = process.env.GOOGLE_PLACES_API_KEY;

  if (!apiKey) {
    await log("SCOUT", "missing_api_key", { hint: "Add GOOGLE_PLACES_API_KEY to Replit Secrets" }, "warning");
    // Return mock data so you can test the pipeline without the API key
    return getMockLeads(niche, location);
  }

  try {
    const query  = `${niche} in ${location}`;
    const places = await textSearch(query, apiKey);

    if (!places.length) return [];

    // Fetch detail for each place (phone, website, etc.)
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

// ─────────────────────────────────────────────
// Places API (New) — Text Search
// POST /places:searchText
// ─────────────────────────────────────────────
async function textSearch(
  query:  string,
  apiKey: string
): Promise<{ place_id: string; name: string }[]> {
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

  if (!res.ok) {
    throw new Error(`Places API error: ${data.error?.status} — ${data.error?.message ?? JSON.stringify(data)}`);
  }

  return (data.places ?? []).map((p: any) => ({
    place_id: p.id,
    name:     p.displayName?.text ?? "",
  }));
}

// ─────────────────────────────────────────────
// Places API (New) — Place Details
// GET /places/{place_id}
// ─────────────────────────────────────────────
async function getPlaceDetails(
  placeId:  string,
  apiKey:   string,
  niche:    string,
  location: string
): Promise<RawLead | null> {
  const fieldMask = [
    "displayName",
    "nationalPhoneNumber",
    "websiteUri",
    "formattedAddress",
    "rating",
    "userRatingCount",
    "businessStatus",
    "googleMapsUri",
  ].join(",");

  const res = await fetch(`${GOOGLE_PLACES_BASE}/places/${placeId}`, {
    headers: {
      "X-Goog-Api-Key":   apiKey,
      "X-Goog-FieldMask": fieldMask,
    },
  });

  const r = await res.json() as any;

  if (!res.ok) return null;
  if (r.businessStatus === "PERMANENTLY_CLOSED") return null;

  const notes = buildNotes(r);

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
    notes,
  };
}

// ─────────────────────────────────────────────
// Build human-readable notes for the scorer
// ─────────────────────────────────────────────
function buildNotes(place: any): string {
  const parts: string[] = [];

  if (!place.websiteUri)
    parts.push("❗ No website found — high opportunity");

  if (place.rating && place.rating < 3.5)
    parts.push(`⭐ Low rating: ${place.rating}/5 — may need reputation help`);

  if (place.userRatingCount && place.userRatingCount < 10)
    parts.push(`📊 Very few reviews (${place.userRatingCount}) — newer or low-visibility business`);

  if (place.userRatingCount && place.userRatingCount > 50 && place.rating >= 4.5)
    parts.push("✅ Established business with strong reviews — may want to upgrade web presence");

  return parts.join(" | ") || "Standard local business";
}

// ─────────────────────────────────────────────
// Mock leads — used when no API key is set
// Lets you test the full pipeline immediately
// ─────────────────────────────────────────────
function getMockLeads(niche: string, location: string): RawLead[] {
  return [
    {
      business_name: `${location} ${niche} Co.`,
      contact_name:  "John Smith",
      phone:         "337-555-0101",
      email:         null,
      website_url:   null,
      address:       `123 Main St, ${location}`,
      location,
      niche,
      rating:        3.8,
      review_count:  7,
      place_id:      "mock_001",
      google_url:    "https://maps.google.com",
      notes:         "❗ No website found — high opportunity | 📊 Very few reviews (7) — newer or low-visibility business",
    },
    {
      business_name: `Quality ${niche} Services`,
      contact_name:  "Maria Garcia",
      phone:         "337-555-0202",
      email:         null,
      website_url:   "http://qualityservice.com",
      address:       `456 Oak Ave, ${location}`,
      location,
      niche,
      rating:        4.2,
      review_count:  23,
      place_id:      "mock_002",
      google_url:    "https://maps.google.com",
      notes:         "Has a basic website — good candidate for upgrade",
    },
    {
      business_name: `Pro ${niche} LLC`,
      contact_name:  null,
      phone:         "337-555-0303",
      email:         null,
      website_url:   null,
      address:       `789 Pine Rd, ${location}`,
      location,
      niche,
      rating:        null,
      review_count:  0,
      place_id:      "mock_003",
      google_url:    "https://maps.google.com",
      notes:         "❗ No website found — high opportunity | 📊 Very few reviews (0) — newer or low-visibility business",
    },
  ];
}
