'use client'

import { useCollaborationMessagePane } from './use-collaboration-message-pane'

import type { CollaborationMessagePaneProps } from './message-pane-types'

export type { CollaborationMessagePaneProps } from './message-pane-types'

export function CollaborationMessagePane(props: CollaborationMessagePaneProps) {
  return useCollaborationMessagePane(props)
}
