// scripts/seed.ts
// ─────────────────────────────────────────────
// Seeds a test lead + project + first task
// so you can immediately test PRODUCER
// Usage: npm run db:seed
// ─────────────────────────────────────────────

import "dotenv/config";
import { insertLead, insertProject, insertTask } from "../core/queries";
import { pool } from "../core/db";

async function seed() {
  console.log("🌱 Seeding test data...\n");

  try {
    // 1. Insert a test lead
    const lead = await insertLead({
      source:        "manual",
      business_name: "Calm & Co. Coaching",
      contact_name:  "Sarah Mitchell",
      email:         "sarah@calmandco.com",
      phone:         "555-0101",
      website_url:   null,
      niche:         "coach",
      location:      "Austin, TX",
      notes:         "Life coach looking for a clean, calming website. Budget around $1,500.",
      score:         82,
      status:        "qualified",
    });
    console.log(`✅ Lead created: ${lead.id} — ${lead.business_name}`);

    // 2. Convert lead into a project
    const project = await insertProject({
      lead_id:       lead.id,
      client_name:   "Sarah Mitchell",
      client_email:  "sarah@calmandco.com",
      project_name:  "Calm & Co. — Website Redesign",
      niche:         "coach",
      package:       "growth",
      price:         1500,
      tech_stack:    "React / TypeScript / Tailwind",
      status:        "active",
      current_stage: "PROPOSAL",
      deadline:      new Date(Date.now() + 14 * 24 * 60 * 60 * 1000), // 2 weeks
      notes:         "Wants soothing colours, minimal design, booking integration",
      metadata: {
        brand_colors:  ["#E8F4F1", "#3D8A7A"],
        tone:          "calm, professional, warm",
        pages_needed:  ["Home", "About", "Services", "Booking", "Contact"],
      }
    });
    console.log(`✅ Project created: ${project.id} — ${project.project_name}`);

    // 3. Queue the first task (PROPOSER generates the proposal)
    const task = await insertTask({
      project_id:  project.id,
      agent:       "PROPOSER",
      task_type:   "generate_proposal",
      status:      "pending",
      priority:    2,
      input_data: {
        project,
        lead,
        instructions: "Generate a warm, professional proposal for a life coach. Emphasise clean design, mobile-first, and a 2-week turnaround.",
      },
      output_data: null,
      error_log:   null,
      retries:     0,
    });
    console.log(`✅ Task queued:   ${task.id} — ${task.task_type}`);

    console.log("\n🎉 Seed complete! PRODUCER will pick this up on next heartbeat.");
    console.log(`\n   Project ID: ${project.id}`);
    console.log(`   Task ID:    ${task.id}`);
    console.log("\n   Start the server: npm run dev");

  } catch (err) {
    console.error("❌ Seed failed:", err);
    process.exit(1);
  } finally {
    await pool.end();
  }
}

seed();
