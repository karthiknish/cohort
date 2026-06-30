'use client';
import { useCallback, useEffect, useRef, useState, type ChangeEvent, type RefObject } from 'react';
import { formatAgentMentionMarkup, mergeAgentMentions, parseAgentMentionsFromText, type AgentMentionEntity, } from '@/lib/agent-mentions';
import type { MentionDropdownHandle, MentionItem } from './mention-dropdown';
type UseAgentPanelComposerParams = {
    isOpen: boolean;
    isProcessing: boolean;
    isExtractingAttachments: boolean;
    onSendMessage: (text: string, options?: {
        mentions?: AgentMentionEntity[];
    }) => void;
};
export function useAgentPanelComposer({ isOpen, isProcessing, isExtractingAttachments, onSendMessage, }: UseAgentPanelComposerParams) {
    const [inputValue, setInputValue] = useState('');
    const [composerMentions, setComposerMentions] = useState<AgentMentionEntity[]>([]);
    const [showMentions, setShowMentions] = useState(false);
    const [mentionQuery, setMentionQuery] = useState('');
    const inputRef = useRef<HTMLTextAreaElement>(null);
    const mentionDropdownRef = useRef<MentionDropdownHandle>(null);
    useEffect(() => {
        if (!isOpen || !inputRef.current) {
            return;
        }
        const focusTimeoutId = window.setTimeout(() => inputRef.current?.focus(), 100);
        return () => {
            window.clearTimeout(focusTimeoutId);
        };
    }, [isOpen]);
    const handleVoiceTranscript = (text: string) => {
        if (text.trim()) {
            onSendMessage(text);
            setInputValue('');
        }
    };
    const handleVoiceInterim = (text: string) => {
        setInputValue(text);
    };
    const handleSubmit = () => {
        if (inputValue.trim() && !isProcessing && !isExtractingAttachments) {
            const mentions = mergeAgentMentions(parseAgentMentionsFromText(inputValue), composerMentions);
            onSendMessage(inputValue.trim(), { mentions });
            setInputValue('');
            setComposerMentions([]);
            setShowMentions(false);
        }
    };
    const handleInputChange = (e: ChangeEvent<HTMLTextAreaElement>) => {
        const value = e.target.value;
        setInputValue(value);
        const cursorPos = e.target.selectionStart ?? value.length;
        const textBeforeCursor = value.slice(0, cursorPos);
        const atIndex = textBeforeCursor.lastIndexOf('@');
        if (atIndex !== -1) {
            const charBefore = atIndex > 0 ? textBeforeCursor[atIndex - 1] : ' ';
            if (charBefore === ' ' || atIndex === 0) {
                const query = textBeforeCursor.slice(atIndex + 1);
                if (!query.includes(' ')) {
                    setMentionQuery(query);
                    setShowMentions(true);
                    return;
                }
            }
        }
        setShowMentions(false);
        setComposerMentions((prev) => mergeAgentMentions(parseAgentMentionsFromText(value), prev));
    };
    const handleMentionSelect = (item: MentionItem) => {
        const cursorPos = inputRef.current?.selectionStart ?? inputValue.length;
        const textBeforeCursor = inputValue.slice(0, cursorPos);
        const atIndex = textBeforeCursor.lastIndexOf('@');
        if (atIndex !== -1) {
            const beforeMention = inputValue.slice(0, atIndex);
            const afterMention = inputValue.slice(cursorPos);
            const entity: AgentMentionEntity = {
                id: item.id,
                name: item.name,
                type: item.type,
                subtitle: item.subtitle,
            };
            const insertedMention = `${formatAgentMentionMarkup(entity)} `;
            const newValue = `${beforeMention}${insertedMention}${afterMention}`;
            const nextCursorPos = beforeMention.length + insertedMention.length;
            setInputValue(newValue);
            setComposerMentions((prev) => mergeAgentMentions([entity], prev));
            requestAnimationFrame(() => {
                inputRef.current?.focus();
                inputRef.current?.setSelectionRange(nextCursorPos, nextCursorPos);
            });
        }
        setShowMentions(false);
    };
    const clearComposer = () => {
        setInputValue('');
        setComposerMentions([]);
        setShowMentions(false);
        setMentionQuery('');
    };
    const closeMentions = () => {
        setShowMentions(false);
    };
    return {
        inputValue,
        setInputValue,
        composerMentions,
        showMentions,
        mentionQuery,
        inputRef: inputRef as RefObject<HTMLTextAreaElement | null>,
        mentionDropdownRef: mentionDropdownRef as RefObject<MentionDropdownHandle | null>,
        handleVoiceTranscript,
        handleVoiceInterim,
        handleSubmit,
        handleInputChange,
        handleMentionSelect,
        clearComposer,
        closeMentions,
    };
}
