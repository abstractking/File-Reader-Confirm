// agents/designer/generator.ts
// ═════════════════════════════════════════════
//  DESIGNER Generator
//  Produces two outputs per project:
//  1. Wireframe  — page-by-page layout blueprint
//  2. Style Guide — complete visual specification
//     that BUILDER uses to generate the site
//
//  Both are deeply informed by the chosen base
//  style AND art genre at the selected intensity.
// ═════════════════════════════════════════════

import { askClaudeJSON }        from "../../core/claude";
import { ArtGenre, GenreIntensity } from "./genres";
import { DesignStyle }              from "./styles";

// ─────────────────────────────────────────────
// Output types
// ─────────────────────────────────────────────

export interface WireframePage {
  name:     string;
  sections: WireframeSection[];
}

export interface WireframeSection {
  name:    string;
  layout:  string;
  content: string;
  notes:   string;
}

export interface StyleGuide {
  fonts:      DesignStyle["fonts"];
  typescale: {
    h1: string; h2: string; h3: string;
    body: string; small: string; label: string;
  };
  colors:      DesignStyle["colors"];
  colorUsage: {
    heroBackground: string; sectionAlt: string;
    ctaButton: string; navBackground: string; footerBg: string;
  };
  components: {
    button: string; card: string;
    input: string; badge: string; divider: string;
  };
  layout:      DesignStyle["layout"];
  spacing: {
    containerMax: string; sectionPadding: string; cardGap: string;
  };
  motion:       DesignStyle["motion"];
  cssVariables: string;
}

export interface DesignBrief {
  style:        DesignStyle;
  genre:        ArtGenre | null;
  intensity:    GenreIntensity;
  wireframe:    WireframePage[];
  styleGuide:   StyleGuide;
  builderNotes: string;
}

// ─────────────────────────────────────────────
// MAIN ENTRY
// ─────────────────────────────────────────────
export async function generateDesignBrief(
  project:   any,
  style:     DesignStyle,
  pages:     string[],
  genre?:    ArtGenre,
  intensity: GenreIntensity = "standard"
): Promise<DesignBrief> {

  const [wireframe, styleGuide] = await Promise.all([
    generateWireframe(project, style, pages, genre, intensity),
    buildStyleGuide(project, style, genre, intensity),
  ]);

  const builderNotes = buildBuilderNotes(
    project, style, styleGuide, genre, intensity
  );

  return { style, genre: genre ?? null, intensity, wireframe, styleGuide, builderNotes };
}

// ─────────────────────────────────────────────
// GENRE CONTEXT BLOCK
// Injected into every Claude prompt when a genre
// is active — uses ALL genre data fields
// ─────────────────────────────────────────────
function buildGenreContext(genre: ArtGenre, intensity: GenreIntensity): string {
  const intensityRule =
    intensity === "subtle"
      ? "SUBTLE (20–40%): Apply ONE signature element per major section. Safe for all clients."
    : intensity === "standard"
      ? "STANDARD (50–70%): Genre clearly recognizable. Signature tricks on hero, services, CTA."
      : "FULL SEND (80–100%): Every section lives in this world. No safe zones. Statement piece.";

  return `
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ART GENRE: ${genre.emoji} ${genre.name} (#${genre.number})
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"${genre.tagline}"
Mood: ${genre.mood}
Energy: ${genre.energy} | Abstraction: ${genre.abstraction}
Intensity: ${intensityRule}

VISUAL DNA (implement at ${intensity} intensity):
${genre.visualDNA.map((d, i) => `  ${i + 1}. ${d}`).join("\n")}

SIGNATURE LAYOUT TRICKS:
${genre.layoutTricks.map((t, i) => `  ${i + 1}. ${t}`).join("\n")}

ANIMATION:
  Personality: ${genre.animation.personality}
  Speed: ${genre.animation.speed}
  Easing: ${genre.animation.easing}
  Framer Motion pattern: ${genre.animation.framerSignature}

CTA STYLE: ${genre.ctaStyle}
COPY VOICE: ${genre.voiceTone}

COLOR LOGIC: ${genre.colorLogic.description}
  Background: ${genre.colorLogic.base}
  Accent 1:   ${genre.colorLogic.accent1}
  Accent 2:   ${genre.colorLogic.accent2}
  Text:       ${genre.colorLogic.text}

TYPOGRAPHY:
  Display: ${genre.fonts.display}
  Body:    ${genre.fonts.body}
  Accent:  ${genre.fonts.accent}

GOVERNING RULE: "Weird enough to be remembered. Clear enough to convert."
Every section must still drive booking/calling/contacting.`.trim();
}

