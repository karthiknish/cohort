'use client';
import { useEffect, useEffectEvent, useMemo, useRef, useState } from 'react';
import { useConvex, useQuery } from 'convex/react';
import { usePreview } from '@/shared/contexts/preview-context';
import { api, directMessagesApi } from '@/lib/convex-api';
import { asErrorMessage, logError } from '@/lib/convex-errors';
import { mergeQueryErrors, useConvexQueryError } from '@/lib/hooks/use-convex-query-error';
import { getPreviewDirectConversations, getPreviewDirectMessages } from '@/lib/preview-data';
import type { DirectConversation, DirectMessage } from '@/types/collaboration';
import { formatConversationSnippet } from '../lib/chat-text';
import { MESSAGE_PAGE_SIZE } from './constants';
import { filterDirectMessagesForSearch, parseDirectMessageSearchQuery } from './direct-message-search';
import type { UseDirectMessagesOptions } from './use-direct-messages';
type MessageCursor = {
    fieldValue: number | string;
    legacyId: string;
} | null;
type DirectMessageRow = Omit<DirectMessage, 'id'> & {
    _id: string;
};
type DirectConversationRow = Omit<DirectConversation, 'id'> & {
    _id: string;
};
type DirectMessagesQueryResult = {
    items: Array<DirectMessageRow & {
        conversationLegacyId?: string;
    }>;
    nextCursor: MessageCursor;
};
type ParsedDirectMessagesPage = {
    items: DirectMessage[];
    nextCursor: MessageCursor;
};
function parsePaginatedDirectMessagesQuery(queryData: unknown, expectedConversationLegacyId: string | null): ParsedDirectMessagesPage | null {
    if (!queryData || typeof queryData !== 'object' || !('items' in queryData)) {
        return null;
    }
    const record = queryData as {
        items?: unknown;
        nextCursor?: unknown;
    };
    const items = Array.isArray(record.items)
        ? record.items.map((item) => {
            const row = item as DirectMessageRow & {
                conversationLegacyId?: string;
            };
            const message: DirectMessage = {
                id: row.legacyId,
                legacyId: row.legacyId,
                senderId: row.senderId,
                senderName: row.senderName,
                senderRole: row.senderRole,
                content: row.content,
                edited: row.edited,
                editedAtMs: row.editedAtMs,
                deleted: row.deleted,
                deletedAtMs: row.deletedAtMs,
                deletedBy: row.deletedBy,
                attachments: row.attachments,
                reactions: row.reactions,
                readBy: row.readBy,
                deliveredTo: row.deliveredTo,
                readAtMs: row.readAtMs,
                sharedTo: row.sharedTo,
                createdAtMs: row.createdAtMs,
                updatedAtMs: row.updatedAtMs,
            };
            return message;
        })
        : [];
    if (expectedConversationLegacyId && items.length > 0) {
        const mismatched = items.some((item) => typeof item.conversationLegacyId === 'string' &&
            item.conversationLegacyId !== expectedConversationLegacyId);
        if (mismatched) {
            return null;
        }
    }
    return {
        items,
        nextCursor: (record.nextCursor as MessageCursor | null | undefined) ?? null,
    };
}
export function useDirectConversationsQuery({ workspaceId, currentUserId, currentUserName, currentUserRole, }: UseDirectMessagesOptions) {
    const { isPreviewMode } = usePreview();
    const convex = useConvex();
    const [selectedConversation, setSelectedConversation] = useState<DirectConversation | null>(null);
    const [isSending, setIsSending] = useState(false);
    const [feed, setFeed] = useState({
        pagination: {
            messageCursor: null as MessageCursor,
            allMessages: [] as DirectMessage[],
            hasMore: true,
            isLoadingMore: false,
        },
        previewData: {
            conversations: [] as DirectConversation[],
            messagesByConversation: {} as Record<string, DirectMessage[]>,
        },
        search: {
            results: [] as DirectMessage[],
            highlights: [] as string[],
            searching: false,
            error: null as string | null,
        },
    });
    const { pagination, previewData, search } = feed;
    const { messageCursor, allMessages, hasMore, isLoadingMore } = pagination;
    const { conversations: previewConversations, messagesByConversation: previewMessagesByConversation } = previewData;
    const { results: searchResults, highlights: searchHighlights, searching: searchingMessages, error: searchError } = search;
    const [messageSearchByConversationId, setMessageSearchByConversationId] = useState<Record<string, string>>({});
    const [searchRetryNonce, setSearchRetryNonce] = useState(0);
    const previewReplyTimersRef = useRef<number[]>([]);
    const conversationsQuery = useQuery(api.directMessages.listConversations, !isPreviewMode && workspaceId ? { workspaceId, includeArchived: false } : 'skip');
    const unreadCountQuery = useQuery(api.directMessages.getUnreadCount, !isPreviewMode && workspaceId ? { workspaceId } : 'skip');
    const conversationsQueryError = useConvexQueryError({
        data: conversationsQuery,
        skipped: isPreviewMode || !workspaceId,
        fallbackMessage: 'Unable to load conversations.',
    });
    const unreadCountQueryError = useConvexQueryError({
        data: unreadCountQuery,
        skipped: isPreviewMode || !workspaceId,
        fallbackMessage: 'Unable to load unread counts.',
    });
    const messagesQueryArgs = !isPreviewMode && selectedConversation && workspaceId
        ? {
            workspaceId,
            conversationLegacyId: selectedConversation.legacyId,
            cursor: messageCursor,
            limit: MESSAGE_PAGE_SIZE,
        }
        : null;
    const messagesQueryArgsRef = useRef(messagesQueryArgs);
    const messagesQueryArgsKey = (() => {
        if (!messagesQueryArgs) {
            return null;
        }
        const cursorKey = messagesQueryArgs.cursor
            ? `${messagesQueryArgs.cursor.fieldValue}|${messagesQueryArgs.cursor.legacyId}`
            : 'start';
        return `${messagesQueryArgs.workspaceId}|${messagesQueryArgs.conversationLegacyId}|${cursorKey}`;
    })();
    const messagesQueryArgsChanged = messagesQueryArgsKey !== null &&
        messagesQueryArgsRef.current !== null &&
        messagesQueryArgsKey !==
            (messagesQueryArgsRef.current
                ? `${messagesQueryArgsRef.current.workspaceId}|${messagesQueryArgsRef.current.conversationLegacyId}|${messagesQueryArgsRef.current.cursor
                    ? `${messagesQueryArgsRef.current.cursor.fieldValue}|${messagesQueryArgsRef.current.cursor.legacyId}`
                    : 'start'}`
                : null);
    if (messagesQueryArgsChanged) {
        messagesQueryArgsRef.current = messagesQueryArgs;
    }
    const messagesQuery = useQuery(api.directMessages.listMessages, messagesQueryArgs ?? 'skip');
    const messagesQueryError = useConvexQueryError({
        data: messagesQuery,
        skipped: isPreviewMode || !messagesQueryArgs,
        fallbackMessage: 'Unable to load messages.',
    });
    const dmQueryError = mergeQueryErrors(conversationsQueryError, unreadCountQueryError, messagesQueryError);
    const typedMessagesQuery = messagesQueryArgsChanged
        ? undefined
        : (messagesQuery as DirectMessagesQueryResult | undefined);
    const conversationRows = (conversationsQuery ?? []) as DirectConversationRow[];
    const selectedConversationLegacyId = selectedConversation?.legacyId ?? null;
    const messageSearchQuery = selectedConversationLegacyId
        ? (messageSearchByConversationId[selectedConversationLegacyId] ?? '')
        : '';
    const normalizedMessageSearch = messageSearchQuery.trim();
    const setMessageSearchQuery = (value: string) => {
        if (!selectedConversationLegacyId)
            return;
        setMessageSearchByConversationId((prev) => ({
            ...prev,
            [selectedConversationLegacyId]: value,
        }));
    };
    useEffect(() => {
        const replyTimersRef = previewReplyTimersRef;
        return () => {
            replyTimersRef.current.forEach((timerId) => window.clearTimeout(timerId));
            replyTimersRef.current = [];
        };
    }, []);
    const previewFeedSnapshot = (() => {
        if (!isPreviewMode) {
            return null;
        }
        const previewSelf = {
            id: currentUserId,
            name: currentUserName,
            role: currentUserRole,
        };
        const previewUserId = currentUserId ?? 'preview-current-user';
        const messagesByConversation = Object.fromEntries(getPreviewDirectConversations(previewSelf).map((conversation) => [
            conversation.legacyId,
            getPreviewDirectMessages(conversation.legacyId, previewSelf),
        ])) as Record<string, DirectMessage[]>;
        const conversations = getPreviewDirectConversations(previewSelf)
            .map((conversation) => {
            const messages = messagesByConversation[conversation.legacyId] ?? [];
            const lastMessage = messages.reduce<DirectMessage | null>((latest, message) => {
                if (latest === null || message.createdAtMs > latest.createdAtMs) {
                    return message;
                }
                return latest;
            }, null);
            const isRead = !messages.some((message) => message.senderId !== previewUserId && !message.readBy.includes(previewUserId));
            const enriched: DirectConversation = {
                ...conversation,
                lastMessageSnippet: lastMessage?.deleted
                    ? 'Message deleted'
                    : lastMessage?.content
                        ? formatConversationSnippet(lastMessage.content, 160)
                        : null,
                lastMessageAtMs: lastMessage?.createdAtMs ?? conversation.lastMessageAtMs ?? null,
                lastMessageSenderId: lastMessage?.senderId ?? conversation.lastMessageSenderId ?? null,
                isRead,
                unreadCount: isRead ? 0 : 1,
                updatedAtMs: lastMessage?.updatedAtMs ?? conversation.updatedAtMs,
            };
            return enriched;
        })
            .sort((a, b) => (b.lastMessageAtMs ?? 0) - (a.lastMessageAtMs ?? 0));
        return {
            key: `${currentUserId ?? ''}|${currentUserName ?? ''}|${currentUserRole ?? ''}|${conversations.length}|${conversations[0]?.updatedAtMs ?? 0}`,
            conversations,
            messagesByConversation,
        };
    })();
    const previewFeedSnapshotRef = useRef<string | null>(null);
    useEffect(() => {
        if (!previewFeedSnapshot || previewFeedSnapshotRef.current === previewFeedSnapshot.key) {
            return;
        }
        previewFeedSnapshotRef.current = previewFeedSnapshot.key;
        setFeed((prev) => ({
            ...prev,
            previewData: {
                conversations: previewFeedSnapshot.conversations,
                messagesByConversation: previewFeedSnapshot.messagesByConversation,
            },
            pagination: {
                messageCursor: null,
                allMessages: [],
                hasMore: false,
                isLoadingMore: false,
            },
        }));
    }, [previewFeedSnapshot]);
    const liveMessagesFromQuery = (() => {
        if (isPreviewMode || !typedMessagesQuery) {
            return null;
        }
        const parsed = parsePaginatedDirectMessagesQuery(typedMessagesQuery, selectedConversationLegacyId);
        if (!parsed) {
            return null;
        }
        return {
            key: `${selectedConversationLegacyId ?? ''}|${messageCursor ? 'cursor' : 'root'}|${isLoadingMore ? 'more' : 'fresh'}|${parsed.items.length}|${parsed.nextCursor ? 'has-more' : 'end'}`,
            newMessages: parsed.items,
            hasMore: Boolean(parsed.nextCursor),
            loadingMore: isLoadingMore && Boolean(messageCursor),
        };
    })();
    const conversationPaginationKey = `${isPreviewMode}|${selectedConversationLegacyId ?? ''}`;
    const conversationPaginationKeyRef = useRef<string | null>(null);
    const liveMessagesSnapshotRef = useRef<string | null>(null);
    useEffect(() => {
        const conversationChanged = conversationPaginationKeyRef.current !== conversationPaginationKey;
        const liveMessagesChanged = Boolean(liveMessagesFromQuery) &&
            liveMessagesSnapshotRef.current !== liveMessagesFromQuery?.key;
        if (!conversationChanged && !liveMessagesChanged) {
            return;
        }
        if (conversationChanged) {
            conversationPaginationKeyRef.current = conversationPaginationKey;
        }
        if (liveMessagesFromQuery && liveMessagesChanged) {
            liveMessagesSnapshotRef.current = liveMessagesFromQuery?.key ?? null;
        }
        setFeed((prev) => {
            const basePagination = conversationChanged
                ? {
                    messageCursor: null,
                    allMessages: [] as typeof prev.pagination.allMessages,
                    hasMore: !isPreviewMode,
                    isLoadingMore: false,
                }
                : prev.pagination;
            if (!liveMessagesFromQuery) {
                return conversationChanged
                    ? {
                        ...prev,
                        pagination: basePagination,
                    }
                    : prev;
            }
            const byLegacyId = new Map(basePagination.allMessages.map((message) => [message.legacyId, message]));
            if (liveMessagesFromQuery.loadingMore) {
                for (const message of liveMessagesFromQuery.newMessages) {
                    if (!byLegacyId.has(message.legacyId)) {
                        byLegacyId.set(message.legacyId, message);
                    }
                }
            }
            else {
                byLegacyId.clear();
                for (const message of liveMessagesFromQuery.newMessages) {
                    byLegacyId.set(message.legacyId, message);
                }
            }
            return {
                ...prev,
                pagination: {
                    ...basePagination,
                    allMessages: Array.from(byLegacyId.values()).sort((a, b) => b.createdAtMs - a.createdAtMs),
                    hasMore: liveMessagesFromQuery.hasMore,
                    isLoadingMore: liveMessagesFromQuery.loadingMore ? false : basePagination.isLoadingMore,
                },
            };
        });
    }, [conversationPaginationKey, liveMessagesFromQuery, isPreviewMode]);
    const resolvedSelectedConversation = (() => {
        if (!selectedConversation) {
            return null;
        }
        const pool = isPreviewMode
            ? previewConversations
            : conversationRows.map((c) => ({
                id: c._id,
                legacyId: c.legacyId,
                otherParticipantId: c.otherParticipantId,
                otherParticipantName: c.otherParticipantName,
                otherParticipantRole: c.otherParticipantRole,
                lastMessageSnippet: c.lastMessageSnippet,
                lastMessageAtMs: c.lastMessageAtMs,
                lastMessageSenderId: c.lastMessageSenderId,
                isRead: c.isRead,
                unreadCount: c.unreadCount,
                isArchived: c.isArchived,
                isMuted: c.isMuted,
                createdAtMs: c.createdAtMs,
                updatedAtMs: c.updatedAtMs,
            }));
        return pool.find((conversation) => conversation.legacyId === selectedConversation.legacyId) ?? null;
    })();
    useEffect(() => {
        if (selectedConversation &&
            resolvedSelectedConversation &&
            resolvedSelectedConversation.updatedAtMs !== selectedConversation.updatedAtMs) {
            setSelectedConversation(resolvedSelectedConversation);
            return;
        }
        if (selectedConversation &&
            !resolvedSelectedConversation &&
            !isPreviewMode &&
            conversationsQuery !== undefined) {
            setSelectedConversation(null);
        }
    }, [selectedConversation, resolvedSelectedConversation, isPreviewMode, conversationsQuery]);
    const liveConversations: DirectConversation[] = conversationRows
        .map((c) => ({
        id: c._id,
        legacyId: c.legacyId,
        otherParticipantId: c.otherParticipantId,
        otherParticipantName: c.otherParticipantName,
        otherParticipantRole: c.otherParticipantRole,
        lastMessageSnippet: c.lastMessageSnippet,
        lastMessageAtMs: c.lastMessageAtMs,
        lastMessageSenderId: c.lastMessageSenderId,
        isRead: c.isRead,
        unreadCount: c.unreadCount,
        isArchived: c.isArchived,
        isMuted: c.isMuted,
        createdAtMs: c.createdAtMs,
        updatedAtMs: c.updatedAtMs,
    }))
        .sort((a, b) => (b.lastMessageAtMs ?? 0) - (a.lastMessageAtMs ?? 0));
    const conversations = isPreviewMode ? previewConversations : liveConversations;
    const currentMessages = isPreviewMode
        ? (selectedConversation ? previewMessagesByConversation[selectedConversation.legacyId] ?? [] : [])
        : allMessages;
    const visibleMessages = normalizedMessageSearch ? searchResults : currentMessages;
    const retryDirectMessageSearch = () => {
        setSearchRetryNonce((n) => n + 1);
    };
    const resolvedSyncSearch = (() => {
        if (!selectedConversation || !normalizedMessageSearch) {
            return { results: [] as DirectMessage[], highlights: [] as string[], searching: false, error: null as string | null };
        }
        const parsed = parseDirectMessageSearchQuery(normalizedMessageSearch);
        if (isPreviewMode) {
            const previewMessages = previewMessagesByConversation[selectedConversation.legacyId] ?? [];
            return {
                results: filterDirectMessagesForSearch(previewMessages, parsed),
                highlights: parsed.highlights,
                searching: false,
                error: null,
            };
        }
        if (!workspaceId) {
            return {
                results: [] as DirectMessage[],
                highlights: parsed.highlights,
                searching: false,
                error: null,
            };
        }
        return null;
    })();
    const syncSearchSnapshotRef = useRef<string | null>(null);
    useEffect(() => {
        if (resolvedSyncSearch === null) {
            return;
        }
        const syncSearchKey = `${selectedConversation?.legacyId ?? ''}|${normalizedMessageSearch}|${resolvedSyncSearch.results.length}|${resolvedSyncSearch.searching ? 'loading' : 'ready'}`;
        if (syncSearchSnapshotRef.current === syncSearchKey) {
            return;
        }
        syncSearchSnapshotRef.current = syncSearchKey;
        setFeed((prev) => ({ ...prev, search: resolvedSyncSearch }));
    }, [resolvedSyncSearch, selectedConversation?.legacyId, normalizedMessageSearch]);
    const fetchDirectMessageSearch = useEffectEvent(async (isCancelled: () => boolean) => {
        if (!selectedConversation || !normalizedMessageSearch || !workspaceId)
            return;
        const parsed = parseDirectMessageSearchQuery(normalizedMessageSearch);
        const startMs = parsed.start ? Date.parse(parsed.start) : NaN;
        const endMs = parsed.end ? Date.parse(parsed.end) : NaN;
        setFeed((prev) => ({
            ...prev,
            search: { ...prev.search, searching: true, error: null },
        }));
        if (isCancelled())
            return;
        try {
            const payload = (await convex.query(directMessagesApi.searchMessages, {
                workspaceId: String(workspaceId),
                conversationLegacyId: selectedConversation.legacyId,
                q: parsed.q || null,
                sender: parsed.sender ?? null,
                attachment: parsed.attachment ?? null,
                startMs: Number.isFinite(startMs) ? startMs : null,
                endMs: Number.isFinite(endMs) ? endMs : null,
                limit: 200,
            })) as {
                rows?: unknown[];
                highlights?: unknown[];
            };
            if (isCancelled())
                return;
            const rows = Array.isArray(payload?.rows) ? payload.rows : [];
            const highlights = Array.isArray(payload?.highlights)
                ? payload.highlights.filter((entry): entry is string => typeof entry === 'string')
                : parsed.highlights;
            const mapped = rows
                .flatMap((row: unknown) => {
                const item = (row ?? {}) as Record<string, unknown>;
                const legacyId = String(item.legacyId ?? '');
                if (!legacyId)
                    return [];
                return [{
                        id: String(item._id ?? ''),
                        legacyId,
                        senderId: String(item.senderId ?? ''),
                        senderName: typeof item.senderName === 'string' ? item.senderName : 'Unknown teammate',
                        senderRole: typeof item.senderRole === 'string' ? item.senderRole : null,
                        content: typeof item.content === 'string' ? item.content : '',
                        edited: Boolean(item.edited),
                        editedAtMs: typeof item.editedAtMs === 'number' ? item.editedAtMs : null,
                        deleted: Boolean(item.deleted),
                        deletedAtMs: typeof item.deletedAtMs === 'number' ? item.deletedAtMs : null,
                        deletedBy: typeof item.deletedBy === 'string' ? item.deletedBy : null,
                        attachments: Array.isArray(item.attachments) ? item.attachments as DirectMessage['attachments'] : null,
                        reactions: Array.isArray(item.reactions) ? item.reactions as DirectMessage['reactions'] : null,
                        readBy: Array.isArray(item.readBy) ? item.readBy.filter((value): value is string => typeof value === 'string') : [],
                        deliveredTo: Array.isArray(item.deliveredTo) ? item.deliveredTo.filter((value): value is string => typeof value === 'string') : [],
                        readAtMs: typeof item.readAtMs === 'number' ? item.readAtMs : null,
                        sharedTo: Array.isArray(item.sharedTo) ? item.sharedTo.filter((value): value is 'email' => value === 'email') : null,
                        createdAtMs: typeof item.createdAtMs === 'number' ? item.createdAtMs : 0,
                        updatedAtMs: typeof item.updatedAtMs === 'number' ? item.updatedAtMs : 0,
                    } satisfies DirectMessage];
            })
                .sort((a, b) => b.createdAtMs - a.createdAtMs);
            setFeed((prev) => ({
                ...prev,
                search: {
                    results: mapped,
                    highlights,
                    searching: false,
                    error: null,
                },
            }));
        }
        catch (error: unknown) {
            if (isCancelled())
                return;
            logError(error, 'useDirectMessages:searchMessages');
            setFeed((prev) => ({
                ...prev,
                search: {
                    results: [],
                    highlights: parsed.highlights,
                    searching: false,
                    error: asErrorMessage(error),
                },
            }));
        }
    });
    useEffect(() => {
        if (resolvedSyncSearch !== null)
            return;
        let cancelled = false;
        void fetchDirectMessageSearch(() => cancelled);
        return () => {
            cancelled = true;
        };
    }, [normalizedMessageSearch, resolvedSyncSearch, searchRetryNonce, selectedConversation?.legacyId, workspaceId]);
    const selectConversation = (conversation: DirectConversation | null) => {
        liveMessagesSnapshotRef.current = null;
        setSelectedConversation(conversation);
        setFeed((prev) => ({
            ...prev,
            pagination: {
                ...prev.pagination,
                messageCursor: null,
                allMessages: [],
                hasMore: !isPreviewMode,
                isLoadingMore: false,
            },
        }));
    };
    const loadMoreMessages = () => {
        if (isPreviewMode) {
            return;
        }
        if (typedMessagesQuery?.nextCursor && hasMore && !isLoadingMore) {
            setFeed((prev) => ({
                ...prev,
                pagination: {
                    ...prev.pagination,
                    isLoadingMore: true,
                    messageCursor: typedMessagesQuery.nextCursor,
                },
            }));
        }
    };
    return {
        convex,
        isPreviewMode,
        workspaceId,
        currentUserId,
        currentUserName,
        currentUserRole,
        selectedConversation,
        setSelectedConversation,
        isSending,
        setIsSending,
        messageCursor,
        setMessageCursor: (cursor: MessageCursor) => setFeed((prev) => ({ ...prev, pagination: { ...prev.pagination, messageCursor: cursor } })),
        allMessages,
        setAllMessages: (messages: DirectMessage[] | ((prev: DirectMessage[]) => DirectMessage[])) => setFeed((prev) => ({
            ...prev,
            pagination: {
                ...prev.pagination,
                allMessages: typeof messages === 'function' ? messages(prev.pagination.allMessages) : messages,
            },
        })),
        hasMore,
        setHasMore: (value: boolean) => setFeed((prev) => ({ ...prev, pagination: { ...prev.pagination, hasMore: value } })),
        isLoadingMore,
        setIsLoadingMore: (value: boolean) => setFeed((prev) => ({ ...prev, pagination: { ...prev.pagination, isLoadingMore: value } })),
        messageSearchQuery,
        setMessageSearchQuery,
        searchResults,
        setSearchResults: (results: DirectMessage[]) => setFeed((prev) => ({ ...prev, search: { ...prev.search, results } })),
        searchHighlights,
        setSearchHighlights: (highlights: string[]) => setFeed((prev) => ({ ...prev, search: { ...prev.search, highlights } })),
        searchingMessages,
        setSearchingMessages: (searching: boolean) => setFeed((prev) => ({ ...prev, search: { ...prev.search, searching } })),
        searchError,
        setSearchError: (error: string | null) => setFeed((prev) => ({ ...prev, search: { ...prev.search, error } })),
        searchRetryNonce,
        setSearchRetryNonce,
        previewConversations,
        setPreviewConversations: (value: DirectConversation[] | ((prev: DirectConversation[]) => DirectConversation[])) => setFeed((prev) => ({
            ...prev,
            previewData: {
                ...prev.previewData,
                conversations: typeof value === 'function' ? value(prev.previewData.conversations) : value,
            },
        })),
        previewMessagesByConversation,
        setPreviewMessagesByConversation: (value: Record<string, DirectMessage[]> | ((prev: Record<string, DirectMessage[]>) => Record<string, DirectMessage[]>)) => setFeed((prev) => ({
            ...prev,
            previewData: {
                ...prev.previewData,
                messagesByConversation: typeof value === 'function' ? value(prev.previewData.messagesByConversation) : value,
            },
        })),
        previewReplyTimersRef,
        conversationsQuery,
        unreadCountQuery,
        typedMessagesQuery,
        conversations,
        currentMessages,
        visibleMessages,
        selectConversation,
        loadMoreMessages,
        retryDirectMessageSearch,
        normalizedMessageSearch,
        isLoadingConversations: isPreviewMode ? false : conversationsQuery === undefined,
        isLoadingMessages: isPreviewMode
            ? false
            : messagesQueryArgsChanged ||
                (typedMessagesQuery === undefined && messageCursor === null),
        hasMoreMessages: isPreviewMode ? false : hasMore,
        messagesError: normalizedMessageSearch ? searchError : dmQueryError,
    };
}
