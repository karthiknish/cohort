'use client';

import { useState } from 'react';
import { useCollaborationDashboard } from '@/features/dashboard/collaboration/components/collaboration-dashboard-provider';
import { useCollaborationData } from '@/features/dashboard/collaboration/hooks/use-collaboration-data';
import { useDirectMessages } from '@/features/dashboard/collaboration/hooks/use-direct-messages';
import { useAuth } from '@/shared/contexts/auth-context';
import { useClientContext } from '@/shared/contexts/client-context';
import { usePreview } from '@/shared/contexts/preview-context';
import { useProjectsData } from '@/features/dashboard/collaboration/hooks/use-projects-data';
import { useChannelsData } from '@/features/dashboard/collaboration/hooks/use-channels-data';
import { useAttachmentsData } from '@/features/dashboard/collaboration/hooks/use-attachments-data';
import { useMessagesData } from '@/features/dashboard/collaboration/hooks/use-messages-data';
import { useChannelMessageSearch } from '@/features/dashboard/collaboration/hooks/use-channel-message-search';
import { useTyping } from '@/features/dashboard/collaboration/hooks/use-typing';
import { useThreads } from '@/features/dashboard/collaboration/hooks/use-threads';
import { useMessageActions } from '@/features/dashboard/collaboration/hooks/use-message-actions';
import { useRealtimeChannelSnapshot, useRealtimeTyping } from '@/features/dashboard/collaboration/hooks/use-realtime';
import { useChannelReadReceipts } from '@/features/dashboard/collaboration/hooks/use-channel-read-receipts';
import { useCollaborationExternalNotify } from '@/features/dashboard/collaboration/hooks/use-collaboration-external-notify';
import { useChannelMessageSend } from '@/features/dashboard/collaboration/hooks/use-channel-message-send';
import { useChannelMessagesQuery } from '@/features/dashboard/collaboration/hooks/use-channel-messages-query';
import { useQuery, useConvex } from 'convex/react';
import { collaborationChannelsApi, collaborationChannelAvatarsApi, collaborationApi } from '@/lib/convex-api';
import { getPreviewCollaborationMessages } from '@/lib/preview-data';
import type { Channel } from '@/features/dashboard/collaboration/types';
import type { ClientTeamMember } from '@/types/clients';
import type { CollaborationMessage } from '@/types/collaboration';

// Shared helper to build the base data needed by all sub-steps
function useBaseData() {
  const { user } = useAuth();
  const { clients, selectedClient } = useClientContext();
  const { isPreviewMode } = usePreview();
  const workspaceId = user?.agencyId ? String(user.agencyId) : null;
  const userId = user?.id ?? null;
  const selectedClientId = selectedClient?.id ?? null;
  const fallbackDisplayName = user?.name?.trim() || 'You';
  const fallbackRole = user?.role ?? 'Account Owner';
  const { projects } = useProjectsData({ workspaceId, userId, selectedClientId, isPreviewMode });
  const customChannelsResult = useQuery(collaborationChannelsApi.listAccessible,
    !isPreviewMode && workspaceId ? { workspaceId: String(workspaceId), channelType: 'team' } : 'skip');
  const channelsData = useChannelsData({
    clients,
    projects,
    customChannels: (customChannelsResult ?? []).map((c: any) => ({
      legacyId: c.legacyId, name: c.name, description: c.description,
      visibility: c.visibility, memberIds: c.memberIds, memberSummaries: c.memberSummaries,
    })),
    fallbackDisplayName, fallbackRole, visibleClientId: selectedClient?.id ?? null,
  });
  const attachments = useAttachmentsData({ userId, workspaceId });
  return {
    workspaceId, currentUserId: userId, fallbackDisplayName, fallbackRole,
    isPreviewMode, channels: channelsData.channels, selectedChannel: channelsData.selectedChannel,
    channelParticipants: channelsData.channelParticipants,
    pendingAttachments: attachments.pendingAttachments, uploading: attachments.uploading,
    clearAttachments: attachments.clearAttachments, uploadAttachments: attachments.uploadAttachments,
  };
}

