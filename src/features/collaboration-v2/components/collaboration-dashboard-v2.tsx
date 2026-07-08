'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useAuth } from '@/shared/contexts/auth-context';
import { useClientContext } from '@/shared/contexts/client-context';
import { usePreview } from '@/shared/contexts/preview-context';
import { collaborationToUnifiedMessage } from '@/features/dashboard/collaboration/components/message-list-utils';
import type { MessagePaneListState } from '@/features/dashboard/collaboration/components/unified-message-pane-layout';
import { useProjectsData } from '@/features/dashboard/collaboration/hooks/use-projects-data';
import { useThreads } from '@/features/dashboard/collaboration/hooks/use-threads';
import { useAttachments } from '@/features/dashboard/collaboration/hooks/use-attachments';
import { directMessageToCollaborationMessage } from '@/features/dashboard/collaboration/lib/direct-message-collaboration';
import type { SendMessageOptions } from '@/features/dashboard/collaboration/hooks/types';
import type { UnifiedMessage } from '@/features/dashboard/collaboration/components/message-list-types';
import { useQuery, useMutation } from 'convex/react';
import { usersApi, collaborationChannelsApi } from '@/lib/convex-api';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { asErrorMessage, logError } from '@/lib/convex-errors';
import { useCollaborationChannels } from '../hooks/use-collaboration-channels';
import {
  useChannelMessages,
  useSendChannelMessage,
  useEditChannelMessage,
  useDeleteChannelMessage,
  useToggleChannelReaction,
} from '../api/use-channel-messages';
import {
  useDirectConversations,
  useDirectMessages,
  useSendDirectMessage,
  useEditDirectMessage,
  useDeleteDirectMessage,
  useToggleDirectMessageReaction,
  useMarkDirectMessageRead,
  useArchiveConversation,
  useMuteConversation,
  useDirectMessageUnreadCount,
  useGetOrCreateConversation,
} from '../api/use-direct-messages';
import { useChannelUnreadCounts, useMarkChannelAsRead } from '../api/use-read-receipts';
import { useTypingParticipants, useSetTyping } from '../api/use-typing';
import { useMarkThreadAsRead } from '../api/use-thread-replies';
import { useSearchChannelMessages } from '../api/use-search';
import { useCrossChannelCollaborationSearch } from '@/features/dashboard/collaboration/hooks/use-cross-channel-collaboration-search';
import { CrossChannelSearch } from '@/features/dashboard/collaboration/components/cross-channel-search';
import { useCollaborationChannelExtras } from '@/features/dashboard/collaboration/components/collaboration-channel-extras';
import { useCollaborationExternalNotify } from '@/features/dashboard/collaboration/hooks/use-collaboration-external-notify';
import { useTyping } from '@/features/dashboard/collaboration/hooks/use-typing';
import { useMessageDrafts, buildChannelDraftKey, buildDmDraftKey } from '../hooks/use-message-drafts';
import {
  ConversationListPane,
  useInboxItems,
  type SourceFilter,
  type InboxItem,
} from './conversation-list-pane';
import { useCollaborationUrlState } from '../hooks/use-collaboration-url-state';
import { useCollaborationHeaderInfo } from './use-collaboration-header-info';
import { CollaborationDashboardDialogs } from './collaboration-dashboard-dialogs';
import { CollaborationMessagePane } from './collaboration-message-pane';
import type { CollaborationMessage, CollaborationAttachment } from '@/types/collaboration';

