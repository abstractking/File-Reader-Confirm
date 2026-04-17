// agents/proposer/generator.ts
// ═════════════════════════════════════════════
//  Proposal Generator
//  Claude writes a fully tailored, warm proposal
//  for each client based on their business details,
//  site analysis, and chosen package.
// ═════════════════════════════════════════════

import { askClaude }        from "../../core/claude";
import { Project }          from "../../core/types";
import { PACKAGES, AGENCY, BRAND_VOICE } from "./config";
import { SiteAnalysis, formatAnalysis }  from "./analyzer";

export interface GeneratedProposal {
  subject_line:    string;
  proposal_text:   string;
  package_id:      string;
  package_name:    string;
  price:           number;
  timeline:        string;
  word_count:      number;
}

// ─────────────────────────────────────────────
// Generate a full proposal for a project
// ─────────────────────────────────────────────
export async function generateProposal(
  project:      Project,
  siteAnalysis: SiteAnalysis | null,
  revisionNotes?: string
): Promise<GeneratedProposal> {
  const pkg      = PACKAGES[project.package ?? "growth"] ?? PACKAGES.growth;
  const analysis = siteAnalysis ? formatAnalysis(siteAnalysis) : "No existing website — this is a new build from scratch.";

  const deliverablesList = pkg.deliverables.map(d => `• ${d}`).join("\n");

  const revisionSection = revisionNotes
    ? `\n\nIMPORTANT — This is a REVISION. The owner rejected the previous draft with these notes:\n"${revisionNotes}"\nAddress every point in the revision notes carefully.`
    : "";

  const proposal = await askClaude({
    system: `You are a proposal writer for ${AGENCY.name}, a web design agency 
             based in ${AGENCY.location} that builds simple, high-converting websites 
             for local service businesses.

Brand voice and tone rules:
${BRAND_VOICE}

Your job is to write a complete, ready-to-send project proposal. 
Write in first person as the agency owner.
Be specific — reference the client's actual business name, niche, and situation.
Never sound generic or templated.
${revisionSection}`,

    messages: [{
      role:    "user",
      content: `Write a full website project proposal using these details:

━━━━━━━━━━━━━━━━━━━━━━━━━
CLIENT DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━
Business: ${project.client_name}
Project: ${project.project_name}
Niche: ${project.niche}
Location: ${project.metadata?.address ?? project.metadata?.location ?? "local area"}
Phone on file: ${project.metadata?.phone ?? "not provided"}

━━━━━━━━━━━━━━━━━━━━━━━━━
THEIR CURRENT WEBSITE SITUATION
━━━━━━━━━━━━━━━━━━━━━━━━━
${analysis}

━━━━━━━━━━━━━━━━━━━━━━━━━
RECOMMENDED PACKAGE: ${pkg.name.toUpperCase()}
━━━━━━━━━━━━━━━━━━━━━━━━━
Price: $${(pkg.price ?? 0).toLocaleString()}
Timeline: ${pkg.timeline}
Tagline: ${pkg.tagline}
Ideal for: ${pkg.idealFor}

What's included:
${deliverablesList}

━━━━━━━━━━━━━━━━━━━━━━━━━
AGENCY DETAILS
━━━━━━━━━━━━━━━━━━━━━━━━━
Agency: ${AGENCY.name}
Owner: ${AGENCY.owner}
Email: ${AGENCY.email}
Phone: ${AGENCY.phone}
Website: ${AGENCY.website}

━━━━━━━━━━━━━━━━━━━━━━━━━
PROPOSAL STRUCTURE TO FOLLOW
━━━━━━━━━━━━━━━━━━━━━━━━━

Write the proposal in this exact order:

1. SUBJECT LINE
   (for when the owner emails this — write it as: Subject: ...)
   Make it personal and specific to their business.

2. GREETING
   Warm, personal opening. 1-2 sentences.

3. WHAT I NOTICED
   2-3 sentences about their specific situation.
   Reference actual details from the site analysis.
   If no website: talk about the opportunity they're missing.
   Be empathetic, not condescending.

4. WHAT I'D BUILD FOR YOU
   Introduce the ${pkg.name} package with its tagline.
   List the deliverables in a clean, readable format.
   Make it feel exciting and tangible, not like a boring spec sheet.

5. YOUR INVESTMENT
   State the price clearly: $${(pkg.price ?? 0).toLocaleString()} — one clear project fee.
   Mention the timeline: ${pkg.timeline}.
   Optional: mention a payment structure (50% upfront, 50% on launch).

6. WHAT HAPPENS NEXT
   Simple 3-step process:
   Step 1 — We hop on a quick 15-min call to align on your vision
   Step 2 — I get to work, you get updates along the way
   Step 3 — We launch your new site

7. CLOSING
   Warm, low-pressure close. Invite them to reply or call.
   Sign off as ${AGENCY.owner} from ${AGENCY.name}.

IMPORTANT RULES:
- Total length: 350-500 words (concise but complete)
- No corporate jargon, no buzzwords
- Write every section — do not skip any
- Start your response with "Subject: " on the first line`
    }],
    maxTokens: 1200,
  });

  // Extract subject line from first line
  const lines       = proposal.trim().split("\n");
  const subjectLine = lines[0].replace(/^subject:\s*/i, "").trim();
  const bodyText    = lines.slice(1).join("\n").trim();

  return {
    subject_line:  subjectLine,
    proposal_text: bodyText,
    package_id:    pkg.id,
    package_name:  pkg.name,
    price:         pkg.price,
    timeline:      pkg.timeline,
    word_count:    bodyText.split(/\s+/).length,
  };
}
