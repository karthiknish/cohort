'use client'

import { memo } from 'react'
import type { CollaborationMessage } from '@/types/collaboration'

export interface MemoizedMessageItemProps {
  message: CollaborationMessage
  index: number
  children: (message: CollaborationMessage, index: number) => React.ReactNode
}

export function MemoizedMessageItem({
  message,
  index,
  children,
}: MemoizedMessageItemProps) {
  return <>{children(message, index)}</>
}

export const VirtualizedMessageItem = memo(MemoizedMessageItem, (prevProps, nextProps) => {
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.updatedAt === nextProps.message.updatedAt &&
    prevProps.message.isEdited === nextProps.message.isEdited &&
    prevProps.index === nextProps.index
  )
})