// ─────────────────────────────────────────────
// WIREFRAME GENERATOR
// ─────────────────────────────────────────────
async function generateWireframe(
  project:   any,
  style:     DesignStyle,
  pages:     string[],
  genre?:    ArtGenre,
  intensity: GenreIntensity = "standard"
): Promise<WireframePage[]> {

  const genreBlock = genre
    ? buildGenreContext(genre, intensity)
    : "No art genre — clean professional layout from base style only.";

  const result = await askClaudeJSON<{ pages: WireframePage[] }>({
    system: `You are a senior UX/UI designer creating precise wireframe briefs for React developers.
Be specific enough that a developer can build without asking questions.
Specify: column counts, alignment, spacing classes, component types, content placement.
Output ONLY valid JSON.`,

    messages: [{
      role:    "user",
      content: `Create a wireframe brief for a ${project.niche} business website.

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
PROJECT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Business: ${project.client_name}
Niche: ${project.niche}
Location: ${project.metadata?.address ?? "local area"}
Phone: ${project.metadata?.phone ?? "(337) 555-0100"}
Package: ${project.package}
Pages: ${pages.join(", ")}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BASE STYLE: ${style.name} — "${style.tagline}"
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Philosophy: ${style.philosophy} | Mood: ${style.mood}
Hero: ${style.layout.heroStyle}
Grid: ${style.layout.gridStyle}
Primary: ${style.colors.primary} | Accent: ${style.colors.accent}
Button: ${style.details.buttonStyle}
Card: ${style.details.cardStyle}
Motion: ${style.motion.pageLoad}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${genreBlock}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━

For EACH section provide:
- name: section name
- layout: precise column/alignment/sizing description with Tailwind patterns
- content: SPECIFIC content for ${project.client_name} — real services, actual copy, real phone
- notes: actionable implementation notes with exact Tailwind classes, genre techniques, colors

BAD note: "Use brand colors"
GOOD note: "bg-[${style.colors.primary}] hero, headline text-6xl font-black text-white, ${style.details.buttonStyle} CTA linking to phone ${project.metadata?.phone ?? "(337) 555-0100"}"

Return JSON:
{
  "pages": [
    {
      "name": "Home",
      "sections": [
        {
          "name": "Hero",
          "layout": "Full-width, left-aligned content col-span-7, right image col-span-5",
          "content": "Headline specific to ${project.client_name}, subhead, phone CTA",
          "notes": "Precise Tailwind classes + genre-specific techniques"
        }
      ]
    }
  ]
}`,
    }],
    maxTokens: 4000,
  });

  return result.pages ?? [];
}

// ─────────────────────────────────────────────
// STYLE GUIDE BUILDER
// ─────────────────────────────────────────────
async function buildStyleGuide(
  project:   any,
  style:     DesignStyle,
  genre?:    ArtGenre,
  intensity: GenreIntensity = "standard"
): Promise<StyleGuide> {

  const fonts      = genre ? mergeFonts(style, genre, intensity)  : style.fonts;
  const colors     = genre ? mergeColors(style, genre, intensity) : style.colors;
  const motion     = genre ? mergeMotion(style, genre, intensity) : style.motion;
  const typescale  = buildTypescale(style, genre);
  const components = buildComponents(style, genre, intensity);
  const colorUsage = buildColorUsage(style, genre, intensity);
  const cssVars    = buildCSSVariables(style, genre, intensity);

  return {
    fonts,
    typescale,
    colors,
    colorUsage,
    components,
    layout: style.layout,
    spacing: {
      containerMax:   "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8",
      sectionPadding: style.layout.sectionSpacing,
      cardGap:        "gap-6 lg:gap-8",
    },
    motion,
    cssVariables: cssVars,
  };
}

