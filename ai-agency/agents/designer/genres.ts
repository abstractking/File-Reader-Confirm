// agents/designer/genres.ts
// ═════════════════════════════════════════════
//  A&M Studios — Art Genre Library
//  8 experimental design genres that layer
//  ON TOP of the 12 base styles.
//
//  Base style  = structure, layout, conversion
//  Art genre   = expression, personality, memory
//
//  "Weird enough to be remembered.
//   Clear enough to convert.
//   Built well enough to ship."
// ═════════════════════════════════════════════

export type GenreIntensity = "subtle" | "standard" | "full_send";

export interface ArtGenre {
  id:              string;
  number:          string;    // 01–08
  name:            string;
  emoji:           string;
  tagline:         string;
  mood:            string;
  energy:          "low" | "medium" | "high" | "very_high";
  abstraction:     "low" | "medium" | "high" | "very_high";

  // Visual DNA — fed directly to Claude
  visualDNA:       string[];

  // Color logic
  colorLogic: {
    description: string;
    base:        string;
    accent1:     string;
    accent2:     string;
    text:        string;
    noGradients?: boolean;
  };

  // Typography
  fonts: {
    display:  string;
    body:     string;
    accent:   string;
    googleFonts: string;
  };

  // Signature layout tricks
  layoutTricks:    string[];

  // Animation personality
  animation: {
    personality: string;
    speed:       string;
    easing:      string;
    framerSignature: string;   // Code snippet description
  };

  // CTA and voice
  ctaStyle:        string;
  voiceTone:       string;

  // CSS token overrides
  cssTokens:       string;

  // What niches this suits
  nicheAffinity:   Record<string, number>;

  // Intensity-specific guidance
  intensityGuide: {
    subtle:    string;   // 20-40% — safe for most clients
    standard:  string;   // 50-70% — portfolio sweet spot
    full_send: string;   // 80-100% — statement piece
  };

  // Which base styles blend best with this genre
  bestBaseStyles:  string[];
}

