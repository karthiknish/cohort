import type { ProposalFormData } from '@/lib/proposals';
import { deepseekAI } from '@/services/deepseek';
import { logger } from '@/lib/logger';
const FALLBACK_DECK_INSTRUCTIONS = `Slide 1: A tailored strategy to achieve measurable growth
METRICS:
- value: "25%" | label: Target conversion rate uplift
- value: "3.5x" | label: Projected return on ad spend
- value: "£0" | label: Wasted spend eliminated
CALLOUT: This proposal outlines a data-driven path to scalable, profitable growth.
NOTES: Open with confidence — reference the client's industry and the specific opportunity you've identified. Keep it under 60 seconds.
IMAGE: business growth chart
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
NOTES: Walk through the before/after contrast — let the client feel the gap between where they are and where they could be.
IMAGE: data analytics dashboard

Slide 3: Target audience insights shape channel selection
METRICS:
- value: "68%" | label: Mobile-first users
- value: "2.3x" | label: Lookalike audience reach
- value: "45%" | label: Repeat purchase rate
CALLOUT: Audience research confirms mobile social is the highest-impact acquisition channel.
NOTES: Highlight the mobile-first stat — it directly justifies the channel mix on the next slides.
IMAGE: target audience demographics
BULLETS:
- Primary persona: 25-40 professionals researching on mobile during commute hours
- Secondary persona: decision-makers active on LinkedIn during business hours
- Retargeting pool of 50k site visitors ready for nurture campaigns

Slide 4: A three-phase strategy balances quick wins with sustainable scaling
BULLETS:
- Phase 1: Foundation — audit, tracking setup, quick-win optimisations in weeks 1-4
- Phase 2: Scale — expand winning channels with 20% incremental budget increases in weeks 5-8
- Phase 3: Optimise — continuous A/B testing and refinement based on performance data in weeks 9-12
- Phase 4: Sustain — quarterly strategy review and long-term scaling roadmap from week 13
CALLOUT: Each phase has clear deliverables, success criteria, and review checkpoints.
NOTES: Emphasise that the strategy is phased to reduce risk — each phase gates the next based on results.
IMAGE: strategy planning whiteboard

Slide 5: Execution roadmap delivers first results within 4 weeks
TIMELINE:
- phase: 1 | title: Foundation | detail: Kickoff, tracking audit, account structure setup, and quick-win fixes | duration: Weeks 1-4
- phase: 2 | title: Scale | detail: Creative production, campaign launch, and incremental budget expansion | duration: Weeks 5-8
- phase: 3 | title: Optimise | detail: Monitoring, A/B testing, performance review, and scaling winners | duration: Weeks 9-12
- phase: 4 | title: Sustain | detail: Long-term scaling, quarterly strategy review, and channel expansion | duration: Weeks 13+
CALLOUT: First results visible within 4 weeks, full optimisation cycle by week 12.
NOTES: Walk through each phase — stress that the client sees tangible output (campaigns live, data flowing) by week 4.
IMAGE: project timeline roadmap

Slide 6: Budget allocation prioritises proven channels with a testing allowance
METRICS:
- value: "40%" | label: Paid social
- value: "30%" | label: Paid search
- value: "20%" | label: Content & SEO
- value: "10%" | label: Testing budget
CALLOUT: 90% to proven channels, 10% reserved for testing new opportunities.
NOTES: Explain the 90/10 split — it balances reliability with innovation. Offer to adjust based on the client's risk appetite.
IMAGE: budget pie chart
BULLETS:
- Allocate budget based on historical performance and industry benchmarks
- Reserve 10% for testing emerging channels and creative variations
- Monthly budget reallocation based on ROAS performance per channel

Slide 7: Businesses that invest in structured testing see 30% higher ROAS within 6 months
QUOTE: text: Companies with a documented testing framework achieve 30% higher ROAS than those without, within the first 6 months. | attribution: Industry benchmark, 2024
CALLOUT: A test-and-learn culture compounds returns over time.
NOTES: Pause here — let the stat land. Then explain how your testing framework is more rigorous than what most agencies do.
IMAGE: business success handshake

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
NOTES: Contrast the old way (set and forget) with your approach (continuous optimisation). The bi-weekly cadence is the key differentiator.
IMAGE: ab testing experiment

Slide 9: Projected ROI delivers break-even within 4 months
METRICS:
- value: "3.2x" | label: Projected ROAS by month 6
- value: "£125k" | label: Incremental revenue year 1
- value: "4 mo" | label: Break-even timeline
CALLOUT: Conservative projections assume a 15% conversion rate uplift in the first quarter.
NOTES: Be clear these are conservative — the upside scenario is 4.8x. Walk through the break-even math so the client trusts the numbers.
IMAGE: roi growth graph
BULLETS:
- Revenue projections based on industry benchmarks and current traffic levels
- Break-even calculation includes management fee and ad spend
- Upside scenario with 25% uplift delivers 4.8x ROAS by month 6

Slide 10: Next steps to launch within 2 weeks of approval
METRICS:
- value: "2 wk" | label: Time to launch
- value: "4 wk" | label: First results
- value: "12 wk" | label: Full optimisation
CALLOUT: Approve today to start seeing results within 4 weeks.
NOTES: Close with urgency — the 2-week launch window is a competitive advantage. Ask for the decision today.
IMAGE: next steps action plan
BULLETS:
- Approve the proposal and budget allocation by end of week
- Schedule a kickoff meeting to align on access and tracking setup
- Launch first campaigns within 2 weeks of approval`;
function truncateDeckInstructions(value: string): string {
    const cleaned = value.trim();
    if (!cleaned)
        return '';
    return cleaned.length > 12000 ? cleaned.slice(0, 12000) : cleaned;
}

