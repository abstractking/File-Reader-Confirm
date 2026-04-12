// agents/builder/config.ts
// ─────────────────────────────────────────────
// Configuration for the BUILDER agent
// Niche palettes, page structures, section types
// ─────────────────────────────────────────────

export const BUILDER_CONFIG = {
  tech_stack: "React + TypeScript + Tailwind CSS",

  structures: {
    single:              ["LandingPage"],
    multi:               ["Home", "About", "Services", "Contact"],
    multi_with_booking:  ["Home", "About", "Services", "Booking", "Contact"],
    multi_full:          ["Home", "About", "Services", "Gallery", "Booking", "Blog", "Contact"],
  },

  sections: [
    "Hero",
    "Services",
    "About",
    "Testimonials",
    "Gallery",
    "Booking/CTA",
    "FAQ",
    "Contact",
    "Footer",
  ],

  niche_palettes: {
    "nail salon":       { primary: "#E8B4B8", secondary: "#F9F0F1", accent: "#C17B82", text: "#2D2D2D" },
    "restaurant":       { primary: "#2C1810", secondary: "#F5E6D3", accent: "#C9956C", text: "#1A1A1A" },
    "plumber":          { primary: "#1B4F8A", secondary: "#EBF2FB", accent: "#F5A623", text: "#1A1A1A" },
    "cleaning service": { primary: "#2E86AB", secondary: "#F0F8FF", accent: "#48CAE4", text: "#1A1A1A" },
    "cleaning":         { primary: "#2E86AB", secondary: "#F0F8FF", accent: "#48CAE4", text: "#1A1A1A" },
    "lawn care":        { primary: "#2D6A4F", secondary: "#F0F7F4", accent: "#74C69D", text: "#1A1A1A" },
    "handyman":         { primary: "#E85D04", secondary: "#FFF3E0", accent: "#FAA307", text: "#1A1A1A" },
    "dog walker":       { primary: "#6B4226", secondary: "#FDF6EC", accent: "#F4A261", text: "#1A1A1A" },
    "hair salon":       { primary: "#4A1942", secondary: "#FDF0FF", accent: "#C77DFF", text: "#1A1A1A" },
    "electrician":      { primary: "#1A1A2E", secondary: "#F0F4FF", accent: "#F5C518", text: "#1A1A1A" },
    "default":          { primary: "#1B4F8A", secondary: "#F0F4FF", accent: "#F5A623", text: "#1A1A1A" },
  } as Record<string, { primary: string; secondary: string; accent: string; text: string }>,
};

export type SiteStructure = "single" | "multi" | "multi_with_booking" | "multi_full";
export type NichePalette  = { primary: string; secondary: string; accent: string; text: string };