// ─────────────────────────────────────────────
// THE 8 ART GENRES
// ─────────────────────────────────────────────
export const ART_GENRES: ArtGenre[] = [

  // ── 01 · DREAMCORE / SURREALISM ──────────────
  {
    id:          "dreamcore",
    number:      "01",
    name:        "Dreamcore",
    emoji:       "🌀",
    tagline:     "The world just slightly wrong in every beautiful way",
    mood:        "Uncanny calm. Like a dream you remember wrong.",
    energy:      "low",
    abstraction: "very_high",

    visualDNA: [
      "Impossible geometry — stairs that go nowhere, shadows pointing wrong",
      "Layouts that defy grid logic — elements that overlap, float, or bleed",
      "Typography set at angles that shouldn't work but do (7°, 13°, -4°)",
      "Objects rendered too large or too small against their context",
      "Foreground/background relationships intentionally inverted",
      "Photographic + flat graphic elements at different scales combined",
    ],

    colorLogic: {
      description: "Desaturated base with one hyper-saturated accent that doesn't belong",
      base:    "#E8E4DF",
      accent1: "#7B4FFF",
      accent2: "#F0E6D3",
      text:    "#1A1614",
    },

    fonts: {
      display:     "Cormorant Garamond",
      body:        "DM Sans",
      accent:      "EB Garamond",
      googleFonts: "family=Cormorant+Garamond:ital,wght@0,400;0,600;1,400&family=DM+Sans:wght@300;400&family=EB+Garamond:ital@1",
    },

    layoutTricks: [
      "Hero: full-bleed image, text in intentionally 'wrong' quadrant (bottom-left or top-right)",
      "Elements partially cut off by viewport edge on purpose",
      "Cards with no visible boundaries — they float without containers",
      "Sections bleed into each other with no clear divider",
      "One element rotated 7–13° as an anchor for the uncanny feeling",
    ],

    animation: {
      personality:      "Extremely slow drift — 1.5s–3s easeInOut. Elements float rather than slide.",
      speed:            "1.5s–3s",
      easing:           "cubic-bezier(0.16, 1, 0.3, 1)",
      framerSignature:  "initial={{ opacity: 0, y: 30, rotate: -1 }} animate={{ opacity: 1, y: 0, rotate: 0 }} transition={{ duration: 2.2 }} / whileHover={{ rotate: 1.5, scale: 1.02, transition: { duration: 0.8 } }}",
    },

    ctaStyle:   "Quiet. No big button shape. Single underlined phrase. 'Begin.' 'Enter.' 'Come in.'",
    voiceTone:  "Second person, present tense, slightly dissociative. 'You are already here.'",

    cssTokens: `
:root {
  --genre-bg: #F5F0E8;
  --genre-bg-2: #EDE4D8;
  --genre-surface: rgba(255,255,255,0.4);
  --genre-text: #1A1614;
  --genre-text-muted: #8A7E74;
  --genre-accent: #7B4FFF;
  --genre-accent-2: #C9956C;
  --genre-border: rgba(26,22,20,0.08);
  --genre-radius: 0px;
  --genre-anim-speed: 2.2s;
  --genre-easing: cubic-bezier(0.16, 1, 0.3, 1);
}`.trim(),

    nicheAffinity: {
      "nail salon": 7, "hair salon": 7, "restaurant": 6,
      "dog walker": 5, "cleaning service": 2, "plumber": 1,
      "handyman": 1, "electrician": 1, "lawn care": 3,
    },

    intensityGuide: {
      subtle:    "One element rotated slightly. Text in an unexpected position. Everything else clean.",
      standard:  "Hero breaks the grid. One floating uncontained card. Slow drift animations.",
      full_send: "No grid. No containers. Typography at angles. Sections bleed. Full uncanny atmosphere.",
    },

    bestBaseStyles: ["bloom", "dusk", "slate", "crisp"],
  },

  // ── 02 · COTTAGECORE / ORGANIC ───────────────
  {
    id:          "cottagecore",
    number:      "02",
    name:        "Cottagecore",
    emoji:       "🌾",
    tagline:     "If your brand were a garden that grew itself",
    mood:        "Warm, unhurried, handmade with love.",
    energy:      "low",
    abstraction: "low",

    visualDNA: [
      "Hand-drawn SVG elements: botanical illustrations, rough borders, ink strokes",
      "Paper texture simulation through CSS (subtle noise, slight yellowing)",
      "Asymmetrical layouts — nothing perfectly centered",
      "Pressed flower aesthetics — delicate, dried, preserved",
      "Visible imperfection as intention: slightly uneven cards, unaligned baselines",
      "Watercolor-style color bleed at section transitions",
    ],

    colorLogic: {
      description: "Warm cream base, botanical greens, dried rose and ochre accents",
      base:    "#F7F0E3",
      accent1: "#8A9E7A",
      accent2: "#C4836A",
      text:    "#2D3821",
    },

    fonts: {
      display:     "Playfair Display",
      body:        "Nunito",
      accent:      "Lora",
      googleFonts: "family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Nunito:wght@300;400;600&family=Lora:ital@1",
    },

    layoutTricks: [
      "Services presented as journal entries or recipe cards",
      "About section: handwritten note aesthetic with ruled-paper lines behind text",
      "Gallery: polaroid-style with slight rotation per image (-2° to +3°)",
      "Testimonials: styled as handwritten letters",
      "Hero: full bleed with overlaid botanical SVG frame",
      "Botanical SVG illustrations as section dividers instead of lines",
    ],

    animation: {
      personality:      "Gentle 0.8s–1.4s — like pages turning in wind. Elements rise like petals falling.",
      speed:            "0.8s–1.4s",
      easing:           "easeOut",
      framerSignature:  "initial={{ opacity: 0, y: -20, rotate: -3 }} animate={{ opacity: 1, y: 0, rotate: 1 }} transition={{ duration: 1.2 }} / whileHover={{ rotate: 2, y: -4, transition: { duration: 0.6 } }}",
    },

    ctaStyle:   "Soft, invitation-based. Pill shapes or styled link text. 'Come find us.' 'Start your garden.'",
    voiceTone:  "First person plural, warm, like a letter from a friend. 'We do everything slowly here.'",

    cssTokens: `
:root {
  --genre-bg: #F7F0E3;
  --genre-bg-2: #EDE4D0;
  --genre-surface: #F2EAD8;
  --genre-text: #2D3821;
  --genre-text-muted: #6B7C5A;
  --genre-accent: #8A9E7A;
  --genre-accent-2: #C4836A;
  --genre-border: rgba(45,56,33,0.12);
  --genre-radius: 12px;
  --genre-anim-speed: 1.2s;
  --genre-easing: ease-out;
}`.trim(),

    nicheAffinity: {
      "lawn care": 9, "dog walker": 10, "restaurant": 8,
      "nail salon": 6, "hair salon": 6, "cleaning service": 7,
      "handyman": 4, "plumber": 2, "electrician": 1,
    },

    intensityGuide: {
      subtle:    "Slightly imperfect card alignment. Warm cream tones. One botanical SVG divider.",
      standard:  "Polaroid gallery. Recipe-card services. Soft watercolor section breaks.",
      full_send: "Full handmade world. Ruled-paper about section. Hand-drawn SVG frames everywhere. Petal fall animations.",
    },

    bestBaseStyles: ["grove", "hearth", "bloom", "dusk"],
  },

  // ── 03 · BRUTALIST WHIMSY ────────────────────
  {
    id:          "brutalist_whimsy",
    number:      "03",
    name:        "Brutalist Whimsy",
    emoji:       "🗞️",
    tagline:     "The grid as a punchline",
    mood:        "Confrontational but playful. Intentionally ugly in a way that reveals taste.",
    energy:      "high",
    abstraction: "medium",

    visualDNA: [
      "Black borders (2–4px) on everything — elements look like newspaper cutouts",
      "Type at massive scale — headlines 120–200px filling viewport width",
      "Text on colored rectangles — zine collage aesthetic",
      "Elements that overlap aggressively on purpose",
      "Grid lines visible as design elements",
      "Random-seeming block layout that is actually carefully composed chaos",
    ],

    colorLogic: {
      description:  "Flat black + raw white base, one jarring primary accent, one unexpected pastel",
      base:         "#FAFAFA",
      accent1:      "#FFE500",
      accent2:      "#FFB3C6",
      text:         "#0D0D0D",
      noGradients:  true,
    },

    fonts: {
      display:     "Space Grotesk",
      body:        "JetBrains Mono",
      accent:      "Anton",
      googleFonts: "family=Space+Grotesk:wght@700;800&family=JetBrains+Mono:wght@400;500&family=Anton",
    },

    layoutTricks: [
      "Hero: type fills 80% of viewport — image is a cutout, not background",
      "Services as classified ad columns with rule lines",
      "About: two-column newspaper layout, text bleeds edge to edge",
      "Gallery: irregular grid with overlapping cells and exposed borders",
      "Testimonials: pull quotes rotated 90° in the margin",
    ],

    animation: {
      personality:      "Fast and sudden 0.15s–0.3s. Elements snap into place. Hover = binary state changes.",
      speed:            "0.15s–0.3s",
      easing:           "easeOut",
      framerSignature:  "initial={{ opacity: 0, x: -40 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.2 }} / whileHover={{ backgroundColor: '#0D0D0D', color: '#FAFAFA' }}",
    },

    ctaStyle:   "Loud and direct. 'BOOK NOW.' 'CALL TODAY.' Big black rectangle. Uppercase always.",
    voiceTone:  "Blunt. No-nonsense. 'We fix it. You call. Done.'",

    cssTokens: `
:root {
  --genre-bg: #FAFAFA;
  --genre-bg-2: #F0F0F0;
  --genre-surface: #FFFFFF;
  --genre-text: #0D0D0D;
  --genre-text-muted: #444444;
  --genre-accent: #FFE500;
  --genre-accent-2: #FFB3C6;
  --genre-border: #0D0D0D;
  --genre-radius: 0px;
  --genre-anim-speed: 0.2s;
  --genre-easing: ease-out;
}`.trim(),

    nicheAffinity: {
      "handyman": 8, "plumber": 7, "electrician": 7,
      "restaurant": 9, "cleaning service": 5, "lawn care": 5,
      "nail salon": 4, "hair salon": 5, "dog walker": 4,
    },

    intensityGuide: {
      subtle:    "Slightly oversized headline. One bordered element. Monospace body font.",
      standard:  "Newspaper layout. Classified-ad services section. Bold grid borders.",
      full_send: "Full zine. 200px headlines. Overlapping elements. 90° rotated testimonials. Binary hover states.",
    },

    bestBaseStyles: ["ember", "volt", "anchor", "crisp"],
  },

  // ── 04 · MAXIMALIST POP ──────────────────────
  {
    id:          "maximalist_pop",
    number:      "04",
    name:        "Maximalist Pop",
    emoji:       "🎪",
    tagline:     "More is more. Then add more.",
    mood:        "Pure joy. Impossible to be sad on this website.",
    energy:      "very_high",
    abstraction: "low",

    visualDNA: [
      "Every element competing for attention — and somehow it works",
      "Overlapping sticker-style elements at various rotations",
      "Rainbow gradients used freely and fearlessly",
      "Thick outlines on everything (3–5px) like cartoon cells",
      "Mixed patterns: polka dots, stripes, stars, squiggles in same layout",
      "Confetti, stars, hearts as actual layout elements not decorations",
    ],

    colorLogic: {
      description: "Maximum saturation, minimum restraint. At least 4 colors active at once.",
      base:    "#FFFFFF",
      accent1: "#FF3366",
      accent2: "#FFD700",
      text:    "#1A0A2E",
    },

    fonts: {
      display:     "Fredoka One",
      body:        "Nunito",
      accent:      "Poppins",
      googleFonts: "family=Fredoka+One&family=Nunito:wght@400;600;700&family=Poppins:wght@700;800;900",
    },

    layoutTricks: [
      "Sticker-pile hero: elements piled and rotated like a mood board",
      "Service cards shaped as badges, stamps, or tickets",
      "Gallery as a scrapbook with mixed sizes and rotations",
      "Testimonials in speech bubbles with portrait stickers",
      "Floating emoji and stars as decorative elements throughout",
    ],

    animation: {
      personality:      "Spring physics. Bouncy overshoot on everything. Continuous wiggle on key elements.",
      speed:            "0.4s–0.8s with spring",
      easing:           "cubic-bezier(0.34, 1.56, 0.64, 1)",
      framerSignature:  "initial={{ scale: 0, rotate: -10 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 200, damping: 10 }} / whileHover={{ scale: 1.1, rotate: 3 }}",
    },

    ctaStyle:   "Fun, punchy, all-caps with exclamation. 'LET'S GO!' 'BOOK ME NOW!' 'YES PLEASE!'",
    voiceTone:  "Energetic, friendly, uses exclamation marks unironically. 'We LOVE what we do!'",

    cssTokens: `
:root {
  --genre-bg: #FFFFFF;
  --genre-bg-2: #FFF0F5;
  --genre-surface: #FFF8E1;
  --genre-text: #1A0A2E;
  --genre-text-muted: #6B5B7B;
  --genre-accent: #FF3366;
  --genre-accent-2: #FFD700;
  --genre-border: #1A0A2E;
  --genre-radius: 20px;
  --genre-anim-speed: 0.5s;
  --genre-easing: cubic-bezier(0.34, 1.56, 0.64, 1);
}`.trim(),

    nicheAffinity: {
      "nail salon": 10, "dog walker": 9, "hair salon": 8,
      "restaurant": 7, "cleaning service": 5, "lawn care": 4,
      "handyman": 3, "plumber": 2, "electrician": 2,
    },

    intensityGuide: {
      subtle:    "Slightly bouncy animations. One badge-style element. Cheerful color pops.",
      standard:  "Sticker-style service cards. Speech bubble testimonials. Spring animations.",
      full_send: "Full scrapbook layout. Everything rotated. Confetti elements. Maximum color. Spring physics on everything.",
    },

    bestBaseStyles: ["petal", "bloom", "hearth", "grove"],
  },

  // ── 05 · DARK FANTASIA ───────────────────────
  {
    id:          "dark_fantasia",
    number:      "05",
    name:        "Dark Fantasia",
    emoji:       "🌙",
    tagline:     "Ancient power, modern craft",
    mood:        "Mysterious luxury. Premium quality announced without speaking.",
    energy:      "medium",
    abstraction: "high",

    visualDNA: [
      "Deep jewel-toned backgrounds — midnight purple, forest black, blood garnet",
      "Gold and amber as the only warm elements — they glow against the dark",
      "Intricate border frames — art nouveau, baroque, celtic knot-inspired",
      "Typography that feels inscribed, not printed",
      "Subtle texture: aged parchment, hammered metal, woven fabric",
      "Celestial motifs: stars, moon phases, constellation lines",
    ],

    colorLogic: {
      description: "Deep dark base with gold accents that feel like candlelight",
      base:    "#0C0A14",
      accent1: "#C9A84C",
      accent2: "#6B2FA0",
      text:    "#FFD77A",
    },

    fonts: {
      display:     "Cinzel",
      body:        "EB Garamond",
      accent:      "IM Fell English",
      googleFonts: "family=Cinzel:wght@400;600;700&family=EB+Garamond:ital,wght@0,400;1,400&family=IM+Fell+English:ital@1",
    },

    layoutTricks: [
      "Hero: dark full-bleed with gold text — feels like an ancient announcement",
      "Services inside ornate bordered frames with corner flourishes",
      "About: candlelit portrait aesthetic with vignette",
      "Gallery: presented as artifacts in a cabinet of curiosities",
      "Testimonials: presented as sealed letters or sworn testimonies",
      "Section dividers: thin gold line with central ornament",
    ],

    animation: {
      personality:      "Slow and intentional 1s–2s. Elements materialise like fog gathering.",
      speed:            "1s–2s",
      easing:           "cubic-bezier(0.22, 1, 0.36, 1)",
      framerSignature:  "initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }} / whileHover={{ borderColor: '#C9A84C', transition: { duration: 0.4 } }}",
    },

    ctaStyle:   "Regal and understated. 'Summon us.' 'Begin the work.' 'Enter.' Gold bordered.",
    voiceTone:  "Elevated, unhurried, speaks in complete sentences. 'Excellence is not a service. It is a standard.'",

    cssTokens: `
:root {
  --genre-bg: #0C0A14;
  --genre-bg-2: #1A0E2E;
  --genre-surface: #241533;
  --genre-text: #FFD77A;
  --genre-text-muted: #9B8FA8;
  --genre-accent: #C9A84C;
  --genre-accent-2: #6B2FA0;
  --genre-border: rgba(201,168,76,0.2);
  --genre-radius: 4px;
  --genre-anim-speed: 1.4s;
  --genre-easing: cubic-bezier(0.22, 1, 0.36, 1);
}`.trim(),

    nicheAffinity: {
      "hair salon": 9, "nail salon": 8, "restaurant": 10,
      "dog walker": 4, "cleaning service": 3, "lawn care": 2,
      "handyman": 1, "plumber": 1, "electrician": 2,
    },

    intensityGuide: {
      subtle:    "Dark color scheme. Gold accents. Clean serif type. One ornate border element.",
      standard:  "Cabinet-of-curiosities gallery. Gold dividers. Slow materialise animations.",
      full_send: "Full dark luxe world. Ornate frames. Celestial motifs. Fog-gather animations. Regal copy voice.",
    },

    bestBaseStyles: ["slate", "dusk", "anchor"],
  },

  // ── 06 · RETROFUTURISM ───────────────────────
  {
    id:          "retrofuturism",
    number:      "06",
    name:        "Retrofuturism",
    emoji:       "🚀",
    tagline:     "The future as imagined in 1975",
    mood:        "Optimistic nostalgia. Progress that smells like chrome and vinyl.",
    energy:      "high",
    abstraction: "medium",

    visualDNA: [
      "Chrome gradients — metallic sheens on type and borders",
      "Star fields and space imagery used sincerely, not ironically",
      "Geometric shapes from the atomic age: starbursts, boomerangs, arcs",
      "Retro grid lines and dot matrix textures",
      "CRT scan line overlays on dark backgrounds",
      "Typography with that optimistic 70s science font energy",
    ],

    colorLogic: {
      description: "Electric blues, chrome silver, deep space black with warm amber highlights",
      base:    "#0A0E1A",
      accent1: "#00D4FF",
      accent2: "#FF6B35",
      text:    "#E8F4F8",
    },

    fonts: {
      display:     "Barlow Condensed",
      body:        "DM Sans",
      accent:      "VT323",
      googleFonts: "family=Barlow+Condensed:wght@500;600;700;800&family=DM+Sans:wght@400;500&family=VT323",
    },

    layoutTricks: [
      "Hero: space-age announcement — large geometric background shape, chrome text",
      "Services: presented on brushed metal cards with atomic-age icons",
      "Timeline/process section: like a mission briefing",
      "Stats section: large numbers with retro-futurist counter animation",
      "CRT scanline overlay effect on hero using CSS",
    ],

    animation: {
      personality:      "Mechanical precision — things move like machinery. Fast then instant stop.",
      speed:            "0.3s–0.6s",
      easing:           "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      framerSignature:  "initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4, ease: 'easeOut' }} / whileHover={{ borderColor: '#00D4FF', boxShadow: '0 0 20px rgba(0,212,255,0.3)' }}",
    },

    ctaStyle:   "Mission-briefing style. 'Launch your site.' 'Begin mission.' 'Activate.' Blue glow border.",
    voiceTone:  "Confident, forward-looking, uses 'we' and 'the future'. 'The future of your business starts today.'",

    cssTokens: `
:root {
  --genre-bg: #0A0E1A;
  --genre-bg-2: #0F1628;
  --genre-surface: #161D35;
  --genre-text: #E8F4F8;
  --genre-text-muted: #7A9DB5;
  --genre-accent: #00D4FF;
  --genre-accent-2: #FF6B35;
  --genre-border: rgba(0,212,255,0.25);
  --genre-radius: 4px;
  --genre-anim-speed: 0.4s;
  --genre-easing: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}`.trim(),

    nicheAffinity: {
      "electrician": 9, "hvac": 8, "plumber": 6,
      "cleaning service": 5, "lawn care": 4, "handyman": 6,
      "restaurant": 5, "nail salon": 3, "hair salon": 4, "dog walker": 3,
    },

    intensityGuide: {
      subtle:    "Dark background with blue accents. Condensed headline font. One geometric shape element.",
      standard:  "Metal-card services. CRT overlay on hero. Counter animations on stats.",
      full_send: "Full space-age world. Scanlines. Starfield. Chrome gradients. Mission-briefing copy.",
    },

    bestBaseStyles: ["volt", "slate", "anchor", "crisp"],
  },

  // ── 07 · ABSTRACT EXPRESSIONISM ──────────────
  {
    id:          "abstract_expressionism",
    number:      "07",
    name:        "Abstract Expressionism",
    emoji:       "🎨",
    tagline:     "Emotion as architecture",
    mood:        "Art gallery confidence. The work doesn't need to explain itself.",
    energy:      "medium",
    abstraction: "very_high",

    visualDNA: [
      "Large fields of pure color as entire sections",
      "Asymmetric composition — negative space is a design element",
      "Typography at architectural scale — text as object not message",
      "Gestural marks: brush stroke SVGs, ink bleed effects",
      "Color blocking with unexpected combinations that vibrate against each other",
      "Photos treated with color overlays, duotones, or high contrast",
    ],

    colorLogic: {
      description: "Bold color fields that vibrate against each other. Unexpected combinations.",
      base:    "#F2EDE4",
      accent1: "#E85D24",
      accent2: "#2F4CC9",
      text:    "#0D0D0D",
    },

    fonts: {
      display:     "Fraunces",
      body:        "Cormorant",
      accent:      "Bebas Neue",
      googleFonts: "family=Fraunces:ital,wght@0,700;0,900;1,400&family=Cormorant:wght@400;500&family=Bebas+Neue",
    },

    layoutTricks: [
      "Hero: full-bleed color field, large single word or phrase",
      "Services: each on its own color field block — no traditional cards",
      "About: editorial two-column, image treated with color overlay",
      "Gallery: color-blocked grid, some cells are pure color, some are photos",
      "Typography at architectural scale — one word filling 60% of a section",
    ],

    animation: {
      personality:      "Color fields breathe and shift slowly. Gestural entrances — like a brushstroke.",
      speed:            "1.5s–3s",
      easing:           "cubic-bezier(0.33, 1, 0.68, 1)",
      framerSignature:  "animate={{ backgroundColor: ['#E85D24', '#D44F9A', '#2F4CC9'] }} transition={{ duration: 8, repeat: Infinity, repeatType: 'mirror' }} / initial={{ opacity: 0, scale: 0.95, rotate: -2 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} transition={{ duration: 1.8 }}",
    },

    ctaStyle:   "Text only. Single color. No button shape. 'See more.' 'Enter the work.' 'Begin.'",
    voiceTone:  "Minimal and elliptic. Let visuals do 90% of talking. Short, confident sentences.",

    cssTokens: `
:root {
  --genre-bg: #F2EDE4;
  --genre-bg-2: #E8E0D4;
  --genre-surface: #FFFFFF;
  --genre-text: #0D0D0D;
  --genre-text-muted: #5A5248;
  --genre-accent: #E85D24;
  --genre-accent-2: #2F4CC9;
  --genre-border: rgba(13,13,13,0.1);
  --genre-radius: 0px;
  --genre-anim-speed: 1.8s;
  --genre-easing: cubic-bezier(0.33, 1, 0.68, 1);
}`.trim(),

    nicheAffinity: {
      "nail salon": 8, "hair salon": 9, "restaurant": 9,
      "dog walker": 5, "cleaning service": 4, "lawn care": 3,
      "handyman": 2, "plumber": 2, "electrician": 3,
    },

    intensityGuide: {
      subtle:    "One color-field section. Oversized single word. Slightly gestural entrance.",
      standard:  "Color-blocked service sections. Editorial about layout. Breathing color animation.",
      full_send: "Full gallery experience. No traditional cards. Pure color fields. Architectural typography. Brushstroke SVGs.",
    },

    bestBaseStyles: ["slate", "crisp", "dusk", "bloom"],
  },

  // ── 08 · KINETIC / MOTION-FIRST ──────────────
  {
    id:          "kinetic",
    number:      "08",
    name:        "Kinetic",
    emoji:       "⚡",
    tagline:     "Animation is not decoration — it is the structure",
    mood:        "Alive. Anticipatory. Everything wants to move.",
    energy:      "very_high",
    abstraction: "medium",

    visualDNA: [
      "Layouts that only make sense in motion — stacked layers revealed by scroll",
      "Text that types itself, morphs between states, counts up/down",
      "SVG path animations — borders draw themselves, icons assemble",
      "Elements that respond to cursor position (parallax on mousemove)",
      "Loading sequences that are part of the brand experience",
      "Counter animations that run when entering viewport",
    ],

    colorLogic: {
      description: "Clean base — motion is the star. One accent color on all animated elements.",
      base:    "#0D0D0D",
      accent1: "#00FF87",
      accent2: "#FFFFFF",
      text:    "#F0F0F0",
    },

    fonts: {
      display:     "Inter",
      body:        "Plus Jakarta Sans",
      accent:      "Geist Mono",
      googleFonts: "family=Inter:wght@400;500;600;700;800&family=Plus+Jakarta+Sans:wght@400;500;600&family=Geist+Mono:wght@400;500",
    },

    layoutTricks: [
      "Hero: text types itself in on load, cursor blinks",
      "Stats section: large numbers count up when entering viewport",
      "Services: SVG icons draw themselves on scroll into view",
      "CTA button: magnetic — snaps toward cursor within 80px",
      "Navbar: transforms on scroll — shrinks, color changes",
      "Progress bar that fills as user scrolls the page",
    ],

    animation: {
      personality:      "Mix of lightning-fast micro (0.1s) and slow macro (2s+). Spring physics on interactive.",
      speed:            "0.1s micro — 2s+ macro",
      easing:           "spring physics",
      framerSignature:  "// SVG path draw: initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ duration: 1.5 }} // Counter: useInView + useSpring from 0 to value // Magnetic button: useMotionValue x,y + onMouseMove lerp",
    },

    ctaStyle:   "The button IS the animation. Magnetic. Border draws itself on hover. 'Start.' 'Launch.' 'Build.'",
    voiceTone:  "Present tense verbs. Action-first. Short. 'Build. Launch. Grow. Now.'",

    cssTokens: `
:root {
  --genre-bg: #0D0D0D;
  --genre-bg-2: #111111;
  --genre-surface: #1A1A1A;
  --genre-text: #F0F0F0;
  --genre-text-muted: #888888;
  --genre-accent: #00FF87;
  --genre-accent-2: #FFFFFF;
  --genre-border: rgba(0,255,135,0.2);
  --genre-radius: 8px;
  --genre-anim-speed: 0.1s;
  --genre-easing: spring;
}`.trim(),

    nicheAffinity: {
      "electrician": 8, "hvac": 7, "plumber": 6,
      "cleaning service": 5, "handyman": 6, "lawn care": 5,
      "restaurant": 6, "nail salon": 5, "hair salon": 5, "dog walker": 5,
    },

    intensityGuide: {
      subtle:    "Subtle typing animation on headline. One counter. Smooth scroll reveal.",
      standard:  "SVG icon draws. Counting stats. Magnetic CTA button. Cursor parallax on hero.",
      full_send: "Full kinetic experience. Everything animates. Scroll-driven timeline. Magnetic elements. Typed text.",
    },

    bestBaseStyles: ["volt", "crisp", "slate", "ember"],
  },

  // ── 09 · WABI-SABI ───────────────────────────
  {
    id:          "wabi_sabi",
    number:      "09",
    name:        "Wabi-Sabi",
    emoji:       "🍂",
    tagline:     "Beauty in imperfection, permanence in transience",
    mood:        "Calm, grounded, and contemplative — quiet confidence that doesn't need to shout.",
    energy:      "low",
    abstraction: "medium",

    visualDNA: [
      "Paper and linen textures via CSS SVG feTurbulence noise filters at 10–15% opacity",
      "Kintsugi gold accents — thin gold lines that appear to 'repair' visual breaks between sections",
      "Organic irregular shapes — hand-drawn-looking borders via SVG paths with slight wobble",
      "Matte finishes everywhere — zero glossy gradients, zero box-shadows; chalky flat surfaces",
      "Asymmetric 65/35 column splits using CSS Grid — nothing perfectly symmetrical",
      "Generous negative space (Ma) — 60–80px section padding; whitespace IS the design",
    ],

    colorLogic: {
      description: "Warm aged neutrals dominate 90% — gold and moss appear only as intentional accent moments",
      base:    "#F5F0E8",
      accent1: "#C9A96E",
      accent2: "#7A8B6F",
      text:    "#3B3632",
    },

    fonts: {
      display:     "Cormorant Garamond",
      body:        "EB Garamond",
      accent:      "Caveat",
      googleFonts: "family=Cormorant+Garamond:ital,wght@0,300;0,400;1,400&family=EB+Garamond:wght@400;500&family=Caveat:wght@400;500",
    },

    layoutTricks: [
      "Offset grid items — transform: translate(8px, -6px) breaks items slightly off strict alignment",
      "Single-column reading flow — text blocks max-width 640px centered in generous margins",
      "Kintsugi section breaks — thin gold border-top with small gold circle centered on the line",
      "Texture-layered cards — paper-grain ::before pseudo-element at mix-blend-mode: multiply",
      "Staggered image grids — unequal heights and vertical offset, mimicking gallery wall arrangements",
    ],

    animation: {
      personality:      "Steam rising from tea — fade-ins at 800–1200ms cubic-bezier(0.25, 0.1, 0.25, 1). No bounce, no spring.",
      speed:            "800ms–1200ms",
      easing:           "cubic-bezier(0.25, 0.1, 0.25, 1)",
      framerSignature:  "initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 1.0, ease: [0.25, 0.1, 0.25, 1] }} / whileHover={{ scale: 1.01, transition: { duration: 0.8 } }}",
    },

    ctaStyle:   "Understated text links or minimal outlined buttons. 'Find us.' 'Begin here.' 'Come in.' Never loud.",
    voiceTone:  "Unhurried and contemplative. Present tense. Short sentences with breathing room between them.",

    cssTokens: `
:root {
  --genre-bg: #F5F0E8;
  --genre-bg-2: #E8E0D4;
  --genre-surface: rgba(245,240,232,0.8);
  --genre-text: #3B3632;
  --genre-text-muted: #8B8178;
  --genre-accent: #C9A96E;
  --genre-accent-2: #7A8B6F;
  --genre-border: rgba(59,54,50,0.1);
  --genre-radius: 2px;
  --genre-anim-speed: 1.0s;
  --genre-easing: cubic-bezier(0.25, 0.1, 0.25, 1);
}`.trim(),

    nicheAffinity: {
      "nail salon": 7, "hair salon": 8, "restaurant": 9,
      "dog walker": 5, "cleaning service": 4, "lawn care": 6,
      "handyman": 2, "plumber": 2, "electrician": 2,
    },

    intensityGuide: {
      subtle:    "Warm cream tones. One gold divider line. Slightly imperfect card edges. Slow fades.",
      standard:  "Offset grid. Kintsugi section repairs. Texture overlays. Asymmetric columns.",
      full_send: "Full wabi-sabi world. Visible grain everywhere. Nothing centered. Gold repairs. Ma space dominant.",
    },

    bestBaseStyles: ["dusk", "grove", "crisp", "breeze"],
  },

  // ── 10 · RISOGRAPH ───────────────────────────
  {
    id:          "risograph",
    number:      "10",
    name:        "Risograph",
    emoji:       "🖨️",
    tagline:     "Two inks, one paper, infinite charm",
    mood:        "Warm, artisanal, community-minded, confidently creative — signals craft without preciousness.",
    energy:      "medium",
    abstraction: "low",

    visualDNA: [
      "2–3 spot color limitation — new colors emerge only where layers overlap via mix-blend-mode: multiply",
      "Halftone dot patterns — visible rasterization via repeating radial-gradient CSS patterns",
      "Deliberate misregistration — colored layers offset 2–4px using transform on pseudo-elements",
      "Paper-grain texture — warm cream background with SVG feTurbulence noise overlay at 12–18% opacity",
      "Overprint color mixing — two overlapping shapes create a third color through mix-blend-mode: multiply",
      "Bold geometric shapes as compositional elements that interact through blending modes",
    ],

    colorLogic: {
      description: "Pick any 2–3 Risograph ink colors per project — overlaps create the third color automatically",
      base:    "#F5F0E8",
      accent1: "#FF48B0",
      accent2: "#0078BF",
      text:    "#435060",
    },

    fonts: {
      display:     "Syne",
      body:        "Work Sans",
      accent:      "Space Mono",
      googleFonts: "family=Syne:wght@700;800&family=Work+Sans:wght@400;500;600&family=Space+Mono:wght@400",
    },

    layoutTricks: [
      "Overprint hero — two overlapping colored divs with mix-blend-mode: multiply inside an isolate container",
      "Misregistration text — headlines with ::before and ::after in each spot color offset 2px opposite directions",
      "Editorial 2–3 column grid — clean column layouts with generous gutters like a printed publication",
      "Grain overlay layer — full-page ::before with inline SVG feTurbulence at mix-blend-mode: multiply",
      "Color-layer scroll reveals — first color layer slides in, second follows 200ms later and overlaps",
    ],

    animation: {
      personality:      "Restrained and print-inspired. Misregistration shifts on hover. Grain animates on scroll. 300–500ms ease-out.",
      speed:            "300ms–500ms",
      easing:           "ease-out",
      framerSignature:  "initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }} / whileHover={{ x: 2, transition: { duration: 0.2 } }} // misregistration shift",
    },

    ctaStyle:   "Confident and editorial. Solid ink-colored buttons with paper texture. 'Book now.' 'Find us.' Direct.",
    voiceTone:  "Community-warm, slightly indie. 'Handmade with care.' 'Local and proud.' Never corporate.",

    cssTokens: `
:root {
  --genre-bg: #F5F0E8;
  --genre-bg-2: #EDE8DC;
  --genre-surface: #FFFFFF;
  --genre-text: #435060;
  --genre-text-muted: #7A8A9A;
  --genre-accent: #FF48B0;
  --genre-accent-2: #0078BF;
  --genre-border: rgba(67,80,96,0.15);
  --genre-radius: 4px;
  --genre-anim-speed: 0.4s;
  --genre-easing: ease-out;
}`.trim(),

    nicheAffinity: {
      "restaurant": 9, "nail salon": 7, "hair salon": 7,
      "cleaning service": 6, "dog walker": 8, "lawn care": 5,
      "handyman": 5, "plumber": 4, "electrician": 4,
    },

    intensityGuide: {
      subtle:    "Slight grain texture. One overprint color moment. Monospace accent font.",
      standard:  "Two-color print palette. Misregistration headline. Editorial column grid.",
      full_send: "Full Riso world. Overprint hero. Grain everywhere. Color-layer reveals. Limited palette discipline.",
    },

    bestBaseStyles: ["hearth", "grove", "breeze", "crisp"],
  },

  // ── 11 · SWISS / BAUHAUS ─────────────────────
  {
    id:          "swiss_bauhaus",
    number:      "11",
    name:        "Swiss / Bauhaus",
    emoji:       "🔲",
    tagline:     "Form follows function — beauty through purpose",
    mood:        "Clean, confident, objective, trustworthy, and quietly authoritative. Design as communication.",
    energy:      "medium",
    abstraction: "low",

    visualDNA: [
      "Mathematical grid system — strict 12-column modular grid with 24px gutters governing all placement",
      "Primary-color geometric accents — yellow triangles, red squares, blue circles deployed sparingly",
      "Typography as primary visual element — large bold sans-serif headlines ARE the design",
      "Flat color fields with hard edges — solid blocks meeting at clean boundaries, zero gradients",
      "Asymmetric balance — content offset but balanced through visual weight of type and color",
      "Black structural rules — thin horizontal and vertical lines separating content into clear zones",
    ],

    colorLogic: {
      description: "Bauhaus primary triad — used sparingly. Neutrals carry 70%+. One dominant accent per page.",
      base:    "#F5F2E8",
      accent1: "#C8302A",
      accent2: "#1E3878",
      text:    "#1A1A18",
    },

    fonts: {
      display:     "Jost",
      body:        "Inter",
      accent:      "Bebas Neue",
      googleFonts: "family=Jost:wght@400;500;600;700&family=Inter:wght@400;500&family=Bebas+Neue",
    },

    layoutTricks: [
      "Asymmetric column spanning — items at col-span-7 and col-span-5 within 12-column grid",
      "Typography-as-hero — hero with only text: massive 96px headline, subhead, CTA — nothing else",
      "Primary-color accent blocks — one large geometric shape anchors an entire section",
      "Structural black rules — border-bottom: 1px solid #1A1A18 between every major section",
      "Modular spacing system — strict 8px base unit with mathematical multiples throughout",
    ],

    animation: {
      personality:      "Minimal and mechanical. Serves communication, never decoration. Quick precise 150–300ms.",
      speed:            "150ms–300ms",
      easing:           "cubic-bezier(0.4, 0, 0.2, 1)",
      framerSignature:  "initial={{ opacity: 0, x: -24 }} animate={{ opacity: 1, x: 0 }} transition={{ duration: 0.25, ease: [0.4, 0, 0.2, 1] }} / whileHover={{ backgroundColor: '#C8302A', color: '#F5F2E8' }}",
    },

    ctaStyle:   "Direct and functional. 'Call now.' 'Get a quote.' 'Book today.' No poetry — just action.",
    voiceTone:  "Objective and professional. Facts-first. Short declarative sentences. 'We fix pipes. On time. Every time.'",

    cssTokens: `
:root {
  --genre-bg: #F5F2E8;
  --genre-bg-2: #E8E4D8;
  --genre-surface: #FFFFFF;
  --genre-text: #1A1A18;
  --genre-text-muted: #6A6A68;
  --genre-accent: #C8302A;
  --genre-accent-2: #1E3878;
  --genre-border: #1A1A18;
  --genre-radius: 0px;
  --genre-anim-speed: 0.25s;
  --genre-easing: cubic-bezier(0.4, 0, 0.2, 1);
}`.trim(),

    nicheAffinity: {
      "plumber": 10, "electrician": 10, "hvac": 9, "handyman": 9,
      "cleaning service": 8, "lawn care": 7, "restaurant": 5,
      "nail salon": 3, "hair salon": 3, "dog walker": 4,
    },

    intensityGuide: {
      subtle:    "Geometric sans font. One structural rule line. Left-aligned everything.",
      standard:  "Primary-color accent block. Asymmetric grid. Typography-dominant hero.",
      full_send: "Full Bauhaus rationalism. No decoration. Pure grid. Type IS the design. Primary colors only.",
    },

    bestBaseStyles: ["crisp", "volt", "anchor", "ember"],
  },

  // ── 12 · ART DECO REVIVAL ────────────────────
  {
    id:          "art_deco",
    number:      "12",
    name:        "Art Deco Revival",
    emoji:       "✦",
    tagline:     "Geometric glamour — the Gatsby era, pixel-perfect",
    mood:        "Sophisticated, celebratory, timeless, confidently elegant. Public luxury, never mysterious.",
    energy:      "medium",
    abstraction: "low",

    visualDNA: [
      "Sunburst/fan radiations — lines radiating from a central point as hero backgrounds or dividers",
      "Gold metallic gradient accents — linear-gradient(135deg, #C9B07E, #E3B23C, #D4AF37, #C9B07E) on borders and text",
      "Stepped geometric frames — tiered rectangular borders with corner ornaments around content",
      "Chevron and zigzag borders — repeating V-shape decorative separators between sections as SVGs",
      "Strong bilateral symmetry — hero and CTAs perfectly centered on vertical axis",
      "Fluted vertical line textures — thin parallel lines as subtle backgrounds via repeating linear-gradient",
    ],

    colorLogic: {
      description: "Dark navy dominates 60%, cream for text areas 25%, gold accents 10–15% maximum",
      base:    "#F2E7D5",
      accent1: "#D4AF37",
      accent2: "#0B2A3C",
      text:    "#0F0F12",
    },

    fonts: {
      display:     "Playfair Display",
      body:        "Cormorant Garamond",
      accent:      "Josefin Sans",
      googleFonts: "family=Playfair+Display:wght@700;900&family=Cormorant+Garamond:wght@400;500&family=Josefin+Sans:wght@300;400",
    },

    layoutTricks: [
      "Centered symmetrical heroes — text and CTA on vertical axis, flanked by gold line elements",
      "Ornamental SVG dividers — horizontal gold lines with diamond or circle centerpieces between sections",
      "Stepped card frames — nested outline and outline-offset in CSS creating tiered rectangular borders",
      "Tall narrow section proportions — vertical emphasis with py-24 to py-32 and max-w-4xl widths",
      "Gold shimmer interaction — background-position animation on gold gradient for metallic shimmer on hover",
    ],

    animation: {
      personality:      "Elegant and deliberate. SVG ornamental borders draw themselves. Parallax on patterns. 400–600ms.",
      speed:            "400ms–600ms",
      easing:           "cubic-bezier(0.25, 0.46, 0.45, 0.94)",
      framerSignature:  "initial={{ opacity: 0, scale: 0.98 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.5, ease: [0.25, 0.46, 0.45, 0.94] }} / whileHover={{ borderColor: '#D4AF37' }}",
    },

    ctaStyle:   "Regal and gracious. 'Reserve your table.' 'Begin.' 'Enter.' Gold-bordered, never shouting.",
    voiceTone:  "Elevated, unhurried, complete sentences. 'We have been perfecting our craft since day one.'",

    cssTokens: `
:root {
  --genre-bg: #F2E7D5;
  --genre-bg-2: #E8D9C0;
  --genre-surface: #FFFFFF;
  --genre-text: #0F0F12;
  --genre-text-muted: #6B5A3E;
  --genre-accent: #D4AF37;
  --genre-accent-2: #0B2A3C;
  --genre-border: rgba(212,175,55,0.4);
  --genre-radius: 2px;
  --genre-anim-speed: 0.5s;
  --genre-easing: cubic-bezier(0.25, 0.46, 0.45, 0.94);
}`.trim(),

    nicheAffinity: {
      "restaurant": 10, "hair salon": 9, "nail salon": 8,
      "cleaning service": 4, "dog walker": 3, "lawn care": 3,
      "handyman": 2, "plumber": 3, "electrician": 3,
    },

    intensityGuide: {
      subtle:    "Gold accent divider line. Uppercase tracked serif headline. One ornamental element.",
      standard:  "Sunburst background. Stepped card frames. Gold shimmer on CTAs.",
      full_send: "Full Gatsby world. Radiating lines. SVG ornamental borders draw in. Gold everything. Bilateral symmetry.",
    },

    bestBaseStyles: ["slate", "dusk", "anchor", "bloom"],
  },

  // ── 13 · SOLARPUNK ───────────────────────────
  {
    id:          "solarpunk",
    number:      "13",
    name:        "Solarpunk",
    emoji:       "🌿",
    tagline:     "Nature and technology in perfect harmony",
    mood:        "Hopeful, warm, communal, lush, gently innovative — a utopia that feels achievable.",
    energy:      "medium",
    abstraction: "low",

    visualDNA: [
      "Art Nouveau whiplash curves — sinuous S-curves for borders and section dividers as SVG paths",
      "Stained-glass panel motifs — geometric cells with colored semi-transparent fills and dark leading lines",
      "Botanical SVG overlays — vine tendrils and leaf silhouettes integrated into UI corners and edges",
      "Wavy section dividers — organic wave shapes between sections replacing all straight horizontal lines",
      "Arch-shaped containers — sections with border-radius: 2rem 2rem 0 0 creating greenhouse silhouettes",
      "Sunburst radial glows — soft gold radial-gradient behind hero sections suggesting sunlight through glass",
    ],

    colorLogic: {
      description: "Green and teal carry visual weight — palette feels like sunlight filtering through a greenhouse",
      base:    "#FFFFF0",
      accent1: "#4CAF50",
      accent2: "#FFD700",
      text:    "#264653",
    },

    fonts: {
      display:     "Playfair Display",
      body:        "Lora",
      accent:      "Josefin Sans",
      googleFonts: "family=Playfair+Display:ital,wght@0,400;0,700;1,400&family=Lora:wght@400;500&family=Josefin+Sans:wght@300;400",
    },

    layoutTricks: [
      "Greenhouse arch sections — border-radius: 2rem 2rem 0 0 with backdrop-filter: blur(8px) glass panels",
      "Organic wave dividers — every section boundary uses custom SVG wave shape in palette greens",
      "Vine-border cards — service cards with SVG botanical elements at corners growing in on scroll",
      "Terraced content stepping — sections overlap with rounded top edges like green hillside terraces",
      "Sunlight radial behind hero — soft gold radial-gradient at top-center suggesting warm sunlight",
    ],

    animation: {
      personality:      "Nature-paced. Plants growing (scale 0.85 to 1 over 600ms). Vine borders draw on scroll. Breeze-like.",
      speed:            "500ms–1000ms",
      easing:           "ease-in-out",
      framerSignature:  "initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 0.7, ease: 'easeInOut' }} / whileHover={{ y: -4, transition: { duration: 0.4 } }}",
    },

    ctaStyle:   "Invitation-based and warm. 'Grow with us.' 'Start fresh.' 'Let's plant something.' Arch-shaped pill buttons.",
    voiceTone:  "Communal and optimistic. 'We believe in better.' Forward-looking. Emphasizes care and sustainability.",

    cssTokens: `
:root {
  --genre-bg: #FFFFF0;
  --genre-bg-2: #F0FFF0;
  --genre-surface: rgba(240,255,240,0.8);
  --genre-text: #264653;
  --genre-text-muted: #4A7A5E;
  --genre-accent: #4CAF50;
  --genre-accent-2: #FFD700;
  --genre-border: rgba(76,175,80,0.25);
  --genre-radius: 32px;
  --genre-anim-speed: 0.7s;
  --genre-easing: ease-in-out;
}`.trim(),

    nicheAffinity: {
      "lawn care": 10, "cleaning service": 9, "dog walker": 8,
      "restaurant": 7, "nail salon": 5, "hair salon": 5,
      "handyman": 6, "plumber": 4, "electrician": 4,
    },

    intensityGuide: {
      subtle:    "Arch-rounded sections. One wave divider. Green accent color. Leaf detail on CTA.",
      standard:  "Greenhouse card panels. Vine-corner details. Wave section transitions. Terraced layout.",
      full_send: "Full solarpunk world. Stained-glass grid hero. SVG botanicals everywhere. Vines draw in on scroll.",
    },

    bestBaseStyles: ["grove", "breeze", "summit", "hearth"],
  },

  // ── 14 · VAPORWAVE / Y2K ─────────────────────
  {
    id:          "vaporwave",
    number:      "14",
    name:        "Vaporwave / Y2K",
    emoji:       "💿",
    tagline:     "The future as remembered, the past as dreamed",
    mood:        "Dreamy, nostalgic, simultaneously ironic and earnest — scrolling through a Y2K time capsule.",
    energy:      "high",
    abstraction: "medium",

    visualDNA: [
      "Iridescent multi-stop gradients — pink→purple→teal→orange diagonal backgrounds and text fills",
      "Glassmorphism cards — frosted glass panels with backdrop-filter: blur(12px) and rgba borders",
      "Chrome/metallic text — gradient-filled text via background-clip with silver-to-white gradients",
      "Retro perspective grid floors — receding Tron-style grid via CSS perspective-transformed containers",
      "Neon glow hover states — elements gain colored box-shadow halos: 0 0 15px #FF71CE, 0 0 30px",
      "CRT scanline overlay — subtle repeating 1px horizontal lines at 3–5% opacity over hero sections",
    ],

    colorLogic: {
      description: "Dark indigo backgrounds dominate. Pink/purple/cyan gradient trio is the signature. Gradients used liberally.",
      base:    "#1A1A2E",
      accent1: "#FF71CE",
      accent2: "#01CDFE",
      text:    "#F0F0F0",
    },

    fonts: {
      display:     "Orbitron",
      body:        "Space Grotesk",
      accent:      "VT323",
      googleFonts: "family=Orbitron:wght@400;700;900&family=Space+Grotesk:wght@400;500;600&family=VT323",
    },

    layoutTricks: [
      "Glassmorphism card grid — service cards as frosted glass panels over gradient backgrounds",
      "Gradient text heroes — headlines using bg-gradient bg-clip-text text-transparent in pink/purple/cyan",
      "Retro grid horizon — perspective-transformed grid floor at hero bottom for depth",
      "Neon-glow hover states — every interactive element gains multi-color box-shadow on hover",
      "Animated gradient backgrounds — background-size 400% with background-position keyframe over 15s infinite",
    ],

    animation: {
      personality:      "Digitally dreamy. Gradients shift slowly (15s). Glitch on hover 200ms. Chrome shimmer on cards.",
      speed:            "200ms–400ms interactions, 10–20s ambient",
      easing:           "ease-in-out for interactions, linear for ambient",
      framerSignature:  "initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.35 }} / whileHover={{ boxShadow: '0 0 20px #FF71CE, 0 0 40px #B967FF' }}",
    },

    ctaStyle:   "Glowing and digital. 'Launch it.' 'Book now.' 'Enter.' Neon glow borders. Gradient fill on hover.",
    voiceTone:  "Cool and self-aware. Short punchy lines. 'It's giving results.' 'Vibe meets value.' Y2K-inflected.",

    cssTokens: `
:root {
  --genre-bg: #1A1A2E;
  --genre-bg-2: #16213E;
  --genre-surface: rgba(255,255,255,0.08);
  --genre-text: #F0F0F0;
  --genre-text-muted: #A0A0C0;
  --genre-accent: #FF71CE;
  --genre-accent-2: #01CDFE;
  --genre-border: rgba(255,113,206,0.3);
  --genre-radius: 16px;
  --genre-anim-speed: 0.35s;
  --genre-easing: ease-in-out;
}`.trim(),

    nicheAffinity: {
      "nail salon": 10, "hair salon": 8, "restaurant": 7,
      "dog walker": 6, "cleaning service": 5, "lawn care": 3,
      "handyman": 3, "plumber": 2, "electrician": 5,
    },

    intensityGuide: {
      subtle:    "Dark background. Gradient text headline. One glassmorphism card. Subtle glow on hover.",
      standard:  "Gradient hero background. Glass card grid. Neon hover states. CRT overlay.",
      full_send: "Full Y2K world. Animated gradient backgrounds. Perspective grid. Glitch effects. Everything glows.",
    },

    bestBaseStyles: ["slate", "volt", "petal", "ember"],
  },

  // ── 15 · AFROFUTURISM ────────────────────────
  {
    id:          "afrofuturism",
    number:      "15",
    name:        "Afrofuturism",
    emoji:       "🌌",
    tagline:     "Ancestral roots, cosmic futures",
    mood:        "Regal, cosmic, empowering, innovative, and deeply rooted — advanced technology that remembers where it came from.",
    energy:      "high",
    abstraction: "high",

    visualDNA: [
      "Kente/Ankara-inspired geometric patterns — interlocking rectangles and stepped motifs as SVG backgrounds",
      "Cosmic backgrounds — deep indigo-to-purple star fields with subtle particle animations",
      "Circuit-meets-textile line art — hybrid SVG patterns where textile motifs merge with circuit board traces",
      "Metallic gold shimmer accents — animated gradient background-position on text and borders",
      "Diagonal section cuts — clip-path: polygon creating angular dynamic section boundaries",
      "Concentric radial motifs — circles-within-circles as decorative elements inspired by African shields",
    ],

    colorLogic: {
      description: "Deep cosmic backgrounds 70% with gold and teal as primary accent pair. Warm and deep.",
      base:    "#1A103C",
      accent1: "#DCAC54",
      accent2: "#6BB5AE",
      text:    "#D9C5A8",
    },

    fonts: {
      display:     "Orbitron",
      body:        "Exo 2",
      accent:      "Space Mono",
      googleFonts: "family=Orbitron:wght@400;700&family=Exo+2:wght@300;400;500;600&family=Space+Mono:wght@400",
    },

    layoutTricks: [
      "Star-field hero backgrounds — deep indigo with CSS radial-gradient dots at varying sizes and opacities",
      "Kente border cards — service cards with thick borders in alternating gold/teal segments",
      "Diagonal clip-path sections — alternating sections cut at angles creating forward-leaning momentum",
      "Gold shimmer headlines — display text with animated gradient background-clip on a 3s loop",
      "Concentric circle accents — decorative SVG circle clusters at section corners suggesting celestial bodies",
    ],

    animation: {
      personality:      "Dignified and cosmic. Gold shimmer loops slowly (3s). Stars drift at barely perceptible speed.",
      speed:            "300ms–600ms",
      easing:           "ease-out",
      framerSignature:  "initial={{ opacity: 0, clipPath: 'polygon(50% 0%, 50% 0%, 50% 100%, 50% 100%)' }} animate={{ opacity: 1, clipPath: 'polygon(0% 0%, 100% 0%, 100% 100%, 0% 100%)' }} transition={{ duration: 0.6 }}",
    },

    ctaStyle:   "Regal and direct. 'Begin the work.' 'Build your future.' Gold-bordered, elevated without being cold.",
    voiceTone:  "Confident and rooted. 'Excellence is our standard.' 'We build legacies.' Forward-looking and proud.",

    cssTokens: `
:root {
  --genre-bg: #1A103C;
  --genre-bg-2: #2A1A5C;
  --genre-surface: rgba(220,172,84,0.08);
  --genre-text: #D9C5A8;
  --genre-text-muted: #9B8B78;
  --genre-accent: #DCAC54;
  --genre-accent-2: #6BB5AE;
  --genre-border: rgba(220,172,84,0.25);
  --genre-radius: 8px;
  --genre-anim-speed: 0.6s;
  --genre-easing: ease-out;
}`.trim(),

    nicheAffinity: {
      "hair salon": 9, "nail salon": 8, "restaurant": 9,
      "cleaning service": 6, "dog walker": 5, "lawn care": 4,
      "handyman": 5, "plumber": 3, "electrician": 6,
    },

    intensityGuide: {
      subtle:    "Deep background with gold accents. Geometric pattern border on one card. Star field subtle.",
      standard:  "Kente-bordered cards. Diagonal section cuts. Gold shimmer headlines. Concentric circle accents.",
      full_send: "Full cosmic world. Star field everywhere. Circuit-textile patterns. Clip-path reveals. Regal copy.",
    },

    bestBaseStyles: ["slate", "volt", "anchor", "ember"],
  },

  // ── 16 · MEMPHIS GROUP ───────────────────────
  {
    id:          "memphis",
    number:      "16",
    name:        "Memphis Group",
    emoji:       "🔺",
    tagline:     "More is more — then add more",
    mood:        "Playful, irreverent, energetic, optimistic, deliberately bad taste elevated to art.",
    energy:      "very_high",
    abstraction: "low",

    visualDNA: [
      "Squiggly Bacterio lines — Sottsass's signature wiggly line-and-dot pattern scattered as SVG backgrounds",
      "Terrazzo patterns — irregular stone-like scattered spots in multiple colors as section backgrounds",
      "Oversized geometric shapes — circles, triangles, zigzags at irregular angles (15°, 30°), not grid-aligned",
      "Thick black outlines — border-4 or border-[6px] border-black on every container and card",
      "Zigzag/sawtooth edges — SVG sawtooth section borders instead of straight lines in contrasting colors",
      "Clashing color blocks — adjacent sections in completely different bold solid colors, zero transition",
    ],

    colorLogic: {
      description: "Mix pastels WITH bold primaries — the clash is the point. Flat colors only, gradients forbidden.",
      base:    "#E8E6D9",
      accent1: "#F725A0",
      accent2: "#FAD141",
      text:    "#070707",
    },

    fonts: {
      display:     "Fredoka",
      body:        "Rubik",
      accent:      "Kablammo",
      googleFonts: "family=Fredoka:wght@500;600;700&family=Rubik:wght@400;500&family=Kablammo",
    },

    layoutTricks: [
      "Grid-breaking card layouts — cards at different sizes, some rotated 2–5°, edges overlapping",
      "Floating decorative shapes — absolute-positioned SVG geometric elements scattered as purely decorative accents",
      "Color-slammed section transitions — each section a completely different background color with zero transition",
      "Thick-border everything — every card, button, and container gets border-4 border-black",
      "Zigzag section dividers — SVG sawtooth patterns replacing horizontal lines between sections",
    ],

    animation: {
      personality:      "Bouncy, springy, alive. cubic-bezier(0.68, -0.55, 0.265, 1.55) for overshoot. Shapes bob and rotate on infinite loops.",
      speed:            "200ms–400ms",
      easing:           "cubic-bezier(0.68, -0.55, 0.265, 1.55)",
      framerSignature:  "initial={{ scale: 0, rotate: -15 }} animate={{ scale: 1, rotate: 0 }} transition={{ type: 'spring', stiffness: 300, damping: 12 }} / whileHover={{ scale: 1.08, rotate: 3 }}",
    },

    ctaStyle:   "Loud and joyful. 'BOOK NOW!' 'LET'S GO!' 'YES PLEASE!' Thick black border, bright fill, all-caps.",
    voiceTone:  "Energetic and unashamed. Exclamation marks. 'We LOVE this stuff!' 'Come find us!' Maximum enthusiasm.",

    cssTokens: `
:root {
  --genre-bg: #E8E6D9;
  --genre-bg-2: #FFFFFF;
  --genre-surface: #FFF8E1;
  --genre-text: #070707;
  --genre-text-muted: #444444;
  --genre-accent: #F725A0;
  --genre-accent-2: #FAD141;
  --genre-border: #070707;
  --genre-radius: 20px;
  --genre-anim-speed: 0.3s;
  --genre-easing: cubic-bezier(0.68, -0.55, 0.265, 1.55);
}`.trim(),

    nicheAffinity: {
      "nail salon": 9, "dog walker": 10, "restaurant": 8,
      "cleaning service": 6, "hair salon": 7, "lawn care": 5,
      "handyman": 4, "plumber": 3, "electrician": 3,
    },

    intensityGuide: {
      subtle:    "Slightly bouncy animations. One Bacterio pattern element. Thick border on one card. Cheerful palette.",
      standard:  "Rotated cards. Terrazzo section. Color-slammed transitions. Thick borders everywhere.",
      full_send: "Full Memphis world. Everything rotated. Squiggly patterns. Clashing sections. Maximum bounce physics.",
    },

    bestBaseStyles: ["petal", "hearth", "bloom", "grove"],
  },

];

