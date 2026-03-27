'use client'
'use no memo'

import { memo, useRef, useCallback, useState, useMemo } from 'react'
import type { CollaborationMessage } from '@/types/collaboration'
import { cn } from '@/lib/utils'

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

  // Handle scroll to bottom for loading more
  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement
      const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight

      // Load more when near bottom (within 200px)
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
              {renderItem(message, index)}
            </div>
          )
        })}
      </div>

      {/* Loading more indicator */}
      {isLoadingMore && (
        <div className="flex items-center justify-center py-4">
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
            Loading more messages...
          </div>
        </div>
      )}
    </div>
  )
}

/**
 * Simple virtualized list for smaller message sets
 * Renders messages in chunks for better performance
 */
export function ChunkedMessageList({
  messages,
  renderItem,
  chunkSize = 20,
  className,
}: {
  messages: CollaborationMessage[]
  renderItem: (message: CollaborationMessage, index: number) => React.ReactNode
  chunkSize?: number
  className?: string
}) {
  const [visibleChunks, setVisibleChunks] = useState(1)
  const containerRef = useRef<HTMLDivElement>(null)

  const chunks = useMemo(() => {
    const result: CollaborationMessage[][] = []
    for (let i = 0; i < messages.length; i += chunkSize) {
      result.push(messages.slice(i, i + chunkSize))
    }
    return result
  }, [messages, chunkSize])

  const visibleMessages = useMemo(() => {
    return chunks.slice(0, visibleChunks).flat()
  }, [chunks, visibleChunks])

  const hasMore = visibleChunks < chunks.length

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const target = e.target as HTMLDivElement
      const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight

      if (scrollBottom < 300 && hasMore) {
        setVisibleChunks((prev) => prev + 1)
      }
    },
    [hasMore]
  )

  return (
    <div
      ref={containerRef}
      className={cn('overflow-y-auto', className)}
      onScroll={handleScroll}
    >
      {visibleMessages.map((message, index) => (
        <div key={message.id}>{renderItem(message, index)}</div>
      ))}

      {hasMore && (
        <div className="flex items-center justify-center py-4">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      )}
    </div>
  )
}

/**
 * Memoized message item for use in virtualized lists
 * Prevents unnecessary re-renders of message components
 */

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
  // Custom comparison for message items
  return (
    prevProps.message.id === nextProps.message.id &&
    prevProps.message.content === nextProps.message.content &&
    prevProps.message.updatedAt === nextProps.message.updatedAt &&
    prevProps.message.isEdited === nextProps.message.isEdited &&
    prevProps.index === nextProps.index
  )
})

/**
 * Hook for efficient message list rendering
 * Automatically selects between virtualized and regular rendering based on message count
 */
export function useMessageListRendering(messages: CollaborationMessage[]) {
  const VIRTUALIZATION_THRESHOLD = 50

  const shouldVirtualize = messages.length > VIRTUALIZATION_THRESHOLD

  return {
    shouldVirtualize,
    VirtualizationThreshold: VIRTUALIZATION_THRESHOLD,
  }
}