// 3e.0: just useMessagesData state setup (no sub-hooks)
function Step3e0() {
  const base = useBaseData();
  return <div>Step 3e.0 - Base: channels={base.channels.length} selected={base.selectedChannel?.id ?? 'none'}</div>;
}

// 3e.1: + unreadCountsResult query
function Step3e1() {
  const base = useBaseData();
  const { isPreviewMode, workspaceId, currentUserId } = base;
  const unreadCountsResult = useQuery(collaborationApi.getUnreadCountsByChannel,
    !isPreviewMode && workspaceId && currentUserId
      ? { workspaceId: String(workspaceId), userId: String(currentUserId) }
      : 'skip');
  return <div>Step 3e.1 - +unreadCounts: {unreadCountsResult === undefined ? 'loading' : 'loaded'}</div>;
}

// 3e.2: + threadUnreadCountsResult query
function Step3e2() {
  const base = useBaseData();
  const { isPreviewMode, workspaceId, currentUserId, selectedChannel } = base;
  const unreadCountsResult = useQuery(collaborationApi.getUnreadCountsByChannel,
    !isPreviewMode && workspaceId && currentUserId
      ? { workspaceId: String(workspaceId), userId: String(currentUserId) }
      : 'skip');
  const threadUnreadCountsResult = useQuery(collaborationApi.getThreadUnreadCounts,
    !isPreviewMode && workspaceId && currentUserId && selectedChannel
      ? { workspaceId: String(workspaceId), channelId: null, channelType: selectedChannel.type,
          clientId: null, projectId: null, threadRootIds: [], userId: String(currentUserId) }
      : 'skip');
  return <div>Step 3e.2 - +threadUnread: {threadUnreadCountsResult === undefined ? 'loading' : 'loaded'}</div>;
}

// 3e.3: + useChannelMessageSearch
function Step3e3() {
  const base = useBaseData();
  const convex = useConvex();
  const { workspaceId, selectedChannel, isPreviewMode } = base;
  const channelMessages: CollaborationMessage[] = selectedChannel
    ? (isPreviewMode ? getPreviewCollaborationMessages(selectedChannel.type, selectedChannel.clientId ?? null, selectedChannel.projectId ?? null, base.currentUserId) : [])
    : [];
  const search = useChannelMessageSearch({
    convex, workspaceId, selectedChannel, channelMessages,
    messagesByChannel: {}, messageSearchQuery: '', isPreviewMode,
  });
  return <div>Step 3e.3 - +search: visible={search.visibleMessages.length}</div>;
}

// 3e.4: + useTyping
function Step3e4() {
  const base = useBaseData();
  const { workspaceId, selectedChannel, fallbackDisplayName, fallbackRole } = base;
  const participantNameMap = new Map(base.channelParticipants.map((p) => [p.name.toLowerCase(), p]));
  const resolveSenderDetails = () => {
    const participant = participantNameMap.get(fallbackDisplayName.toLowerCase());
    return { senderName: fallbackDisplayName, senderRole: participant?.role ?? fallbackRole };
  };
  const typing = useTyping({ workspaceId, selectedChannel, resolveSenderDetails });
  return <div>Step 3e.4 - +typing: ok</div>;
}

// 3e.5: + useThreads
function Step3e5() {
  const base = useBaseData();
  const { workspaceId, currentUserId } = base;
  const threads = useThreads({ workspaceId, currentUserId });
  return <div>Step 3e.5 - +threads: active={threads.threadMessagesByRootId === undefined ? 'undef' : Object.keys(threads.threadMessagesByRootId).length}</div>;
}