const DECK_SYSTEM_INSTRUCTION = `You are a world-class marketing strategist and proposal writer who creates high-converting marketing proposal decks for client decision-makers (CMOs, founders, marketing directors).

Your output is parsed by a machine — follow the format rules EXACTLY.

TONE: Confident but specific. Not salesy. Every claim must be backed by a number, benchmark, or concrete tactic. The client should feel they are reading analysis, not a brochure.

AUDIENCE: The reader is a decision-maker evaluating whether to hire your agency. They care about: measurable outcomes, realistic timelines, budget efficiency, and execution credibility.

ANTI-PATTERNS — NEVER DO THESE:
- Never use placeholder numbers like "XX%" or "TBD" — if you don't have data, use industry benchmarks and label them as such.
- Never name specific competitors you cannot verify.
- Never promise specific revenue figures without stating the methodology or basis.
- Never use vague claims like "significant growth", "many clients", "substantial improvement".
- Never use markdown, bold, or headers beyond "Slide N:".
- Never include commentary before or after the slides.
- Never write a bullet that is longer than 18 words — if it needs more, split it or move detail to NOTES.
- Never repeat the same metric value across slides (e.g. don't put "3.5x ROAS" on three different slides).

CONTENT DENSITY RULES:
- Vary the density across the deck. Not every slide should carry the same weight.
- Light slides (1-2 bullets, big visual): section openers, key takeaways, stat heroes. Use QUOTE for these.
- Medium slides (3-4 bullets): strategy pillars, channel rationale, audience insights.
- Dense slides (4-5 bullets + metrics or comparison): current-state analysis, budget breakdown, measurement framework.
- At least one slide MUST use TIMELINE for the execution roadmap — do not use BULLETS for phase-based content.
- At least one slide MUST use QUOTE for a stat-hero moment (e.g. a benchmark or headline number).

FORMAT RULES:
- Every slide MUST have a CALLOUT line (single sentence, max 20 words).
- Every slide MUST have a NOTES line (talking points for the presenter, max 60 words).
- Every slide MUST have an IMAGE line (a short topic description for stock photo search, 2-5 words).
- Use the currency symbol provided in the client context for all monetary values.
- Write action titles as full sentences that state the takeaway (e.g. "Paid social will drive 60% of new acquisition within Q1" not "Social Media Strategy").
- Slides 1-3 should cover overview content (company, market, audience, challenges).
- Slides 4+ should cover strategy, execution, and next steps.
- Each bullet MUST include a concrete number, percentage, timeline, channel name, or tool name — never a vague claim.
- METRICS values should be short (1-5 characters) with descriptive labels (5-10 words).
- TIMELINE phases: use 3-5 phases, each with a title (1-3 words), detail (one sentence), and duration (e.g. "Weeks 1-4").
- QUOTE slides: the text should be a single powerful sentence (max 25 words) — a stat, benchmark, or strategic claim.`;

