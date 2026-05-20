'use client'

import type { KeyboardEvent } from 'react'

import type { MeetingAttendeeSuggestion } from '@/lib/meetings/attendees'
import {
  MeetingAttendeesInputRow,
  MeetingAttendeesSelectedList,
  MeetingAttendeesSuggestions,
} from './meeting-attendees-field-sections'

export type { MeetingAttendeeSuggestion } from '@/lib/meetings/attendees'

type MeetingAttendeesFieldProps = {
  label: string
  inputId: string
  inputValue: string
  selectedEmails: string[]
  disabled: boolean
  emptyStateText: string
  helperText: string
  suggestions: MeetingAttendeeSuggestion[]
  suggestionsLabel?: string
  onInputChange: (value: string) => void
  onInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
  onCommitInput: () => void
  onRemoveEmail: (email: string) => void
  onAddSuggestedEmail: (email: string) => void
}

export function MeetingAttendeesField({
  label,
  inputId,
  inputValue,
  selectedEmails,
  disabled,
  emptyStateText,
  helperText,
  suggestions,
  suggestionsLabel,
  onInputChange,
  onInputKeyDown,
  onCommitInput,
  onRemoveEmail,
  onAddSuggestedEmail,
}: MeetingAttendeesFieldProps) {
  return (
    <div className="space-y-3">
      <label htmlFor={inputId} className="text-sm font-medium">{label}</label>
      <div className="rounded-md border border-input bg-background p-2">
        <MeetingAttendeesSelectedList
          disabled={disabled}
          emptyStateText={emptyStateText}
          onRemoveEmail={onRemoveEmail}
          selectedEmails={selectedEmails}
        />

        <MeetingAttendeesInputRow
          disabled={disabled}
          inputId={inputId}
          inputValue={inputValue}
          onCommitInput={onCommitInput}
          onInputChange={onInputChange}
          onInputKeyDown={onInputKeyDown}
        />
      </div>

      <MeetingAttendeesSuggestions
        disabled={disabled}
        label={suggestionsLabel}
        onAddSuggestedEmail={onAddSuggestedEmail}
        suggestions={suggestions}
      />

      <p className="text-xs text-muted-foreground">{helperText}</p>
    </div>
  )
}