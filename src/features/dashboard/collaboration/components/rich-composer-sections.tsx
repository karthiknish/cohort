'use client'

import {
  useCallback,
  type ChangeEvent,
  type ClipboardEvent,
  type ComponentType,
  type DragEvent,
  type KeyboardEvent,
  type MouseEvent,
  type RefObject,
} from 'react'

import EmojiPicker, { Theme, type EmojiClickData } from 'emoji-picker-react'
import { AtSign, Bold, Code, Italic, List, ListOrdered, Paperclip, Quote, Smile, Upload } from 'lucide-react'

import { Button } from '@/shared/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover'
import { Textarea } from '@/shared/ui/textarea'
import { VoiceInputButton } from '@/shared/ui/voice-input'
import { cn } from '@/lib/utils'
import type { ClientTeamMember } from '@/types/clients'

type FormattingAction = 'bold' | 'italic' | 'blockquote' | 'code' | 'unordered-list' | 'ordered-list'

type ComposerButtonProps = {
  icon: ComponentType<{ className?: string }>
  label: string
  onClick: () => void
  disabled?: boolean
}

function ComposerButton({ icon: Icon, label, onClick, disabled }: ComposerButtonProps) {
  const handleClick = useCallback(() => {
    if (disabled) return
    onClick()
  }, [disabled, onClick])

  return (
    <Button type="button" size="icon" variant="ghost" onClick={handleClick} disabled={disabled} className="h-7 w-7 hover:bg-background/50" aria-label={label}>
      <Icon className="h-3.5 w-3.5" />
      <span className="sr-only">{label}</span>
    </Button>
  )
}

export function RichComposerToolbar({
  disabled,
  emojiPickerOpen,
  hasAttachments,
  onAction,
  onAttachClick,
  onEmojiClick,
  onInsertMention,
  onOpenEmojiChange,
  onVoiceTranscript,
}: {
  disabled: boolean
  emojiPickerOpen: boolean
  hasAttachments: boolean
  onAction: (action: FormattingAction) => void
  onAttachClick?: () => void
  onEmojiClick: (emojiData: EmojiClickData) => void
  onInsertMention: () => void
  onOpenEmojiChange: (open: boolean) => void
  onVoiceTranscript: (transcript: string) => void
}) {
  return (
    <div className="flex flex-wrap items-center gap-0.5 rounded-t-lg border-b border-muted/40 bg-muted/10 px-2 py-1.5">
      <ComposerButton icon={Bold} label="Bold" onClick={() => onAction('bold')} disabled={disabled} />
      <ComposerButton icon={Italic} label="Italic" onClick={() => onAction('italic')} disabled={disabled} />
      <ComposerButton icon={Quote} label="Quote" onClick={() => onAction('blockquote')} disabled={disabled} />
      <ComposerButton icon={Code} label="Code" onClick={() => onAction('code')} disabled={disabled} />
      <ComposerButton icon={List} label="Bulleted list" onClick={() => onAction('unordered-list')} disabled={disabled} />
      <ComposerButton icon={ListOrdered} label="Numbered list" onClick={() => onAction('ordered-list')} disabled={disabled} />
      <ComposerButton icon={AtSign} label="Mention" onClick={onInsertMention} disabled={disabled} />
      <div className="mx-1 h-4 w-px bg-muted/60" />
      {onAttachClick ? (
        <Button
          type="button"
          size="sm"
          variant={hasAttachments ? 'secondary' : 'ghost'}
          onClick={onAttachClick}
          disabled={disabled}
          className={cn('h-7 gap-1.5 px-2 text-xs hover:bg-background/50', hasAttachments && 'bg-primary/10 text-primary hover:bg-primary/20')}
        >
          <Paperclip className="h-3.5 w-3.5" />
          <span className="hidden sm:inline">Attach</span>
        </Button>
      ) : null}
      <div className="mx-1 h-4 w-px bg-muted/60" />
      <Popover open={emojiPickerOpen} onOpenChange={onOpenEmojiChange}>
        <PopoverTrigger asChild>
          <Button type="button" size="icon" variant="ghost" disabled={disabled} className="h-7 w-7" aria-label="Open emoji picker">
            <Smile className="h-4 w-4" />
            <span className="sr-only">Open emoji picker</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.LIGHT} width={320} height={400} />
        </PopoverContent>
      </Popover>
      <VoiceInputButton onTranscript={onVoiceTranscript} disabled={disabled} />
    </div>
  )
}

