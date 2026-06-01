'use client';
import { notifyFailure } from '@/lib/notifications';
import { type ChangeEvent, type ClipboardEvent, type DragEvent, useCallback, useEffect, useMemo, useRef, useState, } from 'react';
import { useToast } from '@/shared/ui/use-toast';
import type { CollaborationMessage } from '@/types/collaboration';
import type { PendingAttachment, SendMessageOptions } from '../hooks/types';
import type { UnifiedMessage } from './message-list-types';
import type { MessagePaneHeaderInfo } from './unified-message-pane-types';
type UseUnifiedMessagePaneControllerArgs = {
    channelMessages?: CollaborationMessage[];
    focusMessageId?: string | null;
    focusThreadId?: string | null;
    header: MessagePaneHeaderInfo | null;
    isSending: boolean;
    messageDeletingId?: string | null;
    messageInput: string;
    messageUpdatingId?: string | null;
    onAddAttachments?: (files: FileList | File[]) => void;
    onComposerBlur?: () => void;
    onComposerFocus?: () => void;
    onDeleteMessage?: (messageId: string) => Promise<void>;
    onEditMessage?: (messageId: string, newContent: string) => Promise<void>;
    onLoadMoreThreadReplies?: (threadRootId: string) => Promise<void> | void;
    onLoadThreadReplies?: (threadRootId: string) => Promise<void> | void;
    onMarkThreadAsRead?: (threadRootId: string, beforeMs?: number) => Promise<void> | void;
    onReply?: (message: UnifiedMessage) => void;
    onSendMessage: (options?: SendMessageOptions) => Promise<void>;
    onShareToPlatform?: (message: UnifiedMessage, platform: 'email') => Promise<void>;
    onToggleReaction: (messageId: string, emoji: string) => Promise<void>;
    pendingAttachments: PendingAttachment[];
    threadErrorsByRootId: Record<string, string | null>;
    threadLoadingByRootId: Record<string, boolean>;
    threadMessagesByRootId: Record<string, CollaborationMessage[]>;
    uploadingAttachments: boolean;
};
export function useUnifiedMessagePaneController({ channelMessages, focusMessageId = null, focusThreadId = null, header, isSending, messageDeletingId = null, messageInput, messageUpdatingId = null, onAddAttachments, onComposerBlur, onComposerFocus, onDeleteMessage, onEditMessage, onLoadMoreThreadReplies, onLoadThreadReplies, onMarkThreadAsRead, onReply, onSendMessage, onShareToPlatform, onToggleReaction, pendingAttachments, threadErrorsByRootId, threadLoadingByRootId, threadMessagesByRootId, uploadingAttachments, }: UseUnifiedMessagePaneControllerArgs) {
    const [sharingTo, setSharingTo] = useState<string | null>(null);
    const [paneUi, setPaneUi] = useState({
        deletingMessageId: null as string | null,
        confirmingDeleteMessageId: null as string | null,
        editingMessageId: null as string | null,
        editingValue: '',
        editingPreview: '',
        isComposerFocused: false,
    });
    const { deletingMessageId, confirmingDeleteMessageId, editingMessageId, editingValue, editingPreview, isComposerFocused, } = paneUi;
    const [expandedThreadIds, setExpandedThreadIds] = useState<Record<string, boolean>>({});
    const fileInputRef = useRef<HTMLInputElement>(null);
    const lastAutoOpenedThreadRef = useRef<string | null>(null);
    const lastConversationKeyRef = useRef<string | null>(null);
    const { toast } = useToast();
    const activeDeletingMessageId = deletingMessageId ?? messageDeletingId;
    const conversationKey = header?.conversationKey ?? (header ? `${header.type}:${header.name}` : 'none');
    const hasPendingAttachments = pendingAttachments.length > 0;
    const channelMessagesById = (() => {
        const map = new Map<string, CollaborationMessage>();
        for (const message of channelMessages ?? []) {
            if (message?.id)
                map.set(message.id, message);
        }
        for (const replies of Object.values(threadMessagesByRootId)) {
            for (const reply of replies) {
                if (reply?.id)
                    map.set(reply.id, reply);
            }
        }
        return map;
    })();
    const effectiveFocusMessageId = (() => {
        if (typeof focusMessageId !== 'string')
            return null;
        const normalizedId = focusMessageId.trim();
        if (!normalizedId)
            return null;
        const focusedMessage = channelMessagesById.get(normalizedId);
        if (!focusedMessage?.parentMessageId)
            return normalizedId;
        return focusedMessage.threadRootId?.trim() || focusedMessage.parentMessageId?.trim() || normalizedId;
    })();
    const effectiveFocusThreadId = (() => {
        if (typeof focusThreadId === 'string' && focusThreadId.trim().length > 0) {
            return focusThreadId.trim();
        }
        if (typeof focusMessageId !== 'string' || focusMessageId.trim().length === 0) {
            return null;
        }
        const focusedMessage = channelMessagesById.get(focusMessageId.trim());
        if (!focusedMessage)
            return null;
        return focusedMessage.threadRootId?.trim() || focusedMessage.parentMessageId?.trim() || null;
    })();
    useEffect(() => {
        if (lastConversationKeyRef.current === conversationKey)
            return;
        lastConversationKeyRef.current = conversationKey;
        const frame = window.requestAnimationFrame(() => {
            setExpandedThreadIds({});
            setPaneUi({
                deletingMessageId: null,
                confirmingDeleteMessageId: null,
                editingMessageId: null,
                editingValue: '',
                editingPreview: '',
                isComposerFocused: false,
            });
        });
        return () => window.cancelAnimationFrame(frame);
    }, [conversationKey]);
    const handleReaction = async (messageId: string, emoji: string) => {
        await onToggleReaction(messageId, emoji);
    };
    const handleReply = (message: UnifiedMessage) => {
        onReply?.(message);
    };
    const handleDelete = async (messageId: string) => {
        if (!onDeleteMessage)
            return;
        setPaneUi((prev) => ({ ...prev, deletingMessageId: messageId }));
        try {
            await onDeleteMessage(messageId);
        }
        finally {
            setPaneUi((prev) => ({ ...prev, deletingMessageId: null }));
        }
    };
    const handleRequestDelete = (messageId: string) => {
        setPaneUi((prev) => ({ ...prev, confirmingDeleteMessageId: messageId }));
    };
    const handleCancelDelete = () => {
        if (activeDeletingMessageId)
            return;
        setPaneUi((prev) => ({ ...prev, confirmingDeleteMessageId: null }));
    };
    const handleConfirmDelete = async () => {
        if (!confirmingDeleteMessageId)
            return;
        try {
            await handleDelete(confirmingDeleteMessageId);
            setPaneUi((prev) => ({ ...prev, confirmingDeleteMessageId: null }));
        }
        catch {
            // Error toast comes from message actions; leave dialog open for retry.
        }
    };
    const handleStartEdit = (message: UnifiedMessage) => {
        if (!onEditMessage || message.deleted)
            return;
        setPaneUi((prev) => ({
            ...prev,
            editingMessageId: message.id,
            editingValue: message.content ?? '',
            editingPreview: (message.content ?? '').trim().slice(0, 120),
        }));
    };
    const handleCancelEdit = () => {
        if (messageUpdatingId)
            return;
        setPaneUi((prev) => ({
            ...prev,
            editingMessageId: null,
            editingValue: '',
            editingPreview: '',
        }));
    };
    const handleConfirmEdit = async () => {
        if (!onEditMessage || !editingMessageId)
            return;
        const trimmedValue = editingValue.trim();
        if (!trimmedValue) {
            notifyFailure({
                title: 'Message required',
                message: 'Enter a message before saving your changes.',
            });
            return;
        }
        try {
            await onEditMessage(editingMessageId, trimmedValue);
            setPaneUi((prev) => ({
                ...prev,
                editingMessageId: null,
                editingValue: '',
                editingPreview: '',
            }));
        }
        catch {
            // Error toast comes from message actions; keep editor open.
        }
    };
    const handleShare = async (message: UnifiedMessage, platform: 'email') => {
        if (!onShareToPlatform)
            return;
        setSharingTo(`${message.id}-${platform}`);
        await onShareToPlatform(message, platform)
            .then(() => {
            toast({
                title: 'Message shared',
                description: `Sent to ${platform === 'email' ? 'Email' : platform}`,
            });
        })
            .catch(() => {
            notifyFailure({
                title: 'Share failed',
                message: 'Share failed',
            });
        });
        setSharingTo(null);
    };
    const handleSend = async () => {
        const content = messageInput.trim();
        if ((!content && !hasPendingAttachments) || isSending || uploadingAttachments)
            return;
        await onSendMessage();
    };
    const handleComposerFocusInternal = () => {
        setPaneUi((prev) => ({ ...prev, isComposerFocused: true }));
        onComposerFocus?.();
    };
    const handleComposerBlurInternal = () => {
        setPaneUi((prev) => ({ ...prev, isComposerFocused: false }));
        onComposerBlur?.();
    };
    const handleAttachmentInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        if (!onAddAttachments)
            return;
        const files = event.target.files;
        if (files && files.length > 0)
            onAddAttachments(files);
        event.target.value = '';
    };
    const handleComposerDragOver = (event: DragEvent<HTMLTextAreaElement>) => {
        if (!onAddAttachments)
            return;
        event.preventDefault();
        event.dataTransfer.dropEffect = 'copy';
    };
    const handleComposerDrop = (event: DragEvent<HTMLTextAreaElement>) => {
        if (!onAddAttachments)
            return;
        event.preventDefault();
        const files = event.dataTransfer.files;
        if (files && files.length > 0)
            onAddAttachments(files);
    };
    const handleComposerPaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
        if (!onAddAttachments)
            return;
        const files = Array.from(event.clipboardData?.files ?? []).filter((file) => file.type.startsWith('image/'));
        if (files.length > 0) {
            event.preventDefault();
            onAddAttachments(files);
        }
    };
    const resolveThreadRootId = (message: UnifiedMessage) => {
        const original = channelMessagesById.get(message.id);
        if (original?.threadRootId && original.threadRootId.trim().length > 0)
            return original.threadRootId.trim();
        if (message.threadRootId && message.threadRootId.trim().length > 0)
            return message.threadRootId.trim();
        return message.id;
    };
    const handleThreadToggle = (threadRootId: string, beforeMs?: number) => {
        const normalizedId = typeof threadRootId === 'string' ? threadRootId.trim() : '';
        if (!normalizedId)
            return;
        const isCurrentlyOpen = Boolean(expandedThreadIds[normalizedId]);
        setExpandedThreadIds((prev) => {
            const next = { ...prev };
            if (isCurrentlyOpen)
                delete next[normalizedId];
            else
                next[normalizedId] = true;
            return next;
        });
        if (!isCurrentlyOpen) {
            const hasRepliesLoaded = (threadMessagesByRootId[normalizedId]?.length ?? 0) > 0;
            const hasError = Boolean(threadErrorsByRootId[normalizedId]);
            const isLoadingReplies = Boolean(threadLoadingByRootId[normalizedId]);
            if ((!hasRepliesLoaded || hasError) && !isLoadingReplies) {
                void onLoadThreadReplies?.(normalizedId);
            }
            void onMarkThreadAsRead?.(normalizedId, beforeMs);
        }
    };
    const handleRetryThreadLoad = (threadRootId: string) => {
        const normalizedId = typeof threadRootId === 'string' ? threadRootId.trim() : '';
        if (!normalizedId)
            return;
        void onLoadThreadReplies?.(normalizedId);
    };
    const handleLoadMoreThread = (threadRootId: string) => {
        const normalizedId = typeof threadRootId === 'string' ? threadRootId.trim() : '';
        if (!normalizedId)
            return;
        void onLoadMoreThreadReplies?.(normalizedId);
    };
    useEffect(() => {
        if (!effectiveFocusThreadId) {
            lastAutoOpenedThreadRef.current = null;
            return;
        }
        if (lastAutoOpenedThreadRef.current === effectiveFocusThreadId)
            return;
        lastAutoOpenedThreadRef.current = effectiveFocusThreadId;
        const frame = window.requestAnimationFrame(() => {
            setExpandedThreadIds((prev) => {
                if (prev[effectiveFocusThreadId])
                    return prev;
                return { ...prev, [effectiveFocusThreadId]: true };
            });
        });
        const hasRepliesLoaded = (threadMessagesByRootId[effectiveFocusThreadId]?.length ?? 0) > 0;
        const isLoadingReplies = Boolean(threadLoadingByRootId[effectiveFocusThreadId]);
        if (!hasRepliesLoaded && !isLoadingReplies) {
            void onLoadThreadReplies?.(effectiveFocusThreadId);
        }
        void onMarkThreadAsRead?.(effectiveFocusThreadId);
        return () => window.cancelAnimationFrame(frame);
    }, [effectiveFocusThreadId, onLoadThreadReplies, onMarkThreadAsRead, threadLoadingByRootId, threadMessagesByRootId]);
    return {
        activeDeletingMessageId,
        channelMessagesById,
        confirmingDeleteMessageId,
        editingMessageId,
        editingPreview,
        editingValue,
        effectiveFocusMessageId,
        effectiveFocusThreadId,
        expandedThreadIds,
        fileInputRef,
        handleAttachmentInputChange,
        handleCancelDelete,
        handleCancelEdit,
        handleComposerBlurInternal,
        handleComposerDragOver,
        handleComposerDrop,
        handleComposerFocusInternal,
        handleComposerPaste,
        handleConfirmDelete,
        handleConfirmEdit,
        handleDelete,
        handleLoadMoreThread,
        handleReaction,
        handleReply,
        handleRequestDelete,
        handleRetryThreadLoad,
        handleSend,
        handleShare,
        handleStartEdit,
        handleThreadToggle,
        hasPendingAttachments,
        isComposerFocused,
        setEditingValue: (value: string) => setPaneUi((prev) => ({ ...prev, editingValue: value })),
        sharingTo,
        resolveThreadRootId,
    };
}
