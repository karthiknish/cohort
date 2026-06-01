'use client';
import { useCallback } from 'react';
import { PollCard } from './message-polls';
import type { MessagePoll } from './message-polls';
import type { UnifiedMessage } from './message-list-types';
export function MessagePollCardBlock({ message, poll, currentUserId, isAdmin, onVotePoll, onEndPoll, }: {
    message: UnifiedMessage;
    poll: MessagePoll;
    currentUserId?: string | null;
    isAdmin: boolean;
    onVotePoll?: (messageLegacyId: string, optionIds: string[]) => Promise<void>;
    onEndPoll?: (messageLegacyId: string) => Promise<void>;
}) {
    const canEnd = Boolean(onEndPoll && currentUserId && (poll.createdBy === currentUserId || isAdmin));
    const handleVote = async (_pollId: string, optionIds: string[]) => {
        await onVotePoll?.(message.id, optionIds);
    };
    const handleEndPoll = async () => {
        await onEndPoll?.(message.id);
    };
    return (<PollCard poll={poll} userId={currentUserId ?? null} showResults={false} canEnd={canEnd} onVote={onVotePoll ? handleVote : undefined} onEndPoll={onEndPoll ? handleEndPoll : undefined}/>);
}
