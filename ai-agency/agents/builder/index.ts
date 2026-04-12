// agents/builder/index.ts
// ═════════════════════════════════════════════
//  BUILDER — Website Code Generation Agent
//  Generates complete React + TypeScript + Tailwind
//  websites for local service businesses.
//  Triggered by PRODUCER after DESIGN stage approval.
// ═════════════════════════════════════════════

import { Task, AgentRunResult }          from "../../core/types";
import { log }                           from "../../core/logger";
import { askClaude }                     from "../../core/claude";
import { insertAsset, getAssetByTaskId } from "../../core/queries";
import { postApprovedCode }              from "./slack";
import { BUILDER_CONFIG, SiteStructure, NichePalette } from "./config";

// ─────────────────────────────────────────────
// Main run() — called by PRODUCER dispatcher
// ─────────────────────────────────────────────
export async function run(task: Task): Promise<AgentRunResult> {
  const project   = task.input_data?.project;
  const wireframe = task.input_data?.previous_output;

  if (!project) throw new Error("BUILDER: no project in task input_data");

  await log("BUILDER", "run_started", { project_id: project.id, client: project.client_name }, "success", project.id);

  // Determine site structure — explicit override > package default
  const explicitStructure = task.input_data?.structure as SiteStructure | undefined;
  const structure: SiteStructure =
    explicitStructure                      ? explicitStructure :
    project.package === "starter"          ? "single" :
    project.package === "basic"            ? "multi" :
    project.package === "growth"           ? "multi_with_booking" :
    "multi_full";

  const pages = BUILDER_CONFIG.structures[structure];

  // Pick niche palette
  const nicheRaw = (project.niche ?? "").toLowerCase();
  const nicheKey = Object.keys(BUILDER_CONFIG.niche_palettes)
    .find(k => nicheRaw.includes(k)) ?? "default";
  const palette: NichePalette = BUILDER_CONFIG.niche_palettes[nicheKey];

  await log("BUILDER", "generating_files", { structure, pages: pages.length, palette: nicheKey }, "success", project.id);

  const generatedFiles: Record<string, string> = {};

  // Root config files (no Claude needed)
  generatedFiles["package.json"]        = generatePackageJson(project);
  generatedFiles["vite.config.ts"]      = generateViteConfig();
  generatedFiles["tailwind.config.ts"]  = generateTailwindConfig(palette);
  generatedFiles["postcss.config.js"]   = generatePostcssConfig();
  generatedFiles["tsconfig.json"]       = generateTsconfig();
  generatedFiles["tsconfig.node.json"]  = generateTsconfigNode();
  generatedFiles["index.html"]          = generateIndexHtml(project);
  generatedFiles["README.md"]           = generateReadme(project, structure, pages);

  // src/ files
  generatedFiles["src/index.css"]  = generateIndexCss(palette);
  generatedFiles["src/main.tsx"]   = generateMainTsx();

  // 1. src/App.tsx — lives in src/ so relative imports work correctly
  generatedFiles["src/App.tsx"] = await generateAppFile(project, pages, palette, wireframe, structure);
  await delay(400);

  // 2. Per-page components under src/pages/
  for (const page of pages) {
    const fileName = `src/pages/${page}.tsx`;
    generatedFiles[fileName] = await generatePageComponent(project, page, palette, wireframe, structure);
    await delay(400);
  }

  // 3. Shared components under src/components/
  const sharedComponents = ["Navbar", "Footer", "ContactForm", "HeroSection"];
  for (const component of sharedComponents) {
    const fileName = `src/components/${component}.tsx`;
    generatedFiles[fileName] = await generateSharedComponent(project, component, palette);
    await delay(400);
  }

  const fileList = Object.keys(generatedFiles);

  // Save all files as an asset (content = JSON map of filename → code)
  await insertAsset({
    project_id:  project.id,
    task_id:     task.id,
    asset_type:  "site_code",
    title:       `${project.project_name} — Full Site Code`,
    content:     JSON.stringify(generatedFiles, null, 2),
    file_url:    null,
    version:     1,
    is_approved: false,
    metadata: {
      structure,
      pages,
      palette,
      files:      fileList,
      file_count: fileList.length,
      tech_stack: BUILDER_CONFIG.tech_stack,
    }
  });

  await log(
    "BUILDER", "site_generated",
    { files: fileList.length, structure, pages: pages.length },
    "success", project.id
  );

  return {
    summary: `Generated ${fileList.length} files for ${project.client_name} — ${structure} site with ${pages.length} pages`,
    data: {
      structure,
      pages,
      palette,
      files:      fileList,
      file_count: fileList.length,
      tech_stack: BUILDER_CONFIG.tech_stack,
      preview: {
        "src/App.tsx": (generatedFiles["src/App.tsx"] ?? "").slice(0, 500) + "...",
      }
    },
    metadata: { palette, structure }
  };
}

