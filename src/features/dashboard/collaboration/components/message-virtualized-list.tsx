'use client'
'use no memo'

import { useRef, useCallback, useMemo } from 'react'
import type { CollaborationMessage } from '@/types/collaboration'
import { cn } from '@/lib/utils'
import { VirtualizedMessageItem } from './virtualized-message-item'

export { ChunkedMessageList } from './chunked-message-list'
export { VirtualizedMessageItem, MemoizedMessageItem } from './virtualized-message-item'
export type { MemoizedMessageItemProps } from './virtualized-message-item'
export { useMessageListRendering } from './use-message-list-rendering'

interface VirtualizedMessageListProps {
  messages: CollaborationMessage[]
  renderItem: (message: CollaborationMessage, index: number) => React.ReactNode
  estimateSize?: () => number
  overscan?: number
  className?: string
  loadMore?: () => void
  hasMore?: boolean
  isLoadingMore?: boolean
}

/**
 * Virtualized list for efficient rendering of large message lists
 * Uses @tanstack/react-virtual for windowing
 */
export function VirtualizedMessageList({
  messages,
  renderItem,
  estimateSize = () => 100,
  overscan = 5,
  className,
  loadMore,
  hasMore = false,
  isLoadingMore = false,
}: VirtualizedMessageListProps) {
  'use no memo'

  const containerRef = useRef<HTMLDivElement>(null)
  const estimatedRowHeight = estimateSize()
  const rowSpacing = Math.max(overscan - 1, 0)
  const totalMinHeight = Math.max(messages.length * estimatedRowHeight + Math.max(messages.length - 1, 0) * rowSpacing, 0)
  const containerStyle = useMemo(() => ({ contain: 'strict' as const }), [])
  const contentStyle = useMemo(
    () => ({
      display: 'flex',
      flexDirection: 'column' as const,
      gap: `${rowSpacing}px`,
      minHeight: `${totalMinHeight}px`,
      width: '100%',
    }),
    [rowSpacing, totalMinHeight]
  )

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement
      const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight

      if (scrollBottom < 200 && hasMore && !isLoadingMore && loadMore) {
        loadMore()
      }
    },
    [hasMore, isLoadingMore, loadMore]
  )

  return (
    <div
      ref={containerRef}
      className={cn('overflow-y-auto', className)}
      onScroll={handleScroll}
      style={containerStyle}
    >
      <div style={contentStyle}>
        {messages.map((message, index) => {
          if (!message) return null

          return (
            <div key={message.id} data-index={index}>
              <VirtualizedMessageItem message={message} index={index}>
                {renderItem}
              </VirtualizedMessageItem>
            </div>
          )
        })}
      </div>

      {isLoadingMore && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading more messages…
          </div>
        </div>
      )}
    </div>
  )
}
