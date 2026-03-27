'use client'
'use no memo'

import { useCallback, useMemo, useRef, type ReactNode } from 'react'
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
    gap = 0,
    onEndReached,
    endReachedThreshold = 200,
    isLoadingMore,
    renderLoadingIndicator,
}: VirtualizedListProps<T>) {
    'use no memo'

    const parentRef = useRef<HTMLDivElement>(null)
    const hasCalledEndReached = useRef(false)

    const totalMinHeight = Math.max(items.length * estimateSize + Math.max(items.length - 1, 0) * gap, 0)
    const containerStyle = useMemo(
        () => ({ height: typeof height === 'number' ? `${height}px` : height }),
        [height]
    )
    const contentStyle = useMemo(
        () => ({
            minHeight: `${totalMinHeight}px`,
            width: '100%',
        }),
        [totalMinHeight]
    )

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
            style={containerStyle}
            onScroll={handleScroll}
        >
            <div style={contentStyle}>
                {items.map((item, index) => {
                    const key = getItemKey ? getItemKey(item, index) : index
                    return (
                        <VirtualizedListRow
                            key={key}
                            gap={gap}
                            index={index}
                            itemsLength={items.length}
                            renderItem={renderItem}
                            value={item}
                        >
                        </VirtualizedListRow>
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
    const headerContainerStyle = useMemo(() => ({ height: props.height }), [props.height])

    return (
        <div className="flex flex-col" style={headerContainerStyle}>
            {header}
            <VirtualizedList {...props} height="100%" className={cn('flex-1', props.className)} />
            {footer}
        </div>
    )
}

function VirtualizedListRow<T>({
    gap,
    index,
    itemsLength,
    renderItem,
    value,
}: {
    gap: number
    index: number
    itemsLength: number
    renderItem: (item: T, index: number) => ReactNode
    value: T
}) {
    const rowStyle = useMemo(
        () => ({
            marginBottom: index === itemsLength - 1 ? 0 : gap,
        }),
        [gap, index, itemsLength]
    )

    return (
        <div data-index={index} style={rowStyle}>
            {renderItem(value, index)}
        </div>
    )
}
