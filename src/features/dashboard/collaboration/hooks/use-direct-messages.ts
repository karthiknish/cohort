'use client';
import { useMemo } from 'react';
import type { DirectConversation, DirectMessage } from '@/types/collaboration';
import { useDirectConversationsQuery } from './use-direct-conversations-query';
import { useDirectMessageActions } from './use-direct-message-actions';
import { useDmTyping } from './use-dm-typing';
export type { DirectConversation, DirectMessage };
export type UseDirectMessagesOptions = {
    workspaceId: string | null;
    currentUserId: string | null;
    currentUserName?: string | null;
    currentUserRole?: string | null;
};
export type UseDirectMessagesReturn = {
    conversations: DirectConversation[];
    selectedConversation: DirectConversation | null;
    selectConversation: (conversation: DirectConversation | null) => void;
    isLoadingConversations: boolean;
    messages: DirectMessage[];
    visibleMessages: DirectMessage[];
    isLoadingMessages: boolean;
    isLoadingMore: boolean;
    loadMoreMessages: () => void;
    hasMoreMessages: boolean;
    messageSearchQuery: string;
    setMessageSearchQuery: (value: string) => void;
    searchHighlights: string[];
    searchingMessages: boolean;
    messagesError: string | null;
    retryMessagesError: () => void;
    sendMessage: (content: string, attachments?: DirectMessage['attachments']) => Promise<void>;
    isSending: boolean;
    markAsRead: () => Promise<void>;
    editMessage: (messageLegacyId: string, newContent: string) => Promise<void>;
    deleteMessage: (messageLegacyId: string) => Promise<void>;
    toggleReaction: (messageLegacyId: string, emoji: string) => Promise<void>;
    archiveConversation: (archived: boolean) => Promise<void>;
    muteConversation: (muted: boolean) => Promise<void>;
    getOrCreateConversation: (otherUserId: string, otherUserName: string, otherUserRole?: string | null) => Promise<{
        legacyId: string;
        isNew: boolean;
    }>;
    unreadCount: number;
    startNewDM: (user: {
        id: string;
        name: string;
        role?: string | null;
    }) => Promise<void>;
    typingParticipants: Array<{
        name: string;
        role?: string | null;
    }>;
    handleComposerFocus: () => void;
    handleComposerBlur: () => void;
    notifyDmTyping: () => void;
};
export function useDirectMessages(options: UseDirectMessagesOptions): UseDirectMessagesReturn {
    const query = useDirectConversationsQuery(options);
    const actions = useDirectMessageActions({ ...options, ...query });
    const dmTyping = useDmTyping({
        workspaceId: options.workspaceId,
        currentUserId: options.currentUserId,
        currentUserName: options.currentUserName,
        currentUserRole: options.currentUserRole,
        conversationLegacyId: query.selectedConversation?.legacyId ?? null,
    });
    return useMemo(() => ({
        conversations: query.conversations,
        selectedConversation: query.selectedConversation,
        selectConversation: query.selectConversation,
        isLoadingConversations: query.isLoadingConversations,
        messages: query.currentMessages,
        visibleMessages: query.visibleMessages,
        isLoadingMessages: query.isLoadingMessages,
        isLoadingMore: query.isLoadingMore,
        loadMoreMessages: query.loadMoreMessages,
        hasMoreMessages: query.hasMoreMessages,
        messageSearchQuery: query.messageSearchQuery,
        setMessageSearchQuery: query.setMessageSearchQuery,
        searchHighlights: query.searchHighlights,
        searchingMessages: query.searchingMessages,
        messagesError: query.messagesError,
        retryMessagesError: query.retryDirectMessageSearch,
        sendMessage: actions.sendMessage,
        isSending: actions.isSending,
        markAsRead: actions.markAsRead,
        editMessage: actions.editMessage,
        deleteMessage: actions.deleteMessage,
        toggleReaction: actions.toggleReaction,
        archiveConversation: actions.archiveConversation,
        muteConversation: actions.muteConversation,
        getOrCreateConversation: actions.getOrCreateConversation,
        unreadCount: actions.unreadCount,
        startNewDM: actions.startNewDM,
        typingParticipants: dmTyping.typingParticipants,
        handleComposerFocus: dmTyping.handleComposerFocus,
        handleComposerBlur: dmTyping.handleComposerBlur,
        notifyDmTyping: dmTyping.notifyTyping,
    }), [query, actions, dmTyping]);
}