export function RichComposerTextareaShell({
  disabled,
  isDraggingOver,
  onBlur,
  onChange,
  onDragEnter,
  onDragLeave,
  onDragOver,
  onDrop,
  onFocus,
  onKeyDown,
  onPaste,
  placeholder,
  textareaRef,
  value,
}: {
  disabled: boolean
  isDraggingOver: boolean
  onBlur: () => void
  onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void
  onDragEnter: (event: DragEvent<HTMLTextAreaElement>) => void
  onDragLeave: (event: DragEvent<HTMLTextAreaElement>) => void
  onDragOver: (event: DragEvent<HTMLTextAreaElement>) => void
  onDrop: (event: DragEvent<HTMLTextAreaElement>) => void
  onFocus: () => void
  onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void
  onPaste?: (event: ClipboardEvent<HTMLTextAreaElement>) => void
  placeholder: string
  textareaRef: RefObject<HTMLTextAreaElement | null>
  value: string
}) {
  return (
    <div className="relative">
      <Textarea
        ref={textareaRef}
        value={value}
        placeholder={placeholder}
        onChange={onChange}
        onKeyDown={onKeyDown}
        onBlur={onBlur}
        onFocus={onFocus}
        onDrop={onDrop}
        onDragOver={onDragOver}
        onDragEnter={onDragEnter}
        onDragLeave={onDragLeave}
        onPaste={onPaste}
        disabled={disabled}
        maxLength={2000}
        className={cn('min-h-[120px] resize-y rounded-b-lg rounded-t-none border-0 bg-transparent p-3 shadow-none focus-visible:ring-0', isDraggingOver && 'bg-primary/5')}
      />
      {isDraggingOver ? (
        <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-b-lg bg-primary/10">
          <div className="flex flex-col items-center gap-2 text-primary">
            <Upload className="h-8 w-8" />
            <span className="text-sm font-medium">Drop files here to attach</span>
          </div>
        </div>
      ) : null}
    </div>
  )
}

export function RichComposerMentionMenu({
  highlightedMention,
  mentionQuery,
  mentionResults,
  onMentionClick,
  onMentionMouseDown,
}: {
  highlightedMention: number
  mentionQuery: string
  mentionResults: ClientTeamMember[]
  onMentionClick: (participant: ClientTeamMember) => void
  onMentionMouseDown: (event: MouseEvent<HTMLButtonElement>) => void
}) {
  return (
    <div className="absolute bottom-2 left-2 z-20 w-64 rounded-md border border-muted/60 bg-popover p-1 shadow-lg" role="listbox" aria-label="Mention teammate suggestions">
      <p className="px-2 py-1 text-xs font-medium uppercase text-muted-foreground">Mention teammate</p>
      <div className="max-h-52 overflow-y-auto">
        {mentionResults.length > 0 ? mentionResults.map((participant, index) => {
          const isActive = index === highlightedMention
          return (
            <button
              key={participant.name}
              type="button"
              onMouseDown={onMentionMouseDown}
              onClick={() => onMentionClick(participant)}
              className={cn('flex w-full items-center justify-between gap-2 rounded-md px-2 py-1 text-left text-sm transition', isActive ? 'bg-primary/10 text-primary' : 'hover:bg-muted')}
            >
              <span className="truncate">{participant.name}</span>
              {participant.role ? <span className="text-xs text-muted-foreground">{participant.role}</span> : null}
            </button>
          )
        }) : (
          <div className="px-2 py-3 text-sm text-muted-foreground" aria-live="polite">
            No teammates match {mentionQuery.trim() ? `“${mentionQuery.trim()}”` : 'your search'}.
          </div>
        )}
      </div>
    </div>
  )
}