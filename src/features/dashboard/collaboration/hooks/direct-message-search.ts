import type { DirectMessage } from '@/types/collaboration'

export type ParsedDirectMessageSearch = {
  q: string
  sender: string | null
  attachment: string | null
  start: string | null
  end: string | null
  highlights: string[]
}

function normalizeField(value: string | null): string | null {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function parseDirectMessageSearchQuery(input: string): ParsedDirectMessageSearch {
  const tokens = input.split(/\s+/).filter(Boolean)
  const terms: string[] = []
  let sender: string | null = null
  let attachment: string | null = null
  let start: string | null = null
  let end: string | null = null

  tokens.forEach((token) => {
    const lower = token.toLowerCase()
    if (lower.startsWith('from:')) {
      sender = token.slice(5)
    } else if (lower.startsWith('attachment:')) {
      attachment = token.slice(11)
    } else if (lower.startsWith('before:')) {
      end = token.slice(7)
    } else if (lower.startsWith('after:')) {
      start = token.slice(6)
    } else {
      terms.push(token)
    }
  })

  const highlights = [...terms]
  if (sender) highlights.push(sender)
  if (attachment) highlights.push(attachment)

  return {
    q: terms.join(' ').trim(),
    sender: normalizeField(sender),
    attachment: normalizeField(attachment),
    start: normalizeField(start),
    end: normalizeField(end),
    highlights: highlights.filter(Boolean),
  }
}

export function filterDirectMessagesForSearch(
  messages: DirectMessage[],
  search: ParsedDirectMessageSearch,
): DirectMessage[] {
  const queryTerms = search.q.toLowerCase().split(/\s+/).filter(Boolean)
  const senderSearch = search.sender?.toLowerCase() ?? null
  const attachmentSearch = search.attachment?.toLowerCase() ?? null
  const startMs = search.start ? Date.parse(search.start) : NaN
  const endMs = search.end ? Date.parse(search.end) : NaN

  return messages
    .filter((message) => {
      if (message.deleted) return false

      const attachmentNames = (message.attachments ?? []).map((attachment) => attachment.name.toLowerCase())
      const haystack = [message.content, message.senderName, ...attachmentNames].join(' ').toLowerCase()
      const matchesQuery = queryTerms.every((term) => haystack.includes(term))
      const matchesSender = !senderSearch || message.senderName.toLowerCase().includes(senderSearch)
      const matchesAttachment = !attachmentSearch || attachmentNames.some((name) => name.includes(attachmentSearch))
      const matchesStart = !Number.isFinite(startMs) || message.createdAtMs >= startMs
      const matchesEnd = !Number.isFinite(endMs) || message.createdAtMs <= endMs

      return matchesQuery && matchesSender && matchesAttachment && matchesStart && matchesEnd
    })
    .sort((a, b) => b.createdAtMs - a.createdAtMs)
}