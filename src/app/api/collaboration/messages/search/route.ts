import { FieldPath, Timestamp } from 'firebase-admin/firestore'
import { z } from 'zod'

import { createApiHandler } from '@/lib/api-handler'
import { ValidationError } from '@/lib/api-errors'
import { toISO } from '@/lib/utils'
import { type WorkspaceContext } from '@/lib/workspace'
import { channelTypeSchema, mapMessageDoc, type StoredMessage } from '../route'

const searchQuerySchema = z.object({
  q: z.string().trim().max(400).optional(),
  sender: z.string().trim().max(160).optional(),
  attachment: z.string().trim().max(200).optional(),
  mention: z.string().trim().max(160).optional(),
  start: z.string().trim().optional(),
  end: z.string().trim().optional(),
  limit: z.string().trim().optional(),
  channelType: z.string().optional(),
  clientId: z.string().optional(),
  projectId: z.string().optional(),
})

function clampLimit(raw?: string) {
  const parsed = Number(raw)
  if (!Number.isFinite(parsed)) return 120
  return Math.min(Math.max(Math.trunc(parsed), 20), 400)
}

function parseDate(value?: string | null): Date | null {
  if (!value) return null
  const parsed = new Date(value)
  return Number.isNaN(parsed.getTime()) ? null : parsed
}

function normalizeTerm(term: string) {
  return term.trim().toLowerCase()
}

function tokenize(input: string) {
  return input
    .split(/\s+/)
    .map(normalizeTerm)
    .filter((token) => token.length > 0)
}

function levenshtein(a: string, b: string): number {
  const matrix: number[][] = []
  const aLen = a.length
  const bLen = b.length
  for (let i = 0; i <= bLen; i += 1) {
    matrix[i] = [i]
  }
  for (let j = 0; j <= aLen; j += 1) {
    matrix[0][j] = j
  }
  for (let i = 1; i <= bLen; i += 1) {
    for (let j = 1; j <= aLen; j += 1) {
      if (b.charAt(i - 1) === a.charAt(j - 1)) {
        matrix[i][j] = matrix[i - 1][j - 1]
      } else {
        matrix[i][j] = Math.min(
          matrix[i - 1][j - 1] + 1,
          matrix[i][j - 1] + 1,
          matrix[i - 1][j] + 1,
        )
      }
    }
  }
  return matrix[bLen][aLen]
}

function fuzzyScore(text: string, term: string): number {
  const haystack = normalizeTerm(text)
  const needle = normalizeTerm(term)
  if (!haystack || !needle) return 0
  if (haystack.includes(needle)) return Math.min(needle.length * 2, 12)

  const words = haystack.split(/[^a-z0-9]+/i).filter(Boolean)
  let best = Infinity
  for (const word of words) {
    const dist = levenshtein(word, needle)
    if (dist < best) {
      best = dist
    }
    if (best === 0) break
  }

  if (best === Infinity) return 0
  if (best <= 2) return Math.max(needle.length - best, 1)
  return 0
}

function buildWorkspaceQuery(workspace: WorkspaceContext, channelType: string, clientId?: string | null, projectId?: string | null) {
  let base = workspace.collaborationCollection.where('channelType', '==', channelType)
  if (channelType === 'client' && clientId) {
    base = base.where('clientId', '==', clientId)
  }
  if (channelType === 'project' && projectId) {
    base = base.where('projectId', '==', projectId)
  }
  return base
}

export const GET = createApiHandler(
  {
    workspace: 'required',
    querySchema: searchQuerySchema,
    rateLimit: 'standard',
  },
  async (_req, { workspace, query }) => {
    if (!workspace) throw new Error('Workspace context missing')

    const {
      q,
      sender,
      attachment,
      mention,
      start,
      end,
      limit: limitParam,
      channelType: channelTypeParam = 'team',
      clientId,
      projectId,
    } = query

    const parseChannel = channelTypeSchema.safeParse(channelTypeParam)
    if (!parseChannel.success) {
      throw new ValidationError('Invalid channel type')
    }
    const channelType = parseChannel.data

    if (channelType === 'client' && !clientId) {
      throw new ValidationError('clientId is required for client channels')
    }
    if (channelType === 'project' && !projectId) {
      throw new ValidationError('projectId is required for project channels')
    }

    const limit = clampLimit(limitParam)
    const startDate = parseDate(start)
    const endDate = parseDate(end)

    let messagesQuery = buildWorkspaceQuery(workspace, channelType, clientId ?? null, projectId ?? null)
      .orderBy('createdAt', 'desc')
      .orderBy(FieldPath.documentId(), 'desc')

    if (startDate) {
      messagesQuery = messagesQuery.where('createdAt', '>=', Timestamp.fromDate(startDate))
    }
    if (endDate) {
      messagesQuery = messagesQuery.where('createdAt', '<=', Timestamp.fromDate(endDate))
    }

    const snapshot = await messagesQuery.limit(limit).get()
    const messages = snapshot.docs.map((doc) => mapMessageDoc(doc.id, doc.data() as StoredMessage))

    const searchTerms = tokenize(q ?? '')
    const senderTerm = sender ? normalizeTerm(sender) : null
    const attachmentTerm = attachment ? normalizeTerm(attachment) : null
    const mentionTerm = mention ? normalizeTerm(mention.replace(/^@/, '')) : null

    const scored = messages
      .map((message) => {
        if (message.isDeleted) return null

        // Sender filter
        if (senderTerm && !normalizeTerm(message.senderName).includes(senderTerm)) {
          return null
        }

        // Mention filter
        if (mentionTerm) {
          const mentionNames = (message.mentions ?? []).map((m) => normalizeTerm(m.name))
          const hasMention = mentionNames.some((name) => name.includes(mentionTerm))
          if (!hasMention) return null
        }

        // Attachment filter
        if (attachmentTerm) {
          const attachmentNames = (message.attachments ?? []).map((a) => normalizeTerm(a.name))
          const hasAttachment = attachmentNames.some((name) => name.includes(attachmentTerm))
          if (!hasAttachment) return null
        }

        const highlightSet = new Set<string>()
        let totalScore = 0
        const haystacks: string[] = []
        if (message.content) haystacks.push(message.content)
        if (message.senderName) haystacks.push(message.senderName)
        if (Array.isArray(message.attachments)) haystacks.push(...message.attachments.map((a) => a.name))
        if (Array.isArray(message.mentions)) haystacks.push(...message.mentions.map((m) => m.name))

        if (searchTerms.length === 0) {
          // No search terms means we matched filters only
          totalScore = 1
        } else {
          searchTerms.forEach((term) => {
            let bestScore = 0
            haystacks.forEach((text) => {
              const score = fuzzyScore(text, term)
              if (score > bestScore) {
                bestScore = score
              }
            })
            if (bestScore > 0) {
              totalScore += bestScore
              highlightSet.add(term)
            }
          })
        }

        if (totalScore <= 0) return null

        return {
          message,
          score: totalScore,
          highlights: Array.from(highlightSet),
        }
      })
      .filter(Boolean) as { message: typeof messages[number]; score: number; highlights: string[] }[]

    scored.sort((a, b) => b.score - a.score)

    const top = scored.slice(0, limit)
    const highlights = Array.from(new Set(top.flatMap((item) => item.highlights)))

    return {
      messages: top.map((item) => item.message),
      highlights,
    }
  }
)
