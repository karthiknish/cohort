'use client';

import { useQuery } from 'convex/react';
import { collaborationApi } from '@/lib/convex-api';
import { usePreview } from '@/shared/contexts/preview-context';
import type { Channel, CollaborationMessage } from '../types';
import { mapChannelMessageRow } from '../utils/message-mappers';

type SearchArgs = {
  workspaceId: string;
  channel: Channel;
  q?: string | null;
  sender?: string | null;
  attachment?: string | null;
  mention?: string | null;
  startMs?: number | null;
  endMs?: number | null;
  limit?: number;
};

type RawSearchResponse = {
  rows?: Array<Record<string, unknown>>;
  highlights?: string[];
};

export function useSearchChannelMessages(
  workspaceId: string | null,
  channel: Channel | null,
  query: string,
) {
  const { isPreviewMode } = usePreview();
  const trimmed = query.trim();
  const enabled = !isPreviewMode && Boolean(workspaceId) && Boolean(channel) && trimmed.length > 0;

  const result = useQuery(
    collaborationApi.searchChannel,
    enabled
      ? {
          workspaceId: String(workspaceId),
          channelId: channel!.isCustom ? channel!.id : null,
          channelType: channel!.type,
          clientId: channel!.type === 'client' ? (channel!.clientId ?? null) : null,
          projectId: channel!.type === 'project' ? (channel!.projectId ?? null) : null,
          q: trimmed,
          limit: 200,
        }
      : 'skip',
  ) as RawSearchResponse | undefined;

  const messages: CollaborationMessage[] = (result?.rows ?? [])
    .flatMap((row) => {
      const msg = mapChannelMessageRow(row, { fallbackChannelType: channel?.type ?? 'team' });
      return msg ? [msg] : [];
    })
    .sort((a, b) => new Date(b.createdAt ?? 0).getTime() - new Date(a.createdAt ?? 0).getTime());

  const highlights: string[] = Array.isArray(result?.highlights)
    ? result!.highlights.filter((h): h is string => typeof h === 'string')
    : [];

  return { messages, highlights, isSearching: result === undefined && enabled };
}
