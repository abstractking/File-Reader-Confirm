// agents/designer/styles.ts
// ═════════════════════════════════════════════
//  12 Base Design Styles
//  These define the structural foundation —
//  layout system, color palette, typography,
//  motion personality — before any art genre
//  is applied on top.
// ═════════════════════════════════════════════

export interface DesignStyle {
  id:          string;
  name:        string;
  tagline:     string;
  philosophy:  "bold" | "minimalist" | "warm" | "organic" | "playful" | "professional";
  mood:        string;

  fonts: {
    display:     string;
    body:        string;
    accent:      string;
    googleFonts: string;
  };

  colors: {
    primary:    string;
    secondary:  string;
    accent:     string;
    text:       string;
    textMuted:  string;
    background: string;
    surface:    string;
    border:     string;
  };

  layout: {
    heroStyle:      string;
    gridStyle:      string;
    sectionSpacing: string;
    borderRadius:   string;
    shadowStyle:    string;
  };

  motion: {
    pageLoad:   string;
    hover:      string;
    transition: string;
  };

  details: {
    backgroundStyle: string;
    buttonStyle:     string;
    cardStyle:       string;
    dividerStyle:    string;
    iconStyle:       string;
  };

  // Which niches this suits best
  nicheAffinity: Record<string, number>;
}

