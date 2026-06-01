'use client';
'use no memo';
import { useCallback, useEffect, useMemo, useReducer, useRef } from 'react';
import type { ChangeEvent, ClipboardEvent, DragEvent } from 'react';
import { ConfirmDialog } from '@/shared/ui/confirm-dialog';
import { useToast } from '@/shared/ui/use-toast';
import { TaskCreationModal } from '@/features/dashboard/tasks/task-creation-modal';
import type { CollaborationMessage } from '@/types/collaboration';
import type { TaskRecord } from '@/types/tasks';
import { buildCollaborationExportCharts } from '@/lib/export/cohorts-spreadsheet-charts';
import { exportCohortsSpreadsheetRows } from '@/lib/export/cohorts-spreadsheet';
import { groupMessages } from '../utils';
import { EmptyChannelState, MessagePaneHeader, MessageSearchBar, } from './message-pane-parts';
import { MessageComposer } from './message-composer';
import { CollaborationMessageViewport, type CollaborationFlattenedMessageItem, } from './message-pane-sections';
import { INITIAL_MESSAGE_PANE_STATE, MESSAGE_PANE_MAX_PREVIEW_LENGTH, messagePaneReducer, } from './message-pane-state';
import type { CollaborationMessagePaneProps } from './message-pane-types';
export function useCollaborationMessagePane({ channel, channelMessages, visibleMessages, channelParticipants, messagesError, onRetryMessages, messagesRetrying, isLoading, onLoadMore, canLoadMore = false, loadingMore = false, messageInput, onMessageInputChange, messageSearchQuery, onMessageSearchChange, onSendMessage, sending, isSendDisabled, pendingAttachments, onAddAttachments, onRemoveAttachment, uploading, typingParticipants, onComposerFocus, onComposerBlur, onEditMessage, onDeleteMessage, onToggleReaction, messageUpdatingId, messageDeletingId, messagesEndRef, currentUserId, currentUserRole, threadMessagesByRootId, threadNextCursorByRootId, threadLoadingByRootId, threadErrorsByRootId, onLoadThreadReplies, onLoadMoreThreadReplies, onClearThreadReplies, reactionPendingByMessage, }: CollaborationMessagePaneProps) {
    'use no memo';
    const { toast } = useToast();
    const [paneState, dispatch] = useReducer(messagePaneReducer, INITIAL_MESSAGE_PANE_STATE);
    const fileInputRef = useRef<HTMLInputElement | null>(null);
    const { editingMessageId, editingValue, replyingToMessage, expandedThreadIds, confirmingDeleteMessageId, taskCreationModalOpen, selectedMessageForTask, } = paneState;
    const isSearchActive = messageSearchQuery.trim().length > 0;
    const editingPreview = (() => {
        if (!editingMessageId)
            return '';
        const target = channelMessages.find((message) => message.id === editingMessageId);
        if (!target)
            return '';
        const text = target.content ?? '';
        return text.length <= MESSAGE_PANE_MAX_PREVIEW_LENGTH
            ? text
            : `${text.slice(0, MESSAGE_PANE_MAX_PREVIEW_LENGTH)}…`;
    })();
    const messageGroups = (() => {
        if (isSearchActive)
            return [];
        return groupMessages(visibleMessages.filter((m) => !m.parentMessageId));
    })();
    const flattenedMessages = (() => {
        if (isSearchActive)
            return [];
        return messageGroups.flatMap((group) => {
            const headerItem = group.dateSeparator
                ? [{ id: `separator-${group.id}`, type: 'separator' as const, label: group.dateSeparator }]
                : [];
            const messageItems = group.messages.map((message, index) => ({
                id: message.id,
                type: 'message' as const,
                message,
                isFirstInGroup: index === 0,
            }));
            return [...headerItem, ...messageItems];
        });
    })() as CollaborationFlattenedMessageItem[];
    const typingIndicator = (() => {
        if (!typingParticipants || typingParticipants.length === 0)
            return '';
        if (typingParticipants.length === 1) {
            return `${typingParticipants[0]?.name ?? 'Someone'} is typing…`;
        }
        if (typingParticipants.length === 2) {
            const [first, second] = typingParticipants;
            return `${first?.name ?? 'Someone'} and ${second?.name ?? 'someone else'} are typing…`;
        }
        const [first, second, ...rest] = typingParticipants;
        return `${first?.name ?? 'Someone'}, ${second?.name ?? 'someone else'}, and ${rest.length} others are typing…`;
    })();
    const latestVisibleMessageId = (() => {
        if (isSearchActive || visibleMessages.length === 0)
            return null;
        return visibleMessages[visibleMessages.length - 1]?.id ?? null;
    })();
    // Clear editing state if message is deleted
    useEffect(() => {
        if (!editingMessageId)
            return undefined;
        const stillExists = channelMessages.some((message) => message.id === editingMessageId && !message.isDeleted);
        if (!stillExists) {
            const frame = requestAnimationFrame(() => {
                dispatch({ type: 'clear-edit' });
            });
            return () => {
                cancelAnimationFrame(frame);
            };
        }
        return undefined;
    }, [channelMessages, editingMessageId]);
    // Reset thread state when channel changes
    useEffect(() => {
        const frame = requestAnimationFrame(() => {
            dispatch({ type: 'reset-threads' });
            onClearThreadReplies();
        });
        return () => {
            cancelAnimationFrame(frame);
        };
    }, [channel?.id, onClearThreadReplies]);
    // Scroll to bottom when the latest visible message changes.
    // This covers initial channel loads and newly-arrived messages,
    // while avoiding jumps when older history is prepended.
    useEffect(() => {
        if (isLoading || isSearchActive || !latestVisibleMessageId) {
            return;
        }
        const frame = requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'auto', block: 'end' });
        });
        return () => {
            cancelAnimationFrame(frame);
        };
    }, [channel?.id, isLoading, isSearchActive, latestVisibleMessageId, messagesEndRef]);
    useEffect(() => {
        if (isLoading || isSearchActive || !typingIndicator) {
            return;
        }
        const frame = requestAnimationFrame(() => {
            messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' });
        });
        return () => {
            cancelAnimationFrame(frame);
        };
    }, [isLoading, isSearchActive, messagesEndRef, typingIndicator]);
    // Handlers
    const handleStartEdit = (message: CollaborationMessage) => {
        if (message.isDeleted || messageUpdatingId === message.id || messageDeletingId === message.id)
            return;
        dispatch({ type: 'start-edit', message });
    };
    const handleReply = (message: CollaborationMessage) => {
        dispatch({ type: 'set-reply-target', message });
    };
    const handleCancelReply = () => {
        dispatch({ type: 'set-reply-target', message: null });
    };
    const handleCancelEdit = () => {
        dispatch({ type: 'clear-edit' });
    };
    const handleConfirmEdit = () => {
        if (!editingMessageId || messageUpdatingId === editingMessageId)
            return;
        const trimmed = editingValue.trim();
        if (!trimmed)
            return;
        onEditMessage(editingMessageId, trimmed);
        dispatch({ type: 'clear-edit' });
    };
    const handleConfirmDelete = (messageId: string) => {
        if (messageDeletingId === messageId)
            return;
        dispatch({ type: 'open-delete-confirmation', messageId });
    };
    const handleExecuteDelete = () => {
        if (!confirmingDeleteMessageId || messageDeletingId === confirmingDeleteMessageId)
            return;
        onDeleteMessage(confirmingDeleteMessageId);
        dispatch({ type: 'close-delete-confirmation' });
    };
    const handleCancelDelete = () => {
        dispatch({ type: 'close-delete-confirmation' });
    };
    const handleCreateTaskFromMessage = (message: CollaborationMessage) => {
        dispatch({ type: 'open-task-modal', message });
    };
    const handleTaskCreated = (task: TaskRecord) => {
        toast({
            title: 'Task created',
            description: task.title ? `"${task.title}" was added from this message.` : 'The task was added from this message.',
        });
    };
    const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
        onMessageSearchChange(event.target.value);
    };
    const handleAttachmentInputChange = (event: ChangeEvent<HTMLInputElement>) => {
        const files = event.target.files;
        if (!files || files.length === 0)
            return;
        onAddAttachments(files);
        event.target.value = '';
    };
    const handleComposerDrop = (event: DragEvent<HTMLTextAreaElement>) => {
        event.preventDefault();
        if (!channel || sending)
            return;
        if (event.dataTransfer.files && event.dataTransfer.files.length > 0) {
            onAddAttachments(event.dataTransfer.files);
            event.dataTransfer.clearData();
        }
    };
    const handleComposerDragOver = (event: DragEvent<HTMLTextAreaElement>) => {
        event.preventDefault();
        if (!channel || sending) {
            event.dataTransfer.dropEffect = 'none';
            return;
        }
        event.dataTransfer.dropEffect = 'copy';
    };
    const handleComposerPaste = (event: ClipboardEvent<HTMLTextAreaElement>) => {
        if (!channel || sending)
            return;
        const files = Array.from(event.clipboardData?.files ?? []).filter((file) => file.type.startsWith('image/'));
        if (files.length === 0)
            return;
        event.preventDefault();
        onAddAttachments(files);
    };
    const handleThreadToggle = (threadRootId: string) => {
        const normalizedId = threadRootId.trim();
        if (!normalizedId)
            return;
        const isCurrentlyOpen = Boolean(expandedThreadIds[normalizedId]);
        dispatch({ type: 'toggle-thread', threadRootId: normalizedId });
        // Side-effect: Load replies if opening and not loaded/loading
        if (!isCurrentlyOpen) {
            const existingReplies = threadMessagesByRootId[normalizedId];
            const hasRepliesLoaded = Array.isArray(existingReplies) && existingReplies.length > 0;
            const hasError = Boolean(threadErrorsByRootId[normalizedId]);
            const isLoadingReplies = threadLoadingByRootId[normalizedId] ?? false;
            if ((!hasRepliesLoaded || hasError) && !isLoadingReplies) {
                void onLoadThreadReplies(normalizedId);
            }
        }
    };
    const handleRetryThreadLoad = (threadRootId: string) => {
        const normalizedId = threadRootId.trim();
        if (!normalizedId)
            return;
        void onLoadThreadReplies(normalizedId);
    };
    const handleLoadMoreThread = (threadRootId: string) => {
        const normalizedId = threadRootId.trim();
        if (!normalizedId)
            return;
        void onLoadMoreThreadReplies(normalizedId);
    };
    const handleExportChannel = () => {
        if (!channel || channelMessages.length === 0)
            return;
        const headers = ['Date', 'Sender', 'Role', 'Content', 'Attachments', 'Reactions', 'Thread Replies'];
        const rows = channelMessages.map((msg) => {
            const date = msg.createdAt ? new Date(msg.createdAt).toLocaleString() : '';
            const sender = msg.senderName;
            const role = msg.senderRole || '';
            const content = msg.content || '';
            const attachments = (msg.attachments || []).map((a) => a.url).join('; ');
            const reactions = (msg.reactions || []).map((r) => `${r.emoji}(${r.count})`).join(' ');
            const replies = msg.threadReplyCount || 0;
            return [date, sender, role, content, attachments, reactions, replies];
        });
        const chartRows = channelMessages.map((msg) => ({
            date: msg.createdAt ? new Date(msg.createdAt).toLocaleString() : '',
            sender: msg.senderName,
        }));
        void exportCohortsSpreadsheetRows({
            filename: `${channel.name.replace(/[^a-z0-9]/gi, '_')}_export.xlsx`,
            title: `${channel.name} messages`,
            subtitle: `${rows.length} message${rows.length === 1 ? '' : 's'}`,
            sheetName: 'Messages',
            headers,
            rows,
            charts: buildCollaborationExportCharts(chartRows),
        });
    };
    const handleSendWithReply = () => {
        onSendMessage({ parentMessageId: replyingToMessage?.id });
        dispatch({ type: 'set-reply-target', message: null });
    };
    const handleCloseTaskModal = () => {
        dispatch({ type: 'close-task-modal' });
    };
    const handleEditingValueChange = (value: string) => {
        dispatch({ type: 'set-editing-value', value });
    };
    const taskCreationInitialData = ({
        title: selectedMessageForTask ? `Task from: ${selectedMessageForTask.content?.slice(0, 50)}...` : '',
        description: selectedMessageForTask?.content || '',
        projectId: channel?.id || '',
        projectName: channel?.name || '',
    });
    const handleConfirmDialogOpenChange = (open: boolean) => {
        if (!open)
            handleCancelDelete();
    };
    // Early return for no channel
    if (!channel) {
        return <EmptyChannelState />;
    }
    return (<div className="flex min-h-[480px] flex-1 flex-col bg-background/50 lg:h-[640px] relative overflow-hidden">
      <div className="absolute inset-0 -z-10 overflow-hidden pointer-events-none">
        <div className="absolute -top-[100%] -left-[100%] size-[300%] animate-shimmer bg-gradient-to-br from-transparent via-muted/30 to-transparent opacity-50"/>
      </div>
      <MessagePaneHeader channel={channel} channelParticipants={channelParticipants} messageCount={channelMessages.length} onExport={handleExportChannel}/>

      <MessageSearchBar value={messageSearchQuery} onChange={handleSearchChange} resultCount={visibleMessages.length} isActive={isSearchActive}/>

      <CollaborationMessageViewport canLoadMore={canLoadMore} channelMessages={channelMessages} currentUserId={currentUserId} currentUserRole={currentUserRole} editingMessageId={editingMessageId} editingPreview={editingPreview} editingValue={editingValue} expandedThreadIds={expandedThreadIds} flattenedMessages={flattenedMessages} isLoading={isLoading} isSearchActive={isSearchActive} loadingMore={loadingMore} messageDeletingId={messageDeletingId} messageUpdatingId={messageUpdatingId} messagesEndRef={messagesEndRef} messagesError={messagesError} onRetryMessages={onRetryMessages} messagesRetrying={messagesRetrying} onCancelEdit={handleCancelEdit} onConfirmDelete={handleConfirmDelete} onConfirmEdit={handleConfirmEdit} onCreateTask={handleCreateTaskFromMessage} onEditingValueChange={handleEditingValueChange} onLoadMore={onLoadMore} onLoadMoreThread={handleLoadMoreThread} onReply={handleReply} onRetryThreadLoad={handleRetryThreadLoad} onStartEdit={handleStartEdit} onThreadToggle={handleThreadToggle} onToggleReaction={onToggleReaction} reactionPendingByMessage={reactionPendingByMessage} threadErrorsByRootId={threadErrorsByRootId} threadLoadingByRootId={threadLoadingByRootId} threadMessagesByRootId={threadMessagesByRootId} threadNextCursorByRootId={threadNextCursorByRootId} visibleMessages={visibleMessages} typingIndicator={typingIndicator || undefined}/>


      <MessageComposer channel={channel} messageInput={messageInput} onMessageInputChange={onMessageInputChange} onSend={handleSendWithReply} sending={sending} isSendDisabled={isSendDisabled} pendingAttachments={pendingAttachments} uploading={uploading} onAddAttachments={onAddAttachments} onRemoveAttachment={onRemoveAttachment} channelParticipants={channelParticipants} replyingToMessage={replyingToMessage} onCancelReply={handleCancelReply} onComposerFocus={onComposerFocus} onComposerBlur={onComposerBlur} typingIndicator={typingIndicator} fileInputRef={fileInputRef} onAttachmentInputChange={handleAttachmentInputChange} onComposerDrop={handleComposerDrop} onComposerDragOver={handleComposerDragOver} onComposerPaste={handleComposerPaste}/>

      {/* Task Creation Modal */}
      <TaskCreationModal isOpen={taskCreationModalOpen} onClose={handleCloseTaskModal} initialData={taskCreationInitialData} onTaskCreated={handleTaskCreated}/>

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog open={Boolean(confirmingDeleteMessageId)} onOpenChange={handleConfirmDialogOpenChange} title="Delete message" description="Are you sure you want to delete this message? This action cannot be undone. The message will be marked as deleted and hidden from all participants." confirmLabel="Delete" cancelLabel="Cancel" variant="destructive" onConfirm={handleExecuteDelete} onCancel={handleCancelDelete}/>
    </div>);
}