function detectCurrencySymbol(budget: string): string {
    if (!budget) return '£';
    if (budget.includes('$')) return '$';
    if (budget.includes('€')) return '€';
    if (budget.includes('₹')) return '₹';
    return '£';
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
    const budget = formData.marketing?.budget?.trim();
    const platforms = formData.marketing?.platforms?.join(', ');
    const currency = detectCurrencySymbol(budget || '');

    // Count how many data sections are populated to determine slide count
    const populatedSections = [
        industry, goals, audience, challenges, scope, budget, platforms, timeline,
    ].filter(Boolean).length;

    // Adaptive slide count: 6 for sparse data, 9 for medium, 12 for rich data
    const slideCount = populatedSections <= 2 ? 6 : populatedSections <= 5 ? 9 : 12;

    const context = [
        `Company: ${company}`,
        industry ? `Industry: ${industry}` : null,
        goals ? `Core Objectives: ${goals}` : null,
        audience ? `Target Audience: ${audience}` : null,
        challenges ? `Key Challenges: ${challenges}` : null,
        scope ? `Scope of Work: ${scope}` : null,
        budget ? `Monthly Budget: ${budget}` : null,
        platforms ? `Current Platforms: ${platforms}` : null,
        timeline ? `Desired Start Date: ${timeline}` : null,
        `Currency: Use ${currency} for all monetary values`,
    ]
        .filter(Boolean)
        .join('\n');

    return `Create a ${slideCount}-slide marketing proposal deck for the following client. Adapt the content depth to the available data — if only a company name and budget are provided, keep slides concise; if full form data is provided, add detail and specificity.

CLIENT CONTEXT:
${context}

EXACT OUTPUT FORMAT (copy this structure precisely — the parser expects these exact keywords):

Slide 1: [Action title: one sentence stating the key value proposition, max 12 words]
METRICS:
- value: "[specific number]" | label: [KPI label]
- value: "[specific number]" | label: [KPI label]
- value: "[specific number]" | label: [KPI label]
CALLOUT: [One sentence summarising the strategic takeaway]
NOTES: [2-3 sentences of talking points for the presenter — what to say, not what's on the slide]
IMAGE: [2-5 word topic for stock photo search, e.g. "business growth chart"]
BULLETS:
- [Specific, actionable point with a number or timeline]
- [Specific, actionable point with a number or timeline]
- [Specific, actionable point with a number or timeline]

Slide 2: [Action title about the current state problem/gap, max 12 words]
COMPARISON:
Before:
- [Current state problem with specific data]
- [Current state problem with specific data]
- [Current state problem with specific data]
After:
- [Proposed solution with specific outcome]
- [Proposed solution with specific outcome]
- [Proposed solution with specific outcome]
CALLOUT: [One sentence about the opportunity]
NOTES: [Presenter talking points]
IMAGE: [stock photo topic]

Slide 3: [Action title about target audience insights, max 12 words]
METRICS:
- value: "[percentage]" | label: [audience metric]
- value: "[number]" | label: [audience metric]
- value: "[percentage]" | label: [audience metric]
CALLOUT: [One sentence about the audience insight]
NOTES: [Presenter talking points]
IMAGE: [stock photo topic]
BULLETS:
- [Persona detail with demographics and behaviour]
- [Channel preference with data]
- [Buying trigger or decision factor with data]

${slideCount >= 9 ? `Slide 4: [Action title about the proposed strategy, max 12 words]
BULLETS:
- [Strategy pillar 1 with specific tactic and expected outcome]
- [Strategy pillar 2 with specific tactic and expected outcome]
- [Strategy pillar 3 with specific tactic and expected outcome]
- [Strategy pillar 4 with specific tactic and expected outcome]
CALLOUT: [One sentence about why this strategy wins]
NOTES: [Presenter talking points]
IMAGE: [stock photo topic]

Slide 5: [Action title about execution roadmap, max 12 words]
TIMELINE:
- phase: 1 | title: Foundation | detail: [Audit, tracking setup, quick-win optimisations] | duration: Weeks 1-4
- phase: 2 | title: Scale | detail: [Expand winning channels with incremental budget increases] | duration: Weeks 5-8
- phase: 3 | title: Optimise | detail: [Continuous testing and refinement based on performance data] | duration: Weeks 9-12
${slideCount >= 12 ? '- phase: 4 | title: Sustain | detail: [Long-term scaling and quarterly strategy review] | duration: Weeks 13+' : ''}
CALLOUT: [One sentence about timeline commitment]
NOTES: [Presenter talking points]
IMAGE: [stock photo topic]

${slideCount >= 12 ? `Slide 6: [Action title about channel strategy, max 12 words]
BULLETS:
- [Channel 1 with rationale, budget share, and expected outcome]
- [Channel 2 with rationale, budget share, and expected outcome]
- [Channel 3 with rationale, budget share, and expected outcome]
CALLOUT: [One sentence about channel mix]
NOTES: [Presenter talking points]
IMAGE: [stock photo topic]

Slide 7: [A powerful stat or benchmark that frames the opportunity, max 12 words]
QUOTE: text: [Single powerful sentence with a stat or benchmark, max 25 words] | attribution: [Source or context, e.g. "Industry benchmark 2024"]
CALLOUT: [One sentence reinforcing the quote]
NOTES: [Presenter talking points — explain the stat and why it matters]
IMAGE: [stock photo topic]

Slide 8: [Action title about creative or content approach, max 12 words]
BULLETS:
- [Creative approach with specific tactic and expected engagement]
- [Content strategy with cadence and format mix]
- [Testing framework with methodology and success criteria]
- [Brand messaging angle tailored to the audience]
CALLOUT: [One sentence about creative differentiation]
NOTES: [Presenter talking points]
IMAGE: [stock photo topic]

Slide 9: [Action title about optimisation/testing approach, max 12 words]
COMPARISON:
Before:
- [Current optimisation gap with data]
- [Current optimisation gap with data]
After:
- [Proposed optimisation process with frequency]
- [Proposed optimisation process with frequency]
- [Proposed optimisation process with frequency]
CALLOUT: [One sentence about continuous improvement]
NOTES: [Presenter talking points]
IMAGE: [stock photo topic]

Slide 10: [Action title about measurement and reporting, max 12 words]
METRICS:
- value: "[frequency]" | label: Reporting cadence
- value: "[number]" | label: KPIs tracked
- value: "[timeframe]" | label: First review
CALLOUT: [One sentence about transparency]
NOTES: [Presenter talking points]
IMAGE: [stock photo topic]
BULLETS:
- [KPI framework with specific metrics and targets]
- [Reporting dashboard, access, and alert thresholds]
- [Monthly performance review and quarterly strategy session]

Slide 11: [Action title about risk mitigation, max 12 words]
COMPARISON:
Before:
- [Common risk without mitigation]
- [Second risk without mitigation]
After:
- [Risk mitigation strategy with specific safeguard]
- [Risk mitigation strategy with specific safeguard]
CALLOUT: [One sentence about risk management]
NOTES: [Presenter talking points]
IMAGE: [stock photo topic]

Slide 12: [Action title about next steps, max 12 words]
METRICS:
- value: "[timeframe]" | label: Time to launch
- value: "[timeframe]" | label: First results
- value: "[timeframe]" | label: Full optimisation
CALLOUT: [One sentence with urgency]
NOTES: [Presenter talking points]
IMAGE: [stock photo topic]
BULLETS:
- [Immediate action item with deadline]
- [Immediate action item with deadline]
- [Immediate action item with deadline]` : `Slide 6: [Action title about next steps, max 12 words]
METRICS:
- value: "[timeframe]" | label: Time to launch
- value: "[timeframe]" | label: First results
- value: "[timeframe]" | label: Full optimisation
CALLOUT: [One sentence with urgency]
NOTES: [Presenter talking points]
IMAGE: [stock photo topic]
BULLETS:
- [Immediate action item with deadline]
- [Immediate action item with deadline]
- [Immediate action item with deadline]`}` : `Slide 4: [Action title about the proposed strategy, max 12 words]
BULLETS:
- [Strategy pillar 1 with specific tactic and expected outcome]
- [Strategy pillar 2 with specific tactic and expected outcome]
- [Strategy pillar 3 with specific tactic and expected outcome]
CALLOUT: [One sentence about why this strategy wins]
NOTES: [Presenter talking points]
IMAGE: [stock photo topic]

Slide 5: [Action title about execution roadmap, max 12 words]
TIMELINE:
- phase: 1 | title: Foundation | detail: [Audit, tracking setup, quick-win optimisations] | duration: Weeks 1-4
- phase: 2 | title: Scale | detail: [Expand winning channels with incremental budget] | duration: Weeks 5-8
- phase: 3 | title: Optimise | detail: [Continuous testing and refinement] | duration: Weeks 9-12
CALLOUT: [One sentence about timeline commitment]
NOTES: [Presenter talking points]
IMAGE: [stock photo topic]

Slide 6: [Action title about next steps, max 12 words]
METRICS:
- value: "[timeframe]" | label: Time to launch
- value: "[timeframe]" | label: First results
- value: "[timeframe]" | label: Full optimisation
CALLOUT: [One sentence with urgency]
NOTES: [Presenter talking points]
IMAGE: [stock photo topic]
BULLETS:
- [Immediate action item with deadline]
- [Immediate action item with deadline]
- [Immediate action item with deadline]`}

CONTENT QUALITY RULES:
- Every number must be specific and realistic for the industry — use benchmarks if no client data is available.
- Every bullet must include a concrete number, percentage, timeline, or channel name — never a vague claim.
- Write 3-5 bullets per BULLETS section (not 2) — dense slides build credibility.
- METRICS values should be short (1-5 characters) with descriptive labels (5-10 words).
- COMPARISON "Before" points describe current pain; "After" points describe proposed outcomes. Use 3+ points per side.
- TIMELINE phases: use 3-5 phases, each with a concise title (1-3 words), one-sentence detail, and duration.
- QUOTE slides: the text should be a single powerful sentence (max 25 words) — a stat, benchmark, or strategic claim.
- CALLOUT is a single sentence (max 20 words) that becomes the highlighted takeaway box.
- NOTES are presenter talking points (max 60 words) — what the salesperson should say, not what's on the slide.
- IMAGE is a 2-5 word topic for stock photo search (e.g. "team meeting", "data analytics dashboard", "social media marketing").
- Use ${currency} for all currency values.
- Slides 1-3 should cover overview content (company, market, audience, challenges).
- Slides 4+ should cover strategy, execution, and next steps.
- Vary content density: not every slide should have the same weight. Some slides should be light (QUOTE, few bullets), others dense (COMPARISON, METRICS + BULLETS).
- Adapt all content to the client's industry, objectives, and challenges listed above.
- Return plain text only. No markdown, no bold, no extra commentary.`;
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
/**
 * Post-process AI output to ensure every slide has a CALLOUT line.
 * The AI sometimes omits CALLOUT on slides that only have BULLETS — this
 * synthesises one from the slide title if missing.
 */
function ensureCallouts(instructions: string): string {
    const blocks = instructions.split(/\n(?=\*{0,2}Slide\s+\d+)/i);
    return blocks
        .map((block) => {
            const trimmed = block.trim();
            if (!trimmed || !/^Slide\s+\d+/i.test(trimmed)) return block;
            if (/^CALLOUT:/im.test(trimmed)) return block;
            // Extract title from first line
            const titleMatch = trimmed.match(/^Slide\s+\d+\s*[:\-–]\s*(.*)$/im);
            const title = titleMatch?.[1]?.replace(/\*+/g, '').trim() ?? '';
            // Synthesise a callout from the title
            const callout = title
                ? `CALLOUT: ${title.endsWith('.') ? title : title + '.'}`
                : 'CALLOUT: This slide outlines a key strategic recommendation.';
            return `${trimmed}\n${callout}`;
        })
        .join('\n');
}

/**
 * Validate that parsed slides have meaningful content.
 * Returns the number of sparse slides (no bullets, no metrics, no comparison).
 */
function countSparseSlides(instructions: string): number {
    const blocks = instructions.split(/\n(?=\*{0,2}Slide\s+\d+)/i);
    let sparse = 0;
    for (const block of blocks) {
        const trimmed = block.trim();
        if (!trimmed || !/^Slide\s+\d+/i.test(trimmed)) continue;
        const hasBullets = /^-\s/m.test(trimmed);
        const hasMetrics = /^-\s*value:/im.test(trimmed);
        const hasComparison = /^before\s*:?$/im.test(trimmed);
        const hasTimeline = /^-\s*phase:/im.test(trimmed);
        const hasQuote = /^QUOTE:/im.test(trimmed);
        if (!hasBullets && !hasMetrics && !hasComparison && !hasTimeline && !hasQuote) sparse++;
    }
    return sparse;
}

async function resolveDeckInstructions(formData: ProposalFormData, candidate?: string | null): Promise<string> {
    const trimmedCandidate = typeof candidate === 'string' ? truncateDeckInstructions(candidate) : '';
    if (trimmedCandidate.length > 0) {
        return trimmedCandidate;
    }
    try {
        const prompt = buildDeckInstructionPrompt(formData);
        const raw = await deepseekAI.generateContentWithOptions(prompt, {
            systemInstruction: DECK_SYSTEM_INSTRUCTION,
            temperature: 0.4,
            maxOutputTokens: 8192,
        });
        const withCallouts = ensureCallouts(raw);
        const generated = truncateDeckInstructions(withCallouts);
        if (generated.length > 0) {
            // Validate: if more than half the slides are sparse, retry once
            const sparseCount = countSparseSlides(generated);
            const totalSlides = (generated.match(/^Slide\s+\d+/gim) || []).length;
            if (totalSlides > 0 && sparseCount > totalSlides / 2) {
                logger.warn(`[proposal-deck-ai] ${sparseCount}/${totalSlides} slides are sparse, retrying generation`);
                const retryRaw = await deepseekAI.generateContentWithOptions(prompt, {
                    systemInstruction: DECK_SYSTEM_INSTRUCTION,
                    temperature: 0.3,
                    maxOutputTokens: 8192,
                });
                const retryGenerated = truncateDeckInstructions(ensureCallouts(retryRaw));
                if (retryGenerated.length > 0 && countSparseSlides(retryGenerated) < sparseCount) {
                    return retryGenerated;
                }
            }
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