// ─────────────────────────────────────────────
// MERGE HELPERS
// Colors, fonts, motion blend at different ratios
// per intensity level
// ─────────────────────────────────────────────

function mergeColors(
  style: DesignStyle, genre: ArtGenre, intensity: GenreIntensity
): DesignStyle["colors"] {
  if (intensity === "subtle") {
    return { ...style.colors, accent: genre.colorLogic.accent1 };
  }
  if (intensity === "standard") {
    return {
      ...style.colors,
      accent:    genre.colorLogic.accent1,
      secondary: genre.colorLogic.accent2,
    };
  }
  // full_send — genre takes full control
  return {
    ...style.colors,
    primary:    genre.colorLogic.base,
    accent:     genre.colorLogic.accent1,
    secondary:  genre.colorLogic.accent2,
    text:       genre.colorLogic.text,
    background: genre.colorLogic.base,
    surface:    genre.colorLogic.base,
  };
}

function mergeFonts(
  style: DesignStyle, genre: ArtGenre, intensity: GenreIntensity
): DesignStyle["fonts"] {
  if (intensity === "subtle") {
    return { ...style.fonts, display: genre.fonts.display };
  }
  if (intensity === "standard") {
    return {
      display:     genre.fonts.display,
      body:        style.fonts.body,
      accent:      genre.fonts.accent,
      googleFonts: `${genre.fonts.googleFonts}&${style.fonts.googleFonts}`,
    };
  }
  return { ...genre.fonts };
}

function mergeMotion(
  style: DesignStyle, genre: ArtGenre, intensity: GenreIntensity
): DesignStyle["motion"] {
  if (intensity === "subtle") return style.motion;
  if (intensity === "standard") {
    return {
      ...style.motion,
      pageLoad:   genre.animation.personality,
      transition: genre.animation.easing,
    };
  }
  return {
    pageLoad:   genre.animation.personality,
    hover:      genre.animation.framerSignature,
    transition: genre.animation.easing,
  };
}

