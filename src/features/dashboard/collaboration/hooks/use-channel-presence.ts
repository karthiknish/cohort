'use client';
import { useEffect, useMemo, useRef, useState } from 'react';
import { useConvex, useMutation, useQuery } from 'convex/react';
import { usePreview } from '@/shared/contexts/preview-context';
import { presenceApi } from '@/lib/convex-api';
import { logError } from '@/lib/convex-errors';
import type { Channel } from '../types';

/**
 * Build a stable, namespaced room id for a collaboration channel or DM.
 * Scoping by workspaceId prevents cross-workroom presence bleed.
 */
export function buildPresenceRoomId(workspaceId: string, channel: Channel | null, conversationLegacyId?: string | null): string | null {
    if (conversationLegacyId) {
        return `dm:${workspaceId}:${conversationLegacyId}`;
    }
    if (channel?.id) {
        return `channel:${workspaceId}:${channel.id}`;
    }
    return null;
}

export interface ChannelPresenceMember {
    id: string;
    name: string;
    avatarUrl?: string;
    role?: string | null;
    online: boolean;
}

interface UseChannelPresenceOptions {
    workspaceId: string | null;
    userId: string | null;
    selectedChannel?: Channel | null;
    conversationLegacyId?: string | null;
    /** Heartbeat interval in ms. Defaults to 10s. */
    intervalMs?: number;
}

/**
 * Maintains presence for the current user in a chat room (channel or DM) and
 * returns the live list of present members. Handles heartbeats, graceful
 * disconnect on tab close, and visibility-change pauses.
 *
 * Returns `undefined` while loading, `null` when presence is disabled
 * (preview mode, missing workspace/user/channel), or an array of online
 * members once subscribed.
 */
export function useChannelPresence({ workspaceId, userId, selectedChannel = null, conversationLegacyId = null, intervalMs = 10_000, }: UseChannelPresenceOptions) {
    const { isPreviewMode } = usePreview();
    const roomId = workspaceId && userId
        ? buildPresenceRoomId(workspaceId, selectedChannel, conversationLegacyId)
        : null;
    const enabled = !isPreviewMode && Boolean(roomId) && Boolean(userId);

    const heartbeat = useMutation(presenceApi.heartbeat);
    const disconnect = useMutation(presenceApi.disconnect);
    const convex = useConvex();

    const [roomToken, setRoomToken] = useState<string | null>(null);
    const sessionTokenRef = useRef<string | null>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    // Stable per-mount session id; regenerated when the room changes.
    const sessionIdRef = useRef<string>(typeof crypto !== 'undefined' ? crypto.randomUUID() : Math.random().toString(36).slice(2));

    const presenceRows = useQuery(presenceApi.list, roomToken ? { roomToken } : 'skip') as
        | Array<{
            userId: string;
            online: boolean;
            lastDisconnected: number;
            data?: { name?: string; role?: string | null; photoUrl?: string | null };
        }>
        | undefined;

    useEffect(() => {
        if (!enabled || !roomId || !userId) {
            return;
        }
        const sid = sessionIdRef.current;

        const sendHeartbeat = async () => {
            try {
                const result = await heartbeat({ roomId, userId, sessionId: sid, interval: intervalMs });
                sessionTokenRef.current = result.sessionToken;
                setRoomToken(result.roomToken);
            }
            catch (error) {
                logError(error, 'useChannelPresence:heartbeat');
            }
        };

        void sendHeartbeat();
        if (intervalRef.current) {
            clearInterval(intervalRef.current);
        }
        intervalRef.current = setInterval(sendHeartbeat, intervalMs);

        const handleUnload = () => {
            const token = sessionTokenRef.current;
            if (!token) return;
            try {
                const blob = new Blob([JSON.stringify({ path: 'presence:disconnect', args: { sessionToken: token } })], { type: 'application/json' });
                navigator.sendBeacon(`${convex.url}/api/mutation`, blob);
            }
            catch {
                // sendBeacon can fail in some environments; best-effort disconnect.
            }
        };
        const handleVisibility = async () => {
            if (document.hidden) {
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                    intervalRef.current = null;
                }
                const token = sessionTokenRef.current;
                if (token) {
                    try {
                        await disconnect({ sessionToken: token });
                    }
                    catch (error) {
                        logError(error, 'useChannelPresence:disconnect');
                    }
                }
            }
            else {
                void sendHeartbeat();
                if (intervalRef.current) {
                    clearInterval(intervalRef.current);
                }
                intervalRef.current = setInterval(sendHeartbeat, intervalMs);
            }
        };
        const wrappedVisibility = () => {
            void handleVisibility();
        };

        window.addEventListener('beforeunload', handleUnload);
        document.addEventListener('visibilitychange', wrappedVisibility);

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            window.removeEventListener('beforeunload', handleUnload);
            document.removeEventListener('visibilitychange', wrappedVisibility);
            const token = sessionTokenRef.current;
            if (token) {
                void disconnect({ sessionToken: token }).catch((error) => logError(error, 'useChannelPresence:cleanup'));
                sessionTokenRef.current = null;
            }
            setRoomToken(null);
        };
    }, [enabled, roomId, userId, intervalMs, heartbeat, disconnect, convex.url]);

    const members = useMemo<ChannelPresenceMember[] | null | undefined>(() => {
        if (!enabled) {
            return null;
        }
        if (!presenceRows) {
            return undefined;
        }
        const result: ChannelPresenceMember[] = [];
        for (const entry of presenceRows) {
            if (!entry.online) {
                continue;
            }
            const name = entry.data?.name ?? 'User';
            result.push({
                id: entry.userId,
                name,
                avatarUrl: entry.data?.photoUrl ?? undefined,
                role: entry.data?.role ?? null,
                online: entry.online,
            });
        }
        return result;
    }, [enabled, presenceRows]);

    return members;
}
