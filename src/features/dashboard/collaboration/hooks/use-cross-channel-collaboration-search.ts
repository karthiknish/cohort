'use client';
import { useCallback } from 'react';
import { useConvex } from 'convex/react';
import { collaborationApi } from '@/lib/convex-api';
import type { CollaborationMessage } from '@/types/collaboration';
import type { Channel } from '../types';
import type { CrossChannelSearchQuery } from '../components/cross-channel-search';
import { mapCollaborationMessageRow } from './message-mappers';
export type CrossChannelSearchResult = {
    message: CollaborationMessage;
    channel: Channel;
    highlights: string[];
};
export function useCrossChannelCollaborationSearch(workspaceId: string | null, channels: Channel[]) {
    const convex = useConvex();
    return async (query: CrossChannelSearchQuery): Promise<CrossChannelSearchResult[]> => {
        if (!workspaceId) {
            return [];
        }
        const trimmed = query.query.trim();
        if (!trimmed) {
            return [];
        }
        const scopedChannels = channels.filter((channel) => {
            if (query.channelId && channel.id !== query.channelId) {
                return false;
            }
            if (query.channelType && channel.type !== query.channelType) {
                return false;
            }
            return true;
        });
        const results: CrossChannelSearchResult[] = [];
        await Promise.all(scopedChannels.map(async (channel) => {
            try {
                const payload = await convex.query(collaborationApi.searchChannel, {
                    workspaceId,
                    channelId: channel.id,
                    channelType: channel.type,
                    clientId: channel.clientId,
                    projectId: channel.projectId,
                    q: trimmed,
                    sender: query.sender ?? null,
                    attachment: query.hasAttachment ? trimmed : null,
                    mention: null,
                    startMs: query.afterDate ? new Date(query.afterDate).getTime() : null,
                    endMs: query.beforeDate ? new Date(query.beforeDate).getTime() : null,
                    limit: 40,
                });
                const resolvedPayload = (payload ?? {}) as {
                    rows?: unknown[];
                    highlights?: string[];
                };
                const rows = Array.isArray(resolvedPayload.rows) ? resolvedPayload.rows : [];
                const highlights = Array.isArray(resolvedPayload.highlights)
                    ? resolvedPayload.highlights.filter((entry): entry is string => typeof entry === 'string')
                    : [];
                for (const row of rows) {
                    const message = mapCollaborationMessageRow(row, { fallbackChannelType: channel.type });
                    if (!message) {
                        continue;
                    }
                    const content = message.content ?? '';
                    if (query.hasLink && !/https?:\/\//i.test(content)) {
                        continue;
                    }
                    results.push({
                        message,
                        channel,
                        highlights,
                    });
                }
            }
            catch {
                // Skip channels the user cannot access.
            }
        }));
        return results.sort((left, right) => {
            const leftMs = left.message.createdAt ? new Date(left.message.createdAt).getTime() : 0;
            const rightMs = right.message.createdAt ? new Date(right.message.createdAt).getTime() : 0;
            return rightMs - leftMs;
        });
    };
}
