import type { CollaborationMessage } from '@/types/collaboration'

export type ParsedChannelMessageSearch = {
  q: string
  sender: string | null
  attachment: string | null
  mention: string | null
  start: string | null
  end: string | null
  highlights: string[]
}

function normalizeField(value: string | null): string | null {
  if (!value) return null
  const trimmed = value.trim()
  return trimmed.length > 0 ? trimmed : null
}

export function parseChannelMessageSearchQuery(input: string): ParsedChannelMessageSearch {
  const tokens = input.split(/\s+/).filter(Boolean)
  const terms: string[] = []
  let sender: string | null = null
  let attachment: string | null = null
  let mention: string | null = null
  let start: string | null = null
  let end: string | null = null

  tokens.forEach((token) => {
    const lower = token.toLowerCase()
    if (lower.startsWith('from:')) {
      sender = token.slice(5)
    } else if (lower.startsWith('attachment:')) {
      attachment = token.slice(11)
    } else if (lower.startsWith('mention:')) {
      mention = token.slice(8)
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
  if (mention) highlights.push(mention)

  return {
    q: terms.join(' ').trim(),
    sender: normalizeField(sender),
    attachment: normalizeField(attachment),
    mention: normalizeField(mention),
    start: normalizeField(start),
    end: normalizeField(end),
    highlights: highlights.filter(Boolean),
  }
}

export function filterChannelMessagesForSearch(
  messages: CollaborationMessage[],
  search: ParsedChannelMessageSearch,
): CollaborationMessage[] {
  const queryTerms = search.q.toLowerCase().split(/\s+/).filter(Boolean)
  const senderSearch = search.sender?.toLowerCase() ?? null
  const attachmentSearch = search.attachment?.toLowerCase() ?? null
  const mentionSearch = search.mention?.toLowerCase() ?? null
  const startMs = search.start ? Date.parse(search.start) : NaN
  const endMs = search.end ? Date.parse(search.end) : NaN

  return messages
    .filter((message) => {
      const createdAtMs = message.createdAt ? Date.parse(message.createdAt) : NaN
      const haystack = `${message.content} ${message.senderName}`.toLowerCase()
      const matchesQuery = queryTerms.every((term) => haystack.includes(term))
      const matchesSender = !senderSearch || message.senderName.toLowerCase().includes(senderSearch)
      const matchesAttachment =
        !attachmentSearch ||
        (message.attachments ?? []).some((attachment) => attachment.name.toLowerCase().includes(attachmentSearch))
      const matchesMention =
        !mentionSearch ||
        (message.mentions ?? []).some((mention) => {
          return mention.name.toLowerCase().includes(mentionSearch) || mention.slug.toLowerCase().includes(mentionSearch)
        })
      const matchesStart = !Number.isFinite(startMs) || (Number.isFinite(createdAtMs) && createdAtMs >= startMs)
      const matchesEnd = !Number.isFinite(endMs) || (Number.isFinite(createdAtMs) && createdAtMs <= endMs)

      return matchesQuery && matchesSender && matchesAttachment && matchesMention && matchesStart && matchesEnd
    })
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime())
}