// 3e.6: + useMessageActions
function Step3e6() {
  const base = useBaseData();
  const { workspaceId, currentUserId, isPreviewMode, channels, channelParticipants } = base;
  const mutateChannelMessages = (_channelId: string, _updater: (m: CollaborationMessage[]) => CollaborationMessage[]) => {};
  const mutateThreadMessageById = (_id: string, _updater: (m: CollaborationMessage) => CollaborationMessage) => {};
  const actions = useMessageActions({
    workspaceId, userId: currentUserId, isPreviewMode, channels, channelParticipants,
    mutateChannelMessages, mutateThreadMessageById,
  });
  return <div>Step 3e.6 - +messageActions: updating={actions.messageUpdatingId ?? 'none'}</div>;
}

// 3e.7: + useRealtimeChannelSnapshot
function Step3e7() {
  const base = useBaseData();
  const { workspaceId, selectedChannel, currentUserId } = base;
  const snapshot = useRealtimeChannelSnapshot({
    workspaceId, selectedChannel, currentUserId, channelListRetryNonce: 0,
  });
  return <div>Step 3e.7 - +realtimeSnapshot: kind={snapshot.kind}</div>;
}

// 3e.8: + useRealtimeTyping
function Step3e8() {
  const base = useBaseData();
  const { workspaceId, selectedChannel, currentUserId } = base;
  const snapshot = useRealtimeChannelSnapshot({
    workspaceId, selectedChannel, currentUserId, channelListRetryNonce: 0,
  });
  const typing = useRealtimeTyping({ userId: currentUserId, workspaceId, selectedChannel });
  return <div>Step 3e.8 - +realtimeTyping: kind={snapshot.kind} typing={typing.typingParticipants.length}</div>;
}

// 3e.9: + useChannelReadReceipts
function Step3e9() {
  const base = useBaseData();
  const { workspaceId, currentUserId, selectedChannel, isPreviewMode } = base;
  const channelMessages: CollaborationMessage[] = [];
  const mutateChannelMessages = (_channelId: string, _updater: (m: CollaborationMessage[]) => CollaborationMessage[]) => {};
  const receipts = useChannelReadReceipts({
    workspaceId, currentUserId, selectedChannel, channelMessages, isPreviewMode, mutateChannelMessages,
  });
  return <div>Step 3e.9 - +readReceipts: pending={String(receipts.markChannelReadPending)}</div>;
}

// 3e.10: + useCollaborationExternalNotify
function Step3e10() {
  const base = useBaseData();
  const notify = useCollaborationExternalNotify();
  return <div>Step 3e.10 - +externalNotify: ok={typeof notify.sendCollaborationEmailCopy}</div>;
}

// 3e.11: + useChannelMessageSend
function Step3e11() {
  const base = useBaseData();
  const { workspaceId, currentUserId, selectedChannel, channels, channelParticipants,
    fallbackDisplayName, fallbackRole, pendingAttachments, uploading,
    clearAttachments, uploadAttachments, isPreviewMode } = base;
  const stopTyping = () => {};
  const mutateChannelMessages = (_channelId: string, _updater: (m: CollaborationMessage[]) => CollaborationMessage[]) => {};
  const addThreadReplyToState = (_rootId: string, _message: CollaborationMessage) => {};
  const sendCollaborationEmailCopy = async () => {};
  const send = useChannelMessageSend({
    workspaceId, currentUserId, selectedChannel, channels, channelParticipants,
    fallbackDisplayName, fallbackRole, messageInput: '',
    setMessageInput: () => {}, pendingAttachments, uploading, clearAttachments,
    uploadAttachments, isPreviewMode, stopTyping, mutateChannelMessages,
    addThreadReplyToState, sendToExternalPlatforms: sendCollaborationEmailCopy,
  } as any);
  return <div>Step 3e.11 - +messageSend: sending={String(send.sending)}</div>;
}

// 3e.12: + useChannelMessagesQuery
function Step3e12() {
  const base = useBaseData();
  const convex = useConvex();
  const { workspaceId, channels, isPreviewMode } = base;
  const setLoadingMoreChannelId = (_id: string | null) => {};
  const mutateChannelMessages = (_channelId: string, _updater: (m: CollaborationMessage[]) => CollaborationMessage[]) => {};
  const setNextCursorByChannel = (_action: any) => {};
  const query = useChannelMessagesQuery({
    convex, workspaceId, channels, isPreviewMode, nextCursorByChannel: {},
    setLoadingMoreChannelId, mutateChannelMessages, setNextCursorByChannel,
  });
  return <div>Step 3e.12 - +messagesQuery: ok</div>;
}

