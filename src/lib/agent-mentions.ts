export type AgentMentionType = 'client' | 'project' | 'team' | 'user'

export type AgentMentionEntity = {
  id: string
  name: string
  type: AgentMentionType
  subtitle?: string
}

const MENTION_MARKUP_REGEX = /@\[([^\]]+)\]\((client|project|team|user):([^)]+)\)/g

export function formatAgentMentionMarkup(entity: AgentMentionEntity): string {
  return `@[${entity.name}](${entity.type}:${entity.id})`
}

export function parseAgentMentionsFromText(text: string): AgentMentionEntity[] {
  const mentions: AgentMentionEntity[] = []
  const seen = new Set<string>()

  for (const match of text.matchAll(MENTION_MARKUP_REGEX)) {
    const name = match[1]?.trim()
    const type = match[2] as AgentMentionType | undefined
    const id = match[3]?.trim()
    if (!name || !type || !id) continue
    const key = `${type}:${id}`
    if (seen.has(key)) continue
    seen.add(key)
    mentions.push({ id, name, type })
  }

  return mentions
}

export function mergeAgentMentions(
  fromText: AgentMentionEntity[],
  selected: AgentMentionEntity[],
): AgentMentionEntity[] {
  const map = new Map<string, AgentMentionEntity>()
  for (const mention of [...selected, ...fromText]) {
    map.set(`${mention.type}:${mention.id}`, mention)
  }
  return [...map.values()]
}

export function parseAgentMentionsFromStored(
  value: unknown,
): AgentMentionEntity[] | undefined {
  if (!Array.isArray(value)) return undefined

  const mentions: AgentMentionEntity[] = []
  for (const entry of value) {
    if (!entry || typeof entry !== 'object') continue
    const record = entry as Record<string, unknown>
    const id = typeof record.id === 'string' ? record.id : null
    const name = typeof record.name === 'string' ? record.name : null
    const type = record.type
    if (!id || !name) continue
    if (type !== 'client' && type !== 'project' && type !== 'team' && type !== 'user') continue
    mentions.push({
      id,
      name,
      type,
      subtitle: typeof record.subtitle === 'string' ? record.subtitle : undefined,
    })
  }

  return mentions.length > 0 ? mentions : undefined
}

export function serializeAgentMentionsForStorage(
  mentions: AgentMentionEntity[],
): Array<{ id: string; name: string; type: AgentMentionType; subtitle?: string }> {
  return mentions.map((mention) => ({
    id: mention.id,
    name: mention.name,
    type: mention.type,
    ...(mention.subtitle ? { subtitle: mention.subtitle } : {}),
  }))
}
