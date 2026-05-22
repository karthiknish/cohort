'use client'

import { createElement, type ComponentType, type ReactNode } from 'react'

import type { UnifiedMessage } from './message-list-types'

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
