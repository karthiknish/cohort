import type { AgentConversationSummary } from '@/shared/hooks/use-agent-mode'

export type AgentHistoryGroup = 'pinned' | 'today' | 'yesterday' | 'this_week' | 'older'

export type GroupedAgentHistory = {
  group: AgentHistoryGroup
  label: string
  conversations: AgentConversationSummary[]
}

export function filterAgentHistory(
  history: AgentConversationSummary[],
  query: string,
): AgentConversationSummary[] {
  const trimmed = query.trim().toLowerCase()
  if (!trimmed) return history

  return history.filter((conversation) => {
    const title = (conversation.title ?? 'Untitled chat').toLowerCase()
    const snippet = (conversation.previewSnippet ?? '').toLowerCase()
    return title.includes(trimmed) || snippet.includes(trimmed) || conversation.id.toLowerCase().includes(trimmed)
  })
}

function startOfLocalDay(date: Date): number {
  const copy = new Date(date)
  copy.setHours(0, 0, 0, 0)
  return copy.getTime()
}

export function getAgentHistoryGroup(lastMessageAt: string | null, pinnedAt: string | null): AgentHistoryGroup {
  if (pinnedAt) return 'pinned'

  if (!lastMessageAt) return 'older'

  const timestamp = new Date(lastMessageAt).getTime()
  if (Number.isNaN(timestamp)) return 'older'

  const now = new Date()
  const todayStart = startOfLocalDay(now)
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000
  const weekStart = todayStart - 6 * 24 * 60 * 60 * 1000

  if (timestamp >= todayStart) return 'today'
  if (timestamp >= yesterdayStart) return 'yesterday'
  if (timestamp >= weekStart) return 'this_week'
  return 'older'
}

const GROUP_LABELS: Record<AgentHistoryGroup, string> = {
  pinned: 'Pinned',
  today: 'Today',
  yesterday: 'Yesterday',
  this_week: 'This week',
  older: 'Older',
}

const GROUP_ORDER: AgentHistoryGroup[] = ['pinned', 'today', 'yesterday', 'this_week', 'older']

export function groupAgentHistory(
  history: AgentConversationSummary[],
  options?: { includeArchived?: boolean },
): GroupedAgentHistory[] {
  const includeArchived = options?.includeArchived ?? false
  const visible = history.filter((entry) => includeArchived || !entry.archivedAt)

  const buckets = new Map<AgentHistoryGroup, AgentConversationSummary[]>()
  for (const group of GROUP_ORDER) {
    buckets.set(group, [])
  }

  for (const conversation of visible) {
    const group = getAgentHistoryGroup(conversation.lastMessageAt, conversation.pinnedAt ?? null)
    buckets.get(group)?.push(conversation)
  }

  return GROUP_ORDER.flatMap((group) => {
    const conversations = buckets.get(group) ?? []
    return conversations.length > 0
      ? [{ group, label: GROUP_LABELS[group], conversations }]
      : []
  })
}
