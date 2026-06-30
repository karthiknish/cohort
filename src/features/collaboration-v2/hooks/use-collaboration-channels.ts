'use client';

import { useMemo } from 'react';
import { useChannelsData } from '@/features/dashboard/collaboration/hooks/use-channels-data';
import type { ClientRecord } from '@/types/clients';
import type { ProjectRecord } from '@/types/projects';
import { useCustomChannels, useChannelAvatars } from '../api/use-channels';

type UseCollaborationChannelsOptions = {
  workspaceId: string | null;
  clients: ClientRecord[];
  projects: ProjectRecord[];
  fallbackDisplayName: string;
  fallbackRole: string;
  visibleClientId?: string | null;
};

export function useCollaborationChannels({
  workspaceId,
  clients,
  projects,
  fallbackDisplayName,
  fallbackRole,
  visibleClientId = null,
}: UseCollaborationChannelsOptions) {
  const { channels: customChannels } = useCustomChannels(workspaceId);
  const channelAvatars = useChannelAvatars(workspaceId);

  // Shape custom channels for the legacy useChannelsData hook.
  const customChannelInputs = useMemo(
    () =>
      customChannels.map((channel) => ({
        legacyId: channel.id,
        name: channel.name,
        description: channel.description ?? null,
        visibility: channel.visibility ?? 'private',
        memberIds: channel.memberIds ?? [],
        memberSummaries: channel.teamMembers
          .filter((member) => Boolean(member.id))
          .map((member) => ({
            id: member.id as string,
            name: member.name,
            role: member.role ?? null,
          })),
      })),
    [customChannels],
  );

  return useChannelsData({
    clients,
    projects,
    customChannels: customChannelInputs,
    fallbackDisplayName,
    fallbackRole,
    visibleClientId,
    channelAvatars,
  });
}
