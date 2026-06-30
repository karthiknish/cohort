'use client';

import { useQuery, useMutation } from 'convex/react';
import { collaborationApi } from '@/lib/convex-api';
import { usePreview } from '@/shared/contexts/preview-context';
import type { Channel, TypingParticipant } from '../types';

type RawTypingRow = {
  userId?: string;
  name?: string;
  role?: string;
};

/**
 * Subscribe to typing indicators for a channel or DM conversation.
 * Pass either `channel` (for channels) or `conversationLegacyId` (for DMs).
 * The current user is filtered out.
 */
export function useTypingParticipants(
  workspaceId: string | null,
  currentUserId: string | null,
  channel: Channel | null,
  conversationLegacyId: string | null,
) {
  const { isPreviewMode } = usePreview();
  const channelId = conversationLegacyId
    ? `dm:${conversationLegacyId}`
    : channel?.id ?? null;
  const enabled = !isPreviewMode && Boolean(workspaceId) && Boolean(channelId) && Boolean(currentUserId);

  const result = useQuery(
    collaborationApi.listTyping,
    enabled
      ? { workspaceId: String(workspaceId), channelId: String(channelId), limit: 20 }
      : 'skip',
  ) as RawTypingRow[] | undefined;

  const participants: TypingParticipant[] = (result ?? []).flatMap((row) => {
    if (typeof row?.userId !== 'string' || row.userId === currentUserId) return [];
    const name = typeof row?.name === 'string' ? row.name : null;
    if (!name || name.trim().length === 0) return [];
    return [{ name, role: typeof row?.role === 'string' ? row.role : null }];
  });

  return participants;
}

export function useSetTyping() {
  return useMutation(collaborationApi.setTyping);
}