export function CollaborationDashboardV2() {
  // ─── Identity & workspace data ────────────────────────────────────────────
  const { user } = useAuth();
  const { isPreviewMode } = usePreview();
  const workspaceId = user?.agencyId ? String(user.agencyId) : null;
  const currentUserId = user?.id ?? null;
  const currentUserName = user?.name ?? 'Teammate';
  const currentUserRole = user?.role ?? null;
  const isAdmin = currentUserRole === 'admin';

  const { clients, loading: clientsLoading } = useClientContext();
  const { projects, projectsLoading } = useProjectsData({
    workspaceId,
    userId: currentUserId,
    isPreviewMode,
  });

  // ─── Workspace members (for create channel + new DM dialogs) ──────────────
  const workspaceMembersResult = useQuery(
    usersApi.listWorkspaceMembers,
    workspaceId ? { workspaceId, limit: 500 } : 'skip',
  ) as Array<{
    id?: string;
    name?: string;
    email?: string;
    role?: string;
  }> | undefined;

  const workspaceMembers = (workspaceMembersResult ?? []).flatMap((member) =>
    typeof member?.id === 'string' && typeof member?.name === 'string'
      ? [{
          id: member.id,
          name: member.name,
          email: typeof member.email === 'string' ? member.email : undefined,
          role: typeof member.role === 'string' ? member.role : undefined,
        }]
      : [],
  );

  // ─── Channel mutations (create/remove) ────────────────────────────────────
  const createChannelMutation = useMutation(collaborationChannelsApi.create);

  // ─── URL state ────────────────────────────────────────────────────────────
  const urlState = useCollaborationUrlState();

  // ─── Channels ─────────────────────────────────────────────────────────────
  const {
    channels,
    selectedChannelId,
    selectChannel,
    channelParticipants,
  } = useCollaborationChannels({
    workspaceId,
    clients,
    projects,
    fallbackDisplayName: currentUserName,
    fallbackRole: currentUserRole ?? 'Contributor',
  });

  // ─── DM conversations ─────────────────────────────────────────────────────
  const { conversations: dmConversations, isLoading: dmsLoading } =
    useDirectConversations(workspaceId);
  const dmUnreadCount = useDirectMessageUnreadCount(workspaceId);

  // ─── Unread counts ────────────────────────────────────────────────────────
  const channelUnreadCounts = useChannelUnreadCounts(workspaceId, currentUserId);

  // ─── Selection state (synced with URL) ───────────────────────────────────
  const selectedConversationLegacyId = urlState.conversationLegacyId;
  const selectedDM = useMemo(
    () =>
      dmConversations.find((c) => c.legacyId === selectedConversationLegacyId) ?? null,
    [dmConversations, selectedConversationLegacyId],
  );

  // Sync URL → channel selection
  const urlChannelId = urlState.channelId;
  const effectiveSelectedChannelId = useMemo(() => {
    if (urlChannelId === null) return null;
    if (urlChannelId && channels.some((c) => c.id === urlChannelId)) return urlChannelId;
    return selectedChannelId;
  }, [urlChannelId, channels, selectedChannelId]);

  const effectiveSelectedChannel = useMemo(
    () => channels.find((c) => c.id === effectiveSelectedChannelId) ?? null,
    [channels, effectiveSelectedChannelId],
  );

  // ─── Messages (channel or DM) ─────────────────────────────────────────────
  const {
    messages: channelMessages,
    isLoading: channelMessagesLoading,
    hasMore: channelMessagesHasMore,
    loadingMore: channelMessagesLoadingMore,
    loadMore: loadMoreChannelMessages,
  } = useChannelMessages(workspaceId, effectiveSelectedChannel, 51);

  const {
    messages: dmMessages,
    isLoading: dmMessagesLoading,
    hasMore: dmMessagesHasMore,
    loadingMore: dmMessagesLoadingMore,
    loadMore: loadMoreDmMessages,
  } = useDirectMessages(workspaceId, selectedConversationLegacyId, 51);

  // ─── Typing indicators ────────────────────────────────────────────────────
  const typingParticipants = useTypingParticipants(
    workspaceId,
    currentUserId,
    effectiveSelectedChannel,
    selectedConversationLegacyId,
  );
  const typingIndicator =
    typingParticipants.length > 0
      ? typingParticipants.length === 1
        ? `${typingParticipants[0]!.name} is typing…`
        : `${typingParticipants[0]!.name} and ${typingParticipants.length - 1} other${
            typingParticipants.length - 1 > 1 ? 's' : ''
          } typing…`
      : '';

  // ─── In-channel message search ────────────────────────────────────────────
  const [messageSearchQuery, setMessageSearchQuery] = useState('');
  const { highlights: searchHighlights } = useSearchChannelMessages(
    workspaceId,
    effectiveSelectedChannel,
    messageSearchQuery,
  );

  // ─── Cross-channel search (hook only — handler wired after select handler) ──
  const searchAcrossChannels = useCrossChannelCollaborationSearch(workspaceId, channels);

  // ─── Drafts ───────────────────────────────────────────────────────────────
  const { getDraft, setDraft, clearDraft } = useMessageDrafts();
  const draftKey = effectiveSelectedChannel
    ? buildChannelDraftKey(effectiveSelectedChannel.id)
    : selectedConversationLegacyId
      ? buildDmDraftKey(selectedConversationLegacyId)
      : '';
  const messageInput = draftKey ? getDraft(draftKey) : '';

  // ─── Mutations ────────────────────────────────────────────────────────────
  const sendChannelMessage = useSendChannelMessage();
  const editChannelMessage = useEditChannelMessage();
  const deleteChannelMessage = useDeleteChannelMessage();
  const toggleChannelReaction = useToggleChannelReaction();
  const markChannelAsRead = useMarkChannelAsRead();

  const sendDirectMessage = useSendDirectMessage();
  const editDirectMessage = useEditDirectMessage();
  const deleteDirectMessage = useDeleteDirectMessage();
  const toggleDirectMessageReaction = useToggleDirectMessageReaction();
  const markDirectMessageRead = useMarkDirectMessageRead();
  const archiveConversation = useArchiveConversation();
  const muteConversation = useMuteConversation();
  const getOrCreateConversation = useGetOrCreateConversation();

  useSetTyping(); // initialize the mutation hook for future use
  const markThreadAsRead = useMarkThreadAsRead();

  // ─── Attachments ──────────────────────────────────────────────────────────
  const {
    pendingAttachments,
    uploading: uploadingAttachments,
    handleAddAttachments,
    handleRemoveAttachment,
    clearAttachments,
    uploadAttachments,
  } = useAttachments({ userId: currentUserId, workspaceId });

  // ─── Typing (composer focus/blur + notify) ────────────────────────────────
  const { notifyTyping, handleComposerFocus, handleComposerBlur, stopTyping } = useTyping({
    workspaceId,
    selectedChannel: effectiveSelectedChannel,
    conversationLegacyId: selectedConversationLegacyId,
    resolveSenderDetails: () => ({
      senderName: currentUserName,
      senderRole: currentUserRole,
    }),
  });

  // ─── Channel extras (task creation, export, poll, forward) ─────────────────
  const { sendCollaborationEmailCopy } = useCollaborationExternalNotify();
  const {
    handleCreateTask,
    handleExportChannel,
    handleCreatePoll,
    taskModal,
    forwardDialog: channelExtrasForwardDialog,
  } = useCollaborationChannelExtras({
    channel: effectiveSelectedChannel,
    channelMessages: effectiveSelectedChannel ? channelMessages : [],
    channels,
    currentUserId,
    workspaceId,
    onSendPollMessage: async (content: string) => {
      if (!workspaceId || !currentUserId || !effectiveSelectedChannel) return;
      const channel = effectiveSelectedChannel;
      const legacyId =
        typeof crypto !== 'undefined' && crypto.randomUUID
          ? crypto.randomUUID()
          : `${Date.now()}-${Math.random()}`;
      await sendChannelMessage({
        workspaceId: String(workspaceId),
        legacyId,
        channelId: channel.isCustom ? channel.id : null,
        channelType: channel.type,
        clientId: channel.type === 'client' ? (channel.clientId ?? null) : null,
        projectId: channel.type === 'project' ? (channel.projectId ?? null) : null,
        senderId: String(currentUserId),
        senderName: currentUserName,
        senderRole: currentUserRole,
        content,
        format: 'markdown',
      });
    },
  });

  // ─── Thread management (reuses battle-tested legacy hook) ────────────────
  const {
    threadMessagesByRootId,
    threadNextCursorByRootId,
    threadLoadingByRootId,
    threadErrorsByRootId,
    loadThreadReplies,
    loadMoreThreadReplies,
    clearThreadReplies,
    addThreadReplyToState,
  } = useThreads({ workspaceId, currentUserId });

  // ─── Reply & sending state ────────────────────────────────────────────────
  const [replyingToMessage, setReplyingToMessage] = useState<CollaborationMessage | null>(null);
  const [sending, setSending] = useState(false);
  const [forwardingMessage, setForwardingMessage] = useState<CollaborationMessage | null>(null);
  const [isNewDMDialogOpen, setIsNewDMDialogOpen] = useState(false);

  // ─── Unified messages for the pane ────────────────────────────────────────
  const unifiedMessages = useMemo(() => {
    if (effectiveSelectedChannel) {
      return channelMessages.map(collaborationToUnifiedMessage);
    }
    if (selectedConversationLegacyId && selectedDM) {
      return dmMessages.map((dm) =>
        collaborationToUnifiedMessage(directMessageToCollaborationMessage(dm)),
      );
    }
    return [];
  }, [
    effectiveSelectedChannel,
    channelMessages,
    selectedConversationLegacyId,
    selectedDM,
    dmMessages,
  ]);

  // ─── Channel last messages (for inbox previews) ──────────────────────────
  const channelLastMessages = useMemo(() => {
    const map: Record<string, { content: string; createdAtMs: number } | undefined> = {};
    if (effectiveSelectedChannel && channelMessages.length > 0) {
      const last = channelMessages[channelMessages.length - 1];
      if (last?.content && last.createdAt) {
        map[effectiveSelectedChannel.id] = {
          content: last.content,
          createdAtMs: new Date(last.createdAt).getTime(),
        };
      }
    }
    return map;
  }, [effectiveSelectedChannel, channelMessages]);

  // ─── Inbox items ──────────────────────────────────────────────────────────
  const [sourceFilter, setSourceFilter] = useState<SourceFilter>('all');
  const [inboxSearchQuery, setInboxSearchQuery] = useState('');
  const inboxItems = useInboxItems(
    channels,
    channelUnreadCounts,
    channelLastMessages,
    dmConversations,
    sourceFilter,
    inboxSearchQuery,
  );
  const totalUnread = useMemo(() => {
    const channelUnread = Object.values(channelUnreadCounts).reduce(
      (sum, count) => sum + count,
      0,
    );
    return channelUnread + dmUnreadCount;
  }, [channelUnreadCounts, dmUnreadCount]);

  // ─── Selection handlers ───────────────────────────────────────────────────
  const handleSelectItem = useCallback(
    (item: InboxItem) => {
      if (item.type === 'channel') {
        urlState.setChannelId(item.legacyId);
        selectChannel(item.legacyId);
      } else {
        urlState.setConversationLegacyId(item.legacyId);
        selectChannel(null);
      }
    },
    [urlState, selectChannel],
  );

  const selectedInboxKey = effectiveSelectedChannel
    ? `channel:${effectiveSelectedChannel.id}`
    : selectedConversationLegacyId
      ? `dm:${selectedConversationLegacyId}`
      : null;

  // ─── Cross-channel search result click ─────────────────────────────────────
  const handleSearchResultClick = useCallback(
    (messageId: string, channelId: string, threadRootId?: string | null) => {
      const channel = channels.find((c) => c.id === channelId);
      if (channel) {
        urlState.setChannelId(channel.id);
        selectChannel(channel.id);
      }
      urlState.setDeepLinkMessage(messageId, threadRootId ?? null);
    },
    [channels, urlState, selectChannel],
  );

  // ─── Send message handler ─────────────────────────────────────────────────
  const handleSendMessage = useCallback(async (options?: SendMessageOptions) => {
    const content = (options?.content ?? messageInput).trim();
    const hasAttachments = pendingAttachments.length > 0;
    if ((!content && !hasAttachments) || sending || !workspaceId || !currentUserId) return;

    const replyTarget = options?.threadRootId
      ? { threadRootId: options.threadRootId, parentMessageId: options.parentMessageId ?? null }
      : replyingToMessage
        ? {
            threadRootId: replyingToMessage.threadRootId ?? replyingToMessage.id,
            parentMessageId: replyingToMessage.id,
          }
        : null;

    const parentMessageId = replyTarget?.parentMessageId ?? null;
    const threadRootId = replyTarget?.threadRootId ?? null;
    const isThreadReply = Boolean(threadRootId);

    setSending(true);
    try {
      let uploadedAttachments: CollaborationAttachment[] = [];
      if (hasAttachments) {
        uploadedAttachments = await uploadAttachments(pendingAttachments);
        clearAttachments();
      }

      if (effectiveSelectedChannel) {
        const channel = effectiveSelectedChannel;
        const legacyId =
          typeof crypto !== 'undefined' && crypto.randomUUID
            ? crypto.randomUUID()
            : `${Date.now()}-${Math.random()}`;
        await sendChannelMessage({
          workspaceId: String(workspaceId),
          legacyId,
          channelId: channel.isCustom ? channel.id : null,
          channelType: channel.type,
          clientId: channel.type === 'client' ? (channel.clientId ?? null) : null,
          projectId: channel.type === 'project' ? (channel.projectId ?? null) : null,
          senderId: String(currentUserId),
          senderName: options?.senderName ?? currentUserName,
          senderRole: options?.senderRole ?? currentUserRole,
          content,
          format: 'markdown',
          parentMessageId,
          threadRootId,
          attachments: uploadedAttachments.length > 0 ? uploadedAttachments : undefined,
        });

        if (isThreadReply && threadRootId) {
          const replyMessage: CollaborationMessage = {
            id: legacyId,
            channelType: channel.type,
            clientId: channel.clientId ?? null,
            projectId: channel.projectId ?? null,
            senderId: String(currentUserId),
            senderName: currentUserName,
            senderRole: currentUserRole,
            content,
            createdAt: new Date().toISOString(),
            updatedAt: null,
            isEdited: false,
            deletedAt: null,
            deletedBy: null,
            isDeleted: false,
            format: 'markdown',
            parentMessageId,
            threadRootId,
            readBy: [String(currentUserId)],
            deliveredTo: [],
            isPinned: false,
            pinnedAt: null,
            pinnedBy: null,
            sharedTo: [],
          };
          addThreadReplyToState(threadRootId, replyMessage);
        }
      } else if (selectedConversationLegacyId) {
        await sendDirectMessage({
          workspaceId: String(workspaceId),
          conversationLegacyId: selectedConversationLegacyId,
          content,
        });
        void markDirectMessageRead({
          workspaceId: String(workspaceId),
          conversationLegacyId: selectedConversationLegacyId,
        });
      }
      if (draftKey) clearDraft(draftKey);
      if (isThreadReply) setReplyingToMessage(null);
      void stopTyping();
    } catch (error) {
      logError(error, 'collaboration-dashboard-v2:handleSendMessage');
      reportConvexFailure({
        error,
        context: 'collaboration-dashboard-v2:handleSendMessage',
        title: 'Message not sent',
        fallbackMessage: 'Could not send your message. Please try again.',
      });
    } finally {
      setSending(false);
    }
  }, [
    messageInput,
    sending,
    workspaceId,
    currentUserId,
    currentUserName,
    currentUserRole,
    effectiveSelectedChannel,
    selectedConversationLegacyId,
    draftKey,
    replyingToMessage,
    pendingAttachments,
    sendChannelMessage,
    sendDirectMessage,
    markDirectMessageRead,
    clearDraft,
    addThreadReplyToState,
    uploadAttachments,
    clearAttachments,
    stopTyping,
  ]);

  const handleMessageInputChange = useCallback(
    (value: string) => {
      if (draftKey) setDraft(draftKey, value);
      void notifyTyping();
    },
    [draftKey, setDraft, notifyTyping],
  );

  // ─── Reaction handler ─────────────────────────────────────────────────────
  const handleToggleReaction = useCallback(
    async (messageId: string, emoji: string) => {
      if (!workspaceId || !currentUserId) return;
      if (effectiveSelectedChannel) {
        await toggleChannelReaction({
          workspaceId: String(workspaceId),
          legacyId: messageId,
          emoji,
          userId: String(currentUserId),
        });
      } else if (selectedConversationLegacyId) {
        await toggleDirectMessageReaction({
          workspaceId: String(workspaceId),
          messageLegacyId: messageId,
          emoji,
        });
      }
    },
    [
      workspaceId,
      currentUserId,
      effectiveSelectedChannel,
      selectedConversationLegacyId,
      toggleChannelReaction,
      toggleDirectMessageReaction,
    ],
  );

  // ─── Edit/delete handlers ─────────────────────────────────────────────────
  const handleEditMessage = useCallback(
    async (messageId: string, newContent: string) => {
      if (!workspaceId) return;
      if (effectiveSelectedChannel) {
        await editChannelMessage({
          workspaceId: String(workspaceId),
          legacyId: messageId,
          content: newContent,
        });
      } else if (selectedConversationLegacyId) {
        await editDirectMessage({
          workspaceId: String(workspaceId),
          messageLegacyId: messageId,
          newContent,
        });
      }
    },
    [
      workspaceId,
      effectiveSelectedChannel,
      selectedConversationLegacyId,
      editChannelMessage,
      editDirectMessage,
    ],
  );

  const handleDeleteMessage = useCallback(
    async (messageId: string) => {
      if (!workspaceId || !currentUserId) return;
      if (effectiveSelectedChannel) {
        await deleteChannelMessage({
          workspaceId: String(workspaceId),
          legacyId: messageId,
          deletedBy: String(currentUserId),
        });
      } else if (selectedConversationLegacyId) {
        await deleteDirectMessage({
          workspaceId: String(workspaceId),
          messageLegacyId: messageId,
        });
      }
    },
    [
      workspaceId,
      currentUserId,
      effectiveSelectedChannel,
      selectedConversationLegacyId,
      deleteChannelMessage,
      deleteDirectMessage,
    ],
  );

  // ─── Mark channel as read ─────────────────────────────────────────────────
  const handleMarkChannelRead = useCallback(async () => {
    if (!workspaceId || !currentUserId || !effectiveSelectedChannel) return;
    await markChannelAsRead({
      workspaceId: String(workspaceId),
      channelId: effectiveSelectedChannel.isCustom ? effectiveSelectedChannel.id : null,
      channelType: effectiveSelectedChannel.type,
      clientId:
        effectiveSelectedChannel.type === 'client'
          ? (effectiveSelectedChannel.clientId ?? null)
          : null,
      projectId:
        effectiveSelectedChannel.type === 'project'
          ? (effectiveSelectedChannel.projectId ?? null)
          : null,
      userId: String(currentUserId),
    });
  }, [workspaceId, currentUserId, effectiveSelectedChannel, markChannelAsRead]);

  // ─── Thread mark-as-read ──────────────────────────────────────────────────
  const handleMarkThreadAsRead = useCallback(
    async (threadRootId: string) => {
      if (!workspaceId || !currentUserId || !effectiveSelectedChannel) return;
      await markThreadAsRead({
        workspaceId: String(workspaceId),
        channelId: effectiveSelectedChannel.isCustom ? effectiveSelectedChannel.id : null,
        channelType: effectiveSelectedChannel.type,
        clientId:
          effectiveSelectedChannel.type === 'client'
            ? (effectiveSelectedChannel.clientId ?? null)
            : null,
        projectId:
          effectiveSelectedChannel.type === 'project'
            ? (effectiveSelectedChannel.projectId ?? null)
            : null,
        threadRootId,
        userId: String(currentUserId),
      });
    },
    [workspaceId, currentUserId, effectiveSelectedChannel, markThreadAsRead],
  );

  // ─── Reply handler ────────────────────────────────────────────────────────
  const handleReply = useCallback(
    (message: UnifiedMessage) => {
      const original = effectiveSelectedChannel
        ? channelMessages.find((m) => m.id === message.id)
        : null;
      if (original) {
        setReplyingToMessage(original);
      } else if (selectedConversationLegacyId && selectedDM) {
        const dm = dmMessages.find((m) => m.id === message.id);
        if (dm) {
          setReplyingToMessage(directMessageToCollaborationMessage(dm));
        }
      }
    },
    [effectiveSelectedChannel, channelMessages, selectedConversationLegacyId, selectedDM, dmMessages],
  );

  const handleCancelReply = useCallback(() => {
    setReplyingToMessage(null);
  }, []);

  // ─── Create channel handler ───────────────────────────────────────────────
  const handleCreateChannel = useCallback(
    async (channel: {
      name: string;
      description?: string;
      visibility: 'public' | 'private';
      memberIds: string[];
    }) => {
      if (!workspaceId) return;
      try {
        const created = (await createChannelMutation({
          workspaceId: String(workspaceId),
          name: channel.name,
          description: channel.description ?? null,
          visibility: channel.visibility,
          memberIds: channel.memberIds,
        })) as { legacyId?: string } | undefined;
        if (typeof created?.legacyId === 'string') {
          urlState.setChannelId(created.legacyId);
          selectChannel(created.legacyId);
        }
      } catch (error) {
        reportConvexFailure({
          error,
          context: 'CollaborationDashboardV2:handleCreateChannel',
          title: 'Channel creation failed',
          fallbackMessage: 'Unable to create the channel. Please try again.',
        });
      }
    },
    [workspaceId, createChannelMutation, urlState, selectChannel],
  );

  // ─── Start new DM handler ─────────────────────────────────────────────────
  const handleStartNewDM = useCallback(
    async (targetUser: { id: string; name: string; role?: string | null }) => {
      if (!workspaceId) return;
      const result = (await getOrCreateConversation({
        workspaceId: String(workspaceId),
        otherUserId: targetUser.id,
        otherUserName: targetUser.name,
        otherUserRole: targetUser.role ?? null,
      })) as { legacyId?: string } | undefined;
      if (typeof result?.legacyId === 'string') {
        urlState.setConversationLegacyId(result.legacyId);
        selectChannel(null);
      }
      setIsNewDMDialogOpen(false);
    },
    [workspaceId, getOrCreateConversation, urlState, selectChannel],
  );

  // ─── Forward message handler ──────────────────────────────────────────────
  const handleForwardMessage = useCallback(
    (message: UnifiedMessage) => {
      const original = effectiveSelectedChannel
        ? channelMessages.find((m) => m.id === message.id)
        : null;
      if (original) {
        setForwardingMessage(original);
      } else if (selectedConversationLegacyId && selectedDM) {
        const dm = dmMessages.find((m) => m.id === message.id);
        if (dm) {
          setForwardingMessage(directMessageToCollaborationMessage(dm));
        }
      }
    },
    [effectiveSelectedChannel, channelMessages, selectedConversationLegacyId, selectedDM, dmMessages],
  );

  // ─── Share to platform (email) ─────────────────────────────────────────────
  const handleShareToPlatform = useCallback(
    async (message: UnifiedMessage, platform: 'email') => {
      if (platform !== 'email' || !workspaceId) return;
      const channelMessage = channelMessages.find((entry) => entry.id === message.id);
      if (channelMessage) {
        await sendCollaborationEmailCopy(channelMessage, workspaceId);
        return;
      }
      const dm = dmMessages.find((entry) => entry.id === message.id);
      if (!dm) return;
      await sendCollaborationEmailCopy(
        {
          id: dm.id,
          channelType: 'team',
          clientId: null,
          projectId: null,
          content: dm.content,
          senderId: dm.senderId,
          senderName: dm.senderName,
          senderRole: dm.senderRole ?? null,
          createdAt: new Date(dm.createdAtMs).toISOString(),
          updatedAt: null,
          isEdited: Boolean(dm.edited),
          deletedAt: dm.deletedAtMs ? new Date(dm.deletedAtMs).toISOString() : null,
          deletedBy: dm.deletedBy ?? null,
          isDeleted: Boolean(dm.deleted),
        },
        workspaceId,
      );
    },
    [channelMessages, dmMessages, workspaceId, sendCollaborationEmailCopy],
  );

  // ─── Clear thread state when conversation changes ─────────────────────────
  const conversationKey = effectiveSelectedChannel
    ? `channel:${effectiveSelectedChannel.id}`
    : selectedConversationLegacyId
      ? `dm:${selectedConversationLegacyId}`
      : null;

  const lastConversationKeyRef = useRef<string | null>(null);
  useEffect(() => {
    if (lastConversationKeyRef.current === conversationKey) return;
    lastConversationKeyRef.current = conversationKey;
    clearThreadReplies();
    setReplyingToMessage(null);
    setMessageSearchQuery('');
  }, [conversationKey, clearThreadReplies]);

  // ─── Header info (extracted hook) ─────────────────────────────────────────
  const headerInfo = useCollaborationHeaderInfo({
    effectiveSelectedChannel,
    channelParticipants,
    channelMessages,
    channelUnreadCounts,
    handleMarkChannelRead,
    handleExportChannel,
    urlState,
    selectedDM,
    workspaceId,
    archiveConversation,
    muteConversation,
  });

  // ─── List state ───────────────────────────────────────────────────────────
  const listState: MessagePaneListState = {
    loading: effectiveSelectedChannel ? channelMessagesLoading : dmMessagesLoading,
    loadingMore: effectiveSelectedChannel
      ? channelMessagesLoadingMore
      : dmMessagesLoadingMore,
    hasMore: effectiveSelectedChannel ? channelMessagesHasMore : dmMessagesHasMore,
  };

  // ─── Loading state ────────────────────────────────────────────────────────
  const isLoading = clientsLoading || projectsLoading || dmsLoading;

  // ─── Render ───────────────────────────────────────────────────────────────
  return (
    <div className="flex h-full min-h-0 w-full flex-col lg:flex-row">
      <ConversationListPane
        channelCount={channels.length}
        dmCount={dmConversations.length}
        filteredItems={inboxItems}
        isLoading={isLoading}
        selectedKey={selectedInboxKey}
        onSelectItem={handleSelectItem}
        onSearchQueryChange={setInboxSearchQuery}
        onSourceFilterChange={setSourceFilter}
        searchQuery={inboxSearchQuery}
        sourceFilter={sourceFilter}
        totalUnread={totalUnread}
        onNewDM={() => setIsNewDMDialogOpen(true)}
        createChannelProps={
          isAdmin
            ? {
                workspaceId,
                userId: currentUserId,
                teamMembers: workspaceMembers,
                onCreate: handleCreateChannel,
              }
            : undefined
        }
        crossChannelSearchSlot={
          currentUserRole !== 'client' ? (
            <CrossChannelSearch
              onSearch={searchAcrossChannels}
              onResultClick={handleSearchResultClick}
            />
          ) : null
        }
      />

      <CollaborationMessagePane
        headerInfo={headerInfo}
        unifiedMessages={unifiedMessages}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        listState={listState}
        sending={sending}
        uploadingAttachments={uploadingAttachments}
        pendingAttachments={pendingAttachments}
        messageSearchQuery={messageSearchQuery}
        onMessageSearchChange={setMessageSearchQuery}
        searchHighlights={searchHighlights}
        messageInput={messageInput}
        onMessageInputChange={handleMessageInputChange}
        onSendMessage={handleSendMessage}
        onAddAttachments={handleAddAttachments}
        onRemoveAttachment={handleRemoveAttachment}
        onToggleReaction={handleToggleReaction}
        onEditMessage={handleEditMessage}
        onDeleteMessage={handleDeleteMessage}
        onReply={handleReply}
        replyingToMessage={replyingToMessage}
        onCancelReply={handleCancelReply}
        onForwardMessage={handleForwardMessage}
        onShareToPlatform={handleShareToPlatform}
        onCreateTask={handleCreateTask}
        onCreatePoll={handleCreatePoll}
        onComposerFocus={handleComposerFocus}
        onComposerBlur={handleComposerBlur}
        workspaceId={workspaceId}
        typingIndicator={typingIndicator}
        channelMessages={effectiveSelectedChannel ? channelMessages : undefined}
        threadMessagesByRootId={threadMessagesByRootId}
        threadNextCursorByRootId={threadNextCursorByRootId}
        threadLoadingByRootId={threadLoadingByRootId}
        threadErrorsByRootId={threadErrorsByRootId}
        focusMessageId={urlState.deepLinkMessageId ?? null}
        focusThreadId={urlState.deepLinkThreadId ?? null}
        onLoadThreadReplies={loadThreadReplies}
        onLoadMoreThreadReplies={loadMoreThreadReplies}
        onMarkThreadAsRead={handleMarkThreadAsRead}
        participants={channelParticipants}
        effectiveSelectedChannel={effectiveSelectedChannel}
        loadMoreChannelMessages={loadMoreChannelMessages}
        loadMoreDmMessages={loadMoreDmMessages}
      />

      <CollaborationDashboardDialogs
        isNewDMDialogOpen={isNewDMDialogOpen}
        setIsNewDMDialogOpen={setIsNewDMDialogOpen}
        onUserSelect={handleStartNewDM}
        workspaceId={workspaceId}
        currentUserId={currentUserId}
        currentUserRole={currentUserRole}
        forwardingMessage={forwardingMessage}
        setForwardingMessage={setForwardingMessage}
        channels={channels}
        taskModal={taskModal}
        channelExtrasForwardDialog={channelExtrasForwardDialog}
      />
    </div>
  );
}