// ─────────────────────────────────────────────
// TYPESCALE — genre-specific overrides
// ─────────────────────────────────────────────
function buildTypescale(
  style: DesignStyle, genre?: ArtGenre
): StyleGuide["typescale"] {

  // Genre-specific typescales
  if (genre) {
    const g = genre.id;
    if (g === "swiss_bauhaus")
      return {
        h1: "text-5xl md:text-8xl font-bold tracking-tight leading-none uppercase",
        h2: "text-3xl md:text-5xl font-bold tracking-tight uppercase",
        h3: "text-xl font-semibold uppercase tracking-wider",
        body: "text-base leading-relaxed",
        small: "text-sm",
        label: "text-xs font-bold uppercase tracking-widest",
      };
    if (g === "brutalist_whimsy")
      return {
        h1: "text-6xl md:text-[10rem] font-black leading-none tracking-tighter",
        h2: "text-4xl md:text-6xl font-black",
        h3: "text-2xl font-black uppercase",
        body: "font-mono text-base leading-relaxed",
        small: "font-mono text-sm",
        label: "font-mono text-xs uppercase tracking-widest",
      };
    if (g === "dreamcore" || g === "wabi_sabi")
      return {
        h1: "text-4xl md:text-6xl font-light tracking-[0.05em] leading-tight",
        h2: "text-2xl md:text-4xl font-light tracking-wide",
        h3: "text-xl font-normal tracking-wider",
        body: "text-base font-light leading-[1.9]",
        small: "text-sm font-light",
        label: "text-xs tracking-[0.2em] uppercase font-light",
      };
    if (g === "art_deco")
      return {
        h1: "text-5xl md:text-7xl font-bold tracking-[0.1em] leading-tight uppercase",
        h2: "text-3xl md:text-5xl font-bold tracking-[0.08em] uppercase",
        h3: "text-xl font-semibold tracking-widest uppercase",
        body: "text-base leading-relaxed",
        small: "text-sm tracking-wide",
        label: "text-xs tracking-[0.3em] uppercase",
      };
    if (g === "memphis" || g === "maximalist_pop")
      return {
        h1: "text-5xl md:text-7xl font-bold leading-none",
        h2: "text-3xl md:text-5xl font-bold",
        h3: "text-2xl font-bold",
        body: "text-base leading-relaxed",
        small: "text-sm",
        label: "text-xs font-bold uppercase",
      };
    if (g === "vaporwave" || g === "retrofuturism" || g === "afrofuturism")
      return {
        h1: "text-5xl md:text-7xl font-black tracking-tight leading-none",
        h2: "text-3xl md:text-5xl font-bold tracking-tight",
        h3: "text-xl font-semibold tracking-wide",
        body: "text-base leading-relaxed",
        small: "font-mono text-sm",
        label: "font-mono text-xs uppercase tracking-widest",
      };
    if (g === "risograph")
      return {
        h1: "text-5xl md:text-7xl font-extrabold leading-tight",
        h2: "text-3xl md:text-5xl font-bold",
        h3: "text-xl font-bold",
        body: "text-base leading-relaxed",
        small: "font-mono text-sm",
        label: "font-mono text-xs uppercase",
      };
    if (g === "solarpunk")
      return {
        h1: "text-4xl md:text-6xl font-bold leading-tight",
        h2: "text-3xl md:text-4xl font-bold",
        h3: "text-xl font-semibold",
        body: "text-[17px] leading-[1.8]",
        small: "text-sm leading-relaxed",
        label: "text-sm font-medium tracking-wide uppercase",
      };
  }

  // Philosophy-based defaults
  const isBold    = style.philosophy === "bold";
  const isMinimal = style.philosophy === "minimalist";
  return {
    h1:    isBold    ? "text-5xl md:text-7xl font-black tracking-tight leading-none"
         : isMinimal ? "text-4xl md:text-6xl font-semibold tracking-tight leading-tight"
         :             "text-4xl md:text-5xl font-bold leading-tight",
    h2:    isBold    ? "text-3xl md:text-5xl font-bold tracking-tight"
         : isMinimal ? "text-3xl md:text-4xl font-semibold tracking-tight"
         :             "text-3xl md:text-4xl font-bold",
    h3:    isBold    ? "text-2xl font-bold"
         :             "text-xl font-semibold",
    body:  isMinimal ? "text-base font-normal leading-relaxed"
         :             "text-base leading-relaxed",
    small: "text-sm leading-normal",
    label: isBold    ? "text-xs font-bold uppercase tracking-widest"
         : isMinimal ? "text-xs font-medium uppercase tracking-wider"
         :             "text-sm font-medium",
  };
}

