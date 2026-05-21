import type { ProposalFormData } from '@/lib/proposals'
import { geminiAI } from '@/services/gemini'

const FALLBACK_DECK_INSTRUCTIONS = `Slide 1: Executive Summary
Slide 2: Objectives & KPIs
Slide 3: Strategy Overview
Slide 4: Budget Allocation (distribute 100% across channels and note a testing allowance)
Slide 5: Execution Roadmap
Slide 6: Optimization & Testing
Slide 7: Next Steps & Call-to-Action`

function truncateDeckInstructions(value: string): string {
  const cleaned = value.trim()
  if (!cleaned) return ''
  return cleaned.length > 5000 ? cleaned.slice(0, 5000) : cleaned
}

function buildDeckInstructionPrompt(formData: ProposalFormData): string {
  const company = formData.company?.name?.trim() || 'Client'
  const industry = formData.company?.industry?.trim()
  const goals = formData.goals?.objectives?.join(', ')
  const audience = formData.goals?.audience?.trim()
  const challenges = [...(formData.goals?.challenges || []), formData.goals?.customChallenge]
    .filter(Boolean)
    .join(', ')
  const scope = [...(formData.scope?.services || []), formData.scope?.otherService].filter(Boolean).join(', ')
  const timeline = formData.timelines?.startTime?.trim()

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
    .join('\n')

  return `You are a world-class marketing strategist. Create a high-converting, strategic slide-by-slide outline for a marketing proposal deck based on the following context:

${context}

Outline Requirements:
- Use 7-10 slides.
- Keep each slide title under 8 words.
- Provide 2-3 specific, actionable bullet points per slide.
- Ensure the narrative flows from identifying pain points to presenting a tailored solution and projected ROI.
- Return plain text only.`
}

function buildDeckContextText(formData: ProposalFormData, summary?: string): string {
  const companyName = formData.company?.name?.trim() || 'Client'
  const industry = formData.company?.industry?.trim()
  const goals = formData.goals?.objectives?.join(', ')
  const budget = formData.marketing?.budget?.trim()
  const scope = [...(formData.scope?.services || []), formData.scope?.otherService].filter(Boolean).join(', ')

  return [
    `Client: ${companyName}`,
    industry ? `Industry: ${industry}` : null,
    goals ? `Strategic Goals: ${goals}` : null,
    budget ? `Budget: ${budget}` : null,
    scope ? `Proposed Scope: ${scope}` : null,
    summary ? `AI Generated Outline:\n${summary}` : null,
  ]
    .filter(Boolean)
    .join('\n')
}

async function resolveDeckInstructions(
  formData: ProposalFormData,
  candidate?: string | null,
): Promise<string> {
  const trimmedCandidate = typeof candidate === 'string' ? truncateDeckInstructions(candidate) : ''
  if (trimmedCandidate.length > 0) {
    return trimmedCandidate
  }

  try {
    const prompt = buildDeckInstructionPrompt(formData)
    const raw = await geminiAI.generateContent(prompt)
    const generated = truncateDeckInstructions(raw)
    if (generated.length > 0) {
      return generated
    }
  } catch {
    // Fall back to static outline.
  }

  return truncateDeckInstructions(FALLBACK_DECK_INSTRUCTIONS)
}

export async function generateDeckInstructions(
  formData: ProposalFormData,
  existing?: string | null,
): Promise<string> {
  return resolveDeckInstructions(formData, existing)
}

export async function generateProposalSuggestions(
  formData: ProposalFormData,
  summary: string | null | undefined,
): Promise<string | null> {
  try {
    const baseContext = buildDeckContextText(formData, summary ?? undefined)
    const prompt = `You are a senior marketing strategist. Based on the client context and AI outline below, produce three concise recommendations the account team should act on next. Each recommendation must:
- Start with "- "
- Stay under 120 characters
- Focus on high-impact actions (budget, messaging, channel, measurement, or collaboration)
- Reference missing data when appropriate

Keep the tone confident and collaborative. Do not include introductions or conclusions.

Client context:
${baseContext}

AI outline:
${summary ?? 'Not available'}`

    const raw = await geminiAI.generateContent(prompt)
    const cleaned = raw.trim()
    if (!cleaned) {
      return null
    }

    const lines = cleaned
      .split(/\r?\n+/)
      .map((line) => line.trim())
      .filter((line) => line.length > 0)

    if (!lines.length) {
      return cleaned
    }

    return lines
      .map((line) => {
        if (line.startsWith('-')) return line
        const trimmed = line.replace(/^\s*(?:[-•*]|\d+[\.\)])\s*/, '')
        return `- ${trimmed}`
      })
      .join('\n')
  } catch {
    return null
  }
}

/** @deprecated Use generateDeckInstructions */
export const generateGammaInstructions = generateDeckInstructions
