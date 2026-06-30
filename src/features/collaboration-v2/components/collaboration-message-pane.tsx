'use client';

import { UnifiedMessagePane } from '@/features/dashboard/collaboration/components/unified-message-pane';
import type { MessagePaneHeaderInfo } from '@/features/dashboard/collaboration/components/unified-message-pane-types';
import type { MessagePaneListState } from '@/features/dashboard/collaboration/components/unified-message-pane-layout';
import { EmptyChannelState, EmptyMessagesState } from '@/features/dashboard/collaboration/components/message-pane-parts';
import type { PendingAttachment, SendMessageOptions } from '@/features/dashboard/collaboration/hooks/types';
import type { UnifiedMessage } from '@/features/dashboard/collaboration/components/message-list-types';
import type { CollaborationMessage } from '@/types/collaboration';
import type { ClientTeamMember } from '@/types/clients';
import type { MessagePoll } from '@/features/dashboard/collaboration/components/message-polls';

export type CollaborationMessagePaneProps = {
  headerInfo: MessagePaneHeaderInfo | null;
  unifiedMessages: UnifiedMessage[];
  currentUserId: string | null;
  currentUserRole: string | null;
  listState: MessagePaneListState;
  sending: boolean;
  uploadingAttachments: boolean;
  pendingAttachments: PendingAttachment[];
  messageSearchQuery: string;
  onMessageSearchChange: (value: string) => void;
  searchHighlights: string[];
  messageInput: string;
  onMessageInputChange: (value: string) => void;
  onSendMessage: (options?: SendMessageOptions) => Promise<void>;
  onAddAttachments: (files: FileList | File[]) => void;
  onRemoveAttachment: (attachmentId: string) => void;
  onToggleReaction: (messageId: string, emoji: string) => Promise<void>;
  onEditMessage: (messageId: string, newContent: string) => Promise<void>;
  onDeleteMessage: (messageId: string) => Promise<void>;
  onReply: (message: UnifiedMessage) => void;
  replyingToMessage: CollaborationMessage | null;
  onCancelReply: () => void;
  onForwardMessage: (message: UnifiedMessage) => void;
  onShareToPlatform: (message: UnifiedMessage, platform: 'email') => Promise<void>;
  onCreateTask: (message: UnifiedMessage) => void;
  onCreatePoll: (poll: Omit<MessagePoll, 'id' | 'createdAt'>) => Promise<void>;
  onComposerFocus: () => void;
  onComposerBlur: () => void;
  workspaceId: string | null;
  typingIndicator: string;
  channelMessages: CollaborationMessage[] | undefined;
  threadMessagesByRootId: Record<string, CollaborationMessage[]>;
  threadNextCursorByRootId: Record<string, string | null>;
  threadLoadingByRootId: Record<string, boolean>;
  threadErrorsByRootId: Record<string, string | null>;
  focusMessageId: string | null;
  focusThreadId: string | null;
  onLoadThreadReplies: (threadRootId: string) => void;
  onLoadMoreThreadReplies: (threadRootId: string) => void;
  onMarkThreadAsRead: (threadRootId: string) => Promise<void>;
  participants: ClientTeamMember[];
  effectiveSelectedChannel: { id: string } | null;
  loadMoreChannelMessages: () => void;
  loadMoreDmMessages: () => void;
};

export function CollaborationMessagePane(props: CollaborationMessagePaneProps) {
  const handleLoadMore = () => {
    if (props.effectiveSelectedChannel) {
      props.loadMoreChannelMessages();
    } else {
      props.loadMoreDmMessages();
    }
  };

  return (
    <div className="flex min-h-0 flex-1 flex-col">
      {props.headerInfo ? (
        <UnifiedMessagePane
          header={props.headerInfo}
          messages={props.unifiedMessages}
          currentUserId={props.currentUserId}
          currentUserRole={props.currentUserRole}
          listState={props.listState}
          composerState={{
            sending: props.sending,
            uploadingAttachments: props.uploadingAttachments,
            pendingAttachments: props.pendingAttachments.length > 0,
          }}
          onLoadMore={handleLoadMore}
          messageSearchQuery={props.messageSearchQuery}
          onMessageSearchChange={props.onMessageSearchChange}
          messageSearchHighlights={props.searchHighlights}
          messageInput={props.messageInput}
          onMessageInputChange={props.onMessageInputChange}
          onSendMessage={props.onSendMessage}
          pendingAttachments={props.pendingAttachments}
          onAddAttachments={props.onAddAttachments}
          onRemoveAttachment={props.onRemoveAttachment}
          onToggleReaction={props.onToggleReaction}
          onEditMessage={props.onEditMessage}
          onDeleteMessage={props.onDeleteMessage}
          onReply={props.onReply}
          replyingToMessage={props.replyingToMessage}
          onCancelReply={props.onCancelReply}
          onForwardMessage={props.onForwardMessage}
          onShareToPlatform={props.onShareToPlatform}
          onCreateTask={props.onCreateTask}
          onCreatePoll={props.onCreatePoll}
          onComposerFocus={props.onComposerFocus}
          onComposerBlur={props.onComposerBlur}
          workspaceId={props.workspaceId}
          typingIndicator={props.typingIndicator}
          channelMessages={props.channelMessages}
          threadMessagesByRootId={props.threadMessagesByRootId}
          threadNextCursorByRootId={props.threadNextCursorByRootId}
          threadLoadingByRootId={props.threadLoadingByRootId}
          threadErrorsByRootId={props.threadErrorsByRootId}
          threadUnreadCountsByRootId={{}}
          focusMessageId={props.focusMessageId}
          focusThreadId={props.focusThreadId}
          onLoadThreadReplies={props.onLoadThreadReplies}
          onLoadMoreThreadReplies={props.onLoadMoreThreadReplies}
          onMarkThreadAsRead={props.onMarkThreadAsRead}
          participants={props.participants}
          emptyState={<EmptyMessagesState />}
        />
      ) : (
        <EmptyChannelState />
      )}
    </div>
  );
}
