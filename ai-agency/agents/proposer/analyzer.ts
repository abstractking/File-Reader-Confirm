// agents/proposer/analyzer.ts
// ═════════════════════════════════════════════
//  Website Analyzer
//  If the lead has an existing website, fetch
//  basic info about it so Claude can reference
//  specific improvements in the proposal.
// ═════════════════════════════════════════════

import { log } from "../../core/logger";

export interface SiteAnalysis {
  url:            string;
  accessible:     boolean;
  has_mobile:     boolean | null;
  has_ssl:        boolean;
  page_title:     string | null;
  meta_desc:      string | null;
  has_booking:    boolean;
  has_contact:    boolean;
  has_social:     boolean;
  issues:         string[];
  opportunities:  string[];
  raw_snippet:    string | null;
}

// ─────────────────────────────────────────────
// Analyze an existing website
// Returns key signals Claude uses in the proposal
// ─────────────────────────────────────────────
export async function analyzeWebsite(url: string): Promise<SiteAnalysis> {
  const result: SiteAnalysis = {
    url,
    accessible:    false,
    has_mobile:    null,
    has_ssl:       url.startsWith("https://"),
    page_title:    null,
    meta_desc:     null,
    has_booking:   false,
    has_contact:   false,
    has_social:    false,
    issues:        [],
    opportunities: [],
    raw_snippet:   null,
  };

  try {
    const controller  = new AbortController();
    const timeout     = setTimeout(() => controller.abort(), 8000);

    const res = await fetch(url, {
      signal:  controller.signal,
      headers: { "User-Agent": "Mozilla/5.0 (compatible; SiteAudit/1.0)" }
    });
    clearTimeout(timeout);

    if (!res.ok) {
      result.issues.push(`Site returned HTTP ${res.status}`);
      return result;
    }

    result.accessible = true;
    const html        = await res.text();
    const lower       = html.toLowerCase();

    // ── Extract title ──────────────────────────
    const titleMatch  = html.match(/<title[^>]*>([^<]+)<\/title>/i);
    result.page_title = titleMatch?.[1]?.trim() ?? null;

    // ── Extract meta description ───────────────
    const metaMatch  = html.match(/<meta[^>]+name=["']description["'][^>]+content=["']([^"']+)/i)
                    ?? html.match(/<meta[^>]+content=["']([^"']+)["'][^>]+name=["']description/i);
    result.meta_desc = metaMatch?.[1]?.trim() ?? null;

    // ── Mobile viewport check ──────────────────
    result.has_mobile = lower.includes("viewport") && lower.includes("width=device-width");

    // ── SSL check ─────────────────────────────
    result.has_ssl = url.startsWith("https://");

    // ── Booking signals ───────────────────────
    result.has_booking = ["book", "schedul", "appointment", "calendar", "reserve", "acuity", "calendly", "booksy"].some(k => lower.includes(k));

    // ── Contact signals ───────────────────────
    result.has_contact = ["contact", "call us", "get in touch", "reach out", "<form"].some(k => lower.includes(k));

    // ── Social signals ────────────────────────
    result.has_social = ["facebook.com", "instagram.com", "twitter.com", "tiktok.com", "youtube.com"].some(k => lower.includes(k));

    // ── Save a short snippet for Claude ───────
    const bodyMatch    = html.match(/<body[^>]*>([\s\S]{0,2000})/i);
    result.raw_snippet = bodyMatch?.[1]?.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim().slice(0, 500) ?? null;

    // ── Build issues list ──────────────────────
    if (!result.has_ssl)     result.issues.push("No SSL certificate (site shows as 'Not Secure')");
    if (!result.has_mobile)  result.issues.push("No mobile viewport — likely not mobile-friendly");
    if (!result.meta_desc)   result.issues.push("Missing meta description — hurts search visibility");
    if (!result.has_booking) result.issues.push("No online booking system found");
    if (!result.has_contact) result.issues.push("No clear contact section found");

    // ── Build opportunities list ───────────────
    if (!result.has_booking) result.opportunities.push("Add online booking to reduce phone tag");
    if (!result.has_ssl)     result.opportunities.push("Add SSL to build trust and improve Google ranking");
    if (!result.has_mobile)  result.opportunities.push("Mobile-first redesign — 70%+ of local searches are mobile");
    if (!result.has_social)  result.opportunities.push("Connect social media to increase reach");
    if (!result.meta_desc)   result.opportunities.push("Full SEO setup to improve local search visibility");

    await log("PROPOSER", "site_analyzed", { url, issues: result.issues.length }, "success");

  } catch (err: any) {
    if (err.name === "AbortError") {
      result.issues.push("Site timed out — may be slow or down");
    } else {
      result.issues.push(`Could not access site: ${err.message}`);
    }
    await log("PROPOSER", "site_analyze_error", { url, error: err.message }, "warning");
  }

  return result;
}

// ─────────────────────────────────────────────
// Format analysis into a Claude-readable summary
// ─────────────────────────────────────────────
export function formatAnalysis(a: SiteAnalysis): string {
  if (!a.accessible) {
    return `Existing site (${a.url}) could not be accessed — treat as no usable website.`;
  }

  return `
Existing website analysis for ${a.url}:
- SSL/HTTPS: ${a.has_ssl ? "Yes ✅" : "No ❌"}
- Mobile-friendly: ${a.has_mobile ? "Yes ✅" : "No ❌"}
- Has booking system: ${a.has_booking ? "Yes ✅" : "No ❌"}
- Has contact section: ${a.has_contact ? "Yes ✅" : "No ❌"}
- Page title: ${a.page_title ?? "missing"}
- Meta description: ${a.meta_desc ?? "missing"}
- Key issues: ${a.issues.length ? a.issues.join("; ") : "none found"}
- Opportunities: ${a.opportunities.length ? a.opportunities.join("; ") : "none found"}
- Site content snippet: "${a.raw_snippet ?? "could not extract"}"
  `.trim();
}
