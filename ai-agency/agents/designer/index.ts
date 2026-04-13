// agents/designer/index.ts
// ═════════════════════════════════════════════
//  DESIGNER — Wireframe & Style Guide Agent
//  Triggered by PRODUCER after PROPOSAL approval.
//  Outputs a full design brief that BUILDER uses
//  to generate the site code.
// ═════════════════════════════════════════════

import { Task, AgentRunResult }                from "../../core/types";
import { log }                                 from "../../core/logger";
import { insertAsset }                         from "../../core/queries";
import { generateDesignBrief }                 from "./generator";
import { getTopStylesForNiche }                from "./styles";
import { getTopGenresForNiche, GenreIntensity } from "./genres";
import { BUILDER_CONFIG }                       from "../builder/config";

// ─────────────────────────────────────────────
// Package → site structure mapping
// ─────────────────────────────────────────────
const PACKAGE_STRUCTURE: Record<string, keyof typeof BUILDER_CONFIG.structures> = {
  starter:  "single",
  basic:    "multi",
  growth:   "multi_with_booking",
  pro:      "multi_full",
};

export async function run(task: Task): Promise<AgentRunResult> {
  const project = task.project;
  if (!project) throw new Error("DESIGNER: no project in task input_data");

  await log("DESIGNER", "run_started", {
    project_id: project.id,
    client:     project.client_name,
  }, "success", project.id);

  // ── Determine pages from package ──
  const structureKey = (task.input_data?.structure as keyof typeof BUILDER_CONFIG.structures)
    ?? PACKAGE_STRUCTURE[project.package ?? "growth"]
    ?? "multi_with_booking";

  const pages = BUILDER_CONFIG.structures[structureKey];

  // ── Pick best base style for this niche ──
  const niche       = project.niche ?? "general";
  const topStyles   = getTopStylesForNiche(niche, 3);
  const style       = topStyles[0];

  // ── Pick best art genre for this niche ──
  const topGenres   = getTopGenresForNiche(niche, 3);
  const genre       = topGenres[0];

  // ── Determine intensity from package ──
  const intensity: GenreIntensity =
    project.package === "starter" ? "subtle"
    : project.package === "pro"   ? "full_send"
    :                               "standard";

  await log("DESIGNER", "generating_brief", {
    style:     style.name,
    genre:     genre.name,
    intensity,
    pages:     pages.length,
    niche,
  }, "success", project.id);

  // ── Generate wireframe + style guide ──
  const brief = await generateDesignBrief(
    project,
    style,
    pages,
    genre,
    intensity,
  );

  await log("DESIGNER", "brief_generated", {
    style:          style.name,
    genre:          genre.name,
    intensity,
    wireframe_pages: brief.wireframe.length,
  }, "success", project.id);

  // ── Save as asset ──
  const asset = await insertAsset({
    project_id:  project.id,
    task_id:     task.id,
    asset_type:  "design_brief",
    title:       `Design Brief — ${project.client_name}`,
    content:     JSON.stringify(brief),
    file_url:    null,
    version:     1,
    is_approved: false,
    metadata: {
      style:     style.name,
      style_id:  style.id,
      genre:     genre.name,
      genre_id:  genre.id,
      intensity,
      pages,
    },
  });

  await log("DESIGNER", "asset_saved", {
    asset_id:  asset.id,
    title:     asset.title,
  }, "success", project.id);

  return {
    summary: `Design brief created — ${style.name} style + ${genre.name} genre (${intensity}) across ${pages.length} pages`,
    data: {
      style_name:    style.name,
      style_id:      style.id,
      genre_name:    genre.name,
      genre_id:      genre.id,
      intensity,
      pages,
      builder_notes: brief.builderNotes,
    },
    metadata: {
      asset_id:    asset.id,
      wireframe:   brief.wireframe,
      style_guide: brief.styleGuide,
    },
  };
}
