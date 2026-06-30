'use client';
import { useEffect, useMemo, useReducer } from 'react';
import { useQueries, useQuery } from 'convex/react';
import { usePreview } from '@/shared/contexts/preview-context';
import { collaborationApi } from '@/lib/convex-api';
import { asErrorMessage } from '@/lib/convex-errors';
import { getPreviewCollaborationMessages } from '@/lib/preview-data';
import type { CollaborationAttachment, CollaborationChannelType, CollaborationMention, CollaborationMessage, CollaborationReaction, } from '@/types/collaboration';
import type { Channel } from '../types';
import type { TypingParticipant } from './types';
import { REALTIME_MESSAGE_LIMIT, TYPING_TIMEOUT_MS } from './constants';
import { encodeTimestampIdCursor } from '@/lib/pagination';
interface ConvexMessageRow {
    legacyId?: string;
    channelType?: string;
    clientId?: string;
    projectId?: string;
    senderId?: string;
    senderName?: string;
    senderRole?: string;
    content?: string;
    createdAtMs?: number;
    updatedAtMs?: number;
    deletedAtMs?: number;
    deleted?: boolean;
    deletedBy?: string;
    attachments?: unknown[];
    format?: string;
    mentions?: unknown[];
    reactions?: unknown[];
    parentMessageId?: string;
    threadRootId?: string;
    threadReplyCount?: number;
    threadLastReplyAtMs?: number;
    readBy?: unknown[];
    deliveredTo?: unknown[];
    isPinned?: boolean;
    pinnedAtMs?: number | null;
    pinnedBy?: string | null;
    sharedTo?: unknown[];
}
const VALID_CHANNEL_TYPES: CollaborationChannelType[] = ['client', 'team', 'project'];
function isValidChannelType(value: unknown): value is CollaborationChannelType {
    return typeof value === 'string' && VALID_CHANNEL_TYPES.includes(value as CollaborationChannelType);
}
function mapConvexRealtimeMessageRow(row: ConvexMessageRow): CollaborationMessage {
    const isDeleted = Boolean(row?.deleted || row?.deletedAtMs);
    const createdAt = typeof row?.createdAtMs === 'number' ? new Date(row.createdAtMs).toISOString() : null;
    const updatedAt = typeof row?.updatedAtMs === 'number' ? new Date(row.updatedAtMs).toISOString() : null;
    const deletedAt = typeof row?.deletedAtMs === 'number' ? new Date(row.deletedAtMs).toISOString() : null;
    const threadLastReplyAt = typeof row?.threadLastReplyAtMs === 'number' ? new Date(row.threadLastReplyAtMs).toISOString() : null;
    const content = typeof row?.content === 'string' ? row.content : '';
    return {
        id: String(row?.legacyId ?? ''),
        channelType: isValidChannelType(row?.channelType) ? row.channelType : 'team',
        clientId: typeof row?.clientId === 'string' ? row.clientId : null,
        projectId: typeof row?.projectId === 'string' ? row.projectId : null,
        senderId: typeof row?.senderId === 'string' ? row.senderId : null,
        senderName: typeof row?.senderName === 'string' ? row.senderName : 'Unknown teammate',
        senderRole: typeof row?.senderRole === 'string' ? row.senderRole : null,
        content: isDeleted ? '' : content,
        createdAt,
        updatedAt,
        isEdited: Boolean(updatedAt && (!createdAt || createdAt !== updatedAt) && !isDeleted),
        deletedAt,
        deletedBy: typeof row?.deletedBy === 'string' ? row.deletedBy : null,
        isDeleted,
        attachments: Array.isArray(row?.attachments) && row.attachments.length > 0
            ? (row.attachments as CollaborationAttachment[])
            : undefined,
        format: row?.format === 'plaintext' ? 'plaintext' : 'markdown',
        mentions: Array.isArray(row?.mentions) && row.mentions.length > 0
            ? (row.mentions as CollaborationMention[])
            : undefined,
        reactions: Array.isArray(row?.reactions) && row.reactions.length > 0
            ? (row.reactions as CollaborationReaction[])
            : undefined,
        readBy: Array.isArray(row?.readBy) && row.readBy.length > 0
            ? row.readBy.filter((value): value is string => typeof value === 'string')
            : undefined,
        deliveredTo: Array.isArray(row?.deliveredTo) && row.deliveredTo.length > 0
            ? row.deliveredTo.filter((value): value is string => typeof value === 'string')
            : undefined,
        isPinned: Boolean(row?.isPinned),
        pinnedAt: typeof row?.pinnedAtMs === 'number' ? new Date(row.pinnedAtMs).toISOString() : null,
        pinnedBy: typeof row?.pinnedBy === 'string' ? row.pinnedBy : null,
        sharedTo: Array.isArray(row?.sharedTo) && row.sharedTo.length > 0
            ? row.sharedTo.filter((platform): platform is 'email' => platform === 'email')
            : undefined,
        parentMessageId: typeof row?.parentMessageId === 'string' ? row.parentMessageId : null,
        threadRootId: typeof row?.threadRootId === 'string' ? row.threadRootId : null,
        threadReplyCount: typeof row?.threadReplyCount === 'number' ? row.threadReplyCount : undefined,
        threadLastReplyAt,
    };
}
export type RealtimeChannelSnapshot = {
    kind: 'idle';
} | {
    kind: 'loading';
    channelId: string;
} | {
    kind: 'success';
    channelId: string;
    messages: CollaborationMessage[];
    nextCursor: string | null;
} | {
    kind: 'error';
    channelId: string;
    errorMessage: string;
} | {
    kind: 'preview';
    channelId: string;
    messages: CollaborationMessage[];
};
interface UseRealtimeChannelSnapshotOptions {
    workspaceId: string | null;
    selectedChannel: Channel | null;
    currentUserId?: string | null;
    channelListRetryNonce: number;
}
export function useRealtimeChannelSnapshot({ workspaceId, selectedChannel, currentUserId, channelListRetryNonce, }: UseRealtimeChannelSnapshotOptions): RealtimeChannelSnapshot {
    const { isPreviewMode } = usePreview();
    const channelId = selectedChannel?.id ?? null;
    const channelType = selectedChannel?.type ?? null;
    const channelClientId = selectedChannel?.clientId ?? null;
    const channelProjectId = selectedChannel?.projectId ?? null;
    const channelScopeId = selectedChannel?.isCustom ? selectedChannel.id : null;
    const convexEnabled = !isPreviewMode &&
        Boolean(workspaceId) &&
        Boolean(channelId) &&
        Boolean(channelType);
    const channelListQueryId = `channelList:${channelId ?? 'none'}:${channelListRetryNonce}`;
    const channelListQueries = (() => {
        if (!convexEnabled) {
            return {};
        }
        return {
            [channelListQueryId]: {
                query: collaborationApi.listChannel,
                args: {
                    workspaceId: String(workspaceId),
                    channelId: channelScopeId,
                    channelType: String(channelType),
                    clientId: channelType === 'client' ? (channelClientId ?? null) : null,
                    projectId: channelType === 'project' ? (channelProjectId ?? null) : null,
                    limit: REALTIME_MESSAGE_LIMIT + 1,
                },
            },
        };
    })();
    const channelListResults = useQueries(channelListQueries);
    const channelListResult = channelListQueries[channelListQueryId]
        ? channelListResults[channelListQueryId]
        : undefined;
    return ((): RealtimeChannelSnapshot => {
        if (!channelId || !channelType) {
            return { kind: 'idle' };
        }
        if (isPreviewMode) {
            return {
                kind: 'preview',
                channelId,
                messages: getPreviewCollaborationMessages(channelType, channelClientId, channelProjectId, currentUserId),
            };
        }
        if (!convexEnabled) {
            return { kind: 'idle' };
        }
        if (channelListResult === undefined) {
            return { kind: 'loading', channelId };
        }
        if (channelListResult instanceof Error) {
            return {
                kind: 'error',
                channelId,
                errorMessage: asErrorMessage(channelListResult),
            };
        }
        const convexRows = channelListResult as {
            items: Array<ConvexMessageRow>;
            nextCursor: string | null;
        };
        const rows = Array.isArray(convexRows.items) ? convexRows.items : [];
        const hasMore = Boolean(convexRows.nextCursor);
        const pageRows = rows;
        const oldestRow = pageRows.length ? pageRows[pageRows.length - 1] : null;
        const nextCursor = hasMore && oldestRow && typeof oldestRow.createdAtMs === 'number'
            ? encodeTimestampIdCursor(new Date(oldestRow.createdAtMs).toISOString(), String(oldestRow.legacyId ?? ''))
            : null;
        const messages = pageRows
            .flatMap((row) => {
            const message = mapConvexRealtimeMessageRow(row);
            return message.id ? [message] : [];
        })
            .sort((a, b) => new Date(a.createdAt ?? 0).getTime() - new Date(b.createdAt ?? 0).getTime());
        return {
            kind: 'success',
            channelId,
            messages,
            nextCursor,
        };
    })();
}
interface UseRealtimeTypingOptions {
    userId: string | null;
    workspaceId: string | null;
    selectedChannel?: Channel | null;
    conversationLegacyId?: string | null;
}
interface ConvexTypingRow {
    userId?: string;
    name?: string;
    role?: string;
}
export function useRealtimeTyping({ userId, workspaceId, selectedChannel = null, conversationLegacyId = null, }: UseRealtimeTypingOptions) {
    const { isPreviewMode } = usePreview();
    const channelId = conversationLegacyId
        ? `dm:${conversationLegacyId}`
        : selectedChannel?.id ?? null;
    const convexEnabled = !isPreviewMode &&
        Boolean(userId) &&
        Boolean(workspaceId) &&
        Boolean(channelId);
    const typingRows = useQuery(collaborationApi.listTyping, convexEnabled
        ? {
            workspaceId: String(workspaceId),
            channelId: String(channelId),
            limit: 20,
        }
        : 'skip') as Array<ConvexTypingRow> | undefined;
    const typingParticipants = (() => {
        if (!convexEnabled || !typingRows) {
            return [] as TypingParticipant[];
        }
        return typingRows.flatMap((row) => {
            if (typeof row?.userId !== 'string' || row.userId === userId)
                return [];
            const name = typeof row?.name === 'string' ? row.name : null;
            if (!name || name.trim().length === 0)
                return [];
            const role = typeof row?.role === 'string' ? row.role : null;
            return [{ name, role } as TypingParticipant];
        });
    })();
    return { typingParticipants };
}
type TypingHideState = {
    hideAfterMs: number | null;
};
type TypingHideAction = {
    type: 'clear';
} | {
    type: 'show';
} | {
    type: 'hide';
    at: number;
};
function typingHideReducer(_state: TypingHideState, action: TypingHideAction): TypingHideState {
    switch (action.type) {
        case 'clear':
            return { hideAfterMs: null };
        case 'show':
            return { hideAfterMs: null };
        case 'hide':
            return { hideAfterMs: action.at };
        default: {
            const _exhaustive: never = action;
            return { hideAfterMs: null };
        }
    }
}
export function useTypingTimeout(typingParticipants: TypingParticipant[]) {
    const [{ hideAfterMs }, dispatchHide] = useReducer(typingHideReducer, { hideAfterMs: null });
    const typingSignature = typingParticipants.map((participant) => `${participant.name}:${participant.role ?? ''}`).join('|');
    useEffect(() => {
        if (typingParticipants.length === 0) {
            dispatchHide({ type: 'clear' });
            return;
        }
        dispatchHide({ type: 'show' });
        const timeoutId = window.setTimeout(() => {
            dispatchHide({ type: 'hide', at: Date.now() });
        }, TYPING_TIMEOUT_MS);
        return () => {
            window.clearTimeout(timeoutId);
        };
    }, [typingParticipants.length, typingSignature]);
    return (() => {
        if (typingParticipants.length === 0) {
            return [] as TypingParticipant[];
        }
        if (hideAfterMs !== null) {
            return [] as TypingParticipant[];
        }
        return typingParticipants;
    })();
}
