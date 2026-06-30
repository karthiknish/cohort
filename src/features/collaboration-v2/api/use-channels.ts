'use client';

import { useQuery, useMutation } from 'convex/react';
import { collaborationChannelsApi, collaborationChannelAvatarsApi } from '@/lib/convex-api';
import { usePreview } from '@/shared/contexts/preview-context';
import type { Channel } from '../types';

type RawCustomChannel = {
  legacyId?: string;
  name?: string;
  description?: string | null;
  visibility?: 'public' | 'private';
  memberIds?: string[];
  memberSummaries?: Array<{
    id?: string;
    name?: string;
    role?: string | null;
    email?: string | null;
  }>;
};

type RawAvatar = {
  channelKey?: string;
  avatarUrl?: string | null;
};

export function useCustomChannels(workspaceId: string | null) {
  const { isPreviewMode } = usePreview();
  const result = useQuery(
    collaborationChannelsApi.listAccessible,
    !isPreviewMode && workspaceId ? { workspaceId: String(workspaceId), channelType: 'team' } : 'skip',
  ) as RawCustomChannel[] | undefined;

  const channels = (result ?? []).flatMap((c): Channel[] => {
    if (typeof c?.legacyId !== 'string' || typeof c?.name !== 'string') return [];
    return [{
      id: c.legacyId,
      name: c.name,
      type: 'team' as const,
      clientId: null,
      projectId: null,
      description: typeof c.description === 'string' ? c.description : null,
      visibility: c.visibility === 'public' ? 'public' : 'private',
      memberIds: Array.isArray(c.memberIds) ? c.memberIds.filter((id): id is string => typeof id === 'string') : [],
      isCustom: true,
      teamMembers: Array.isArray(c.memberSummaries) && c.memberSummaries.length > 0
        ? c.memberSummaries.flatMap((m) => typeof m?.id === 'string' && typeof m?.name === 'string'
          ? [{ id: m.id, name: m.name, role: typeof m.role === 'string' ? m.role : 'Contributor' }]
          : [])
        : [],
    }];
  });

  return { channels, isLoading: result === undefined && !isPreviewMode };
}

export function useChannelAvatars(workspaceId: string | null) {
  const { isPreviewMode } = usePreview();
  const result = useQuery(
    collaborationChannelAvatarsApi.listForWorkspace,
    !isPreviewMode && workspaceId ? { workspaceId: String(workspaceId) } : 'skip',
  ) as RawAvatar[] | undefined;

  const avatarMap = new Map<string, string>();
  for (const row of result ?? []) {
    if (typeof row?.channelKey === 'string' && typeof row?.avatarUrl === 'string' && row.avatarUrl.length > 0) {
      avatarMap.set(row.channelKey, row.avatarUrl);
    }
  }
  return avatarMap;
}

export function useCreateChannel() {
  return useMutation(collaborationChannelsApi.create);
}

export function useUpdateChannelMembers() {
  return useMutation(collaborationChannelsApi.updateMembers);
}

export function useRemoveChannel() {
  return useMutation(collaborationChannelsApi.remove);
}
