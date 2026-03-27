import type { ReceivedChatMessage } from '@/shared/ui/livekit'

export type MeetingChatMentionState = {
  active: boolean
  startIndex: number
  query: string
}

export const DEFAULT_MEETING_CHAT_MENTION_STATE: MeetingChatMentionState = {
  active: false,
  startIndex: -1,
  query: '',
}

const MENTION_TRIGGER_LOOKBACK = 75

export type MeetingChatAttachment = {
  name: string
  url: string
  type: string
  size: string
}

type MeetingChatEnvelope = {
  type: 'cohorts-meeting-chat'
  version: 1
  text?: string | null
  attachments?: MeetingChatAttachment[]
}

type MeetingChatParticipantMetadata = {
  photoURL?: string | null
}

export type ParsedMeetingChatMessageContent = {
  text: string
  attachments: MeetingChatAttachment[]
}

function isMeetingChatMentionBoundary(value: string | undefined): boolean {
  return !value || /[\s([{"']/.test(value)
}

function isMeetingChatAttachment(value: unknown): value is MeetingChatAttachment {
  if (!value || typeof value !== 'object') {
    return false
  }

  const record = value as Record<string, unknown>
  return typeof record.name === 'string'
    && typeof record.url === 'string'
    && typeof record.type === 'string'
    && typeof record.size === 'string'
}

function parseMeetingChatParticipantMetadata(metadata: string | undefined): MeetingChatParticipantMetadata | null {
  if (typeof metadata !== 'string' || metadata.trim().length === 0) {
    return null
  }

  try {
    const parsed = JSON.parse(metadata) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return null
    }

    return parsed as MeetingChatParticipantMetadata
  } catch {
    return null
  }
}

export function buildMeetingChatMessageContent(input: {
  text?: string | null
  attachments?: MeetingChatAttachment[]
}): string {
  const text = input.text?.trim() ?? ''
  const attachments = Array.isArray(input.attachments) ? input.attachments.filter(isMeetingChatAttachment) : []

  if (attachments.length === 0) {
    return text
  }

  const payload: MeetingChatEnvelope = {
    type: 'cohorts-meeting-chat',
    version: 1,
    text: text.length > 0 ? text : null,
    attachments,
  }

  return JSON.stringify(payload)
}

export function parseMeetingChatMessageContent(content: string): ParsedMeetingChatMessageContent {
  if (!content.trim()) {
    return { text: '', attachments: [] }
  }

  try {
    const parsed = JSON.parse(content) as unknown
    if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
      return { text: content, attachments: [] }
    }

    const record = parsed as Record<string, unknown>
    if (record.type !== 'cohorts-meeting-chat') {
      return { text: content, attachments: [] }
    }

    return {
      text: typeof record.text === 'string' ? record.text : '',
      attachments: Array.isArray(record.attachments) ? record.attachments.filter(isMeetingChatAttachment) : [],
    }
  } catch {
    return { text: content, attachments: [] }
  }
}

export function getMeetingChatAuthorLabel(message: ReceivedChatMessage): string {
  const displayName = message.from?.name?.trim()
  if (displayName) {
    return displayName
  }

  const identity = message.from?.identity?.trim()
  if (identity) {
    return identity
  }

  return 'Participant'
}

export function getMeetingChatParticipantAvatarUrl(message: ReceivedChatMessage): string | null {
  const metadata = parseMeetingChatParticipantMetadata(message.from?.metadata)
  const photoURL = metadata?.photoURL
  return typeof photoURL === 'string' && photoURL.trim().length > 0 ? photoURL.trim() : null
}

export function getMeetingChatAvatarUrlFromMetadata(metadata: string | undefined): string | null {
  const parsed = parseMeetingChatParticipantMetadata(metadata)
  const photoURL = parsed?.photoURL
  return typeof photoURL === 'string' && photoURL.trim().length > 0 ? photoURL.trim() : null
}

export function detectMeetingChatMentionState(currentValue: string, caretPosition: number): MeetingChatMentionState {
  if (caretPosition <= 0) {
    return DEFAULT_MEETING_CHAT_MENTION_STATE
  }

  const start = Math.max(0, caretPosition - MENTION_TRIGGER_LOOKBACK)
  for (let index = caretPosition - 1; index >= start; index -= 1) {
    const char = currentValue[index]

    if (char === '@') {
      const preceding = index > 0 ? currentValue[index - 1] : undefined
      if (!isMeetingChatMentionBoundary(preceding)) {
        break
      }

      const query = currentValue.slice(index + 1, caretPosition)
      if (query.includes(' ') || query.includes('\n') || query.includes('[') || query.includes(']')) {
        break
      }

      return {
        active: true,
        startIndex: index,
        query,
      }
    }

    if (char === '\n' || char === ' ' || char === '\t') {
      break
    }
  }

  return DEFAULT_MEETING_CHAT_MENTION_STATE
}

export function insertMeetingChatMention(input: {
  currentValue: string
  mentionLabel: string
  mentionState: MeetingChatMentionState
  caretPosition: number
}): { nextValue: string; nextCaret: number } {
  const label = input.mentionLabel.trim()
  if (!input.mentionState.active || input.mentionState.startIndex < 0 || !label) {
    return {
      nextValue: input.currentValue,
      nextCaret: input.caretPosition,
    }
  }

  const safeCaret = Math.max(input.mentionState.startIndex, input.caretPosition)
  const beforeMention = input.currentValue.slice(0, input.mentionState.startIndex)
  const afterMention = input.currentValue.slice(safeCaret)
  const mentionMarkup = `@[${label}]`
  const needsTrailingSpace = afterMention.length === 0 || !/^[\s,.!?;:)\]}]/.test(afterMention)
  const insertion = `${mentionMarkup}${needsTrailingSpace ? ' ' : ''}`
  const nextValue = `${beforeMention}${insertion}${afterMention}`

  return {
    nextValue,
    nextCaret: beforeMention.length + insertion.length,
  }
}

export function countUnreadMeetingChatMessages(messages: ReceivedChatMessage[], lastReadAt: number): number {
  if (!Number.isFinite(lastReadAt) || lastReadAt <= 0) {
    return messages.length
  }

  return messages.filter((message) => message.timestamp > lastReadAt).length
}

export function getMeetingChatInitials(label: string): string {
  return label
    .split(' ')
    .filter(Boolean)
    .map((segment) => segment[0])
    .join('')
    .slice(0, 2)
    .toUpperCase() || 'P'
}
