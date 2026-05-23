import { Errors } from '../errors'

const POLL_FENCE = '```cohort-poll'

export type PollOptionRow = {
  id: string
  text: string
  voters: string[]
}

export type CollaborationPollPayload = {
  id: string
  question: string
  options: PollOptionRow[]
  multipleChoice: boolean
  anonymous: boolean
  endTime?: string | null
  createdBy: string
  createdByName: string
  createdAt: string
}

export function encodePollMessage(poll: CollaborationPollPayload): string {
  return `${POLL_FENCE}\n${JSON.stringify(poll)}\n\`\`\``
}

export function parsePollMessage(content: string | null | undefined): CollaborationPollPayload | null {
  if (!content || !content.includes(POLL_FENCE)) {
    return null
  }

  const match = content.match(/```cohort-poll\s*([\s\S]*?)```/i)
  if (!match?.[1]) {
    return null
  }

  try {
    const parsed = JSON.parse(match[1].trim()) as CollaborationPollPayload
    if (!parsed?.question || !Array.isArray(parsed.options) || parsed.options.length < 2) {
      return null
    }

    return parsed
  } catch {
    return null
  }
}

export function isPollExpired(poll: CollaborationPollPayload, nowMs: number = Date.now()): boolean {
  if (!poll.endTime) {
    return false
  }

  const endMs = Date.parse(poll.endTime)
  return Number.isFinite(endMs) && endMs <= nowMs
}

export function applyPollVote(
  poll: CollaborationPollPayload,
  userId: string,
  optionIds: string[],
): CollaborationPollPayload {
  if (isPollExpired(poll)) {
    throw Errors.validation.invalidState('Poll has ended')
  }

  const uniqueOptionIds = [...new Set(optionIds.filter(Boolean))]
  if (uniqueOptionIds.length === 0) {
    throw Errors.validation.invalidInput('Select at least one option')
  }

  const validIds = new Set(poll.options.map((option) => option.id))
  for (const optionId of uniqueOptionIds) {
    if (!validIds.has(optionId)) {
      throw Errors.validation.invalidInput('Invalid poll option')
    }
  }

  if (!poll.multipleChoice && uniqueOptionIds.length !== 1) {
    throw Errors.validation.invalidInput('This poll accepts only one choice')
  }

  const nextOptions = poll.options.map((option) => ({
    ...option,
    voters: option.voters.filter((voterId) => voterId !== userId),
  }))

  const optionsById = new Map(nextOptions.map((option) => [option.id, option]))

  for (const optionId of uniqueOptionIds) {
    const target = optionsById.get(optionId)
    if (!target) continue
    target.voters = [...target.voters, userId]
  }

  return {
    ...poll,
    options: nextOptions,
  }
}

export function endPoll(poll: CollaborationPollPayload, nowMs: number = Date.now()): CollaborationPollPayload {
  if (isPollExpired(poll, nowMs)) {
    return poll
  }

  return {
    ...poll,
    endTime: new Date(nowMs).toISOString(),
  }
}
