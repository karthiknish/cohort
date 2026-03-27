'use client'

import { useCallback, type ChangeEvent, type KeyboardEvent } from 'react'
import { X } from 'lucide-react'

import { Badge } from '@/shared/ui/badge'
import { Button } from '@/shared/ui/button'
import { Input } from '@/shared/ui/input'

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
  const handleRemoveEmail = useCallback(
    (email: string) => () => onRemoveEmail(email),
    [onRemoveEmail]
  )

  if (selectedEmails.length === 0) {
    return <p className="mb-2 px-1 text-xs text-muted-foreground">{emptyStateText}</p>
  }

  return (
    <div className="mb-2 flex flex-wrap gap-2">
      {selectedEmails.map((email) => (
        <SelectedEmailBadge key={email} disabled={disabled} email={email} onRemoveEmail={onRemoveEmail} />
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
  onInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void
}) {
  const handleInputChange = useCallback(
    (event: ChangeEvent<HTMLInputElement>) => onInputChange(event.target.value),
    [onInputChange]
  )

  return (
    <div className="flex gap-2">
      <Input
        id={inputId}
        value={inputValue}
        onChange={handleInputChange}
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
  const handleAddSuggestedEmail = useCallback(
    (email: string) => () => onAddSuggestedEmail(email),
    [onAddSuggestedEmail]
  )

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
          <SuggestedEmailButton
            key={member.id}
            disabled={disabled}
            member={member}
            onAddSuggestedEmail={onAddSuggestedEmail}
          />
        ))}
      </div>
    </div>
  )
}

function SelectedEmailBadge({
  disabled,
  email,
  onRemoveEmail,
}: {
  disabled: boolean
  email: string
  onRemoveEmail: (email: string) => void
}) {
  const handleRemove = useCallback(() => {
    onRemoveEmail(email)
  }, [email, onRemoveEmail])

  return (
    <Badge variant="secondary" className="gap-1 pr-1">
      {email}
      <button
        type="button"
        onClick={handleRemove}
        disabled={disabled}
        className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground"
        aria-label={`Remove ${email}`}
      >
        <X className="h-3 w-3" />
      </button>
    </Badge>
  )
}

function SuggestedEmailButton({
  disabled,
  member,
  onAddSuggestedEmail,
}: {
  disabled: boolean
  member: MeetingAttendeeSuggestion
  onAddSuggestedEmail: (email: string) => void
}) {
  const handleAdd = useCallback(() => {
    onAddSuggestedEmail(member.email)
  }, [member.email, onAddSuggestedEmail])

  return (
    <Button
      type="button"
      variant="outline"
      size="sm"
      onClick={handleAdd}
      disabled={disabled}
      className="h-auto py-1.5 text-left"
    >
      <span className="flex flex-col items-start leading-tight">
        <span className="text-xs font-medium">{member.name}</span>
        <span className="text-[11px] text-muted-foreground">{member.email}</span>
      </span>
    </Button>
  )
}