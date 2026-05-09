'use client'

import { type ReactNode, createContext, use } from 'react'

import type { UnifiedMessage } from './message-list'

export type MessageListRenderers = {
  renderMessageExtras?: (message: UnifiedMessage) => ReactNode
  renderMessageActions?: (message: UnifiedMessage) => ReactNode
  renderMessageContent?: (message: UnifiedMessage) => ReactNode
  renderMessageAttachments?: (message: UnifiedMessage) => ReactNode
  renderMessageFooter?: (message: UnifiedMessage) => ReactNode
  renderThreadSection?: (message: UnifiedMessage) => ReactNode
  renderEditForm?: (message: UnifiedMessage) => ReactNode
  renderDeletedInfo?: (message: UnifiedMessage) => ReactNode
  renderMessageWrapper?: (message: UnifiedMessage, children: ReactNode) => ReactNode
}

const MessageListRenderContext = createContext<MessageListRenderers | null>(null)

export function MessageListRenderProvider({
  children,
  value,
}: {
  children: ReactNode
  value: MessageListRenderers
}) {
  return (
    <MessageListRenderContext.Provider value={value}>
      {children}
    </MessageListRenderContext.Provider>
  )
}

export function useMessageListRenderContext() {
  return use(MessageListRenderContext)
}