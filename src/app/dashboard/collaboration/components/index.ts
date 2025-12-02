// Collaboration components barrel file

// Main components
export { CollaborationDashboard } from './collaboration-dashboard'
export { CollaborationSkeleton } from './collaboration-skeleton'
export { CollaborationMessagePane } from './message-pane'

// Channel components
export { CollaborationChannelList } from './channel-list'
export { CollaborationSidebar } from './sidebar'

// Message components
export { MessageContent } from './message-content'
export { MessageAttachments } from './message-attachments'
export { MessageReactions } from './message-reactions'
export { RichComposer } from './rich-composer'

// Message item parts
export {
  MessageActionsBar,
  ReplyActionsBar,
  MessageEditForm,
  MessageHeader,
  MessageAvatar,
  DeletedMessageInfo,
  DeletingOverlay,
} from './message-item-parts'

// Message pane parts
export {
  MessagePaneHeader,
  MessageSearchBar,
  EmptyChannelState,
  EmptyMessagesState,
  NoSearchResultsState,
  MessagesErrorState,
  DateSeparator,
} from './message-pane-parts'

// Composer components
export {
  SenderSelector,
  PendingAttachmentsList,
  ReplyIndicator,
  MessageComposer,
} from './message-composer'

// Thread components
export {
  ThreadToggleButton,
  ThreadError,
  ThreadLoading,
  ThreadEmptyState,
  ThreadLoadMoreButton,
  ThreadReplyButton,
  StartThreadButton,
  ThreadRetryButton,
  ThreadSection,
} from './thread-section'

// Image components
export { ImageGallery } from './image-gallery'
export { ImagePreviewModal } from './image-preview-modal'
export { ImageUrlPreview } from './image-url-preview'

// Link components
export { LinkPreviewCard } from './link-preview-card'

// Types
export type { CollaborationMessagePaneProps } from './message-pane'
export type { MessageActionsBarProps, ReplyActionsBarProps, MessageEditFormProps, MessageHeaderProps, MessageAvatarProps, DeletedMessageInfoProps, DeletingOverlayProps } from './message-item-parts'
export type { MessagePaneHeaderProps, MessageSearchBarProps, MessagesErrorStateProps, DateSeparatorProps } from './message-pane-parts'
export type { SenderSelectorProps, PendingAttachmentsListProps, ReplyIndicatorProps, MessageComposerProps } from './message-composer'
export type { ThreadToggleButtonProps, ThreadErrorProps, ThreadLoadingProps, ThreadLoadMoreButtonProps, ThreadReplyButtonProps, StartThreadButtonProps, ThreadRetryButtonProps, ThreadSectionProps } from './thread-section'
export type { MessageAttachmentsProps } from './message-attachments'
export type { MessageReactionsProps } from './message-reactions'
