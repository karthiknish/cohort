'use client';

import { useQuery } from 'convex/react';
import { collaborationApi } from '@/lib/convex-api';
import { usePreview } from '@/shared/contexts/preview-context';

type ChannelPreview = { content: string; createdAtMs: number };
type ChannelPreviewsResponse = {
  previewsByChannelKey?: Record<string, ChannelPreview>;
};

/**
 * Fetches the latest message preview for every channel in the workspace so the
 * inbox sidebar can show snippets for all conversations — not just the
 * currently selected one.
 */
export function useChannelPreviews(workspaceId: string | null) {
  const { isPreviewMode } = usePreview();
  const enabled = !isPreviewMode && Boolean(workspaceId);

  const result = useQuery(
    collaborationApi.listChannelPreviews,
    enabled ? { workspaceId: String(workspaceId) } : 'skip',
  ) as ChannelPreviewsResponse | undefined;

  return result?.previewsByChannelKey ?? {};
}
