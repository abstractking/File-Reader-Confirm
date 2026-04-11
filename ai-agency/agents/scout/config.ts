// agents/scout/config.ts
// ═════════════════════════════════════════════
//  SCOUT Configuration
//  Edit TARGET_LOCATIONS and NICHES to aim
//  SCOUT at your chosen markets
// ═════════════════════════════════════════════

export interface NicheConfig {
  keyword:     string;   // Google Maps search term
  label:       string;   // Human-readable label
  minScore:    number;   // Minimum score to save (0-100)
  signals: {
    noWebsite:     boolean;  // No website = higher score opportunity
    lowRatings:    boolean;  // Poor reviews = they need help
    fewReviews:    boolean;  // Few reviews = newer/struggling business
  };
}

// ─────────────────────────────────────────────
// 📍 TARGET LOCATIONS
// Add as many cities/areas as you want.
// SCOUT will search every niche in every location.
// Format: "City, State" or "Neighborhood, City"
// ─────────────────────────────────────────────
export const TARGET_LOCATIONS: string[] = [
  "Lake Charles, Louisiana",
  "Sulphur, Louisiana",
  "Westlake, Louisiana",
  "DeRidder, Louisiana",
  "Leesville, Louisiana",
];

// ─────────────────────────────────────────────
// 🎯 TARGET NICHES
// These map directly to Google Maps search queries.
// Adjust minScore to filter how aggressively.
// ─────────────────────────────────────────────
export const NICHES: NicheConfig[] = [
  {
    keyword:  "nail salon",
    label:    "Nail Salon",
    minScore: 40,
    signals:  { noWebsite: true, lowRatings: false, fewReviews: true },
  },
  {
    keyword:  "restaurant",
    label:    "Restaurant",
    minScore: 45,
    signals:  { noWebsite: true, lowRatings: false, fewReviews: true },
  },
  {
    keyword:  "plumber",
    label:    "Plumber",
    minScore: 40,
    signals:  { noWebsite: true, lowRatings: false, fewReviews: true },
  },
  {
    keyword:  "cleaning service",
    label:    "Cleaning Service",
    minScore: 35,
    signals:  { noWebsite: true, lowRatings: false, fewReviews: true },
  },
  {
    keyword:  "lawn care service",
    label:    "Lawn Care",
    minScore: 35,
    signals:  { noWebsite: true, lowRatings: false, fewReviews: true },
  },
  {
    keyword:  "handyman service",
    label:    "Handyman",
    minScore: 35,
    signals:  { noWebsite: true, lowRatings: false, fewReviews: true },
  },
  {
    keyword:  "dog walker",
    label:    "Dog Walker",
    minScore: 30,
    signals:  { noWebsite: true, lowRatings: false, fewReviews: true },
  },
  {
    keyword:  "hair salon",
    label:    "Hair Salon",
    minScore: 40,
    signals:  { noWebsite: true, lowRatings: false, fewReviews: true },
  },
  {
    keyword:  "electrician",
    label:    "Electrician",
    minScore: 40,
    signals:  { noWebsite: true, lowRatings: false, fewReviews: true },
  },
  {
    keyword:  "HVAC contractor",
    label:    "HVAC",
    minScore: 45,
    signals:  { noWebsite: true, lowRatings: false, fewReviews: true },
  },
  {
    keyword:  "pressure washing service",
    label:    "Pressure Washing",
    minScore: 30,
    signals:  { noWebsite: true, lowRatings: false, fewReviews: true },
  },
  {
    keyword:  "auto detailing",
    label:    "Auto Detailing",
    minScore: 35,
    signals:  { noWebsite: true, lowRatings: false, fewReviews: true },
  },
];

// ─────────────────────────────────────────────
// SCOUT Schedule
// How often SCOUT runs automatically
// (Used by agents/scout/cron.ts)
// ─────────────────────────────────────────────
export const SCOUT_CRON_SCHEDULE = "0 */6 * * *"; // Every 6 hours

// Max leads to scrape per niche/location search
export const MAX_RESULTS_PER_SEARCH = 20;

// Google Places API (New) endpoint
export const GOOGLE_PLACES_BASE = "https://places.googleapis.com/v1";
