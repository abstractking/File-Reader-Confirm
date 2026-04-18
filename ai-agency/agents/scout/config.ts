// agents/scout/config.ts
// ═════════════════════════════════════════════
//  SCOUT Configuration
//  Edit TARGET_LOCATIONS and TARGET_NICHES to aim
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
export const TARGET_NICHES: NicheConfig[] = [
  {
    keyword:  "plumber",
    label:    "Plumbing Services",
    minScore: 45,
    signals: {
      noWebsite:   true,
      lowRatings:  false,
      fewReviews:  true,
    },
  },
  {
    keyword:  "electrician",
    label:    "Electricians",
    minScore: 45,
    signals: {
      noWebsite:   true,
      lowRatings:  false,
      fewReviews:  true,
    },
  },
  {
    keyword:  "HVAC repair",
    label:    "HVAC / AC Repair",
    minScore: 45,
    signals: {
      noWebsite:   true,
      lowRatings:  false,
      fewReviews:  true,
    },
  },
  {
    keyword:  "handyman",
    label:    "Handyman / General Contractor",
    minScore: 45,
    signals: {
      noWebsite:   true,
      lowRatings:  false,
      fewReviews:  true,
    },
  },
];

// ─────────────────────────────────────────────
// 🚦 TRIGGER SIGNALS
// Which signals boost a lead's score enough
// to qualify it for the pipeline
// ─────────────────────────────────────────────
export const TRIGGER_SIGNALS = {
  facebookNoWebsite:   true,   // +40 pts
  googleMapsNoWebsite: true,   // +40 pts
  requireBothSignals:  false,  // either one is enough
};

// ─────────────────────────────────────────────
// 📦 BATCH TARGET
// How many qualified leads to collect per run
// ─────────────────────────────────────────────
export const BATCH_TARGET = 25;

// ─────────────────────────────────────────────
// 🏙️  CITY SIZE FILTER
// "any" = SCOUT decides based on available leads
// ─────────────────────────────────────────────
export const CITY_SIZE_FILTER = "any";

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

// ─────────────────────────────────────────────
// Resolve which locations to search this run
// Returns full list; callers pick index [0] per
// run so each cron tick rotates through cities
// ─────────────────────────────────────────────
export function resolveTargetLocations(): string[] {
  return TARGET_LOCATIONS;
}
