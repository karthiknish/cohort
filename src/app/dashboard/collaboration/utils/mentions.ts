export const MENTION_PROTOCOL = 'mention://'

export function buildMentionSlug(name: string): string {
  return encodeURIComponent(name.trim().toLowerCase())
}

export function buildMentionMarkup(name: string): string {
  const trimmed = name.trim()
  const display = trimmed.startsWith('@') ? trimmed : `@${trimmed}`
  const slug = buildMentionSlug(trimmed)
  return `[${display}](${MENTION_PROTOCOL}${slug})`
}

export type ExtractedMention = {
  slug: string
  name: string
}

const MENTION_REGEX = /\[([^\]]+)\]\(mention:\/\/([^\)]+)\)/g

export function extractMentionsFromContent(content: string): ExtractedMention[] {
  if (!content) {
    return []
  }

  const mentions: ExtractedMention[] = []
  const seen = new Set<string>()
  let match: RegExpExecArray | null

  while ((match = MENTION_REGEX.exec(content)) !== null) {
    const [, displayLabel, rawSlug] = match
    if (!displayLabel || !rawSlug) {
      continue
    }

    const normalizedSlug = rawSlug.trim()
    if (!normalizedSlug || seen.has(normalizedSlug)) {
      continue
    }

    seen.add(normalizedSlug)

    const decoded = decodeURIComponent(normalizedSlug)
    const name = decoded && decoded.length > 0 ? decoded : displayLabel.replace(/^@/, '')

    mentions.push({
      slug: normalizedSlug,
      name,
    })
  }

  return mentions
}
