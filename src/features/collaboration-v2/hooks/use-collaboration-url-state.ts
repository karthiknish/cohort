'use client';

import { useCallback, useMemo } from 'react';
import { useSearchParams, useRouter, usePathname } from '@/shared/ui/navigation';

export type CollaborationUrlState = {
  channelId: string | null;
  conversationLegacyId: string | null;
  projectId: string | null;
  projectName: string | null;
  deepLinkMessageId: string | null;
  deepLinkThreadId: string | null;
};

export type CollaborationUrlActions = {
  setChannelId: (channelId: string | null) => void;
  setConversationLegacyId: (legacyId: string | null) => void;
  setProjectFilter: (projectId: string | null, projectName: string | null) => void;
  setDeepLinkMessage: (messageId: string | null, threadId?: string | null) => void;
  clearDeepLink: () => void;
  clearAll: () => void;
};

const CHANNEL_PARAM = 'channelId';
const CONVERSATION_PARAM = 'conversation';
const PROJECT_PARAM = 'projectId';
const PROJECT_NAME_PARAM = 'projectName';
const DEEP_LINK_MESSAGE_PARAM = 'messageId';
const DEEP_LINK_THREAD_PARAM = 'threadId';

function buildSearchString(params: Record<string, string | null>): string {
  const entries = Object.entries(params).filter(([, value]) => value !== null && value !== '');
  if (entries.length === 0) return '';
  const search = new URLSearchParams();
  entries.forEach(([key, value]) => search.set(key, String(value)));
  return `?${search.toString()}`;
}

export function useCollaborationUrlState(): CollaborationUrlState & CollaborationUrlActions {
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();

  const state = useMemo<CollaborationUrlState>(() => {
    const channelId = searchParams.get(CHANNEL_PARAM);
    const conversationLegacyId = searchParams.get(CONVERSATION_PARAM);
    const projectId = searchParams.get(PROJECT_PARAM);
    const projectName = searchParams.get(PROJECT_NAME_PARAM);
    const deepLinkMessageId = searchParams.get(DEEP_LINK_MESSAGE_PARAM);
    const deepLinkThreadId = searchParams.get(DEEP_LINK_THREAD_PARAM);
    return {
      channelId,
      conversationLegacyId,
      projectId,
      projectName,
      deepLinkMessageId,
      deepLinkThreadId,
    };
  }, [searchParams]);

  const updateParams = useCallback(
    (updates: Partial<Record<keyof CollaborationUrlState, string | null>>) => {
      const current: Record<string, string | null> = {
        [CHANNEL_PARAM]: searchParams.get(CHANNEL_PARAM),
        [CONVERSATION_PARAM]: searchParams.get(CONVERSATION_PARAM),
        [PROJECT_PARAM]: searchParams.get(PROJECT_PARAM),
        [PROJECT_NAME_PARAM]: searchParams.get(PROJECT_NAME_PARAM),
        [DEEP_LINK_MESSAGE_PARAM]: searchParams.get(DEEP_LINK_MESSAGE_PARAM),
        [DEEP_LINK_THREAD_PARAM]: searchParams.get(DEEP_LINK_THREAD_PARAM),
      };
      if (CHANNEL_PARAM in updates) current[CHANNEL_PARAM] = updates.channelId ?? null;
      if (CONVERSATION_PARAM in updates) current[CONVERSATION_PARAM] = updates.conversationLegacyId ?? null;
      if (PROJECT_PARAM in updates) current[PROJECT_PARAM] = updates.projectId ?? null;
      if (PROJECT_NAME_PARAM in updates) current[PROJECT_NAME_PARAM] = updates.projectName ?? null;
      if (DEEP_LINK_MESSAGE_PARAM in updates) current[DEEP_LINK_MESSAGE_PARAM] = updates.deepLinkMessageId ?? null;
      if (DEEP_LINK_THREAD_PARAM in updates) current[DEEP_LINK_THREAD_PARAM] = updates.deepLinkThreadId ?? null;
      const search = buildSearchString(current);
      router.replace(`${pathname}${search}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  const setChannelId = useCallback(
    (channelId: string | null) => {
      updateParams({
        channelId,
        conversationLegacyId: null,
        deepLinkMessageId: null,
        deepLinkThreadId: null,
      });
    },
    [updateParams],
  );

  const setConversationLegacyId = useCallback(
    (legacyId: string | null) => {
      updateParams({
        conversationLegacyId: legacyId,
        channelId: null,
        deepLinkMessageId: null,
        deepLinkThreadId: null,
      });
    },
    [updateParams],
  );

  const setProjectFilter = useCallback(
    (projectId: string | null, projectName: string | null) => {
      updateParams({ projectId, projectName });
    },
    [updateParams],
  );

  const setDeepLinkMessage = useCallback(
    (messageId: string | null, threadId: string | null = null) => {
      updateParams({ deepLinkMessageId: messageId, deepLinkThreadId: threadId });
    },
    [updateParams],
  );

  const clearDeepLink = useCallback(() => {
    updateParams({ deepLinkMessageId: null, deepLinkThreadId: null });
  }, [updateParams]);

  const clearAll = useCallback(() => {
    router.replace(pathname, { scroll: false });
  }, [router, pathname]);

  return {
    ...state,
    setChannelId,
    setConversationLegacyId,
    setProjectFilter,
    setDeepLinkMessage,
    clearDeepLink,
    clearAll,
  };
}
