'use client';
import { useCallback, useMemo, useRef, useState } from 'react';
import type { ChangeEvent, ClipboardEvent, DragEvent, KeyboardEvent, MouseEvent } from 'react';
import type { EmojiClickData } from '@/shared/ui/emoji-picker';
import type { ClientTeamMember } from '@/types/clients';
const MAX_MENTION_RESULTS = 6;
const MENTION_TRIGGER_LOOKBACK = 40;
const MENTION_UPDATE_DELAY_MS = 150;
type FormattingAction = 'bold' | 'italic' | 'blockquote' | 'code' | 'unordered-list' | 'ordered-list';
type MentionState = {
    active: boolean;
    startIndex: number;
    query: string;
};
const DEFAULT_MENTION_STATE: MentionState = {
    active: false,
    startIndex: -1,
    query: '',
};
const getWordRangeAt = (value: string, position: number) => {
    let start = position;
    while (start > 0 && !/\s/.test(value[start - 1] ?? '')) {
        start -= 1;
    }
    let end = position;
    while (end < value.length && !/\s/.test(value[end] ?? '')) {
        end += 1;
    }
    if (start === end) {
        return null;
    }
    return { start, end };
};
export type UseRichComposerArgs = {
    value: string;
    onChange: (value: string) => void;
    onSend: () => void;
    disabled?: boolean;
    participants: ClientTeamMember[];
    onFocus?: () => void;
    onBlur?: () => void;
    onDrop?: (event: DragEvent<HTMLTextAreaElement>) => void;
    onDragOver?: (event: DragEvent<HTMLTextAreaElement>) => void;
};
export function useRichComposer({ value, onChange, onSend, disabled = false, participants, onFocus, onBlur, onDrop, onDragOver, }: UseRichComposerArgs) {
    const textareaRef = useRef<HTMLTextAreaElement | null>(null);
    const mentionStateRef = useRef<MentionState>(DEFAULT_MENTION_STATE);
    const [mentionState, setMentionState] = useState<MentionState>(DEFAULT_MENTION_STATE);
    const [highlightedMention, setHighlightedMention] = useState(0);
    const mentionTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
    const [isDraggingOver, setIsDraggingOver] = useState(false);
    const [emojiPickerOpen, setEmojiPickerOpen] = useState(false);
    const handleEmojiClick = (emojiData: EmojiClickData) => {
        const textarea = textareaRef.current;
        if (!textarea)
            return;
        const start = textarea.selectionStart;
        const end = textarea.selectionEnd;
        const newValue = value.slice(0, start) + emojiData.emoji + value.slice(end);
        onChange(newValue);
        requestAnimationFrame(() => {
            const newCursor = start + emojiData.emoji.length;
            textarea.setSelectionRange(newCursor, newCursor);
            textarea.focus();
        });
    };
    const uniqueParticipants = (() => {
        const map = new Map<string, ClientTeamMember>();
        participants.forEach((participant) => {
            const key = participant.name.trim().toLowerCase();
            if (!key)
                return;
            if (!map.has(key)) {
                map.set(key, participant);
            }
        });
        return Array.from(map.values()).sort((left, right) => left.name.localeCompare(right.name));
    })();
    const mentionResults = (() => {
        if (!mentionState.active) {
            return [];
        }
        const normalizedQuery = mentionState.query.trim().toLowerCase();
        if (!normalizedQuery) {
            return uniqueParticipants.slice(0, MAX_MENTION_RESULTS);
        }
        return uniqueParticipants
            .filter((participant) => {
            const role = participant.role?.toLowerCase() ?? '';
            return participant.name.toLowerCase().includes(normalizedQuery) || role.includes(normalizedQuery);
        })
            .slice(0, MAX_MENTION_RESULTS);
    })();
    const resetMentionState = () => {
        if (mentionTimeoutRef.current) {
            clearTimeout(mentionTimeoutRef.current);
            mentionTimeoutRef.current = null;
        }
        mentionStateRef.current = DEFAULT_MENTION_STATE;
        setMentionState(DEFAULT_MENTION_STATE);
        setHighlightedMention(0);
    };
    const applyTextUpdate = (updater: (currentValue: string, selectionStart: number, selectionEnd: number) => {
        nextValue: string;
        nextSelectionStart: number;
        nextSelectionEnd: number;
    }) => {
        const textarea = textareaRef.current;
        if (!textarea) {
            return;
        }
        const { selectionStart, selectionEnd } = textarea;
        const { nextValue, nextSelectionStart, nextSelectionEnd } = updater(value, selectionStart, selectionEnd);
        onChange(nextValue);
        requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(nextSelectionStart, nextSelectionEnd);
        });
    };
    const handleFormattingAction = (action: FormattingAction) => {
        applyTextUpdate((current, selectionStart, selectionEnd) => {
            const selectedText = current.slice(selectionStart, selectionEnd);
            const noSelection = selectionStart === selectionEnd;
            switch (action) {
                case 'bold': {
                    if (noSelection) {
                        const wordRange = getWordRangeAt(current, selectionStart);
                        if (wordRange) {
                            const word = current.slice(wordRange.start, wordRange.end);
                            const wrapped = `*${word}*`;
                            const nextValue = current.slice(0, wordRange.start) + wrapped + current.slice(wordRange.end);
                            const caretOffset = selectionStart - wordRange.start;
                            const nextCursor = wordRange.start + 1 + caretOffset;
                            return { nextValue, nextSelectionStart: nextCursor, nextSelectionEnd: nextCursor };
                        }
                    }
                    const placeholder = selectedText || 'bold text';
                    const wrapped = `*${placeholder}*`;
                    const nextValue = current.slice(0, selectionStart) + wrapped + current.slice(selectionEnd);
                    if (noSelection) {
                        const startInside = selectionStart + 1;
                        const endInside = startInside + placeholder.length;
                        return { nextValue, nextSelectionStart: startInside, nextSelectionEnd: endInside };
                    }
                    return {
                        nextValue,
                        nextSelectionStart: selectionStart,
                        nextSelectionEnd: selectionStart + wrapped.length,
                    };
                }
                case 'italic': {
                    if (noSelection) {
                        const wordRange = getWordRangeAt(current, selectionStart);
                        if (wordRange) {
                            const word = current.slice(wordRange.start, wordRange.end);
                            const wrapped = `_${word}_`;
                            const nextValue = current.slice(0, wordRange.start) + wrapped + current.slice(wordRange.end);
                            const caretOffset = selectionStart - wordRange.start;
                            const nextCursor = wordRange.start + 1 + caretOffset;
                            return { nextValue, nextSelectionStart: nextCursor, nextSelectionEnd: nextCursor };
                        }
                    }
                    const placeholder = selectedText || 'emphasis';
                    const wrapped = `_${placeholder}_`;
                    const nextValue = current.slice(0, selectionStart) + wrapped + current.slice(selectionEnd);
                    if (noSelection) {
                        const startInside = selectionStart + 1;
                        const endInside = startInside + placeholder.length;
                        return { nextValue, nextSelectionStart: startInside, nextSelectionEnd: endInside };
                    }
                    return {
                        nextValue,
                        nextSelectionStart: selectionStart,
                        nextSelectionEnd: selectionStart + wrapped.length,
                    };
                }
                case 'blockquote': {
                    if (noSelection) {
                        const lineStart = current.lastIndexOf('\n', selectionStart - 1) + 1;
                        const lineEndIndex = current.indexOf('\n', selectionEnd);
                        const lineEnd = lineEndIndex === -1 ? current.length : lineEndIndex;
                        const lineText = current.slice(lineStart, lineEnd);
                        if (lineText) {
                            const nextValue = current.slice(0, lineStart) + '> ' + current.slice(lineStart);
                            const nextCursor = selectionStart + 2;
                            return { nextValue, nextSelectionStart: nextCursor, nextSelectionEnd: nextCursor };
                        }
                    }
                    const placeholder = selectedText || 'Quoted text';
                    const lines = placeholder.split('\n');
                    const prefixed = lines.map((line) => (line ? `> ${line}` : '> ')).join('\n');
                    const nextValue = current.slice(0, selectionStart) + prefixed + current.slice(selectionEnd);
                    if (noSelection) {
                        const startInside = selectionStart + 2;
                        const endInside = startInside + placeholder.length;
                        return { nextValue, nextSelectionStart: startInside, nextSelectionEnd: endInside };
                    }
                    return { nextValue, nextSelectionStart: selectionStart, nextSelectionEnd: selectionStart + prefixed.length };
                }
                case 'code': {
                    if (selectedText.includes('\n')) {
                        const blockPlaceholder = selectedText || 'code block';
                        const wrapped = `\n\n\`\`\`\n${blockPlaceholder}\n\`\`\`\n`;
                        const nextValue = current.slice(0, selectionStart) + wrapped + current.slice(selectionEnd);
                        const anchor = selectionStart + wrapped.indexOf('\n') + 3;
                        const nextEnd = anchor + blockPlaceholder.length;
                        return { nextValue, nextSelectionStart: anchor, nextSelectionEnd: nextEnd };
                    }
                    if (noSelection) {
                        const wordRange = getWordRangeAt(current, selectionStart);
                        if (wordRange) {
                            const word = current.slice(wordRange.start, wordRange.end);
                            const wrapped = `\`${word}\``;
                            const nextValue = current.slice(0, wordRange.start) + wrapped + current.slice(wordRange.end);
                            const caretOffset = selectionStart - wordRange.start;
                            const nextCursor = wordRange.start + 1 + caretOffset;
                            return { nextValue, nextSelectionStart: nextCursor, nextSelectionEnd: nextCursor };
                        }
                    }
                    const inlinePlaceholder = selectedText || 'inline code';
                    const wrapped = `\`${inlinePlaceholder}\``;
                    const nextValue = current.slice(0, selectionStart) + wrapped + current.slice(selectionEnd);
                    if (noSelection) {
                        const startInside = selectionStart + 1;
                        const endInside = startInside + inlinePlaceholder.length;
                        return { nextValue, nextSelectionStart: startInside, nextSelectionEnd: endInside };
                    }
                    return {
                        nextValue,
                        nextSelectionStart: selectionStart,
                        nextSelectionEnd: selectionStart + wrapped.length,
                    };
                }
                case 'unordered-list': {
                    const placeholder = selectedText || 'List item';
                    const lines = placeholder.split('\n');
                    const prefixed = lines.map((line) => (line ? `- ${line}` : '- ')).join('\n');
                    const nextValue = current.slice(0, selectionStart) + prefixed + current.slice(selectionEnd);
                    const nextEnd = selectionStart + prefixed.length;
                    if (noSelection) {
                        const startInside = selectionStart + 2;
                        const endInside = startInside + placeholder.length;
                        return { nextValue, nextSelectionStart: startInside, nextSelectionEnd: endInside };
                    }
                    return { nextValue, nextSelectionStart: selectionStart, nextSelectionEnd: nextEnd };
                }
                case 'ordered-list': {
                    const placeholder = selectedText || 'List item';
                    const lines = placeholder.split('\n');
                    const prefixed = lines.map((line, index) => `${index + 1}. ${line || 'Item'}`).join('\n');
                    const nextValue = current.slice(0, selectionStart) + prefixed + current.slice(selectionEnd);
                    const nextEnd = selectionStart + prefixed.length;
                    if (noSelection) {
                        const startInside = selectionStart + 3;
                        const endInside = startInside + placeholder.length;
                        return { nextValue, nextSelectionStart: startInside, nextSelectionEnd: endInside };
                    }
                    return { nextValue, nextSelectionStart: selectionStart, nextSelectionEnd: nextEnd };
                }
                default:
                    return { nextValue: current, nextSelectionStart: selectionStart, nextSelectionEnd: selectionEnd };
            }
        });
    };
    const detectMentionTrigger = (currentValue: string, caretPosition: number) => {
        if (caretPosition === 0) {
            resetMentionState();
            return;
        }
        const start = Math.max(0, caretPosition - MENTION_TRIGGER_LOOKBACK);
        for (let index = caretPosition - 1; index >= start; index -= 1) {
            const char = currentValue[index];
            if (char === '@') {
                const preceding = index > 0 ? (currentValue[index - 1] ?? ' ') : ' ';
                if (!preceding.match(/[\s([{]/)) {
                    break;
                }
                const query = currentValue.slice(index + 1, caretPosition);
                if (query.includes(' ') || query.includes('\n')) {
                    break;
                }
                const nextState: MentionState = { active: true, startIndex: index, query };
                mentionStateRef.current = nextState;
                setMentionState(nextState);
                setHighlightedMention(0);
                return;
            }
            if (char === '\n' || char === ' ' || char === '\t') {
                break;
            }
        }
        if (mentionStateRef.current.active) {
            resetMentionState();
        }
    };
    const handleInputChange = (event: ChangeEvent<HTMLTextAreaElement>) => {
        const nextValue = event.target.value;
        onChange(nextValue);
        if (mentionTimeoutRef.current) {
            clearTimeout(mentionTimeoutRef.current);
        }
        const caret = event.target.selectionStart ?? nextValue.length;
        mentionTimeoutRef.current = setTimeout(() => {
            detectMentionTrigger(nextValue, caret);
        }, MENTION_UPDATE_DELAY_MS);
    };
    const insertMention = (name: string) => {
        const textarea = textareaRef.current;
        const state = mentionStateRef.current;
        if (!textarea || !state.active) {
            return;
        }
        const caretPosition = textarea.selectionStart;
        const trimmed = name.trim();
        const display = trimmed.startsWith('@') ? trimmed : `@${trimmed}`;
        const insertion = `${display} `;
        const nextValue = value.slice(0, state.startIndex) + insertion + value.slice(caretPosition);
        const nextCaret = state.startIndex + insertion.length;
        onChange(nextValue);
        requestAnimationFrame(() => {
            textarea.focus();
            textarea.setSelectionRange(nextCaret, nextCaret);
        });
        resetMentionState();
    };
    const handleMentionClick = (participant: ClientTeamMember) => {
        insertMention(participant.name);
    };
    const handleMentionMouseDown = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault();
    };
    const handleKeyDown = (event: KeyboardEvent<HTMLTextAreaElement>) => {
        if (mentionState.active && mentionResults.length > 0) {
            if (event.key === 'ArrowDown') {
                event.preventDefault();
                setHighlightedMention((current) => (current + 1) % mentionResults.length);
                return;
            }
            if (event.key === 'ArrowUp') {
                event.preventDefault();
                setHighlightedMention((current) => (current - 1 + mentionResults.length) % mentionResults.length);
                return;
            }
            if (event.key === 'Enter' || event.key === 'Tab') {
                event.preventDefault();
                const participant = mentionResults[highlightedMention] ?? mentionResults[0];
                if (participant) {
                    insertMention(participant.name);
                }
                return;
            }
            if (event.key === 'Escape') {
                event.preventDefault();
                resetMentionState();
                return;
            }
        }
        if ((event.ctrlKey || event.metaKey) && !event.shiftKey && !event.altKey) {
            const key = event.key.toLowerCase();
            if (key === 'b' || key === 'i') {
                event.preventDefault();
                handleFormattingAction(key === 'b' ? 'bold' : 'italic');
                return;
            }
        }
        if (event.key === 'Enter' && event.shiftKey) {
            const textarea = textareaRef.current;
            if (textarea) {
                const { selectionStart, selectionEnd } = textarea;
                const lineStart = value.lastIndexOf('\n', selectionStart - 1) + 1;
                const lineEndIndex = value.indexOf('\n', selectionEnd);
                const lineEnd = lineEndIndex === -1 ? value.length : lineEndIndex;
                const line = value.slice(lineStart, lineEnd);
                const unorderedMatch = line.match(/^(\s*)([-*+]) (.*)$/);
                const orderedMatch = line.match(/^(\s*)(\d+)\. (.*)$/);
                const quoteMatch = line.match(/^(\s*)> ?(.*)$/);
                let prefix: string | null = null;
                if (unorderedMatch) {
                    prefix = `${unorderedMatch[1]}${unorderedMatch[2]} `;
                } else if (orderedMatch) {
                    prefix = `${orderedMatch[1]}${Number(orderedMatch[2]) + 1}. `;
                } else if (quoteMatch) {
                    prefix = `${quoteMatch[1]}> `;
                }
                if (prefix) {
                    event.preventDefault();
                    const before = value.slice(0, selectionEnd);
                    const after = value.slice(selectionEnd);
                    const newValue = `${before}\n${prefix}${after}`;
                    const newCursor = before.length + 1 + prefix.length;
                    onChange(newValue);
                    requestAnimationFrame(() => {
                        textarea.focus();
                        textarea.setSelectionRange(newCursor, newCursor);
                    });
                    resetMentionState();
                    return;
                }
            }
        }
        if (event.key === 'Enter' && !event.shiftKey) {
            event.preventDefault();
            onSend();
            resetMentionState();
        }
    };
    const onComposerBlur = () => {
        if (mentionTimeoutRef.current) {
            clearTimeout(mentionTimeoutRef.current);
            mentionTimeoutRef.current = null;
        }
        resetMentionState();
        setIsDraggingOver(false);
        onBlur?.();
    };
    const onComposerFocus = () => {
        onFocus?.();
    };
    const handleDragEnter = (event: DragEvent<HTMLTextAreaElement>) => {
        event.preventDefault();
        if (!disabled && event.dataTransfer.types.includes('Files')) {
            setIsDraggingOver(true);
        }
    };
    const handleDragLeave = (event: DragEvent<HTMLTextAreaElement>) => {
        event.preventDefault();
        const relatedTarget = event.relatedTarget as Node | null;
        const target = event.currentTarget as Node;
        if (!relatedTarget || !target.contains(relatedTarget)) {
            setIsDraggingOver(false);
        }
    };
    const handleDragOverInternal = (event: DragEvent<HTMLTextAreaElement>) => {
        event.preventDefault();
        if (!disabled && event.dataTransfer.types.includes('Files')) {
            event.dataTransfer.dropEffect = 'copy';
            setIsDraggingOver(true);
        }
        else {
            event.dataTransfer.dropEffect = 'none';
        }
        onDragOver?.(event);
    };
    const handleDropInternal = (event: DragEvent<HTMLTextAreaElement>) => {
        event.preventDefault();
        setIsDraggingOver(false);
        onDrop?.(event);
    };
    const handleInsertMention = () => {
        applyTextUpdate((current, selectionStart, selectionEnd) => {
            const insertionPoint = selectionStart === selectionEnd ? selectionStart : selectionEnd;
            const nextValue = `${current.slice(0, insertionPoint)}@${current.slice(insertionPoint)}`;
            const nextCaret = insertionPoint + 1;
            setMentionState({ active: true, startIndex: insertionPoint, query: '' });
            setHighlightedMention(0);
            return { nextValue, nextSelectionStart: nextCaret, nextSelectionEnd: nextCaret };
        });
    };
    const handleVoiceTranscript = (transcript: string) => onChange(value + (value && !value.endsWith(' ') ? ' ' : '') + transcript);
    return {
        textareaRef,
        mentionState,
        highlightedMention,
        mentionResults,
        isDraggingOver,
        emojiPickerOpen,
        setEmojiPickerOpen,
        handleEmojiClick,
        handleFormattingAction,
        handleInputChange,
        handleKeyDown,
        onComposerBlur,
        onComposerFocus,
        handleDragEnter,
        handleDragLeave,
        handleDragOverInternal,
        handleDropInternal,
        handleInsertMention,
        handleVoiceTranscript,
        handleMentionClick,
        handleMentionMouseDown,
    };
}