// ─────────────────────────────────────────────
// THE 12 BASE STYLES
// ─────────────────────────────────────────────
export const DESIGN_STYLES: DesignStyle[] = [

  // ── 01 · BLOOM ───────────────────────────────
  {
    id:          "bloom",
    name:        "Bloom",
    tagline:     "Fresh, open, quietly confident",
    philosophy:  "warm",
    mood:        "Soft optimism. Spring morning energy without being precious.",

    fonts: {
      display:     "Plus Jakarta Sans",
      body:        "Inter",
      accent:      "Lora",
      googleFonts: "family=Plus+Jakarta+Sans:wght@400;600;700;800&family=Inter:wght@400;500&family=Lora:ital@1",
    },

    colors: {
      primary:    "#2D6A4F",
      secondary:  "#74C69D",
      accent:     "#F4A261",
      text:       "#1B2B1F",
      textMuted:  "#6B8C74",
      background: "#F8FAF8",
      surface:    "#EEFAF2",
      border:     "#D0E8D8",
    },

    layout: {
      heroStyle:      "Full-width with soft gradient overlay, left-aligned headline, nature-forward imagery",
      gridStyle:      "3-column card grid with generous gap-8, responsive to 1-col on mobile",
      sectionSpacing: "py-20 lg:py-28",
      borderRadius:   "rounded-2xl",
      shadowStyle:    "shadow-md shadow-green-100",
    },

    motion: {
      pageLoad:   "Fade up 0.6s ease-out, staggered 0.1s per card",
      hover:      "Gentle lift — translateY(-4px) over 300ms",
      transition: "transition-all duration-300 ease-out",
    },

    details: {
      backgroundStyle: "Subtle organic texture — soft noise grain at 3% opacity on hero",
      buttonStyle:     "Rounded-full pill, bg-green-700 text-white px-8 py-3 hover:bg-green-800",
      cardStyle:       "White card rounded-2xl shadow-md p-6 border border-green-100",
      dividerStyle:    "Thin border-t border-green-100 with small leaf SVG centered",
      iconStyle:       "Outlined, 24px, green-600, stroke-width 1.5",
    },

    nicheAffinity: {
      "lawn care": 9, "dog walker": 8, "cleaning service": 7,
      "restaurant": 6, "nail salon": 5, "hair salon": 6,
      "handyman": 4, "plumber": 3, "electrician": 3,
    },
  },

  // ── 02 · DUSK ────────────────────────────────
  {
    id:          "dusk",
    name:        "Dusk",
    tagline:     "Warm authority at the golden hour",
    philosophy:  "warm",
    mood:        "Amber warmth. Premium without intimidation.",

    fonts: {
      display:     "Playfair Display",
      body:        "Source Sans 3",
      accent:      "Cormorant Garamond",
      googleFonts: "family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Source+Sans+3:wght@400;600&family=Cormorant+Garamond:ital,wght@1,400",
    },

    colors: {
      primary:    "#7C3D12",
      secondary:  "#F4A261",
      accent:     "#E76F51",
      text:       "#2D1810",
      textMuted:  "#8B6E5A",
      background: "#FDF8F2",
      surface:    "#FAF0E4",
      border:     "#EDD9C4",
    },

    layout: {
      heroStyle:      "Split layout — rich warm image right, headline and CTA left with decorative line",
      gridStyle:      "2-column with featured card, or masonry-style service list",
      sectionSpacing: "py-20 lg:py-32",
      borderRadius:   "rounded-xl",
      shadowStyle:    "shadow-lg shadow-amber-100",
    },

    motion: {
      pageLoad:   "Warm fade — opacity 0→1 over 0.8s, slight warm glow on load",
      hover:      "Warm brighten — brightness 1.05, shadow deepen over 250ms",
      transition: "transition-all duration-300 ease-in-out",
    },

    details: {
      backgroundStyle: "Warm parchment texture — subtle linen grain at hero sections",
      buttonStyle:     "rounded-xl bg-amber-800 text-white px-7 py-3 hover:bg-amber-900 shadow-md",
      cardStyle:       "bg-amber-50 rounded-xl border border-amber-200 p-6 shadow",
      dividerStyle:    "Thin gold line with centered diamond ornament",
      iconStyle:       "Filled warm amber, 22px, rounded corners",
    },

    nicheAffinity: {
      "restaurant": 10, "hair salon": 8, "nail salon": 7,
      "cleaning service": 5, "dog walker": 5, "lawn care": 4,
      "handyman": 4, "plumber": 3, "electrician": 3,
    },
  },

  // ── 03 · SLATE ───────────────────────────────
  {
    id:          "slate",
    name:        "Slate",
    tagline:     "Dark precision. The quiet confidence of authority.",
    philosophy:  "minimalist",
    mood:        "Controlled power. The brand that doesn't need to shout.",

    fonts: {
      display:     "Space Grotesk",
      body:        "Inter",
      accent:      "Space Mono",
      googleFonts: "family=Space+Grotesk:wght@500;600;700&family=Inter:wght@400;500&family=Space+Mono:wght@400",
    },

    colors: {
      primary:    "#0F172A",
      secondary:  "#1E293B",
      accent:     "#38BDF8",
      text:       "#F1F5F9",
      textMuted:  "#94A3B8",
      background: "#0F172A",
      surface:    "#1E293B",
      border:     "#334155",
    },

    layout: {
      heroStyle:      "Full dark hero with large headline, subtle grid lines, accent color CTA",
      gridStyle:      "4-column tight grid with border separators, data-dense layout",
      sectionSpacing: "py-16 lg:py-24",
      borderRadius:   "rounded-none",
      shadowStyle:    "shadow-2xl shadow-black/50",
    },

    motion: {
      pageLoad:   "Instant sharp entry — translateY(10px)→0 over 0.25s, no blur",
      hover:      "Border color shift to accent, instant 150ms",
      transition: "transition-all duration-150 ease-out",
    },

    details: {
      backgroundStyle: "Subtle dot-grid pattern at 5% opacity on dark backgrounds",
      buttonStyle:     "rounded-none border border-sky-400 text-sky-400 px-8 py-3 uppercase tracking-widest hover:bg-sky-400 hover:text-slate-900",
      cardStyle:       "bg-slate-800 border border-slate-700 rounded p-6",
      dividerStyle:    "border-t border-slate-700",
      iconStyle:       "Outlined sky-400, 20px, stroke-width 1",
    },

    nicheAffinity: {
      "electrician": 8, "hvac": 8, "plumber": 6,
      "handyman": 7, "cleaning service": 5, "lawn care": 4,
      "restaurant": 6, "hair salon": 5, "nail salon": 4, "dog walker": 3,
    },
  },

  // ── 04 · CRISP ───────────────────────────────
  {
    id:          "crisp",
    name:        "Crisp",
    tagline:     "Nothing extra. Everything intentional.",
    philosophy:  "minimalist",
    mood:        "Sharp clarity. The most trusted brand in the room.",

    fonts: {
      display:     "Sora",
      body:        "DM Sans",
      accent:      "DM Mono",
      googleFonts: "family=Sora:wght@600;700;800&family=DM+Sans:wght@400;500&family=DM+Mono:wght@400",
    },

    colors: {
      primary:    "#111827",
      secondary:  "#374151",
      accent:     "#2563EB",
      text:       "#111827",
      textMuted:  "#6B7280",
      background: "#FFFFFF",
      surface:    "#F9FAFB",
      border:     "#E5E7EB",
    },

    layout: {
      heroStyle:      "Clean centered headline with single CTA, white background, minimal imagery",
      gridStyle:      "3-column even grid with generous whitespace, thin border dividers",
      sectionSpacing: "py-16 lg:py-24",
      borderRadius:   "rounded-lg",
      shadowStyle:    "shadow shadow-gray-100",
    },

    motion: {
      pageLoad:   "Clean fade — opacity 0→1 over 0.4s, no transform",
      hover:      "Subtle blue underline on links, bg-gray-50 on cards",
      transition: "transition-colors duration-200 ease-in-out",
    },

    details: {
      backgroundStyle: "Pure white or gray-50, no texture",
      buttonStyle:     "rounded-lg bg-blue-600 text-white px-6 py-3 hover:bg-blue-700",
      cardStyle:       "bg-white border border-gray-200 rounded-lg p-6",
      dividerStyle:    "border-t border-gray-200",
      iconStyle:       "Outlined blue-600, 20px, crisp stroke-width 2",
    },

    nicheAffinity: {
      "handyman": 8, "plumber": 9, "electrician": 9,
      "cleaning service": 8, "lawn care": 7, "dog walker": 5,
      "restaurant": 5, "hair salon": 5, "nail salon": 4,
    },
  },

  // ── 05 · GROVE ───────────────────────────────
  {
    id:          "grove",
    name:        "Grove",
    tagline:     "Rooted. Reliable. Growing.",
    philosophy:  "organic",
    mood:        "Trust built like a tree — slowly, deeply, permanently.",

    fonts: {
      display:     "Nunito",
      body:        "Nunito",
      accent:      "Lora",
      googleFonts: "family=Nunito:wght@400;600;700;800&family=Lora:ital,wght@0,400;1,400",
    },

    colors: {
      primary:    "#1A472A",
      secondary:  "#2D6A4F",
      accent:     "#B5E48C",
      text:       "#1A2E1E",
      textMuted:  "#5A7A62",
      background: "#F4FAF5",
      surface:    "#E8F5EC",
      border:     "#C8E6CC",
    },

    layout: {
      heroStyle:      "Full-width nature image hero with green overlay, centered white text",
      gridStyle:      "3-col organic grid, cards with rounded corners and leaf-green accents",
      sectionSpacing: "py-20 lg:py-28",
      borderRadius:   "rounded-2xl",
      shadowStyle:    "shadow-md shadow-green-100",
    },

    motion: {
      pageLoad:   "Grow-in — scale(0.95)→1 opacity 0→1 over 0.7s ease-out",
      hover:      "Lift and brighten — translateY(-3px) shadow deepen over 300ms",
      transition: "transition-all duration-300 ease-out",
    },

    details: {
      backgroundStyle: "Soft organic grain texture at 4%, section alternating white/green-50",
      buttonStyle:     "rounded-full bg-green-800 text-white px-8 py-3 hover:bg-green-900",
      cardStyle:       "bg-white rounded-2xl border border-green-100 p-6 shadow-sm",
      dividerStyle:    "SVG wave divider in green-100",
      iconStyle:       "Filled green-600, 24px, leaf-inspired shapes",
    },

    nicheAffinity: {
      "lawn care": 10, "dog walker": 9, "cleaning service": 7,
      "restaurant": 6, "handyman": 5, "hair salon": 4,
      "nail salon": 3, "plumber": 4, "electrician": 3,
    },
  },

  // ── 06 · HEARTH ──────────────────────────────
  {
    id:          "hearth",
    name:        "Hearth",
    tagline:     "Where craft meets home",
    philosophy:  "warm",
    mood:        "Fireside warmth. The brand that feels like family.",

    fonts: {
      display:     "Merriweather",
      body:        "Nunito",
      accent:      "Caveat",
      googleFonts: "family=Merriweather:ital,wght@0,700;0,900;1,400&family=Nunito:wght@400;600&family=Caveat:wght@600",
    },

    colors: {
      primary:    "#9C2C2C",
      secondary:  "#D4845A",
      accent:     "#F4C27A",
      text:       "#2A1810",
      textMuted:  "#8A6552",
      background: "#FDF6EE",
      surface:    "#FAF0E2",
      border:     "#EDD9BE",
    },

    layout: {
      heroStyle:      "Warm full-width hero with terracotta overlay, headline + phone CTA prominent",
      gridStyle:      "2-col feature + 3-col service grid with warm borders",
      sectionSpacing: "py-20 lg:py-28",
      borderRadius:   "rounded-xl",
      shadowStyle:    "shadow-lg shadow-red-100",
    },

    motion: {
      pageLoad:   "Warm rise — translateY(20px)→0 opacity 0→1 over 0.7s",
      hover:      "Warm glow — background brightens slightly, border color warms",
      transition: "transition-all duration-300 ease-in-out",
    },

    details: {
      backgroundStyle: "Warm linen texture on hero, cream gradient on sections",
      buttonStyle:     "rounded-lg bg-red-800 text-white px-7 py-3 hover:bg-red-900 shadow",
      cardStyle:       "bg-amber-50 border border-amber-200 rounded-xl p-6",
      dividerStyle:    "Warm border-t with small flame or diamond SVG centered",
      iconStyle:       "Filled terracotta, 22px, hand-crafted feel",
    },

    nicheAffinity: {
      "restaurant": 9, "cleaning service": 8, "handyman": 9,
      "dog walker": 7, "lawn care": 6, "hair salon": 5,
      "nail salon": 5, "plumber": 7, "electrician": 5,
    },
  },

  // ── 07 · BREEZE ──────────────────────────────
  {
    id:          "breeze",
    name:        "Breeze",
    tagline:     "Light, clear, and always moving forward",
    philosophy:  "minimalist",
    mood:        "Airy trust. The brand that doesn't overwhelm.",

    fonts: {
      display:     "Outfit",
      body:        "Inter",
      accent:      "Inter",
      googleFonts: "family=Outfit:wght@400;600;700;800&family=Inter:wght@400;500",
    },

    colors: {
      primary:    "#0369A1",
      secondary:  "#38BDF8",
      accent:     "#7DD3FC",
      text:       "#0C2340",
      textMuted:  "#5B8BAD",
      background: "#F0F9FF",
      surface:    "#E0F2FE",
      border:     "#BAE6FD",
    },

    layout: {
      heroStyle:      "Light sky-blue hero, white headline, single CTA, airy whitespace",
      gridStyle:      "3-col cards with blue-100 borders, icon headers",
      sectionSpacing: "py-16 lg:py-24",
      borderRadius:   "rounded-2xl",
      shadowStyle:    "shadow-sm shadow-sky-100",
    },

    motion: {
      pageLoad:   "Breeze-in — translateX(-10px)→0 opacity 0→1 over 0.5s",
      hover:      "Float up — translateY(-2px) over 200ms",
      transition: "transition-all duration-200 ease-out",
    },

    details: {
      backgroundStyle: "Sky gradient hero bg-gradient-to-br from-sky-50 to-blue-100",
      buttonStyle:     "rounded-full bg-sky-600 text-white px-8 py-3 hover:bg-sky-700",
      cardStyle:       "bg-white rounded-2xl border border-sky-100 p-6 shadow-sm",
      dividerStyle:    "SVG wave divider in sky-100",
      iconStyle:       "Outlined sky-600, 22px, rounded stroke-width 1.5",
    },

    nicheAffinity: {
      "cleaning service": 10, "dog walker": 8, "plumber": 7,
      "handyman": 6, "lawn care": 7, "electrician": 5,
      "restaurant": 4, "hair salon": 5, "nail salon": 4,
    },
  },

  // ── 08 · SUMMIT ──────────────────────────────
  {
    id:          "summit",
    name:        "Summit",
    tagline:     "Reach further. Deliver more.",
    philosophy:  "professional",
    mood:        "Trustworthy excellence. Built for decisions, not browsing.",

    fonts: {
      display:     "Barlow",
      body:        "Source Sans 3",
      accent:      "Barlow Condensed",
      googleFonts: "family=Barlow:wght@500;600;700;800&family=Source+Sans+3:wght@400;500&family=Barlow+Condensed:wght@600;700",
    },

    colors: {
      primary:    "#1E3A5F",
      secondary:  "#2E6DA4",
      accent:     "#F59E0B",
      text:       "#1A2C3F",
      textMuted:  "#5A7A94",
      background: "#F8FAFC",
      surface:    "#EEF4FB",
      border:     "#CBD5E1",
    },

    layout: {
      heroStyle:      "Professional navy hero with bold headline, trust badges below fold",
      gridStyle:      "3-col service grid with icon + headline + text, trust-focused",
      sectionSpacing: "py-16 lg:py-24",
      borderRadius:   "rounded-lg",
      shadowStyle:    "shadow-md shadow-blue-100",
    },

    motion: {
      pageLoad:   "Professional slide-up — translateY(15px)→0 over 0.5s ease-out",
      hover:      "Border accent highlight — 200ms border-color to amber",
      transition: "transition-all duration-200 ease-out",
    },

    details: {
      backgroundStyle: "Clean professional gradient hero, alternating white/blue-50 sections",
      buttonStyle:     "rounded-lg bg-blue-900 text-white px-7 py-3 hover:bg-amber-500 hover:text-blue-900 transition-colors",
      cardStyle:       "bg-white border border-gray-200 rounded-lg p-6 shadow-sm",
      dividerStyle:    "border-t-2 border-amber-400 w-16 mx-auto my-4",
      iconStyle:       "Filled navy/amber, 24px, professional rounded",
    },

    nicheAffinity: {
      "plumber": 9, "electrician": 9, "hvac": 10,
      "handyman": 9, "cleaning service": 7, "lawn care": 6,
      "restaurant": 4, "hair salon": 4, "nail salon": 3, "dog walker": 4,
    },
  },

  // ── 09 · VOLT ────────────────────────────────
  {
    id:          "volt",
    name:        "Volt",
    tagline:     "High voltage. Zero hesitation.",
    philosophy:  "bold",
    mood:        "Electric confidence. Fast, direct, unforgettable.",

    fonts: {
      display:     "Bebas Neue",
      body:        "DM Sans",
      accent:      "Space Mono",
      googleFonts: "family=Bebas+Neue&family=DM+Sans:wght@400;500;600&family=Space+Mono:wght@400",
    },

    colors: {
      primary:    "#1A1A1A",
      secondary:  "#2A2A2A",
      accent:     "#FAFF00",
      text:       "#F0F0F0",
      textMuted:  "#9A9A9A",
      background: "#111111",
      surface:    "#1E1E1E",
      border:     "#333333",
    },

    layout: {
      heroStyle:      "Black hero with massive yellow headline, bold typography fills 60% of viewport",
      gridStyle:      "2-col or 4-col tight grid, elements boxed with yellow borders",
      sectionSpacing: "py-16 lg:py-20",
      borderRadius:   "rounded-none",
      shadowStyle:    "shadow-none",
    },

    motion: {
      pageLoad:   "Sharp snap — translateX(-20px)→0 over 0.2s, no ease",
      hover:      "Yellow fill flash — background snaps to yellow, text snaps to black",
      transition: "transition-all duration-150",
    },

    details: {
      backgroundStyle: "Pure black sections alternating with dark gray",
      buttonStyle:     "rounded bg-yellow-400 text-black px-8 py-3 uppercase font-bold tracking-wider hover:bg-white",
      cardStyle:       "bg-zinc-900 border border-yellow-400/30 p-6",
      dividerStyle:    "border-t-2 border-yellow-400",
      iconStyle:       "Filled yellow-400, 24px, geometric",
    },

    nicheAffinity: {
      "electrician": 10, "handyman": 8, "plumber": 6,
      "cleaning service": 5, "lawn care": 5, "restaurant": 7,
      "hair salon": 5, "nail salon": 4, "dog walker": 4,
    },
  },

  // ── 10 · EMBER ───────────────────────────────
  {
    id:          "ember",
    name:        "Ember",
    tagline:     "The kind of energy that gets things done",
    philosophy:  "bold",
    mood:        "Fired up but focused. Work ethic made visual.",

    fonts: {
      display:     "Oswald",
      body:        "Source Sans 3",
      accent:      "Oswald",
      googleFonts: "family=Oswald:wght@500;600;700&family=Source+Sans+3:wght@400;500",
    },

    colors: {
      primary:    "#C1440E",
      secondary:  "#E76F51",
      accent:     "#FFBA08",
      text:       "#1A0F08",
      textMuted:  "#8A5A42",
      background: "#FFFBF8",
      surface:    "#FFF3EC",
      border:     "#FDDBC9",
    },

    layout: {
      heroStyle:      "Bold orange hero with white text, urgency-driven headline and phone CTA",
      gridStyle:      "3-col service grid with orange-bordered cards, icon accents",
      sectionSpacing: "py-16 lg:py-24",
      borderRadius:   "rounded-lg",
      shadowStyle:    "shadow-lg shadow-orange-100",
    },

    motion: {
      pageLoad:   "Bold rise — translateY(20px)→0 opacity 0→1 over 0.4s",
      hover:      "Warm lift — translateY(-3px) shadow-orange deepen",
      transition: "transition-all duration-250 ease-out",
    },

    details: {
      backgroundStyle: "Orange gradient hero, white/amber-50 alternating sections",
      buttonStyle:     "rounded-lg bg-orange-600 text-white px-7 py-3 hover:bg-orange-700 shadow-md",
      cardStyle:       "bg-white border-l-4 border-orange-500 rounded-r-lg p-6 shadow",
      dividerStyle:    "border-t-2 border-orange-200",
      iconStyle:       "Filled orange-600, 22px, bold rounded",
    },

    nicheAffinity: {
      "plumber": 8, "handyman": 9, "electrician": 7,
      "cleaning service": 8, "lawn care": 7, "restaurant": 6,
      "hair salon": 4, "nail salon": 3, "dog walker": 5,
    },
  },

  // ── 11 · ANCHOR ──────────────────────────────
  {
    id:          "anchor",
    name:        "Anchor",
    tagline:     "Built to hold. Trusted to last.",
    philosophy:  "bold",
    mood:        "Solid authority. The name you call when it has to be right.",

    fonts: {
      display:     "Montserrat",
      body:        "Open Sans",
      accent:      "Montserrat",
      googleFonts: "family=Montserrat:wght@600;700;800;900&family=Open+Sans:wght@400;500",
    },

    colors: {
      primary:    "#1B2A4A",
      secondary:  "#2E4A7A",
      accent:     "#E63946",
      text:       "#1A2038",
      textMuted:  "#5A6880",
      background: "#F7F9FC",
      surface:    "#EDF2F8",
      border:     "#C9D6E8",
    },

    layout: {
      heroStyle:      "Navy bold hero, white headline, red accent CTA, trust badges",
      gridStyle:      "3-col grid with navy-bordered cards and badge-style service labels",
      sectionSpacing: "py-16 lg:py-24",
      borderRadius:   "rounded-lg",
      shadowStyle:    "shadow-lg shadow-blue-100",
    },

    motion: {
      pageLoad:   "Anchor drop — translateY(-10px)→0 snap over 0.35s",
      hover:      "Red accent border flash — 150ms",
      transition: "transition-all duration-200 ease-out",
    },

    details: {
      backgroundStyle: "Deep navy hero, clean white sections with occasional navy-50 break",
      buttonStyle:     "rounded-lg bg-red-600 text-white px-8 py-3 uppercase tracking-wide hover:bg-red-700",
      cardStyle:       "bg-white border border-blue-100 rounded-lg p-6 shadow-md",
      dividerStyle:    "border-t-2 border-red-500 w-12",
      iconStyle:       "Filled navy/red, 24px, solid professional",
    },

    nicheAffinity: {
      "plumber": 10, "electrician": 8, "handyman": 10,
      "cleaning service": 7, "lawn care": 6, "restaurant": 5,
      "hair salon": 4, "nail salon": 3, "dog walker": 4,
    },
  },

  // ── 12 · PETAL ───────────────────────────────
  {
    id:          "petal",
    name:        "Petal",
    tagline:     "Delicate surface. Absolute expertise.",
    philosophy:  "playful",
    mood:        "Soft femininity that means serious business.",

    fonts: {
      display:     "Cormorant Garamond",
      body:        "Nunito",
      accent:      "Dancing Script",
      googleFonts: "family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=Nunito:wght@400;600&family=Dancing+Script:wght@600",
    },

    colors: {
      primary:    "#9D4E6E",
      secondary:  "#C9789A",
      accent:     "#F7BED3",
      text:       "#2E1422",
      textMuted:  "#8A5A6E",
      background: "#FFF7FA",
      surface:    "#FEF0F5",
      border:     "#F9D0E0",
    },

    layout: {
      heroStyle:      "Soft pink hero with elegant serif headline, flower imagery, centered layout",
      gridStyle:      "3-col card grid with rose-border cards and italic service names",
      sectionSpacing: "py-20 lg:py-28",
      borderRadius:   "rounded-3xl",
      shadowStyle:    "shadow-md shadow-pink-100",
    },

    motion: {
      pageLoad:   "Petal fall — scale(0.97) opacity 0→1 over 0.8s ease-in-out",
      hover:      "Gentle bloom — scale(1.02) over 300ms",
      transition: "transition-all duration-300 ease-in-out",
    },

    details: {
      backgroundStyle: "Soft rose gradient on hero, delicate petal texture at 3% on surfaces",
      buttonStyle:     "rounded-full bg-pink-700 text-white px-8 py-3 hover:bg-pink-800 shadow-sm",
      cardStyle:       "bg-white rounded-3xl border border-pink-100 p-6 shadow-sm",
      dividerStyle:    "Thin border-t border-pink-200 with small rose SVG centered",
      iconStyle:       "Outlined rose-500, 22px, delicate stroke-width 1.5",
    },

    nicheAffinity: {
      "nail salon": 10, "hair salon": 10, "dog walker": 7,
      "restaurant": 6, "cleaning service": 5, "lawn care": 4,
      "handyman": 2, "plumber": 1, "electrician": 2,
    },
  },

];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
export function getStyleById(id: string): DesignStyle | undefined {
  return DESIGN_STYLES.find(s => s.id === id);
}

export function getTopStylesForNiche(niche: string, count = 3): DesignStyle[] {
  const lower = niche.toLowerCase();
  const scored = DESIGN_STYLES.map(style => {
    const best = Object.entries(style.nicheAffinity)
      .filter(([key]) => lower.includes(key) || key.includes(lower))
      .reduce((max, [, score]) => Math.max(max, score), 0);
    return { style, score: best || 3 };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(s => s.style);
}
