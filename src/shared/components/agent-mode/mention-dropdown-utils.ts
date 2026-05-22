import type { MentionItem, MentionType } from './mention-dropdown-types'

export function formatMention(item: MentionItem): string {
  return `@[${item.name}](${item.type}:${item.id})`
}

export function parseMentions(text: string): {
  cleanText: string
  mentions: MentionItem[]
} {
  const mentionRegex = /@\[([^\]]+)\]\((\w+):([^)]+)\)/g
  const mentions: MentionItem[] = []
  let cleanText = text

  let match: RegExpExecArray | null = mentionRegex.exec(text)
  while (match !== null) {
    const name = match[1]
    const type = match[2]
    const id = match[3]
    if (name && type && id) {
      mentions.push({
        name,
        type: type as MentionType,
        id,
      })
      cleanText = cleanText.replace(match[0], `@${name}`)
    }

    match = mentionRegex.exec(text)
  }

  return { cleanText, mentions }
}
