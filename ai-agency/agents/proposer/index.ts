// agents/proposer/index.ts — STUB (build next after PRODUCER)
import { Task, AgentRunResult } from "../../core/types";
import { askClaude } from "../../core/claude";

export async function run(task: Task): Promise<AgentRunResult> {
  const project = task.input_data?.project;

  // Basic Claude call — full PROPOSER agent will expand this
  const proposal = await askClaude({
    system: `You are a professional website sales consultant. Write warm, soothing, 
             persuasive project proposals for coaches, e-commerce brands, and local 
             service businesses. Be concise, confident, and friendly.`,
    messages: [{
      role:    "user",
      content: `Write a project proposal for:
Client: ${project?.client_name}
Business: ${project?.project_name}
Niche: ${project?.niche}
Package: ${project?.package} ($${project?.price})
Notes: ${project?.notes}

Include: project overview, deliverables, timeline, investment, and next steps.`
    }],
    maxTokens: 1500,
  });

  return {
    summary:  `Proposal drafted for ${project?.client_name}`,
    data:     { proposal_text: proposal },
    metadata: { word_count: proposal.split(" ").length }
  };
}