// ─────────────────────────────────────────────
// Called by PRODUCER after code is approved
// Dumps each file to Slack for copying
// ─────────────────────────────────────────────
export async function onApproved(taskId: string, project: any): Promise<void> {
  const asset = await getAssetByTaskId(taskId, "site_code");
  if (!asset) {
    await log("BUILDER", "on_approved_no_asset", { taskId }, "error", project.id);
    return;
  }
  await postApprovedCode(asset, project);
  await log("BUILDER", "code_approved_posted", { client: project.client_name }, "success", project.id);
}

// ═════════════════════════════════════════════
// GENERATORS — each returns raw file content
// ═════════════════════════════════════════════

async function generateAppFile(
  project:   any,
  pages:     string[],
  palette:   NichePalette,
  wireframe: any,
  structure: string
): Promise<string> {
  const imports = pages.map(p => `import ${p} from './pages/${p}';`).join("\n");
  const routes  = pages.map(p =>
    p === "Home" || p === "LandingPage"
      ? `          <Route path="/" element={<${p} />} />`
      : `          <Route path="/${p.toLowerCase()}" element={<${p} />} />`
  ).join("\n");

  return askClaude({
    system: `You are an expert React + TypeScript + Tailwind CSS developer.
Generate clean, production-ready code only. No explanations, no markdown — just the raw file content.
Use Tailwind CSS classes exclusively for styling. Make sites feel warm, professional, and conversion-focused.`,
    messages: [{
      role: "user",
      content: `Generate a complete App.tsx for a ${project.niche} business website.

Business: ${project.client_name}
Location: ${project.metadata?.address ?? project.metadata?.location ?? "local area"}
Phone: ${project.metadata?.phone ?? ""}
Package: ${project.package}
Structure: ${structure}
Pages: ${pages.join(", ")}
Primary color: ${palette.primary}
Accent color: ${palette.accent}
Background: ${palette.secondary}
Wireframe context: ${wireframe ? JSON.stringify(wireframe).slice(0, 400) : "not provided"}

REQUIRED IMPORTS (use exactly these):
${imports}
import Navbar from './components/Navbar';
import Footer from './components/Footer';

REQUIRED ROUTES:
${routes}

Requirements:
- Use react-router-dom BrowserRouter, Routes, Route
- Wrap all routes with <Navbar /> above and <Footer /> below
- Mobile responsive layout
- Clean TypeScript with proper types
- Import and set up the CSS variables from ./index.css

Generate ONLY the App.tsx file content, starting with imports.`
    }],
    maxTokens: 1800,
  });
}

async function generatePageComponent(
  project:   any,
  page:      string,
  palette:   NichePalette,
  wireframe: any,
  structure: string
): Promise<string> {
  return askClaude({
    system: `You are an expert React + TypeScript + Tailwind CSS developer.
Generate production-ready React components. No explanations — just the raw TSX file content.
Make sites feel warm, trustworthy, and conversion-focused for local businesses.
Include real placeholder content specific to the business niche.`,
    messages: [{
      role: "user",
      content: `Generate a complete ${page} page component for:

Business: ${project.client_name}
Niche: ${project.niche}
Location: ${project.metadata?.address ?? project.metadata?.location ?? "local area"}
Phone: ${project.metadata?.phone ?? "(337) 555-0100"}
Package: ${project.package} — ${structure} structure
Primary color: ${palette.primary}
Accent color: ${palette.accent}
Background/secondary: ${palette.secondary}
Text color: ${palette.text}
Wireframe hint: ${wireframe ? JSON.stringify(wireframe).slice(0, 300) : "none"}

Page: ${page}

Section requirements:
- Hero (Home/Landing): bold headline, subheadline, CTA button with phone number, bg uses primary color
- Services: 4-6 realistic services for this niche with icons (use emoji or SVG inline)
- About: owner story, years in business, trust badges
- Testimonials: 3 realistic 5-star reviews from local customers with first name + city
- Contact: phone number, address, Google Maps embed placeholder, contact form
- Booking: clear CTA with phone + simple form (name, date, service, message)
- Gallery: 6 placeholder image cards (gray bg with label text)
- Blog: 3 article cards with title, excerpt, date
- Footer: business name, tagline, quick links, phone, address, copyright
- FAQ: 5 realistic questions & answers for this niche using an accordion (useState)

Generate ONLY the TSX component starting with imports. Export default at the end.`
    }],
    maxTokens: 2500,
  });
}

async function generateSharedComponent(
  project:   any,
  component: string,
  palette:   NichePalette
): Promise<string> {
  return askClaude({
    system: `You are an expert React + TypeScript + Tailwind developer.
Generate clean shared components. No explanations, just code.`,
    messages: [{
      role: "user",
      content: `Generate the ${component} shared component for:

Business: ${project.client_name}
Niche: ${project.niche}
Phone: ${project.metadata?.phone ?? "(337) 555-0100"}
Primary color: ${palette.primary}
Accent color: ${palette.accent}
Background: ${palette.secondary}
Text: ${palette.text}

Component: ${component}

Requirements per component:
- Navbar: logo/business-name left, nav links right, mobile hamburger (useState), phone CTA button using accent color
- Footer: business name, tagline, 3 quick links, phone, address, copyright line
- ContactForm: controlled form with name/email/phone/message fields, submit button, TypeScript useState
- HeroSection: reusable component accepting headline, subheadline, ctaText, ctaHref props — full-bleed primary bg, white text

Generate ONLY the TSX code starting with imports. Export default at the end.`
    }],
    maxTokens: 1500,
  });
}

