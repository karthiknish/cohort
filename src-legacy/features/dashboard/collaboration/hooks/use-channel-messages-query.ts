'use client';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import { useCallback, type Dispatch, type SetStateAction } from 'react';
import type { ConvexReactClient } from 'convex/react';
import { collaborationApi } from '@/lib/convex-api';
import { decodeTimestampIdCursor, encodeTimestampIdCursor } from '@/lib/pagination';
import type { CollaborationMessage } from '@/types/collaboration';
import type { Channel } from '../types';
import { mapCollaborationMessageRow } from './message-mappers';
type UseChannelMessagesQueryOptions = {
    convex: ConvexReactClient;
    workspaceId: string | null;
    channels: Channel[];
    isPreviewMode: boolean;
    nextCursorByChannel: Record<string, string | null>;
    setLoadingMoreChannelId: (channelId: string | null) => void;
    mutateChannelMessages: (channelId: string, updater: (messages: CollaborationMessage[]) => CollaborationMessage[]) => void;
    setNextCursorByChannel: Dispatch<SetStateAction<Record<string, string | null>>>;
};
/** Paginated channel message loading (older pages). */
export function useChannelMessagesQuery({ convex, workspaceId, channels, isPreviewMode, nextCursorByChannel, setLoadingMoreChannelId, mutateChannelMessages, setNextCursorByChannel, }: UseChannelMessagesQueryOptions) {
    const handleLoadMore = async (channelId: string) => {
        if (isPreviewMode) {
            return;
        }
        const nextCursor = nextCursorByChannel[channelId];
        if (!nextCursor)
            return;
        setLoadingMoreChannelId(channelId);
        try {
            const channel = channels.find((c) => c.id === channelId);
            if (!channel)
                throw new Error('Channel not found');
            if (!workspaceId)
                throw new Error('Workspace unavailable');
            const decoded = decodeTimestampIdCursor(nextCursor);
            const listResult = await convex.query(collaborationApi.listChannel, {
                workspaceId: String(workspaceId),
                channelId: channel.isCustom ? channel.id : null,
                channelType: channel.type,
                clientId: channel.type === 'client' ? (channel.clientId ?? null) : null,
                projectId: channel.type === 'project' ? (channel.projectId ?? null) : null,
                limit: 50 + 1,
                cursor: decoded
                    ? { legacyId: decoded.id, fieldValue: decoded.time.getTime() }
                    : undefined,
            });
            const pageRows = listResult.items as Array<Record<string, unknown>>;
            const hasMore = pageRows.length > 50;
            const trimmedRows = hasMore ? pageRows.slice(0, 50) : pageRows;
            const mapped: CollaborationMessage[] = trimmedRows
                .flatMap((row) => {
                const message = mapCollaborationMessageRow(row, { fallbackChannelType: channel.type });
                return message ? [message] : [];
            })
                .sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime());
            const oldestRow = trimmedRows.length ? trimmedRows[trimmedRows.length - 1] : null;
            const oldestCreatedAtMs = oldestRow && typeof oldestRow.createdAtMs === 'number' ? oldestRow.createdAtMs : null;
            const oldestLegacyId = oldestRow && typeof oldestRow.legacyId === 'string' ? oldestRow.legacyId : '';
            const newCursor = hasMore && oldestCreatedAtMs !== null
                ? encodeTimestampIdCursor(new Date(oldestCreatedAtMs).toISOString(), String(oldestLegacyId))
                : null;
            mutateChannelMessages(channelId, (existing) => {
                const existingIds = new Set(existing.map((m) => m.id));
                const newMessages = mapped.filter((m) => !existingIds.has(m.id));
                return [...newMessages, ...existing];
            });
            setNextCursorByChannel((prev) => ({ ...prev, [channelId]: newCursor }));
        }
        catch (error) {
            reportConvexFailure({
                error,
                context: 'useChannelMessagesQuery:handleLoadMore',
                title: 'Load error',
                fallbackMessage: 'Load error',
            });
        }
        finally {
            setLoadingMoreChannelId(null);
        }
    };
    return { handleLoadMore };
}
