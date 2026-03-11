'use client'

import { X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

import type { MeetingAttendeeSuggestion } from './meeting-attendees-field'

export function MeetingAttendeesSelectedList({
  disabled,
  emptyStateText,
  onRemoveEmail,
  selectedEmails,
}: {
  disabled: boolean
  emptyStateText: string
  onRemoveEmail: (email: string) => void
  selectedEmails: string[]
}) {
  if (selectedEmails.length === 0) {
    return <p className="mb-2 px-1 text-xs text-muted-foreground">{emptyStateText}</p>
  }

  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {selectedEmails.map((email) => (
        <Badge key={email} variant="secondary" className="gap-1 pr-1">
          {email}
          <button
            type="button"
            onClick={() => onRemoveEmail(email)}
            disabled={disabled}
            className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
            aria-label={`Remove ${email}`}
          >
            <X className="h-3 w-3" />
          </button>
        </Badge>
      ))}
    </div>
  )
}

export function MeetingAttendeesInputRow({
  disabled,
  inputId,
  inputValue,
  onCommitInput,
  onInputChange,
  onInputKeyDown,
}: {
  disabled: boolean
  inputId: string
  inputValue: string
  onCommitInput: () => void
  onInputChange: (value: string) => void
  onInputKeyDown: (event: React.KeyboardEvent<HTMLInputElement>) => void
}) {
  return (
    <div className="flex gap-2">
      <Input
        id={inputId}
        value={inputValue}
        onChange={(event) => onInputChange(event.target.value)}
        onKeyDown={onInputKeyDown}
        placeholder="Type name or email and press Enter"
        disabled={disabled}
      />
      <Button
        type="button"
        variant="outline"
        onClick={onCommitInput}
        disabled={disabled || inputValue.trim().length === 0}
      >
        Add
      </Button>
    </div>
  )
}

export function MeetingAttendeesSuggestions({
  disabled,
  onAddSuggestedEmail,
  suggestions,
}: {
  disabled: boolean
  onAddSuggestedEmail: (email: string) => void
  suggestions: MeetingAttendeeSuggestion[]
}) {
  if (suggestions.length === 0) {
    return null
  }

  return (
    <div className="rounded-md border border-muted/60 bg-muted/20 p-2">
      <p className="mb-2 text-xs font-medium uppercase tracking-wide text-muted-foreground">
        Suggested Platform Users
      </p>
      <div className="flex flex-wrap gap-2">
        {suggestions.map((member) => (
          <Button
            key={member.id}
            type="button"
            variant="outline"
            size="sm"
            onClick={() => onAddSuggestedEmail(member.email)}
            disabled={disabled}
            className="h-auto py-1.5 text-left"
          >
            <span className="flex flex-col items-start leading-tight">
              <span className="text-xs font-medium">{member.name}</span>
              <span className="text-[11px] text-muted-foreground">{member.email}</span>
            </span>
          </Button>
        ))}
      </div>
    </div>
  )
}