// ─────────────────────────────────────────────
// Static file generators (no Claude needed)
// ─────────────────────────────────────────────

function generateTailwindConfig(palette: NichePalette): string {
  return `import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}',
  ],
  theme: {
    extend: {
      colors: {
        primary:   '${palette.primary}',
        secondary: '${palette.secondary}',
        accent:    '${palette.accent}',
        brand: {
          text: '${palette.text}',
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
    },
  },
  plugins: [],
}

export default config
`;
}

function generateIndexCss(palette: NichePalette): string {
  return `@tailwind base;
@tailwind components;
@tailwind utilities;

:root {
  --color-primary:   ${palette.primary};
  --color-secondary: ${palette.secondary};
  --color-accent:    ${palette.accent};
  --color-text:      ${palette.text};
}

body {
  font-family: Inter, system-ui, sans-serif;
  color: var(--color-text);
  background: #ffffff;
}

@layer utilities {
  .bg-primary   { background-color: var(--color-primary); }
  .bg-accent    { background-color: var(--color-accent); }
  .text-primary { color: var(--color-primary); }
  .text-accent  { color: var(--color-accent); }
  .border-primary { border-color: var(--color-primary); }
}
`;
}

function generateViteConfig(): string {
  return `import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
})
`;
}

function generateTsconfigNode(): string {
  return JSON.stringify({
    compilerOptions: {
      composite:        true,
      skipLibCheck:     true,
      module:           "ESNext",
      moduleResolution: "bundler",
      allowSyntheticDefaultImports: true,
    },
    include: ["vite.config.ts"],
  }, null, 2);
}

function generatePostcssConfig(): string {
  return `export default {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
}
`;
}

function generateTsconfig(): string {
  return JSON.stringify({
    compilerOptions: {
      target:           "ES2020",
      useDefineForClassFields: true,
      lib:              ["ES2020", "DOM", "DOM.Iterable"],
      module:           "ESNext",
      skipLibCheck:     true,
      moduleResolution: "bundler",
      allowImportingTsExtensions: true,
      resolveJsonModule: true,
      isolatedModules:  true,
      noEmit:           true,
      jsx:              "react-jsx",
      strict:           true,
      noUnusedLocals:   true,
      noUnusedParameters: true,
      noFallthroughCasesInSwitch: true,
    },
    include: ["src"],
    references: [{ path: "./tsconfig.node.json" }],
  }, null, 2);
}

function generateIndexHtml(project: any): string {
  const title = project.client_name ?? "Local Business";
  return `<!doctype html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/svg+xml" href="/vite.svg" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="${title} — professional local service" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap" rel="stylesheet" />
    <title>${title}</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
`;
}

function generateMainTsx(): string {
  return `import React from 'react'
import ReactDOM from 'react-dom/client'
import App from './App'
import './index.css'

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
)
`;
}

function generatePackageJson(project: any): string {
  const slug = (project.client_name as string)
    .toLowerCase()
    .replace(/[^a-z0-9]/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");

  return JSON.stringify({
    name:    slug,
    version: "1.0.0",
    private: true,
    scripts: {
      dev:     "vite",
      build:   "tsc && vite build",
      preview: "vite preview",
    },
    dependencies: {
      "react":             "^18.2.0",
      "react-dom":         "^18.2.0",
      "react-router-dom":  "^6.22.0",
    },
    devDependencies: {
      "@types/react":            "^18.2.0",
      "@types/react-dom":        "^18.2.0",
      "@vitejs/plugin-react":    "^4.2.0",
      "autoprefixer":            "^10.4.17",
      "postcss":                 "^8.4.35",
      "tailwindcss":             "^3.4.1",
      "typescript":              "^5.3.3",
      "vite":                    "^5.1.0",
    }
  }, null, 2);
}

function generateReadme(project: any, structure: string, pages: string[]): string {
  return `# ${project.project_name}

Generated by AI Agency BUILDER agent.

## Stack
- React 18 + TypeScript
- Tailwind CSS
- Vite
- React Router v6

## Pages
${pages.map(p => `- ${p}`).join("\n")}

## Structure
${structure}

## Setup
\`\`\`bash
npm install
npm run dev
\`\`\`

## Build for production
\`\`\`bash
npm run build
\`\`\`

## Deploy
Upload the \`dist/\` folder to any static host:
- Netlify (drag and drop)
- Vercel
- Cloudflare Pages

## Client
- Business: ${project.client_name}
- Niche: ${project.niche}
- Package: ${project.package}
`;
}

function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}
