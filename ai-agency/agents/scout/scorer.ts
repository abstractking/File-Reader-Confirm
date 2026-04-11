// agents/scout/scorer.ts
// ═════════════════════════════════════════════
//  Lead Scorer — uses Claude to evaluate each
//  raw lead and assign a 0-100 quality score
//  with reasoning and recommended package.
// ═════════════════════════════════════════════

import { askClaudeJSON } from "../../core/claude";
import { RawLead }       from "./scraper";
import { log }           from "../../core/logger";

export interface ScoredLead extends RawLead {
  score:           number;
  score_reasoning: string;
  recommended_pkg: "starter" | "growth" | "pro";
  outreach_angle:  string;    // One-line hook for your outreach message
}

// ─────────────────────────────────────────────
// Score a single lead using Claude
// ─────────────────────────────────────────────
export async function scoreLead(lead: RawLead): Promise<ScoredLead> {
  try {
    const result = await askClaudeJSON<{
      score:           number;
      reasoning:       string;
      recommended_pkg: "starter" | "growth" | "pro";
      outreach_angle:  string;
    }>({
      system: `You are a lead qualification specialist for a web design agency 
               that builds simple, high-converting websites for local service businesses.
               
               Scoring criteria (0-100):
               - NO website = +40 points (biggest opportunity)
               - Outdated/bad website = +25 points
               - Low review count (<10) = +15 points (needs visibility)
               - Low rating (< 3.5) = +10 points (needs reputation help)
               - Active business signals = +10 points
               - Has a great modern website already = -30 points
               
               Packages:
               - starter ($500-800): 1-3 pages, basic info site, no website currently
               - growth ($900-1500): 3-5 pages, booking/contact forms, basic SEO
               - pro ($1600-2500): 5+ pages, full SEO, booking system, Google Business setup
               
               Always respond with ONLY valid JSON matching the schema exactly.`,

      messages: [{
        role:    "user",
        content: `Score this local business lead:

Business: ${lead.business_name}
Niche: ${lead.niche}
Location: ${lead.location}
Phone: ${lead.phone ?? "not listed"}
Website: ${lead.website_url ?? "NONE — no website"}
Rating: ${lead.rating ?? "no rating"} (${lead.review_count ?? 0} reviews)
Notes: ${lead.notes}

Respond with this exact JSON:
{
  "score": <number 0-100>,
  "reasoning": "<2 sentence explanation of score>",
  "recommended_pkg": "<starter|growth|pro>",
  "outreach_angle": "<one punchy sentence to open your outreach — reference something specific about their business>"
}`
      }],
      maxTokens: 400,
    });

    return {
      ...lead,
      score:           Math.min(100, Math.max(0, result.score)),
      score_reasoning: result.reasoning,
      recommended_pkg: result.recommended_pkg,
      outreach_angle:  result.outreach_angle,
      notes:           `${lead.notes}\n\n💡 ${result.reasoning}\n📣 Outreach: ${result.outreach_angle}`,
    };

  } catch (err: any) {
    // If Claude call fails, fall back to rule-based scoring
    await log("SCOUT", "scorer_fallback", { business: lead.business_name, error: err.message }, "warning");
    return fallbackScore(lead);
  }
}

// ─────────────────────────────────────────────
// Rule-based fallback scorer (no Claude needed)
// Used if API call fails or rate-limited
// ─────────────────────────────────────────────
function fallbackScore(lead: RawLead): ScoredLead {
  let score = 20; // baseline

  if (!lead.website_url)                                  score += 40;
  if (lead.review_count !== null && lead.review_count < 10) score += 15;
  if (lead.rating !== null && lead.rating < 3.5)           score += 10;
  if (lead.phone)                                          score += 10;
  if (lead.review_count !== null && lead.review_count > 0) score += 5;

  score = Math.min(100, score);

  const pkg: "starter" | "growth" | "pro" =
    score >= 70 ? "growth" :
    score >= 50 ? "starter" : "starter";

  return {
    ...lead,
    score,
    score_reasoning: "Scored by rule-based fallback (Claude unavailable)",
    recommended_pkg: pkg,
    outreach_angle:  `Hi, I help ${lead.niche} businesses in ${lead.location} get found online — do you have a website?`,
  };
}