// ─────────────────────────────────────────────
// COMPONENT CLASSES — genre-specific overrides
// ─────────────────────────────────────────────
function buildComponents(
  style: DesignStyle, genre?: ArtGenre, intensity: GenreIntensity = "standard"
): StyleGuide["components"] {
  const r  = style.layout.borderRadius;
  const sh = style.layout.shadowStyle;
  const base = "inline-flex items-center justify-center px-6 py-3 font-semibold transition-all cursor-pointer";

  if (genre && intensity !== "subtle") {
    const g  = genre.id;
    const c1 = genre.colorLogic.accent1;
    const c2 = genre.colorLogic.accent2;
    const bg = genre.colorLogic.base;
    const tx = genre.colorLogic.text;

    if (g === "brutalist_whimsy" || g === "swiss_bauhaus")
      return {
        button:  `${base} rounded-none border-4 border-black bg-[${c1}] text-black uppercase tracking-widest hover:bg-black hover:text-[${c1}]`,
        card:    `bg-white border-4 border-black p-6`,
        input:   `w-full px-4 py-3 border-4 border-black bg-white focus:outline-none focus:border-[${c1}]`,
        badge:   `inline-flex px-3 py-1 border-2 border-black text-xs font-bold uppercase bg-[${c1}]`,
        divider: `border-t-4 border-black`,
      };
    if (g === "art_deco")
      return {
        button:  `${base} border-2 border-[${c1}] text-[${c1}] uppercase tracking-[0.2em] hover:bg-[${c1}] hover:text-[${bg}]`,
        card:    `bg-[${bg}] border border-[${c1}]/40 p-6`,
        input:   `w-full px-4 py-3 border border-[${c1}]/60 bg-transparent text-[${tx}] focus:outline-none focus:border-[${c1}]`,
        badge:   `inline-flex px-4 py-1 border border-[${c1}] text-xs uppercase tracking-[0.2em] text-[${c1}]`,
        divider: `border-t border-[${c1}]/40`,
      };
    if (g === "vaporwave")
      return {
        button:  `${base} rounded-xl bg-gradient-to-r from-[${c1}] to-[${c2}] text-white hover:shadow-[0_0_20px_${c1}]`,
        card:    `backdrop-blur-md bg-white/10 border border-white/20 rounded-2xl p-6`,
        input:   `w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white focus:outline-none focus:border-[${c1}]`,
        badge:   `inline-flex px-3 py-1 rounded-full bg-[${c1}]/20 border border-[${c1}]/40 text-xs text-[${c1}]`,
        divider: `border-t border-white/10`,
      };
    if (g === "wabi_sabi")
      return {
        button:  `${base} rounded-sm border border-[${c1}] text-[${c1}] bg-transparent hover:bg-[${c1}]/10`,
        card:    `bg-[${bg}] rounded-sm p-6`,
        input:   `w-full px-4 py-3 rounded-sm border border-[${tx}]/20 bg-transparent focus:outline-none focus:border-[${c1}]`,
        badge:   `inline-flex px-3 py-1 rounded-sm text-xs font-light tracking-wider bg-[${c1}]/10 text-[${tx}]`,
        divider: `border-t border-[${c1}]/30`,
      };
    if (g === "memphis")
      return {
        button:  `${base} rounded-[20px] border-4 border-black bg-[${c1}] text-black uppercase font-bold hover:scale-105`,
        card:    `bg-white border-4 border-black rounded-[20px] p-6`,
        input:   `w-full px-4 py-3 rounded-[20px] border-4 border-black bg-white focus:outline-none`,
        badge:   `inline-flex px-3 py-1 rounded-full border-2 border-black text-xs font-bold bg-[${c2}]`,
        divider: `border-t-4 border-black`,
      };
    if (g === "dark_fantasia" || g === "afrofuturism")
      return {
        button:  `${base} border border-[${c1}]/60 text-[${c1}] bg-transparent hover:bg-[${c1}]/10 tracking-widest uppercase`,
        card:    `bg-[${bg}] border border-[${c1}]/20 rounded-sm p-6`,
        input:   `w-full px-4 py-3 bg-[${bg}] border border-[${c1}]/30 text-[${tx}] focus:outline-none focus:border-[${c1}]`,
        badge:   `inline-flex px-3 py-1 border border-[${c1}]/40 text-xs uppercase tracking-widest text-[${c1}]`,
        divider: `border-t border-[${c1}]/20`,
      };
    if (g === "solarpunk")
      return {
        button:  `${base} rounded-[2rem_2rem_0_0] bg-[${c1}] text-white hover:bg-[${c2}]`,
        card:    `bg-white/80 backdrop-blur-sm rounded-[2rem_2rem_0_0] p-6 border border-[${c1}]/20`,
        input:   `w-full px-4 py-3 rounded-xl border border-[${c1}]/40 bg-white focus:outline-none focus:border-[${c1}]`,
        badge:   `inline-flex px-3 py-1 rounded-full bg-[${c1}]/15 text-xs text-[${tx}]`,
        divider: `border-t border-[${c1}]/20`,
      };
  }

  // Base style defaults
  const button =
    style.id === "slate" ? `${base} rounded-none bg-[${style.colors.accent}] text-black uppercase tracking-widest` :
    style.id === "volt"  ? `${base} rounded bg-[${style.colors.accent}] text-[${style.colors.primary}] uppercase font-bold` :
    style.philosophy === "warm"      ? `${base} ${r} bg-[${style.colors.accent}] text-white ${sh}` :
    style.philosophy === "bold"      ? `${base} rounded bg-[${style.colors.primary}] text-white uppercase` :
    `${base} ${r} bg-[${style.colors.primary}] text-white`;

  const card =
    style.philosophy === "minimalist" ? `bg-white border border-[${style.colors.border}] ${r} p-6` :
    style.philosophy === "bold"       ? `bg-white border-t-4 border-[${style.colors.accent}] ${r} p-6 ${sh}` :
    `bg-[${style.colors.surface}] ${r} p-6 ${sh}`;

  return {
    button,
    card,
    input:   `w-full px-4 py-3 ${r} border border-[${style.colors.border}] bg-white focus:outline-none focus:ring-2 focus:ring-[${style.colors.accent}]`,
    badge:   `inline-flex px-3 py-1 ${r} text-xs font-semibold bg-[${style.colors.surface}] text-[${style.colors.primary}]`,
    divider: `border-t border-[${style.colors.border}]`,
  };
}

