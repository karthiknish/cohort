'use client'

import type { ReactNode } from 'react'

import {
  useUnifiedMessagePaneMessageSearch,
  type UseUnifiedMessagePaneSearchParams,
} from './unified-message-pane-layout-hooks'

export type UnifiedMessagePaneMessageSearchApi = ReturnType<typeof useUnifiedMessagePaneMessageSearch>

/** Remount with `key={conversationKey}` so search UI resets when the conversation changes. */
export function UnifiedMessagePaneMessageSearchBindings({
  children,
  ...searchParams
}: UseUnifiedMessagePaneSearchParams & {
  children: (search: UnifiedMessagePaneMessageSearchApi) => ReactNode
}) {
  const search = useUnifiedMessagePaneMessageSearch(searchParams)
  return <>{children(search)}</>
}
