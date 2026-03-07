'use client'

import { useCallback, useMemo, useState } from 'react'
import type { KeyboardEvent } from 'react'

import { useToast } from '@/components/ui/use-toast'
import {
  buildMeetingAttendeeDraft,
  buildMeetingAttendeeSuggestions,
  mergeMeetingParticipantEmails,
  normalizeEmail,
  parseAttendeeInput,
  sanitizeMeetingParticipantEmails,
} from '@/lib/meetings/attendees'

import type { WorkspaceMember } from '../types'

type UseMeetingAttendeesOptions = {
  workspaceMembers: WorkspaceMember[]
  platformUsers: WorkspaceMember[]
  organizerEmail?: string | null
}

function useAttendeeController(options: UseMeetingAttendeesOptions) {
  const { toast } = useToast()
  const [input, setInput] = useState('')
  const [emails, setEmailsState] = useState<string[]>([])

  const suggestions = useMemo(
    () => buildMeetingAttendeeSuggestions({ ...options, queryValue: input, selectedEmails: emails }),
    [emails, input, options]
  )

  const setEmails = useCallback(
    (nextEmails: string[]) => {
      setEmailsState(sanitizeMeetingParticipantEmails(nextEmails, options.organizerEmail))
    },
    [options.organizerEmail]
  )

  const addEmails = useCallback(
    (entries: string[]) => {
      const organizer = options.organizerEmail ? normalizeEmail(options.organizerEmail) : null
      const includesOrganizer = organizer ? entries.some((entry) => normalizeEmail(entry) === organizer) : false
      const participantEntries = sanitizeMeetingParticipantEmails(entries, options.organizerEmail)

      if (includesOrganizer && participantEntries.length === 0) {
        toast({
          variant: 'destructive',
          title: 'Add another participant',
          description: 'Your own profile is already the meeting organizer. Add at least one other participant.',
        })
        return
      }

      if (participantEntries.length === 0) return
      setEmailsState((current) => mergeMeetingParticipantEmails(current, participantEntries, options.organizerEmail))
    },
    [options.organizerEmail, toast]
  )

  const commitInput = useCallback(() => {
    const parsed = parseAttendeeInput(input)

    if (parsed.length === 0 && input.trim().length > 0) {
      toast({
        variant: 'destructive',
        title: 'Invalid attendee email',
        description: 'Enter a valid email or choose a teammate from suggestions.',
      })
      return false
    }

    addEmails(parsed)
    setInput('')
    return true
  }, [addEmails, input, toast])

  const addSuggestedEmail = useCallback(
    (email: string) => {
      addEmails([email])
      setInput('')
    },
    [addEmails]
  )

  const removeEmail = useCallback((email: string) => {
    const normalized = normalizeEmail(email)
    setEmailsState((current) => current.filter((value) => normalizeEmail(value) !== normalized))
  }, [])

  const handleKeyDown = useCallback(
    (event: KeyboardEvent<HTMLInputElement>) => {
      if (event.key === 'Enter' || event.key === 'Tab') {
        const firstSuggestion = suggestions[0]
        if (firstSuggestion && input.trim().length > 0) {
          event.preventDefault()
          addSuggestedEmail(firstSuggestion.email)
          return
        }

        event.preventDefault()
        void commitInput()
        return
      }

      if (event.key === ',' || event.key === ';') {
        event.preventDefault()
        void commitInput()
      }
    },
    [addSuggestedEmail, commitInput, input, suggestions]
  )

  const resolveSubmission = useCallback(
    () => buildMeetingAttendeeDraft({ selectedEmails: emails, pendingInput: input, organizerEmail: options.organizerEmail }),
    [emails, input, options.organizerEmail]
  )

  const reset = useCallback(() => {
    setInput('')
    setEmailsState([])
  }, [])

  return { input, setInput, emails, setEmails, suggestions, commitInput, addSuggestedEmail, removeEmail, handleKeyDown, resolveSubmission, reset }
}

export function useMeetingAttendees(options: UseMeetingAttendeesOptions) {
  const schedule = useAttendeeController(options)
  const quick = useAttendeeController(options)

  return { schedule, quick }
}