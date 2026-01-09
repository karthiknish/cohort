import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { UnauthorizedError } from '@/lib/api-errors'
import { geminiAI } from '@/services/gemini'

const bodySchema = z.object({
  providerId: z.enum(['google', 'tiktok', 'linkedin', 'facebook']),
  clientId: z.string().optional(),
  campaignId: z.string().min(1),
  creativeId: z.string().min(1),
  campaignName: z.string().optional(),
  creativeName: z.string().optional(),
  landingPageUrl: z.string().url().optional(),
  callToAction: z.string().optional(),
  creativeType: z.string().optional(),
  pageName: z.string().optional(),
  existingHeadlines: z.array(z.string()).optional(),
  existingCaptions: z.array(z.string()).optional(),
  count: z.number().int().min(1).max(10).optional(),
  kind: z.enum(['headlines', 'captions', 'both']).optional(),
})

const modelResponseSchema = z.object({
  headlines: z.array(z.string()).optional(),
  captions: z.array(z.string()).optional(),
})

function extractJsonObject(text: string): string | null {
  const start = text.indexOf('{')
  const end = text.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  return text.slice(start, end + 1)
}

function cleanSuggestion(value: string): string {
  let s = value.trim()
  s = s.replace(/^[-*\d.)\s]+/, '').trim()
  s = s.replace(/^"|"$/g, '').trim()
  s = s.replace(/^'|'$/g, '').trim()
  return s
}

function uniqStrings(values: string[]): string[] {
  const seen = new Set<string>()
  const out: string[] = []
  for (const v of values) {
    const key = v.toLowerCase()
    if (!key) continue
    if (seen.has(key)) continue
    seen.add(key)
    out.push(v)
  }
  return out
}

function clampLength(values: string[], maxLen: number): string[] {
  return values
    .map((v) => v.trim())
    .filter(Boolean)
    .map((v) => (v.length > maxLen ? v.slice(0, maxLen - 1).trimEnd() + '…' : v))
}

function buildPrompt(input: z.infer<typeof bodySchema>): string {
  const count = input.count ?? 5
  const kind = input.kind ?? 'both'

  const headlineRules = [
    `- ${count} headlines`,
    '- Max 40 characters each',
    '- No emojis',
    '- No ALL CAPS',
    '- Avoid repeating the same words',
  ].join('\n')

  const captionRules = [
    `- ${count} captions (primary text)`,
    '- Max 180 characters each',
    '- No emojis',
    '- Use clear benefits + a gentle CTA',
    '- Avoid clickbait, misinformation, or sensitive targeting',
  ].join('\n')

  const context = {
    provider: input.providerId,
    campaignName: input.campaignName,
    creativeName: input.creativeName,
    creativeType: input.creativeType,
    pageName: input.pageName,
    callToAction: input.callToAction,
    landingPageUrl: input.landingPageUrl,
    existingHeadlines: input.existingHeadlines?.slice(0, 10),
    existingCaptions: input.existingCaptions?.slice(0, 10),
  }

  return [
    'You are an expert paid social copywriter.',
    'Generate high-performing ad copy variants. Output ONLY valid JSON.',
    '',
    `Platform: ${input.providerId}`,
    '',
    'Context (JSON):',
    JSON.stringify(context, null, 2),
    '',
    'Return JSON with this exact shape:',
    '{ "headlines": string[], "captions": string[] }',
    '',
    kind === 'headlines' ? `Headlines rules:\n${headlineRules}` : '',
    kind === 'captions' ? `Captions rules:\n${captionRules}` : '',
    kind === 'both' ? `Headlines rules:\n${headlineRules}\n\nCaptions rules:\n${captionRules}` : '',
    '',
    'Do not include markdown, code fences, or commentary.',
  ]
    .filter(Boolean)
    .join('\n')
}

export const POST = createApiHandler(
  {
    bodySchema,
    rateLimit: 'standard',
  },
  async (req, { auth, body }) => {
    if (!auth.uid) {
      throw new UnauthorizedError('Authentication required')
    }

    const prompt = buildPrompt(body)
    const raw = await geminiAI.generateContent(prompt)

    const jsonCandidate = extractJsonObject(raw)
    const parsed = jsonCandidate ? JSON.parse(jsonCandidate) : JSON.parse(raw)
    const validated = modelResponseSchema.parse(parsed)

    const kind = body.kind ?? 'both'
    const count = body.count ?? 5

    const requestedHeadlines = kind === 'headlines' || kind === 'both'
    const requestedCaptions = kind === 'captions' || kind === 'both'

    const existingHeadlines = Array.isArray(body.existingHeadlines) ? body.existingHeadlines.map(cleanSuggestion).filter(Boolean) : []
    const existingCaptions = Array.isArray(body.existingCaptions) ? body.existingCaptions.map(cleanSuggestion).filter(Boolean) : []

    const headlines = requestedHeadlines
      ? uniqStrings(
          clampLength(
            (validated.headlines ?? [])
              .map(cleanSuggestion)
              .filter(Boolean)
              .filter((s) => !existingHeadlines.some((e) => e.toLowerCase() === s.toLowerCase())),
            40
          )
        ).slice(0, count)
      : []

    const captions = requestedCaptions
      ? uniqStrings(
          clampLength(
            (validated.captions ?? [])
              .map(cleanSuggestion)
              .filter(Boolean)
              .filter((s) => !existingCaptions.some((e) => e.toLowerCase() === s.toLowerCase())),
            180
          )
        ).slice(0, count)
      : []

    return {
      headlines,
      captions,
      generatedAt: new Date().toISOString(),
    }
  }
)