// ─────────────────────────────────────────────
// COLOR USAGE MAP
// ─────────────────────────────────────────────
function buildColorUsage(
  style: DesignStyle, genre?: ArtGenre, intensity: GenreIntensity = "standard"
): StyleGuide["colorUsage"] {
  if (genre && intensity !== "subtle") {
    const darkGenres = ["dark_fantasia","vaporwave","afrofuturism","retrofuturism","slate","kinetic"];
    const isDark = darkGenres.includes(genre.id);
    return {
      heroBackground: isDark ? genre.colorLogic.base : genre.colorLogic.accent1,
      sectionAlt:     isDark ? `${genre.colorLogic.base}CC` : genre.colorLogic.base,
      ctaButton:      genre.colorLogic.accent1,
      navBackground:  isDark ? genre.colorLogic.base : style.colors.background,
      footerBg:       isDark ? genre.colorLogic.base : genre.colorLogic.text,
    };
  }
  return {
    heroBackground: style.philosophy === "bold" ? style.colors.primary
                  : style.philosophy === "warm" ? style.colors.secondary
                  :                               style.colors.background,
    sectionAlt:    style.colors.surface,
    ctaButton:     style.id === "slate" ? style.colors.accent : style.colors.primary,
    navBackground: style.philosophy === "bold" ? style.colors.primary : style.colors.background,
    footerBg:      style.philosophy === "minimalist" ? style.colors.surface : style.colors.primary,
  };
}

// ─────────────────────────────────────────────
// CSS VARIABLES — base + genre token layers
// ─────────────────────────────────────────────
function buildCSSVariables(
  style: DesignStyle, genre?: ArtGenre, intensity: GenreIntensity = "standard"
): string {
  const base = `:root {
  /* Base Style: ${style.name} */
  --color-primary:    ${style.colors.primary};
  --color-secondary:  ${style.colors.secondary};
  --color-accent:     ${style.colors.accent};
  --color-background: ${style.colors.background};
  --color-surface:    ${style.colors.surface};
  --color-text:       ${style.colors.text};
  --color-text-muted: ${style.colors.textMuted};
  --color-border:     ${style.colors.border};
  --font-display:     '${style.fonts.display}', serif;
  --font-body:        '${style.fonts.body}', sans-serif;
  --transition:       ${style.motion.transition};
}`;

  if (!genre) return base;

  return `${base}

/* Genre Layer: ${genre.name} @ ${intensity} */
${genre.cssTokens}

/* Merged overrides */
:root {
  --genre-display: '${genre.fonts.display}';
  --genre-body:    '${genre.fonts.body}';
  --genre-accent-font: '${genre.fonts.accent}';
  --genre-speed:   ${genre.animation.speed};
  --genre-easing:  ${genre.animation.easing};
}`;
}

