'use client';
import { useCallback, useEffect, useEffectEvent, useRef, useState, type ChangeEvent, type RefObject, } from 'react';
import { MessageSearchBar } from './message-pane-parts';
import type { MessagePaneHeaderInfo } from './unified-message-pane-types';
export type UseUnifiedMessagePaneSearchParams = {
    canSearchMessages: boolean;
    conversationKey?: string;
    headerType: MessagePaneHeaderInfo['type'];
    messageSearchQuery: string;
    messageSearchActive: boolean;
    resultCount: number;
    onMessageSearchChange?: (value: string) => void;
};
export type UnifiedMessagePaneAttachHandlerProps = {
    fileInputRef: RefObject<HTMLInputElement | null>;
    onAddAttachments?: (files: FileList | File[]) => void;
};
export function useUnifiedMessagePaneMessageSearch({ canSearchMessages, conversationKey, headerType, messageSearchQuery, messageSearchActive, resultCount, onMessageSearchChange, }: UseUnifiedMessagePaneSearchParams) {
    const messageSearchInputRef = useRef<HTMLInputElement>(null);
    const [messageSearchOpen, setMessageSearchOpen] = useState(false);
    const isMessageSearchOpen = canSearchMessages && messageSearchOpen;
    const handleMessageSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        onMessageSearchChange?.(event.target.value);
    };
    const handleClearMessageSearch = () => {
        onMessageSearchChange?.('');
    };
    const handleDismissMessageSearch = () => {
        setMessageSearchOpen(false);
        onMessageSearchChange?.('');
    };
    const handleToggleMessageSearch = () => {
        setMessageSearchOpen((open) => {
            const next = !open;
            if (!next) {
                onMessageSearchChange?.('');
            }
            return next;
        });
    };
    useEffect(() => {
        if (!isMessageSearchOpen)
            return;
        messageSearchInputRef.current?.focus();
    }, [isMessageSearchOpen]);
    const dismissMessageSearchOnEscape = useEffectEvent(() => {
        handleDismissMessageSearch();
    });
    useEffect(() => {
        if (!isMessageSearchOpen) {
            return;
        }
        const onGlobalKeyDown = (event: KeyboardEvent) => {
            if (event.key !== 'Escape')
                return;
            dismissMessageSearchOnEscape();
        };
        window.addEventListener('keydown', onGlobalKeyDown);
        return () => window.removeEventListener('keydown', onGlobalKeyDown);
    }, [isMessageSearchOpen]);
    const searchBar = canSearchMessages && onMessageSearchChange && isMessageSearchOpen ? (<MessageSearchBar inputRef={messageSearchInputRef} value={messageSearchQuery} onChange={handleMessageSearchChange} resultCount={resultCount} isActive={messageSearchActive} placeholder={headerType === 'dm' ? 'Search messages in this conversation…' : 'Search messages in this channel…'} onClear={handleClearMessageSearch}/>) : null;
    return {
        messageSearchOpen: isMessageSearchOpen,
        handleToggleMessageSearch,
        searchBar,
    };
}
export function useUnifiedMessagePaneAttachHandler({ fileInputRef, }: UnifiedMessagePaneAttachHandlerProps) {
    return () => {
        fileInputRef.current?.click();
    };
}
