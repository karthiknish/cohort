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
    renderMessageExtras: renderMessageExtras ?? renderersProp?.renderMessageExtras,
    renderMessageActions: renderMessageActions ?? renderersProp?.renderMessageActions,
    renderMessageAttachments: renderMessageAttachments ?? renderersProp?.renderMessageAttachments,
    renderMessageFooter: renderMessageFooter ?? renderersProp?.renderMessageFooter,
    renderThreadSection: renderThreadSection ?? renderersProp?.renderThreadSection,
    renderEditForm: renderEditForm ?? renderersProp?.renderEditForm,
    renderDeletedInfo: renderDeletedInfo ?? renderersProp?.renderDeletedInfo,
    renderMessageWrapper: renderMessageWrapper ?? renderersProp?.renderMessageWrapper,
  }

  const content = renderMessageContent ?? renderersProp?.renderMessageContent
  if (content) {
    merged.renderMessageContent = isNormalizedMessageContentComponent(content)
      ? content
      : toMessageContentComponent(content)
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

const MESSAGE_CONTENT_COMPONENT_NAME = 'MessageContentComponent'

function isNormalizedMessageContentComponent(
  renderer: ComponentType<{ message: UnifiedMessage }> | ((message: UnifiedMessage) => ReactNode),
): renderer is ComponentType<{ message: UnifiedMessage }> {
  return typeof renderer === 'function' && renderer.name === MESSAGE_CONTENT_COMPONENT_NAME
}

export function toMessageContentComponent(
  renderer: ComponentType<{ message: UnifiedMessage }> | ((message: UnifiedMessage) => ReactNode),
): ComponentType<{ message: UnifiedMessage }> {
  if (isNormalizedMessageContentComponent(renderer)) {
    return renderer
  }

  const usesDirectMessageArg =
    typeof renderer === 'function' &&
    renderer.length === 1 &&
    renderer.name === ''

  return function MessageContentComponent({ message }: { message: UnifiedMessage }) {
    if (usesDirectMessageArg) {
      return (renderer as (msg: UnifiedMessage) => ReactNode)(message)
    }
    return createElement(renderer as unknown as ComponentType<{ message: UnifiedMessage }>, { message })
  }
}