// ─────────────────────────────────────────────
// GENRE BLENDING TABLE
// Proven combinations from the A&M Studios guide
// ─────────────────────────────────────────────
export interface GenreBlend {
  primary:     string;   // genre id, 70%
  secondary:   string;   // genre id, 30%
  ratio:       string;
  result:      string;
  bestFor:     string;
}

export const PROVEN_BLENDS: GenreBlend[] = [
  // Original 8 blends
  { primary: "dreamcore",              secondary: "dark_fantasia",          ratio: "60/40", result: "Witchy luxury",          bestFor: "Premium beauty, nail bars, spa"              },
  { primary: "cottagecore",            secondary: "maximalist_pop",         ratio: "50/50", result: "Joyful handmade",        bestFor: "Dog walkers, pet groomers, artisan food"     },
  { primary: "brutalist_whimsy",       secondary: "retrofuturism",          ratio: "70/30", result: "Industrial zine",        bestFor: "HVAC, auto detailing, trades"                },
  { primary: "abstract_expressionism", secondary: "dark_fantasia",          ratio: "50/50", result: "Art gallery noir",       bestFor: "High-end restaurant, salon"                  },
  { primary: "kinetic",                secondary: "retrofuturism",          ratio: "60/40", result: "Chrome alive",           bestFor: "Electrician, tech-forward trades"            },
  { primary: "cottagecore",            secondary: "abstract_expressionism", ratio: "40/60", result: "Color field garden",     bestFor: "Lawn care, landscaping, botanical"           },
  { primary: "maximalist_pop",         secondary: "brutalist_whimsy",       ratio: "50/50", result: "Controlled chaos",       bestFor: "Cleaning service, pressure washing"          },
  { primary: "dreamcore",              secondary: "kinetic",                ratio: "70/30", result: "Drifting reality",       bestFor: "Hair salon, beauty, grooming"                },
  // New 8 blends
  { primary: "wabi_sabi",              secondary: "risograph",              ratio: "70/30", result: "Printed imperfection",   bestFor: "Artisan bakery, coffee shop, indie grocer"   },
  { primary: "art_deco",               secondary: "afrofuturism",           ratio: "60/40", result: "Ancestral glamour",      bestFor: "Upscale Black-owned restaurant, salon"       },
  { primary: "solarpunk",              secondary: "swiss_bauhaus",          ratio: "50/50", result: "Rational garden",        bestFor: "Eco cleaning, sustainable landscaping"       },
  { primary: "vaporwave",              secondary: "memphis",                ratio: "60/40", result: "Digital carnival",       bestFor: "Nail salon, entertainment, food truck"       },
  { primary: "swiss_bauhaus",          secondary: "risograph",              ratio: "70/30", result: "Rational print",         bestFor: "Trades, handyman, professional services"     },
  { primary: "memphis",                secondary: "afrofuturism",           ratio: "50/50", result: "Cosmic celebration",     bestFor: "Event space, restaurant, creative studio"    },
  { primary: "wabi_sabi",              secondary: "solarpunk",              ratio: "60/40", result: "Mindful garden",         bestFor: "Dog walker, lawn care, wellness"             },
  { primary: "art_deco",               secondary: "vaporwave",              ratio: "70/30", result: "Deco dreams",            bestFor: "Hair salon, upscale nail bar, beauty"        },
];

