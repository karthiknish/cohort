'use client';
import { useCallback, type ChangeEvent, type KeyboardEvent } from 'react';
import { X } from 'lucide-react';
import { Badge } from '@/shared/ui/badge';
import { Button } from '@/shared/ui/button';
import { Input } from '@/shared/ui/input';
import type { MeetingAttendeeSuggestion } from './meeting-attendees-field';
export function MeetingAttendeesSelectedList({ disabled, emptyStateText, onRemoveEmail, selectedEmails, }: {
    disabled: boolean;
    emptyStateText: string;
    onRemoveEmail: (email: string) => void;
    selectedEmails: string[];
}) {
    const handleRemoveEmail = (email: string) => () => onRemoveEmail(email);
    if (selectedEmails.length === 0) {
        return <p className="mb-2 px-1 text-xs text-muted-foreground">{emptyStateText}</p>;
    }
    return (<div className="mb-2 flex flex-wrap gap-2">
      {selectedEmails.map((email) => (<SelectedEmailBadge key={email} disabled={disabled} email={email} onRemoveEmail={onRemoveEmail}/>))}
    </div>);
}
export function MeetingAttendeesInputRow({ disabled, inputId, inputValue, onCommitInput, onInputChange, onInputKeyDown, }: {
    disabled: boolean;
    inputId: string;
    inputValue: string;
    onCommitInput: () => void;
    onInputChange: (value: string) => void;
    onInputKeyDown: (event: KeyboardEvent<HTMLInputElement>) => void;
}) {
    const handleInputChange = (event: ChangeEvent<HTMLInputElement>) => onInputChange(event.target.value);
    return (<div className="flex gap-2">
      <Input id={inputId} value={inputValue} onChange={handleInputChange} onKeyDown={onInputKeyDown} placeholder="Type name or email and press Enter" disabled={disabled}/>
      <Button type="button" variant="outline" onClick={onCommitInput} disabled={disabled || inputValue.trim().length === 0}>
        Add
      </Button>
    </div>);
}
function attendeeInitials(name: string): string {
    const parts = name.trim().split(/\s+/).filter(Boolean);
    if (parts.length === 0)
        return '?';
    const first = parts[0] ?? '';
    if (parts.length === 1)
        return first.slice(0, 2).toUpperCase();
    const second = parts[1] ?? '';
    return `${first.charAt(0)}${second.charAt(0)}`.toUpperCase();
}
function attendeeAvatarColor(email: string): string {
    const palette = [
        'bg-blue-100 text-blue-700',
        'bg-emerald-100 text-emerald-700',
        'bg-violet-100 text-violet-700',
        'bg-amber-100 text-amber-700',
        'bg-rose-100 text-rose-700',
    ] as const;
    const index = email.split('').reduce((sum, char) => sum + char.charCodeAt(0), 0) % palette.length;
    return palette[index] ?? palette[0];
}
export function MeetingAttendeesSuggestions({ disabled, label = 'Suggested participants', onAddSuggestedEmail, suggestions, }: {
    disabled: boolean;
    label?: string;
    onAddSuggestedEmail: (email: string) => void;
    suggestions: MeetingAttendeeSuggestion[];
}) {
    const handleAddSuggestedEmail = (email: string) => () => onAddSuggestedEmail(email);
    if (suggestions.length === 0) {
        return null;
    }
    return (<div className="space-y-2">
      <p className="text-xs font-medium text-muted-foreground">{label}</p>
      <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1">
        {suggestions.map((member) => (<SuggestedEmailButton key={member.id} disabled={disabled} member={member} onAddSuggestedEmail={onAddSuggestedEmail}/>))}
      </div>
    </div>);
}
function SelectedEmailBadge({ disabled, email, onRemoveEmail, }: {
    disabled: boolean;
    email: string;
    onRemoveEmail: (email: string) => void;
}) {
    const handleRemove = () => {
        onRemoveEmail(email);
    };
    return (<Badge variant="secondary" className="gap-1 pr-1">
      {email}
      <button type="button" onClick={handleRemove} disabled={disabled} className="rounded p-0.5 text-muted-foreground transition-colors hover:text-foreground" aria-label={`Remove ${email}`}>
        <X className="size-3"/>
      </button>
    </Badge>);
}
function SuggestedEmailButton({ disabled, member, onAddSuggestedEmail, }: {
    disabled: boolean;
    member: MeetingAttendeeSuggestion;
    onAddSuggestedEmail: (email: string) => void;
}) {
    const handleAdd = () => {
        onAddSuggestedEmail(member.email);
    };
    return (<button type="button" onClick={handleAdd} disabled={disabled} className="flex min-w-[9.5rem] shrink-0 items-center gap-2.5 rounded-lg border border-muted/60 bg-background px-3 py-2 text-left transition-colors hover:border-primary/30 hover:bg-muted/30 disabled:cursor-not-allowed disabled:opacity-50">
      <span className={`flex size-9 shrink-0 items-center justify-center rounded-full text-xs font-semibold ${attendeeAvatarColor(member.email)}`}>
        {attendeeInitials(member.name)}
      </span>
      <span className="min-w-0 leading-tight">
        <span className="block truncate text-sm font-medium text-foreground">{member.name}</span>
        <span className="block truncate text-xs text-muted-foreground">{member.email}</span>
      </span>
    </button>);
}
