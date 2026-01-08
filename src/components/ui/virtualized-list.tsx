'use client'

import { useRef, useCallback, type ReactNode } from 'react'
import { useVirtualizer } from '@tanstack/react-virtual'
import { cn } from '@/lib/utils'

export interface VirtualizedListProps<T> {
    /** Array of items to render */
    items: T[]
    /** Estimated height of each item in pixels */
    estimateSize: number
    /** Function to render each item */
    renderItem: (item: T, index: number) => ReactNode
    /** Optional function to get a unique key for each item */
    getItemKey?: (item: T, index: number) => string | number
    /** Height of the container (default: 400px) */
    height?: number | string
    /** Additional className for the container */
    className?: string
    /** Overscan count - number of items to render outside visible area (default: 5) */
    overscan?: number
    /** Gap between items in pixels (default: 0) */
    gap?: number
    /** Called when scrolling near the end (for infinite loading) */
    onEndReached?: () => void
    /** Threshold for onEndReached in pixels from bottom (default: 200) */
    endReachedThreshold?: number
    /** Whether the list is loading more items */
    isLoadingMore?: boolean
    /** Render function for loading indicator */
    renderLoadingIndicator?: () => ReactNode
}

export function VirtualizedList<T>({
    items,
    estimateSize,
    renderItem,
    getItemKey,
    height = 400,
    className,
    overscan = 5,
    gap = 0,
    onEndReached,
    endReachedThreshold = 200,
    isLoadingMore,
    renderLoadingIndicator,
}: VirtualizedListProps<T>) {
    const parentRef = useRef<HTMLDivElement>(null)
    const hasCalledEndReached = useRef(false)

    const virtualizer = useVirtualizer({
        count: items.length,
        getScrollElement: () => parentRef.current,
        estimateSize: () => estimateSize,
        overscan,
        gap,
        getItemKey: getItemKey ? (index) => getItemKey(items[index], index) : undefined,
    })

    const virtualItems = virtualizer.getVirtualItems()

    // Handle scroll for infinite loading
    const handleScroll = useCallback(() => {
        if (!onEndReached || isLoadingMore || hasCalledEndReached.current) return

        const container = parentRef.current
        if (!container) return

        const { scrollTop, scrollHeight, clientHeight } = container
        const distanceFromBottom = scrollHeight - scrollTop - clientHeight

        if (distanceFromBottom < endReachedThreshold) {
            hasCalledEndReached.current = true
            onEndReached()
            // Reset after a short delay to allow re-triggering
            setTimeout(() => {
                hasCalledEndReached.current = false
            }, 1000)
        }
    }, [onEndReached, isLoadingMore, endReachedThreshold])

    return (
        <div
            ref={parentRef}
            className={cn('overflow-auto', className)}
            style={{ height: typeof height === 'number' ? `${height}px` : height }}
            onScroll={handleScroll}
        >
            <div
                style={{
                    height: `${virtualizer.getTotalSize()}px`,
                    width: '100%',
                    position: 'relative',
                }}
            >
                {virtualItems.map((virtualItem) => {
                    const item = items[virtualItem.index]
                    return (
                        <div
                            key={virtualItem.key}
                            data-index={virtualItem.index}
                            ref={virtualizer.measureElement}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                width: '100%',
                                transform: `translateY(${virtualItem.start}px)`,
                            }}
                        >
                            {renderItem(item, virtualItem.index)}
                        </div>
                    )
                })}
            </div>
            {isLoadingMore && renderLoadingIndicator && (
                <div className="py-4">{renderLoadingIndicator()}</div>
            )}
        </div>
    )
}

export interface VirtualizedListWithHeaderProps<T> extends VirtualizedListProps<T> {
    /** Header content to render above the list */
    header?: ReactNode
    /** Footer content to render below the list */
    footer?: ReactNode
}

export function VirtualizedListWithHeader<T>({
    header,
    footer,
    ...props
}: VirtualizedListWithHeaderProps<T>) {
    return (
        <div className="flex flex-col" style={{ height: props.height }}>
            {header}
            <VirtualizedList {...props} height="100%" className={cn('flex-1', props.className)} />
            {footer}
        </div>
    )
}