// 3e.full: full useMessagesData
function Step3eFull() {
  const base = useBaseData();
  const messages = useMessagesData({
    workspaceId: base.workspaceId, currentUserId: base.currentUserId,
    selectedChannel: base.selectedChannel, channels: base.channels,
    channelParticipants: base.channelParticipants, fallbackDisplayName: base.fallbackDisplayName,
    fallbackRole: base.fallbackRole, pendingAttachments: base.pendingAttachments,
    uploading: base.uploading, clearAttachments: base.clearAttachments,
    uploadAttachments: base.uploadAttachments,
  });
  return <div>Step 3e.full - useMessagesData: messages={messages.channelMessages.length}</div>;
}

// 3: full useCollaborationData
function Step3CollabData() {
  const data = useCollaborationData();
  return <div>Step 3 - CollabData: channels={data.channels.length} bootstrapping={String(data.isBootstrapping)} selectedChannel={data.selectedChannel?.id ?? 'none'}</div>;
}

function Step4DirectMessages() {
  const { user } = useAuth();
  const workspaceId = user?.agencyId ? String(user.agencyId) : null;
  const currentUserId = user?.id ?? null;
  const currentUserName = user?.name?.trim() || user?.email?.trim() || 'You';
  const currentUserRole = user?.role ?? null;
  const dm = useDirectMessages({ workspaceId, currentUserId, currentUserName, currentUserRole });
  return <div>Step 4 - DMs: conversations={dm.conversations.length} selected={dm.selectedConversation?.legacyId ?? 'none'} loading={String(dm.isLoadingConversations)}</div>;
}

function Step5FullHook() {
  const ctx = useCollaborationDashboard();
  return <div>Step 5 - Full hook: channels={ctx.collab.channels.length} dms={ctx.dm.conversations.length} workspaceId={ctx.workspaceId ?? 'none'}</div>;
}

export default function CollabDebugPage() {
  const [step, setStep] = useState(0);
  const steps = [
    { label: '3e.0 Base', comp: <Step3e0 /> },
    { label: '3e.1 +unread', comp: <Step3e1 /> },
    { label: '3e.2 +threadUnread', comp: <Step3e2 /> },
    { label: '3e.3 +search', comp: <Step3e3 /> },
    { label: '3e.4 +typing', comp: <Step3e4 /> },
    { label: '3e.5 +threads', comp: <Step3e5 /> },
    { label: '3e.6 +msgActions', comp: <Step3e6 /> },
    { label: '3e.7 +rtSnapshot', comp: <Step3e7 /> },
    { label: '3e.8 +rtTyping', comp: <Step3e8 /> },
    { label: '3e.9 +receipts', comp: <Step3e9 /> },
    { label: '3e.10 +extNotify', comp: <Step3e10 /> },
    { label: '3e.11 +msgSend', comp: <Step3e11 /> },
    { label: '3e.12 +msgQuery', comp: <Step3e12 /> },
    { label: '3e.full', comp: <Step3eFull /> },
    { label: '3 Full', comp: <Step3CollabData /> },
    { label: '4 DMs', comp: <Step4DirectMessages /> },
    { label: '5 Full Hook', comp: <Step5FullHook /> },
  ];
  return (
    <div className="p-8 space-y-4">
      <h1 className="text-2xl font-bold">Collab Debug - {steps[step]?.label}</h1>
      <div className="flex gap-2 flex-wrap">
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => setStep(i)}
            className={`px-3 py-1 rounded text-xs ${step === i ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
          >
            {s.label}
          </button>
        ))}
      </div>
      <div className="border p-4 rounded">
        {steps[step]?.comp}
      </div>
    </div>
  );
}
