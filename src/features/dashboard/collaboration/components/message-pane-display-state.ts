export type CollaborationMessageDisplayState = {
  isReply?: boolean
  isSearchResult?: boolean
  showAvatar?: boolean
  showHeader?: boolean
}

export const SEARCH_THREAD_REPLY_DISPLAY: CollaborationMessageDisplayState = {
  isReply: true,
  showAvatar: true,
  showHeader: true,
}

export const COLLABORATION_MESSAGE_GROUP_HEADER_DISPLAY: CollaborationMessageDisplayState = {
  showAvatar: true,
  showHeader: true,
}

export const COLLABORATION_MESSAGE_GROUP_CONTINUATION_DISPLAY: CollaborationMessageDisplayState = {
  showAvatar: false,
  showHeader: false,
}
