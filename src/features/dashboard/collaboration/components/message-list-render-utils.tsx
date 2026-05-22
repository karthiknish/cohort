'use client'

import { createElement, useMemo, type ComponentType, type ReactNode } from 'react'

import type { MessageListRenderers } from './message-list-render-context'
import type { UnifiedMessage } from './message-list-types'

export type MessageListRendererProps = {
  renderers?: MessageListRenderers
  renderMessageExtras?: (message: UnifiedMessage) => ReactNode
  renderMessageActions?: (message: UnifiedMessage) => ReactNode
  renderMessageContent?: ComponentType<{ message: UnifiedMessage }> | ((message: UnifiedMessage) => ReactNode)
  renderMessageAttachments?: (message: UnifiedMessage) => ReactNode
  renderMessageFooter?: (message: UnifiedMessage) => ReactNode
  renderThreadSection?: (message: UnifiedMessage) => ReactNode
  renderEditForm?: (message: UnifiedMessage) => ReactNode
  renderDeletedInfo?: (message: UnifiedMessage) => ReactNode
  renderMessageWrapper?: (message: UnifiedMessage, children: ReactNode) => ReactNode
}

export function mergeMessageListRenderers({
  renderers: renderersProp,
  renderMessageExtras,
  renderMessageActions,
  renderMessageContent,
  renderMessageAttachments,
  renderMessageFooter,
  renderThreadSection,
  renderEditForm,
  renderDeletedInfo,
  renderMessageWrapper,
}: MessageListRendererProps): MessageListRenderers | undefined {
  const merged: MessageListRenderers = {
    ...renderersProp,
    renderMessageExtras: renderersProp?.renderMessageExtras ?? renderMessageExtras,
    renderMessageActions: renderersProp?.renderMessageActions ?? renderMessageActions,
    renderMessageAttachments: renderersProp?.renderMessageAttachments ?? renderMessageAttachments,
    renderMessageFooter: renderersProp?.renderMessageFooter ?? renderMessageFooter,
    renderThreadSection: renderersProp?.renderThreadSection ?? renderThreadSection,
    renderEditForm: renderersProp?.renderEditForm ?? renderEditForm,
    renderDeletedInfo: renderersProp?.renderDeletedInfo ?? renderDeletedInfo,
    renderMessageWrapper: renderersProp?.renderMessageWrapper ?? renderMessageWrapper,
  }

  const content = renderersProp?.renderMessageContent ?? renderMessageContent
  if (content) {
    merged.renderMessageContent = toMessageContentComponent(content)
  }

  const hasRenderer = Object.values(merged).some((value) => value !== undefined)
  return hasRenderer ? merged : undefined
}

export function useMessageListRenderers({
  renderers: renderersProp,
  renderMessageExtras,
  renderMessageActions,
  renderMessageContent,
  renderMessageAttachments,
  renderMessageFooter,
  renderThreadSection,
  renderEditForm,
  renderDeletedInfo,
  renderMessageWrapper,
}: MessageListRendererProps): MessageListRenderers | undefined {
  return useMemo(
    () =>
      mergeMessageListRenderers({
        renderers: renderersProp,
        renderMessageExtras,
        renderMessageActions,
        renderMessageContent,
        renderMessageAttachments,
        renderMessageFooter,
        renderThreadSection,
        renderEditForm,
        renderDeletedInfo,
        renderMessageWrapper,
      }),
    [
      renderersProp,
      renderMessageExtras,
      renderMessageActions,
      renderMessageContent,
      renderMessageAttachments,
      renderMessageFooter,
      renderThreadSection,
      renderEditForm,
      renderDeletedInfo,
      renderMessageWrapper,
    ],
  )
}

export function toMessageContentComponent(
  renderer: ComponentType<{ message: UnifiedMessage }> | ((message: UnifiedMessage) => ReactNode),
): ComponentType<{ message: UnifiedMessage }> {
  const usesDirectMessageArg =
    typeof renderer === 'function' &&
    renderer.length === 1 &&
    renderer.name === ''

  return function MessageContentComponent({ message }: { message: UnifiedMessage }) {
    if (usesDirectMessageArg) {
      return (renderer as (msg: UnifiedMessage) => ReactNode)(message)
    }
    return createElement(renderer as ComponentType<{ message: UnifiedMessage }>, { message })
  }
}
