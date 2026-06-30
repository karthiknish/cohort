'use client';
import { ChatTypingIndicator } from '@/shared/ui/chat-typing-indicator';
import { cn } from '@/lib/utils';
import { MessageListLoadMoreButton } from './message-list-sections';
import { MessageListGroupedMessages, type MessageListGroupedMessagesProps, } from './message-list-grouped-messages';
import type { UnifiedMessage } from './message-list-types';
export { MessageListJumpToLatest } from './message-list-jump-to-latest';
type MessageListScrollBodyProps = {
    scrollRef: React.RefObject<HTMLDivElement | null>;
    messagesEndRef: React.RefObject<HTMLDivElement | null>;
    isChannel: boolean;
    hasMore: boolean;
    isLoading: boolean;
    groupedMessages: Map<string, UnifiedMessage[]>;
    typingIndicatorText?: string;
    onScroll: () => void;
    onLoadMore: () => void;
    groupedMessagesProps: Omit<MessageListGroupedMessagesProps, 'groupedMessages' | 'isChannel'>;
};
export function MessageListScrollBody({ scrollRef, messagesEndRef, isChannel, hasMore, isLoading, groupedMessages, typingIndicatorText, onScroll, onLoadMore, groupedMessagesProps, }: MessageListScrollBodyProps) {
    return (<div ref={scrollRef} onScroll={onScroll} className="min-h-0 flex-1 overflow-x-hidden overflow-y-auto">
      <div className={cn('min-w-0 max-w-full p-4', isChannel && 'space-y-4')}>
        {hasMore && (<MessageListLoadMoreButton disabled={isLoading} isLoading={isLoading} onLoadMore={onLoadMore}/>)}

        <MessageListGroupedMessages groupedMessages={groupedMessages} isChannel={isChannel} {...groupedMessagesProps}/>

        {typingIndicatorText ? (<ChatTypingIndicator label={typingIndicatorText} variant="bubble" className="mt-2"/>) : null}
        <div ref={messagesEndRef}/>
      </div>
    </div>);
}