// ─────────────────────────────────────────────
// BUILDER NOTES — full plain-English handoff
// ─────────────────────────────────────────────
function buildBuilderNotes(
  project:    any,
  style:      DesignStyle,
  guide:      StyleGuide,
  genre?:     ArtGenre,
  intensity:  GenreIntensity = "standard"
): string {

  const genreSection = genre ? `

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
ART GENRE: ${genre.emoji} ${genre.name} @ ${intensity.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
"${genre.tagline}"
Mood: ${genre.mood}
Energy: ${genre.energy} | Abstraction: ${genre.abstraction}

GOVERNING PRINCIPLE:
"Weird enough to be remembered. Clear enough to convert. Built well enough to ship."

VISUAL DNA:
${genre.visualDNA.map((d, i) => `  ${i + 1}. ${d}`).join("\n")}

LAYOUT TRICKS:
${genre.layoutTricks.map((t, i) => `  ${i + 1}. ${t}`).join("\n")}

ANIMATION:
  ${genre.animation.personality}
  Speed: ${genre.animation.speed}
  Easing: ${genre.animation.easing}
  Framer pattern: ${genre.animation.framerSignature}

CTA: ${genre.ctaStyle}
VOICE: ${genre.voiceTone}

INTENSITY — ${intensity.toUpperCase()}:
${intensity === "subtle"    ? "  One signature element per major section only." :
  intensity === "standard"  ? "  Genre on hero, services, CTA. Supporting sections lighter." :
                              "  Full genre on every section. No safe zones."}

GENRE CSS TOKENS:
${genre.cssTokens}` : "\nNo genre — base style only.";

  return `DESIGN HANDOFF — ${project.client_name}
${genre ? `System: ${style.name} + ${genre.name} (${intensity})` : `System: ${style.name}`}
Niche: ${project.niche} | Package: ${project.package}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
BASE STYLE: ${style.name}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
Philosophy: ${style.philosophy} | Mood: ${style.mood}

FONTS:
  Display: ${guide.fonts.display}
  Body:    ${guide.fonts.body}
  Accent:  ${guide.fonts.accent}
  Import:  ${guide.fonts.googleFonts}

TYPESCALE:
  H1: ${guide.typescale.h1}
  H2: ${guide.typescale.h2}
  H3: ${guide.typescale.h3}
  Body: ${guide.typescale.body}
  Label: ${guide.typescale.label}

COLORS:
  Primary:    ${guide.colors.primary}
  Accent:     ${guide.colors.accent}
  Background: ${guide.colors.background}
  Surface:    ${guide.colors.surface}
  Text:       ${guide.colors.text}
  Border:     ${guide.colors.border}

COLOR USAGE:
  Hero bg:     ${guide.colorUsage.heroBackground}
  Section alt: ${guide.colorUsage.sectionAlt}
  CTA button:  ${guide.colorUsage.ctaButton}
  Nav bg:      ${guide.colorUsage.navBackground}
  Footer bg:   ${guide.colorUsage.footerBg}

COMPONENTS:
  Button:  ${guide.components.button}
  Card:    ${guide.components.card}
  Input:   ${guide.components.input}
  Badge:   ${guide.components.badge}
  Divider: ${guide.components.divider}

LAYOUT:
  Hero:      ${style.layout.heroStyle}
  Grid:      ${style.layout.gridStyle}
  Radius:    ${style.layout.borderRadius}
  Spacing:   ${style.layout.sectionSpacing}
  Container: ${guide.spacing.containerMax}

MOTION:
  Load:       ${guide.motion.pageLoad}
  Hover:      ${guide.motion.hover}
  Transition: ${guide.motion.transition}

VISUAL DETAILS:
  Background: ${style.details.backgroundStyle}
  Buttons:    ${style.details.buttonStyle}
  Cards:      ${style.details.cardStyle}
  Dividers:   ${style.details.dividerStyle}
  Icons:      ${style.details.iconStyle}
${genreSection}

━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
CSS VARIABLES (src/index.css):
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${guide.cssVariables}`.trim();
}
