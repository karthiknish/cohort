'use client'

import type { MeetingAttendeeSuggestion } from '@/lib/meetings/attendees'

import type { KeyboardEvent } from 'react'
import { X } from 'lucide-react'

import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'

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
  onInputChange,
  onInputKeyDown,
  onCommitInput,
  onRemoveEmail,
  onAddSuggestedEmail,
}: MeetingAttendeesFieldProps) {
  return (
    <div className="space-y-2 md:col-span-2">
      <label htmlFor={inputId} className="text-sm font-medium">{label}</label>
      <div className="rounded-md border border-input bg-background p-2">
        {selectedEmails.length > 0 ? (
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
        ) : (
          <p className="mb-2 px-1 text-xs text-muted-foreground">{emptyStateText}</p>
        )}

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
      </div>

      {suggestions.length > 0 && (
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
      )}

      <p className="text-xs text-muted-foreground">{helperText}</p>
    </div>
  )
}