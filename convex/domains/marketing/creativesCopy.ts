"use node"

import { action } from '../../_generated/server'
import { v } from 'convex/values'

import { formatMetaCallToActionLabel } from '../../../src/services/integrations/meta-ads/meta-call-to-action'
import { deepseekAI } from '../../../src/services/deepseek'
import { Errors, withErrorHandling } from '../../errors'
import { requireIdentity } from '../../lib/functions/auth'
import { enforceDeepSeekActionRateLimit } from '../../deepseekRateLimit'

const providerIdValidator = v.union(
  v.literal('google'),
  v.literal('tiktok'),
  v.literal('linkedin'),
  v.literal('facebook')
)

const kindValidator = v.union(
  v.literal('headlines'),
  v.literal('captions'),
  v.literal('both')
)

function stripMarkdownFences(text: string): string {
  return text
    .replace(/^```(?:json)?\s*/i, '')
    .replace(/\s*```$/i, '')
    .trim()
}

function extractJsonObject(text: string): string | null {
  const cleaned = stripMarkdownFences(text)
  const start = cleaned.indexOf('{')
  const end = cleaned.lastIndexOf('}')
  if (start === -1 || end === -1 || end <= start) return null
  return cleaned.slice(start, end + 1)
}

function extractStringArrayFromRaw(raw: string, key: 'headlines' | 'captions'): string[] {
  const pattern = new RegExp(`"${key}"\\s*:\\s*\\[([\\s\\S]*?)\\]`, 'i')
  const match = raw.match(pattern)
  if (!match?.[1]) return []

  const values: string[] = []
  const itemPattern = /"((?:\\.|[^"\\])*)"/g
  let itemMatch: RegExpExecArray | null = itemPattern.exec(match[1])
  while (itemMatch) {
    const captured = itemMatch[1]
    if (captured) {
      try {
        values.push(JSON.parse(`"${captured}"`) as string)
      } catch {
        values.push(captured.replace(/\\"/g, '"'))
      }
    }
    itemMatch = itemPattern.exec(match[1])
  }
  return values
}

function parseGeneratedCopyResponse(raw: string, providerId: GenerateCopyInput['providerId']) {
  const jsonCandidate = extractJsonObject(raw)
  const payloads = [jsonCandidate, stripMarkdownFences(raw), raw].filter(
    (value, index, values): value is string => typeof value === 'string' && values.indexOf(value) === index
  )

  let lastError: unknown = null

  for (const payload of payloads) {
    try {
      const parsed = JSON.parse(payload) as unknown
      if (parsed && typeof parsed === 'object') {
        return parsed as Record<string, unknown>
      }
    } catch (error) {
      lastError = error
    }
  }

  const headlines = extractStringArrayFromRaw(raw, 'headlines')
  const captions = extractStringArrayFromRaw(raw, 'captions')
  if (headlines.length > 0 || captions.length > 0) {
    return { headlines, captions }
  }

  console.error('[creativesCopy:generateCopy] Failed to parse AI response', {
    providerId,
    hasJsonCandidate: Boolean(jsonCandidate),
    rawPreview: raw.slice(0, 500),
    error: lastError,
  })

  throw Errors.integration.error('deepseek', 'Generated copy response was not valid JSON', {
    providerId,
    hasJsonCandidate: Boolean(jsonCandidate),
  })
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
  return values.flatMap((value) => {
    const trimmedValue = value.trim()
    if (!trimmedValue) return []
    const normalized =
      trimmedValue.length > maxLen ? trimmedValue.slice(0, maxLen - 1).trimEnd() + '…' : trimmedValue
    return [normalized]
  })
}

interface GenerateCopyInput {
  providerId: 'google' | 'tiktok' | 'linkedin' | 'facebook'
  clientId?: string
  campaignId: string
  creativeId: string
  campaignName?: string
  creativeName?: string
  landingPageUrl?: string
  callToAction?: string
  creativeType?: string
  pageName?: string
  existingHeadlines?: string[]
  existingCaptions?: string[]
  count?: number
  kind?: 'headlines' | 'captions' | 'both'
}

function buildPrompt(input: GenerateCopyInput): string {
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
    callToAction:
      input.providerId === 'facebook'
        ? formatMetaCallToActionLabel(input.callToAction) ?? input.callToAction
        : input.callToAction,
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

/**
 * Generate creative copy (headlines and captions) using AI.
 * Powered by AI for ad copy generation.
 */
export const generateCopy = action({
  args: {
    providerId: providerIdValidator,
    clientId: v.optional(v.string()),
    campaignId: v.string(),
    creativeId: v.string(),
    campaignName: v.optional(v.string()),
    creativeName: v.optional(v.string()),
    landingPageUrl: v.optional(v.string()),
    callToAction: v.optional(v.string()),
    creativeType: v.optional(v.string()),
    pageName: v.optional(v.string()),
    existingHeadlines: v.optional(v.array(v.string())),
    existingCaptions: v.optional(v.array(v.string())),
    count: v.optional(v.number()),
    kind: v.optional(kindValidator),
  },
  returns: v.object({
    headlines: v.array(v.string()),
    captions: v.array(v.string()),
    generatedAt: v.string(),
  }),
  handler: async (ctx, args) =>
    withErrorHandling(async () => {
      const identity = await ctx.auth.getUserIdentity()
      requireIdentity(identity)

      await enforceDeepSeekActionRateLimit(ctx, {
        name: 'creativeCopy',
        userId: identity?.subject ?? null,
        resourceId: `${args.campaignId}:${args.creativeId}`,
        scope: args.clientId ?? null,
      })

      const input: GenerateCopyInput = {
        providerId: args.providerId,
        clientId: args.clientId,
        campaignId: args.campaignId,
        creativeId: args.creativeId,
        campaignName: args.campaignName,
        creativeName: args.creativeName,
        landingPageUrl: args.landingPageUrl,
        callToAction: args.callToAction,
        creativeType: args.creativeType,
        pageName: args.pageName,
        existingHeadlines: args.existingHeadlines,
        existingCaptions: args.existingCaptions,
        count: args.count,
        kind: args.kind,
      }

      const prompt = buildPrompt(input)
      const raw = await deepseekAI.generateContent(prompt)

      const parsed = parseGeneratedCopyResponse(raw, args.providerId)

      // Validate response has the expected shape
      const validated = {
        headlines: Array.isArray(parsed.headlines) ? parsed.headlines : [],
        captions: Array.isArray(parsed.captions) ? parsed.captions : [],
      }

      const kind = args.kind ?? 'both'
      const count = args.count ?? 5

      const requestedHeadlines = kind === 'headlines' || kind === 'both'
      const requestedCaptions = kind === 'captions' || kind === 'both'

      const existingHeadlines = Array.isArray(args.existingHeadlines)
        ? args.existingHeadlines.flatMap((headline) => {
            const cleanedHeadline = cleanSuggestion(headline)
            return cleanedHeadline ? [cleanedHeadline] : []
          })
        : []
      const existingCaptions = Array.isArray(args.existingCaptions)
        ? args.existingCaptions.flatMap((caption) => {
            const cleanedCaption = cleanSuggestion(caption)
            return cleanedCaption ? [cleanedCaption] : []
          })
        : []

      const headlines = requestedHeadlines
        ? uniqStrings(
            clampLength(
              validated.headlines.flatMap((headline) => {
                const cleanedHeadline = cleanSuggestion(headline)
                if (!cleanedHeadline) return []
                return existingHeadlines.some((e) => e.toLowerCase() === cleanedHeadline.toLowerCase())
                  ? []
                  : [cleanedHeadline]
              }),
              40
            )
          ).slice(0, count)
        : []

      const captions = requestedCaptions
        ? uniqStrings(
            clampLength(
              validated.captions.flatMap((caption) => {
                const cleanedCaption = cleanSuggestion(caption)
                if (!cleanedCaption) return []
                return existingCaptions.some((e) => e.toLowerCase() === cleanedCaption.toLowerCase())
                  ? []
                  : [cleanedCaption]
              }),
              180
            )
          ).slice(0, count)
        : []

      return {
        headlines,
        captions,
        generatedAt: new Date().toISOString(),
      }
    }, 'creativesCopy:generateCopy'),
})
