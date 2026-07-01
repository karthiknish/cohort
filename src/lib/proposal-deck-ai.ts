import type { ProposalFormData } from '@/lib/proposals';
import { deepseekAI } from '@/services/deepseek';
const FALLBACK_DECK_INSTRUCTIONS = `Slide 1: A tailored strategy to achieve measurable growth
METRICS:
- value: "25%" | label: Target conversion rate uplift
- value: "3.5x" | label: Projected return on ad spend
- value: "£0" | label: Wasted spend eliminated
CALLOUT: This proposal outlines a data-driven path to scalable, profitable growth.
BULLETS:
- Audit current performance and identify the highest-impact growth opportunities
- Propose a phased approach with clear KPIs and weekly reporting cadence
- Align budget allocation with proven channels for your industry

Slide 2: Current state analysis reveals untapped growth potential
COMPARISON:
Before:
- Manual bid management with no audience segmentation
- Single-channel dependency on paid search
- No conversion tracking on mobile checkout flow
- Landing page bounce rate above 65%
After:
- Automated bid strategy with layered audience targeting
- Diversified channel mix across paid social and search
- Full-funnel tracking with event-based measurement
- Optimised landing pages targeting a 40% bounce rate
CALLOUT: Quick-win fixes in weeks 1-2 can recover an estimated 15% of wasted spend.

Slide 3: Target audience insights shape channel selection
METRICS:
- value: "68%" | label: Mobile-first users
- value: "2.3x" | label: Lookalike audience reach
- value: "45%" | label: Repeat purchase rate
CALLOUT: Audience research confirms mobile social is the highest-impact acquisition channel.
BULLETS:
- Primary persona: 25-40 professionals researching on mobile during commute hours
- Secondary persona: decision-makers active on LinkedIn during business hours
- Retargeting pool of 50k site visitors ready for nurture campaigns

Slide 4: A three-phase strategy balances quick wins with sustainable scaling
BULLETS:
- Phase 1 (Weeks 1-4): Foundation — audit, tracking setup, quick-win optimisations
- Phase 2 (Weeks 5-8): Scale — expand winning channels with incremental budget increases
- Phase 3 (Weeks 9-12): Optimise — continuous testing and refinement based on performance data
CALLOUT: Each phase has clear deliverables, success criteria, and review checkpoints.

Slide 5: Budget allocation prioritises proven channels with a testing allowance
METRICS:
- value: "40%" | label: Paid social
- value: "30%" | label: Paid search
- value: "20%" | label: Content & SEO
- value: "10%" | label: Testing budget
CALLOUT: 90% to proven channels, 10% reserved for testing new opportunities.
BULLETS:
- Allocate budget based on historical performance and industry benchmarks
- Reserve 10% for testing emerging channels and creative variations
- Monthly budget reallocation based on ROAS performance per channel

Slide 6: Projected ROI delivers break-even within 4 months
METRICS:
- value: "3.2x" | label: Projected ROAS by month 6
- value: "£125k" | label: Incremental revenue year 1
- value: "4 mo" | label: Break-even timeline
CALLOUT: Conservative projections assume a 15% conversion rate uplift in the first quarter.
BULLETS:
- Revenue projections based on industry benchmarks and current traffic levels
- Break-even calculation includes management fee and ad spend
- Upside scenario with 25% uplift delivers 4.8x ROAS by month 6

Slide 7: Execution roadmap delivers first results within 4 weeks
BULLETS:
- Week 1-2: Kickoff, tracking audit, and account structure setup
- Week 3-4: Creative production and campaign launch
- Week 5-8: Monitoring, optimisation, and first performance review
- Week 9-12: Scaling winners and pausing underperformers
CALLOUT: First results visible within 4 weeks, full optimisation cycle by week 12.

Slide 8: Continuous testing ensures budget flows to the best-performing campaigns
COMPARISON:
Before:
- Budget set once per quarter with no reallocation
- Creative refreshed only when performance drops
- No structured testing framework
After:
- Bi-weekly budget reallocation based on ROAS performance
- Creative refresh calendar with bi-weekly new variants
- Structured A/B testing framework with statistical significance targets
CALLOUT: A test-and-learn culture compounds returns over time.

Slide 9: Next steps to launch within 2 weeks of approval
METRICS:
- value: "2 wk" | label: Time to launch
- value: "4 wk" | label: First results
- value: "12 wk" | label: Full optimisation
CALLOUT: Approve today to start seeing results within 4 weeks.
BULLETS:
- Approve the proposal and budget allocation by end of week
- Schedule a kickoff meeting to align on access and tracking setup
- Launch first campaigns within 2 weeks of approval`;
function truncateDeckInstructions(value: string): string {
    const cleaned = value.trim();
    if (!cleaned)
        return '';
    return cleaned.length > 5000 ? cleaned.slice(0, 5000) : cleaned;
}
function buildDeckInstructionPrompt(formData: ProposalFormData): string {
    const company = formData.company?.name?.trim() || 'Client';
    const industry = formData.company?.industry?.trim();
    const goals = formData.goals?.objectives?.join(', ');
    const audience = formData.goals?.audience?.trim();
    const challenges = [...(formData.goals?.challenges || []), formData.goals?.customChallenge]
        .filter(Boolean)
        .join(', ');
    const scope = [...(formData.scope?.services || []), formData.scope?.otherService].filter(Boolean).join(', ');
    const timeline = formData.timelines?.startTime?.trim();
    const context = [
        `Company: ${company}`,
        industry ? `Industry: ${industry}` : null,
        goals ? `Core Objectives: ${goals}` : null,
        audience ? `Target Audience: ${audience}` : null,
        challenges ? `Key Challenges: ${challenges}` : null,
        scope ? `Scope of Work: ${scope}` : null,
        timeline ? `Desired Start Date: ${timeline}` : null,
    ]
        .filter(Boolean)
        .join('\n');
    return `You are a world-class marketing strategist creating a high-converting marketing proposal deck. Create a strategic slide-by-slide outline based on the following context:

${context}

FORMAT RULES (follow exactly — the output is parsed by a machine):
- Use 8-10 slides.
- Each slide starts with "Slide N: " followed by an action-title (a full sentence stating the takeaway, max 12 words).
- Every slide MUST include a CALLOUT line — it becomes the highlighted takeaway box.
- Every slide MUST use at least one of these content blocks. VARY the content types across slides — do NOT use BULLETS-only on more than 2 consecutive slides.

  METRICS: (use for slides with key numbers, KPIs, benchmarks, or budget breakdowns)
  METRICS:
  - value: "45%" | label: Expected conversion rate uplift
  - value: "3.2x" | label: Projected ROAS
  - value: "£50k" | label: Testing budget allocated
  CALLOUT: A single bottom-line sentence summarising the strategic takeaway.
  BULLETS:
  - First supporting point with specific, actionable detail
  - Second supporting point with specific, actionable detail

  COMPARISON: (use for before/after, current vs proposed, or competitive analysis — at least 2 slides MUST use this)
  COMPARISON:
  Before:
  - Current state point 1
  - Current state point 2
  After:
  - Proposed state point 1
  - Proposed state point 2
  CALLOUT: A single bottom-line sentence.

  BULLETS: (use for strategy, approach, or execution slides — but combine with METRICS when possible)
  BULLETS:
  - First point: Brief explanation of what and why
  - Second point: Brief explanation of what and why
  - Third point: Brief explanation of what and why
  CALLOUT: A single bottom-line sentence summarising the strategic takeaway.

CONTENT DISTRIBUTION REQUIREMENTS (critical — the parser renders different layouts for each type):
- At least 4 slides MUST include a METRICS block (KPIs, budget breakdown, ROI projections, audience stats).
- At least 2 slides MUST include a COMPARISON block (current vs proposed state, before/after).
- No more than 2 slides should be BULLETS-only (without METRICS or COMPARISON).
- METRICS + BULLETS can coexist on the same slide — use this combination for data-rich slides.

CONTENT GUIDELINES:
- Write action titles as full sentences that state the takeaway (e.g. "Paid social will drive 60% of new acquisition within Q1" not "Social Media Strategy").
- Use specific numbers, percentages, and timelines — never vague claims like "significant growth".
- Each bullet should be 1-2 lines with concrete detail, not just a label.
- The CALLOUT line is mandatory for every slide — it becomes the highlighted takeaway box.
- Ensure the narrative flows: pain points → audience insight → strategy → execution roadmap → budget → projected ROI → next steps.
- Return plain text only. No markdown, no bold, no headers beyond "Slide N:".`;
}
function buildDeckContextText(formData: ProposalFormData, summary?: string): string {
    const companyName = formData.company?.name?.trim() || 'Client';
    const industry = formData.company?.industry?.trim();
    const goals = formData.goals?.objectives?.join(', ');
    const budget = formData.marketing?.budget?.trim();
    const scope = [...(formData.scope?.services || []), formData.scope?.otherService].filter(Boolean).join(', ');
    return [
        `Client: ${companyName}`,
        industry ? `Industry: ${industry}` : null,
        goals ? `Strategic Goals: ${goals}` : null,
        budget ? `Budget: ${budget}` : null,
        scope ? `Proposed Scope: ${scope}` : null,
        summary ? `AI Generated Outline:\n${summary}` : null,
    ]
        .filter(Boolean)
        .join('\n');
}
async function resolveDeckInstructions(formData: ProposalFormData, candidate?: string | null): Promise<string> {
    const trimmedCandidate = typeof candidate === 'string' ? truncateDeckInstructions(candidate) : '';
    if (trimmedCandidate.length > 0) {
        return trimmedCandidate;
    }
    try {
        const prompt = buildDeckInstructionPrompt(formData);
        const raw = await deepseekAI.generateContent(prompt);
        const generated = truncateDeckInstructions(raw);
        if (generated.length > 0) {
            return generated;
        }
    }
    catch {
        // Fall back to static outline.
    }
    return truncateDeckInstructions(FALLBACK_DECK_INSTRUCTIONS);
}
export async function generateDeckInstructions(formData: ProposalFormData, existing?: string | null): Promise<string> {
    return resolveDeckInstructions(formData, existing);
}
export async function generateProposalSuggestions(formData: ProposalFormData, summary: string | null | undefined): Promise<string | null> {
    try {
        const baseContext = buildDeckContextText(formData, summary ?? undefined);
        const prompt = `You are a senior marketing strategist. Based on the client context and AI outline below, produce three concise recommendations the account team should act on next. Each recommendation must:
- Start with "- "
- Stay under 120 characters
- Focus on high-impact actions (budget, messaging, channel, measurement, or collaboration)
- Reference missing data when appropriate

Keep the tone confident and collaborative. Do not include introductions or conclusions.

Client context:
${baseContext}

AI outline:
${summary ?? 'Not available'}`;
        const raw = await deepseekAI.generateContent(prompt);
        const cleaned = raw.trim();
        if (!cleaned) {
            return null;
        }
        const lines = cleaned
            .split(/\r?\n+/)
            .flatMap((line) => {
            const trimmed = line.trim();
            return trimmed.length > 0 ? [trimmed] : [];
        });
        if (!lines.length) {
            return cleaned;
        }
        return lines
            .map((line) => {
            if (line.startsWith('-'))
                return line;
            const trimmed = line.replace(/^\s*(?:[-•*]|\d+[\.\)])\s*/, '');
            return `- ${trimmed}`;
        })
            .join('\n');
    }
    catch {
        return null;
    }
}
/** @deprecated Use generateDeckInstructions */
export const generatePresentationInstructions = generateDeckInstructions;
