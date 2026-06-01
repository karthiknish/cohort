'use client';
import { useCallback } from 'react';
import { useRealtimeTyping } from './use-realtime';
import { useTyping } from './use-typing';
import type { UseDirectMessagesOptions } from './use-direct-messages';
type UseDmTypingOptions = Pick<UseDirectMessagesOptions, 'workspaceId' | 'currentUserId' | 'currentUserName' | 'currentUserRole'> & {
    conversationLegacyId: string | null;
};
export function useDmTyping({ workspaceId, currentUserId, currentUserName, currentUserRole, conversationLegacyId, }: UseDmTypingOptions) {
    const resolveSenderDetails = () => ({
        senderName: currentUserName?.trim() || 'You',
        senderRole: currentUserRole ?? null,
    });
    const { notifyTyping, handleComposerFocus, handleComposerBlur, stopTyping } = useTyping({
        workspaceId,
        conversationLegacyId,
        resolveSenderDetails,
    });
    const { typingParticipants } = useRealtimeTyping({
        userId: currentUserId,
        workspaceId,
        conversationLegacyId,
    });
    return {
        typingParticipants,
        notifyTyping,
        handleComposerFocus,
        handleComposerBlur,
        stopTyping,
    };
}