// ─────────────────────────────────────────────
// Helpers
// ─────────────────────────────────────────────
export function getGenreById(id: string): ArtGenre | undefined {
  return ART_GENRES.find(g => g.id === id);
}

export function getTopGenresForNiche(niche: string, count = 3): ArtGenre[] {
  const lower = niche.toLowerCase();
  const scored = ART_GENRES.map(genre => {
    const best = Object.entries(genre.nicheAffinity)
      .filter(([key]) => lower.includes(key) || key.includes(lower))
      .reduce((max, [, score]) => Math.max(max, score), 0);
    return { genre, score: best || 4 };
  });
  return scored
    .sort((a, b) => b.score - a.score)
    .slice(0, count)
    .map(s => s.genre);
}

export function getSuggestedBlend(niche: string): GenreBlend | null {
  const lower  = niche.toLowerCase();
  const lookup: Record<string, GenreBlend> = {
    "dog walker":        PROVEN_BLENDS[1],   // cottagecore + maximalist_pop
    "lawn care":         PROVEN_BLENDS[5],   // cottagecore + abstract_expressionism
    "electrician":       PROVEN_BLENDS[4],   // kinetic + retrofuturism
    "nail salon":        PROVEN_BLENDS[0],   // dreamcore + dark_fantasia
    "hair salon":        PROVEN_BLENDS[7],   // dreamcore + kinetic
    "cleaning service":  PROVEN_BLENDS[10],  // solarpunk + swiss_bauhaus
    "handyman":          PROVEN_BLENDS[12],  // swiss_bauhaus + risograph
    "hvac":              PROVEN_BLENDS[2],   // brutalist_whimsy + retrofuturism
    "restaurant":        PROVEN_BLENDS[3],   // abstract_expressionism + dark_fantasia
    "plumber":           PROVEN_BLENDS[12],  // swiss_bauhaus + risograph
    "auto detailing":    PROVEN_BLENDS[2],   // brutalist_whimsy + retrofuturism
  };
  const key = Object.keys(lookup).find(k => lower.includes(k));
  return key ? lookup[key] : null;
}
