export type MeetingAttendeeSuggestion = {
  id: string
  name: string
  email: string
  role?: string | null
}

type MeetingSuggestionSource = {
  id: string
  name: string
  email?: string | null
  role?: string | null
}

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

export function normalizeEmail(value: string): string {
  return value.trim().toLowerCase()
}

export function parseAttendeeInput(value: string): string[] {
  return Array.from(
    new Set(
      value
        .split(/[\n,;]/)
        .map((entry) => {
          const trimmed = entry.trim()
          const angleMatch = trimmed.match(/<([^>]+)>/)
          const candidate = normalizeEmail(angleMatch?.[1] ?? trimmed)
          return EMAIL_REGEX.test(candidate) ? candidate : null
        })
        .filter((entry): entry is string => Boolean(entry))
    )
  )
}

export function sanitizeMeetingParticipantEmails(attendeeEmails: string[], organizerEmail?: string | null): string[] {
  const organizer = organizerEmail ? normalizeEmail(organizerEmail) : null

  return Array.from(
    new Set(
      attendeeEmails
        .map(normalizeEmail)
        .filter((email) => EMAIL_REGEX.test(email))
        .filter((email) => email !== organizer)
    )
  )
}

export function mergeMeetingParticipantEmails(current: string[], entries: string[], organizerEmail?: string | null): string[] {
  return sanitizeMeetingParticipantEmails([...current, ...entries], organizerEmail)
}

export function buildMeetingAttendeeDraft(options: {
  selectedEmails: string[]
  pendingInput: string
  organizerEmail?: string | null
}) {
  const typedAttendees = parseAttendeeInput(options.pendingInput)
  const attendeeEmails = mergeMeetingParticipantEmails(options.selectedEmails, typedAttendees, options.organizerEmail)

  return {
    attendeeEmails,
    hasParticipants: attendeeEmails.length > 0,
    hasPendingInvalidInput: options.pendingInput.trim().length > 0 && typedAttendees.length === 0,
  }
}

export function buildMeetingAttendeeSuggestions<T extends MeetingSuggestionSource>(options: {
  workspaceMembers: T[]
  platformUsers: T[]
  queryValue: string
  selectedEmails: string[]
  organizerEmail?: string | null
  limit?: number
}): MeetingAttendeeSuggestion[] {
  const mergedByEmail = new Map<string, MeetingAttendeeSuggestion>()
  const organizer = options.organizerEmail ? normalizeEmail(options.organizerEmail) : null
  const selected = new Set(sanitizeMeetingParticipantEmails(options.selectedEmails, options.organizerEmail))

  for (const member of [...options.workspaceMembers, ...options.platformUsers]) {
    const email = typeof member.email === 'string' ? normalizeEmail(member.email) : null
    if (!email || !EMAIL_REGEX.test(email) || email === organizer || selected.has(email) || mergedByEmail.has(email)) {
      continue
    }

    mergedByEmail.set(email, {
      id: member.id,
      name: member.name.trim() || email,
      email,
      role: member.role ?? null,
    })
  }

  const query = options.queryValue.trim().toLowerCase()

  return Array.from(mergedByEmail.values())
    .filter((member) => {
      if (!query) return true
      return [member.name, member.email, member.role ?? ''].some((value) => value.toLowerCase().includes(query))
    })
    .slice(0, options.limit ?? 8)
}