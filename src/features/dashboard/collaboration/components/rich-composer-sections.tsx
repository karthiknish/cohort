'use client';
import { useCallback, type ChangeEvent, type ClipboardEvent, type ComponentType, type DragEvent, type KeyboardEvent, type MouseEvent, type ReactNode, type RefObject, type UIEvent, } from 'react';
import EmojiPicker, { Theme, type EmojiClickData } from '@/shared/ui/emoji-picker';
import { AtSign, Bold, Code, Italic, List, ListOrdered, Paperclip, Quote, Smile, Upload } from 'lucide-react';
import { Button } from '@/shared/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/shared/ui/popover';
import { Textarea } from '@/shared/ui/textarea';
import { VoiceInputButton } from '@/shared/ui/voice-input';
import { Avatar, AvatarFallback } from '@/shared/ui/avatar';
import { Badge } from '@/shared/ui/badge';
import { cn } from '@/lib/utils';
import type { ClientTeamMember } from '@/types/clients';
import { getInitials } from '../lib/utils';
type FormattingAction = 'bold' | 'italic' | 'blockquote' | 'code' | 'unordered-list' | 'ordered-list';
type ComposerButtonProps = {
    icon: ComponentType<{
        className?: string;
    }>;
    label: string;
    title?: string;
    onClick: () => void;
    disabled?: boolean;
};
function ComposerButton({ icon: Icon, label, title, onClick, disabled }: ComposerButtonProps) {
    const onComposerAction = () => {
        if (disabled)
            return;
        onClick();
    };
    return (<Button type="button" size="icon" variant="ghost" onClick={onComposerAction} disabled={disabled} className="size-7 hover:bg-muted/80 active:bg-muted/60" aria-label={label} title={title ?? label}>
      <Icon className="size-4"/>
      <span className="sr-only">{label}</span>
    </Button>);
}
function RichComposerMentionOption({ isActive, mentionClick, mentionMouseDown, participant, }: {
    isActive: boolean;
    mentionClick: (participant: ClientTeamMember) => void;
    mentionMouseDown: (event: MouseEvent<HTMLButtonElement>) => void;
    participant: ClientTeamMember;
}) {
    const onMentionParticipant = () => {
        mentionClick(participant);
    };
    return (<button key={participant.name} type="button" onMouseDown={mentionMouseDown} onClick={onMentionParticipant} className={cn('flex w-full items-center gap-2 rounded-md px-2 py-1.5 text-left text-sm transition', isActive ? 'bg-accent/10 text-primary' : 'hover:bg-muted')}>
      <Avatar className="size-7 shrink-0 ring-1 ring-border/50">
        <AvatarFallback className="bg-accent/10 text-[10px] font-medium text-primary">
          {getInitials(participant.name)}
        </AvatarFallback>
      </Avatar>
      <div className="min-w-0 flex-1">
        <span className="block truncate">{participant.name}</span>
        {participant.role ? <span className="block truncate text-xs text-muted-foreground">{participant.role}</span> : null}
      </div>
      {isActive ? <Badge variant="secondary" className="shrink-0 text-[10px]">↵</Badge> : null}
    </button>);
}
export function RichComposerToolbar({ disabled, emojiPickerOpen, hasAttachments, onAction, onAttachClick, onEmojiClick, onInsertMention, onOpenEmojiChange, onVoiceTranscript, }: {
    disabled: boolean;
    emojiPickerOpen: boolean;
    hasAttachments: boolean;
    onAction: (action: FormattingAction) => void;
    onAttachClick?: () => void;
    onEmojiClick: (emojiData: EmojiClickData) => void;
    onInsertMention: () => void;
    onOpenEmojiChange: (open: boolean) => void;
    onVoiceTranscript: (transcript: string) => void;
}) {
    return (<div className="flex flex-wrap items-center gap-0.5 rounded-t-lg border-b border-muted/40 bg-muted/10 px-2 py-1.5">
      <ComposerButton icon={Bold} label="Bold" title="Bold (Ctrl+B)" onClick={() => onAction('bold')} disabled={disabled}/>
      <ComposerButton icon={Italic} label="Italic" title="Italic (Ctrl+I)" onClick={() => onAction('italic')} disabled={disabled}/>
      <ComposerButton icon={Quote} label="Quote" onClick={() => onAction('blockquote')} disabled={disabled}/>
      <ComposerButton icon={Code} label="Code" onClick={() => onAction('code')} disabled={disabled}/>
      <ComposerButton icon={List} label="Bulleted list" onClick={() => onAction('unordered-list')} disabled={disabled}/>
      <ComposerButton icon={ListOrdered} label="Numbered list" onClick={() => onAction('ordered-list')} disabled={disabled}/>
      <ComposerButton icon={AtSign} label="Mention" onClick={onInsertMention} disabled={disabled}/>
      <div className="mx-1 h-4 w-px bg-muted/60"/>
      {onAttachClick ? (<Button type="button" size="sm" variant={hasAttachments ? 'secondary' : 'ghost'} onClick={onAttachClick} disabled={disabled} className={cn('h-7 gap-1.5 px-2 text-xs hover:bg-background/50', hasAttachments && 'bg-accent/10 text-primary hover:bg-accent/20')}>
          <Paperclip className="size-3.5"/>
          <span className="hidden sm:inline">Attach</span>
        </Button>) : null}
      <div className="mx-1 h-4 w-px bg-muted/60"/>
      <Popover open={emojiPickerOpen} onOpenChange={onOpenEmojiChange}>
        <PopoverTrigger asChild>
          <Button type="button" size="icon" variant="ghost" disabled={disabled} className="size-7" aria-label="Open emoji picker">
            <Smile className="size-4"/>
            <span className="sr-only">Open emoji picker</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-auto p-0" align="end">
          <EmojiPicker onEmojiClick={onEmojiClick} theme={Theme.LIGHT} width={320} height={400}/>
        </PopoverContent>
      </Popover>
      <VoiceInputButton onTranscript={onVoiceTranscript} disabled={disabled}/>
    </div>);
}
const MENTION_MARKDOWN_REGEX = /\[([^\]]+)\]\(mention:\/\/[^\)]+\)/g;
function renderComposerPreview(value: string) {
    if (!value) {
        return null;
    }
    const segments: ReactNode[] = [];
    let lastIndex = 0;
    let match: RegExpExecArray | null;
    MENTION_MARKDOWN_REGEX.lastIndex = 0;
    while ((match = MENTION_MARKDOWN_REGEX.exec(value)) !== null) {
        if (match.index > lastIndex) {
            segments.push(value.slice(lastIndex, match.index));
        }
        segments.push(<span key={`mention-${match.index}`} className="rounded bg-primary/10 px-1 py-0.5 font-medium text-primary">{match[1]}</span>);
        lastIndex = match.index + match[0].length;
    }
    if (lastIndex < value.length) {
        segments.push(value.slice(lastIndex));
    }
    if (segments.length === 0) {
        return null;
    }
    return segments;
}
export function RichComposerTextareaShell({ disabled, isDraggingOver, onBlur, onChange, onDragEnter, onDragLeave, onDragOver, onDrop, onFocus, onKeyDown, onPaste, placeholder, textareaRef, value, }: {
    disabled: boolean;
    isDraggingOver: boolean;
    onBlur: () => void;
    onChange: (event: ChangeEvent<HTMLTextAreaElement>) => void;
    onDragEnter: (event: DragEvent<HTMLTextAreaElement>) => void;
    onDragLeave: (event: DragEvent<HTMLTextAreaElement>) => void;
    onDragOver: (event: DragEvent<HTMLTextAreaElement>) => void;
    onDrop: (event: DragEvent<HTMLTextAreaElement>) => void;
    onFocus: () => void;
    onKeyDown: (event: KeyboardEvent<HTMLTextAreaElement>) => void;
    onPaste?: (event: ClipboardEvent<HTMLTextAreaElement>) => void;
    placeholder: string;
    textareaRef: RefObject<HTMLTextAreaElement | null>;
    value: string;
}) {
    const handleScroll = useCallback((event: UIEvent<HTMLTextAreaElement>) => {
        const overlay = event.currentTarget.parentElement?.querySelector('[data-composer-overlay]') as HTMLElement | null;
        if (overlay) {
            overlay.scrollTop = event.currentTarget.scrollTop;
            overlay.scrollLeft = event.currentTarget.scrollLeft;
        }
    }, []);
    return (<div className="relative">
      <div data-composer-overlay aria-hidden="true" className="pointer-events-none absolute inset-0 whitespace-pre-wrap break-words p-3 text-sm leading-6 text-foreground/90 overflow-hidden">
        {renderComposerPreview(value)}
        <span>&nbsp;</span>
      </div>
      <Textarea ref={textareaRef} value={value} placeholder={placeholder} onChange={onChange} onKeyDown={onKeyDown} onBlur={onBlur} onFocus={onFocus} onDrop={onDrop} onDragOver={onDragOver} onDragEnter={onDragEnter} onDragLeave={onDragLeave} onPaste={onPaste} onScroll={handleScroll} disabled={disabled} maxLength={2000} className={cn('relative min-h-[120px] resize-y rounded-b-lg rounded-t-none border-0 bg-transparent p-3 text-sm leading-6 text-transparent shadow-none focus-visible:ring-0 caret-foreground', isDraggingOver && 'bg-accent/5')}/>
      {isDraggingOver ? (<div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-b-lg bg-accent/10">
          <div className="flex flex-col items-center gap-2 text-primary">
            <Upload className="size-8"/>
            <span className="text-sm font-medium">Drop files here to attach</span>
          </div>
        </div>) : null}
    </div>);
}
export function RichComposerMentionMenu({ highlightedMention, mentionQuery, mentionResults, onMentionClick, onMentionMouseDown, }: {
    highlightedMention: number;
    mentionQuery: string;
    mentionResults: ClientTeamMember[];
    onMentionClick: (participant: ClientTeamMember) => void;
    onMentionMouseDown: (event: MouseEvent<HTMLButtonElement>) => void;
}) {
    return (
        <div
            className="absolute bottom-full left-2 z-50 mb-2 w-64 overflow-hidden rounded-lg border border-muted/60 bg-popover p-1 shadow-lg"
            role="listbox"
            aria-label="Mention teammate suggestions"
        >
            <div className="px-2 py-1 text-xs font-medium uppercase tracking-wide text-muted-foreground">
                Mention teammate
            </div>
            <div className="max-h-52 overflow-y-auto">
                {mentionResults.length > 0 ? (
                    mentionResults.map((participant, index) => {
                        const isActive = index === highlightedMention;
                        return (
                            <RichComposerMentionOption
                                key={participant.name}
                                isActive={isActive}
                                mentionClick={onMentionClick}
                                mentionMouseDown={onMentionMouseDown}
                                participant={participant}
                            />
                        );
                    })
                ) : (
                    <div className="px-2 py-3 text-sm text-muted-foreground" aria-live="polite">
                        No teammates match {mentionQuery.trim() ? `“${mentionQuery.trim()}”` : 'your search'}.
                    </div>
                )}
            </div>
        </div>
    );
}
