'use client';
import type { ChangeEvent, ClipboardEvent, DragEvent } from 'react';
import type { ClientTeamMember } from '@/types/clients';
import { RichComposerMentionMenu, RichComposerTextareaShell, RichComposerToolbar, } from './rich-composer-sections';
import { useRichComposer } from './use-rich-composer';
export type RichComposerProps = {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    disabled?: boolean;
    placeholder?: string;
    participants: ClientTeamMember[];
    onFocus?: () => void;
    onBlur?: () => void;
    onDrop?: (event: DragEvent<HTMLTextAreaElement>) => void;
    onDragOver?: (event: DragEvent<HTMLTextAreaElement>) => void;
    onPaste?: (event: ClipboardEvent<HTMLTextAreaElement>) => void;
    onAttachClick?: () => void;
    hasAttachments?: boolean;
};
export function RichComposer({ value, onChange, onSend, disabled = false, placeholder = 'Share an update…', participants, onFocus, onBlur, onDrop, onDragOver, onPaste, onAttachClick, hasAttachments = false, }: RichComposerProps) {
    const composer = useRichComposer({
        value,
        onChange,
        onSend,
        disabled,
        participants,
        onFocus,
        onBlur,
        onDrop,
        onDragOver,
    });
    return (<div className="relative flex flex-col">
      <RichComposerToolbar disabled={disabled} emojiPickerOpen={composer.emojiPickerOpen} hasAttachments={hasAttachments} onAction={composer.handleFormattingAction} onAttachClick={onAttachClick} onEmojiClick={composer.handleEmojiClick} onInsertMention={composer.handleInsertMention} onOpenEmojiChange={composer.setEmojiPickerOpen} onVoiceTranscript={composer.handleVoiceTranscript}/>
      <RichComposerTextareaShell disabled={disabled} isDraggingOver={composer.isDraggingOver} onBlur={composer.onComposerBlur} onChange={composer.handleInputChange as (event: ChangeEvent<HTMLTextAreaElement>) => void} onDragEnter={composer.handleDragEnter} onDragLeave={composer.handleDragLeave} onDragOver={composer.handleDragOverInternal} onDrop={composer.handleDropInternal} onFocus={composer.onComposerFocus} onKeyDown={composer.handleKeyDown} onPaste={onPaste} placeholder={placeholder} textareaRef={composer.textareaRef} value={value}/>
      {composer.mentionState.active ? (<RichComposerMentionMenu highlightedMention={composer.highlightedMention} mentionQuery={composer.mentionState.query} mentionResults={composer.mentionResults} onMentionClick={composer.handleMentionClick} onMentionMouseDown={composer.handleMentionMouseDown}/>) : null}
    </div>);
}
