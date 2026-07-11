'use client';
import { useMutation } from 'convex/react';
import { useEffect, useEffectEvent, useRef } from 'react';
import { usePreview } from '@/shared/contexts/preview-context';
import { collaborationApi } from '@/lib/convex-api';
import { logError } from '@/lib/convex-errors';
import { buildDmTypingChannelId } from '../lib/dm-typing';
import type { Channel } from '../types';
import { TYPING_TIMEOUT_MS, TYPING_UPDATE_INTERVAL_MS } from './constants';
interface UseTypingOptions {
    workspaceId: string | null;
    selectedChannel?: Channel | null;
    conversationLegacyId?: string | null;
    resolveSenderDetails: () => {
        senderName: string;
        senderRole: string | null;
    };
}
type TypingUpdateRequest = {
    workspaceId: string;
    channelId: string;
    channelType: string;
    clientId: string | null;
    projectId: string | null;
    name: string;
    role: string | null;
    isTyping: boolean;
    ttlMs: number;
};
export function buildTypingUpdateRequest({ workspaceId, selectedChannel, conversationLegacyId, senderName, senderRole, isTyping, }: {
    workspaceId: string | null;
    selectedChannel?: Channel | null;
    conversationLegacyId?: string | null;
    senderName: string;
    senderRole: string | null;
    isTyping: boolean;
}): TypingUpdateRequest | null {
    if (!workspaceId || !senderName) {
        return null;
    }
    if (conversationLegacyId) {
        return {
            workspaceId,
            channelId: buildDmTypingChannelId(conversationLegacyId),
            channelType: 'direct_message',
            clientId: null,
            projectId: null,
            name: senderName,
            role: senderRole,
            isTyping,
            ttlMs: TYPING_TIMEOUT_MS,
        };
    }
    if (!selectedChannel) {
        return null;
    }
    return {
        workspaceId,
        channelId: selectedChannel.id,
        channelType: selectedChannel.type,
        clientId: selectedChannel.clientId ?? null,
        projectId: selectedChannel.projectId ?? null,
        name: senderName,
        role: senderRole,
        isTyping,
        ttlMs: TYPING_TIMEOUT_MS,
    };
}
export function useTyping({ workspaceId, selectedChannel = null, conversationLegacyId = null, resolveSenderDetails, }: UseTypingOptions) {
    const { isPreviewMode } = usePreview();
    const typingTargetId = conversationLegacyId ?? selectedChannel?.id ?? null;
    const composerFocusedRef = useRef(false);
    const isTypingRef = useRef(false);
    const lastTypingUpdateRef = useRef(0);
    const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);
    const setTyping = useMutation(collaborationApi.setTyping);
    const sendTypingUpdate = useEffectEvent(async (isTyping: boolean) => {
        if (isPreviewMode) {
            return;
        }
        const { senderName, senderRole } = resolveSenderDetails();
        const request = buildTypingUpdateRequest({
            workspaceId,
            selectedChannel,
            conversationLegacyId,
            senderName,
            senderRole,
            isTyping,
        });
        if (!request) {
            return;
        }
        try {
            await setTyping(request);
        }
        catch (error) {
            logError(error, 'useTyping:sendTypingUpdate');
        }
    });
    const stopTyping = useEffectEvent(() => {
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
            typingTimeoutRef.current = null;
        }
        if (!isTypingRef.current) {
            return;
        }
        isTypingRef.current = false;
        lastTypingUpdateRef.current = 0;
        void sendTypingUpdate(false);
    });
    const notifyTyping = useEffectEvent(() => {
        if (!composerFocusedRef.current || !typingTargetId) {
            return;
        }
        const now = Date.now();
        if (!isTypingRef.current || now - lastTypingUpdateRef.current > TYPING_UPDATE_INTERVAL_MS) {
            isTypingRef.current = true;
            lastTypingUpdateRef.current = now;
            void sendTypingUpdate(true);
        }
        if (typingTimeoutRef.current) {
            clearTimeout(typingTimeoutRef.current);
        }
        typingTimeoutRef.current = setTimeout(() => {
            isTypingRef.current = false;
            lastTypingUpdateRef.current = 0;
            void sendTypingUpdate(false);
        }, TYPING_TIMEOUT_MS);
    });
    const handleComposerFocus = useEffectEvent(() => {
        composerFocusedRef.current = true;
    });
    const handleComposerBlur = useEffectEvent(() => {
        composerFocusedRef.current = false;
        stopTyping();
    });
    useEffect(() => {
        if (typingTargetId === null) {
            return () => {
                stopTyping();
            };
        }
        return () => {
            stopTyping();
        };
    }, [typingTargetId]);
    useEffect(() => {
        const handleBeforeUnload = () => {
            stopTyping();
        };
        const handleVisibilityChange = () => {
            if (document.visibilityState === 'hidden') {
                stopTyping();
            }
        };
        window.addEventListener('beforeunload', handleBeforeUnload);
        document.addEventListener('visibilitychange', handleVisibilityChange);
        return () => {
            window.removeEventListener('beforeunload', handleBeforeUnload);
            document.removeEventListener('visibilitychange', handleVisibilityChange);
        };
    }, []);
    return {
        composerFocusedRef,
        stopTyping,
        notifyTyping,
        handleComposerFocus,
        handleComposerBlur,
    };
}
