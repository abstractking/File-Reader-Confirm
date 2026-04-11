// agents/proposer/config.ts
// ═════════════════════════════════════════════
//  PROPOSER — Package & Pricing Configuration
//  Edit this file to update your packages,
//  prices, and deliverables at any time.
// ═════════════════════════════════════════════

export interface Package {
  id:           "starter" | "growth" | "pro";
  name:         string;
  price:        number;
  tagline:      string;
  deliverables: string[];
  timeline:     string;
  idealFor:     string;
  bestValue?:   boolean;
}

// ─────────────────────────────────────────────
// 💰 YOUR THREE PACKAGES
// Edit prices, deliverables, and timeline here
// ─────────────────────────────────────────────
export const PACKAGES: Record<string, Package> = {
  starter: {
    id:       "starter",
    name:     "Starter",
    price:    750,
    tagline:  "A clean, professional web presence that gets you found",
    idealFor: "Businesses with no website or an outdated one that just needs the basics done right",
    timeline: "5–7 business days",
    deliverables: [
      "Up to 3 pages (Home, About, Contact)",
      "Mobile-first responsive design",
      "Contact form + phone click-to-call",
      "Google Maps embed",
      "Basic on-page SEO (title tags, meta descriptions)",
      "30-day post-launch support",
    ],
  },

  growth: {
    id:       "growth",
    name:     "Growth",
    price:    1250,
    tagline:  "A conversion-focused site built to turn visitors into booked clients",
    idealFor: "Businesses ready to grow — needs booking, service pages, and a stronger online presence",
    timeline: "10–14 business days",
    bestValue: true,
    deliverables: [
      "Up to 5 pages (Home, About, Services, Booking, Contact)",
      "Mobile-first responsive design",
      "Online booking / appointment system integration",
      "Service area pages for local SEO",
      "Google Reviews widget",
      "Contact form + phone click-to-call",
      "Full on-page SEO setup",
      "Google Analytics setup",
      "60-day post-launch support",
    ],
  },

  pro: {
    id:       "pro",
    name:     "Pro",
    price:    2000,
    tagline:  "A complete digital presence — your business, fully established online",
    idealFor: "Businesses serious about dominating their local market",
    timeline: "14–21 business days",
    deliverables: [
      "Up to 8 pages (full custom sitemap)",
      "Premium mobile-first responsive design",
      "Online booking / appointment system integration",
      "Full local SEO setup (schema markup, citations)",
      "Google Business Profile setup & optimisation",
      "Service area landing pages",
      "Google Reviews widget + reputation strategy",
      "Blog setup (3 starter posts included)",
      "Google Analytics + Search Console setup",
      "Speed optimisation (90+ PageSpeed score target)",
      "90-day post-launch support",
    ],
  },
};

// ─────────────────────────────────────────────
// Business details — used in every proposal
// ─────────────────────────────────────────────
export const AGENCY = {
  name:     "Your Agency Name",       // ← update this
  owner:    "Your Name",              // ← update this
  email:    "you@youragency.com",     // ← update this
  phone:    "337-xxx-xxxx",           // ← update this
  website:  "https://youragency.com", // ← update this
  location: "Lake Charles, LA",
  tagline:  "Simple websites that work hard for local businesses",
};

// ─────────────────────────────────────────────
// Tone guidelines fed to Claude on every call
// ─────────────────────────────────────────────
export const BRAND_VOICE = `
- Tone: Warm, calm, confident, and approachable — never pushy or salesy
- Write like a trusted local expert, not a corporate agency
- Use short sentences and plain language — no jargon
- Be specific about the client's business — never sound like a template
- Lead with their problem/opportunity, not your services
- Always make the client feel like you've already thought about their specific situation
`;
