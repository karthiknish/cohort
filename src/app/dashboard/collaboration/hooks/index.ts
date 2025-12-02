// Collaboration hooks barrel file
export { useCollaborationData } from './use-collaboration-data'
export { useRealtimeMessages, useRealtimeTyping } from './use-realtime'
export { useMessageActions } from './use-message-actions'
export { useSendMessage, useFetchMessages } from './use-messages'
export { useTyping } from './use-typing'
export { useAttachments } from './use-attachments'
export { useThreads } from './use-threads'

// Export types
export type {
  ChannelSummary,
  PendingAttachment,
  ThreadMessagesState,
  ThreadCursorsState,
  ThreadLoadingState,
  ThreadErrorsState,
  ReactionPendingState,
  MessagesByChannelState,
  CursorsByChannelState,
  TypingParticipant,
  AttachmentValidationResult,
  SendMessageOptions,
  UseCollaborationDataReturn,
} from './types'

// Export constants
export {
  MAX_ATTACHMENTS,
  MAX_ATTACHMENT_SIZE,
  ALLOWED_ATTACHMENT_EXTENSIONS,
  ALLOWED_ATTACHMENT_MIME_TYPES,
  TYPING_TIMEOUT_MS,
  TYPING_UPDATE_INTERVAL_MS,
  THREAD_PAGE_SIZE,
  MESSAGE_PAGE_SIZE,
  REALTIME_MESSAGE_LIMIT,
} from './constants'

// Export utilities
export {
  readSessionTokenCookie,
  formatFileSize,
  validateAttachment,
  validateAttachments,
  convertToIso,
  parseChannelType,
  parseMessageFormat,
  sanitizeAttachment,
  sanitizeMention,
  sanitizeReaction,
  mapRealtimeMessage,
} from './utils'
