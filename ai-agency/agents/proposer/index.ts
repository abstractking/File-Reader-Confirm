// agents/proposer/index.ts
// ═════════════════════════════════════════════
//  PROPOSER — Sales Proposal Agent
//  Triggered by PRODUCER after a lead is
//  qualified. Analyzes client site, writes a
//  tailored proposal with Claude, sends to
//  Slack for your review before anything
//  goes to the client.
// ═════════════════════════════════════════════

import { Task, AgentRunResult }  from "../../core/types";
import { log }                   from "../../core/logger";
import { analyzeWebsite }        from "./analyzer";
import { generateProposal }      from "./generator";
import { sendProposalCard,
         postApprovedProposal,
         postEditPrompt }        from "./slack";
import { PACKAGES }              from "./config";
import { insertAsset }           from "../../core/queries";

// ─────────────────────────────────────────────
// Main run() — called by PRODUCER dispatcher
// ─────────────────────────────────────────────
export async function run(task: Task): Promise<AgentRunResult> {
  const project       = task.input_data?.project;
  const revisionNotes = task.input_data?.revision_notes as string | undefined;

  if (!project) throw new Error("PROPOSER: no project in task input_data");

  await log(
    "PROPOSER", "run_started",
    { project_id: project.id, client: project.client_name, revision: !!revisionNotes },
    "success", project.id
  );

  // 1. Analyze existing website (if they have one)
  let siteAnalysis = null;
  const websiteUrl  = project.metadata?.website_url ?? null;

  if (websiteUrl) {
    await log("PROPOSER", "analyzing_site", { url: websiteUrl }, "success", project.id);
    siteAnalysis = await analyzeWebsite(websiteUrl);
  }

  // 2. Generate proposal with Claude
  await log("PROPOSER", "generating_proposal", { package: project.package }, "success", project.id);
  const proposal = await generateProposal(project, siteAnalysis, revisionNotes);

  // 3. Save proposal as draft asset
  await insertAsset({
    project_id:  project.id,
    task_id:     task.id,
    asset_type:  "proposal_draft",
    title:       `Proposal — ${project.client_name} (${proposal.package_name})`,
    content:     `Subject: ${proposal.subject_line}\n\n${proposal.proposal_text}`,
    file_url:    null,
    version:     (task.input_data?.revision_count ?? 0) + 1,
    is_approved: false,
    metadata: {
      package_id:   proposal.package_id,
      price:        proposal.price,
      timeline:     proposal.timeline,
      word_count:   proposal.word_count,
      subject_line: proposal.subject_line,
    }
  });

  await log(
    "PROPOSER", "proposal_generated",
    { words: proposal.word_count, package: proposal.package_name, price: proposal.price },
    "success", project.id
  );

  return {
    summary:  `Proposal drafted for ${project.client_name} — ${proposal.package_name} package at $${proposal.price.toLocaleString()}`,
    data: {
      subject_line:  proposal.subject_line,
      proposal_text: proposal.proposal_text,
      package_id:    proposal.package_id,
      package_name:  proposal.package_name,
      price:         proposal.price,
      timeline:      proposal.timeline,
      word_count:    proposal.word_count,
      site_issues:   siteAnalysis?.issues ?? [],
    },
    metadata: {
      revision:    !!revisionNotes,
      has_website: !!websiteUrl,
    }
  };
}

// ─────────────────────────────────────────────
// Called by PRODUCER after proposal approved
// Posts full copyable text to Slack
// ─────────────────────────────────────────────
export async function onApproved(
  task:    Task,
  project: any
): Promise<void> {
  if (!task.output_data) return;

  const proposal = {
    subject_line:  task.output_data.subject_line,
    proposal_text: task.output_data.proposal_text,
    package_id:    task.output_data.package_id,
    package_name:  task.output_data.package_name,
    price:         task.output_data.price,
    timeline:      task.output_data.timeline,
    word_count:    task.output_data.word_count,
  };

  await postApprovedProposal(proposal, project);

  await log("PROPOSER", "proposal_approved_posted", { client: project.client_name }, "success", project.id);
}
