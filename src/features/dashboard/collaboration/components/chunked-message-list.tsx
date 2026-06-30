'use client';
import { useRef, useCallback, useState, useMemo } from 'react';
import type { CollaborationMessage } from '@/types/collaboration';
import { cn } from '@/lib/utils';
import { VirtualizedMessageItem } from './virtualized-message-item';
/**
 * Simple virtualized list for smaller message sets
 * Renders messages in chunks for better performance
 */
export function ChunkedMessageList({ messages, renderItem, chunkSize = 20, className, }: {
    messages: CollaborationMessage[];
    renderItem: (message: CollaborationMessage, index: number) => React.ReactNode;
    chunkSize?: number;
    className?: string;
}) {
    const [visibleChunks, setVisibleChunks] = useState(1);
    const containerRef = useRef<HTMLDivElement>(null);
    const chunks = (() => {
        const result: CollaborationMessage[][] = [];
        for (let i = 0; i < messages.length; i += chunkSize) {
            result.push(messages.slice(i, i + chunkSize));
        }
        return result;
    })();
    const visibleMessages = chunks.slice(0, visibleChunks).flat();
    const hasMore = visibleChunks < chunks.length;
    const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
        const target = e.target as HTMLDivElement;
        const scrollBottom = target.scrollHeight - target.scrollTop - target.clientHeight;
        if (scrollBottom < 300 && hasMore) {
            setVisibleChunks((prev) => prev + 1);
        }
    };
    return (<div ref={containerRef} className={cn('overflow-y-auto', className)} onScroll={handleScroll}>
      {visibleMessages.map((message, index) => (<VirtualizedMessageItem key={message.id} message={message} index={index}>
          {renderItem}
        </VirtualizedMessageItem>))}

      {hasMore && (<div className="flex items-center justify-center py-4">
          <div className="size-4 animate-spin rounded-full border-2 border-primary border-t-transparent"/>
        </div>)}
    </div>);
}
