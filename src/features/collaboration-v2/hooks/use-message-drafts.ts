'use client';

import { useCallback, useState } from 'react';

type DraftMap = Record<string, string>;

/**
 * Per-conversation composer draft state.
 * Drafts are keyed by conversation key (channel id or `dm:<legacyId>`)
 * so switching conversations preserves in-progress text.
 */
export function useMessageDrafts() {
  const [drafts, setDrafts] = useState<DraftMap>({});

  const getDraft = useCallback(
    (key: string) => drafts[key] ?? '',
    [drafts],
  );

  const setDraft = useCallback((key: string, value: string) => {
    setDrafts((prev) => {
      if (prev[key] === value) return prev;
      return { ...prev, [key]: value };
    });
  }, []);

  const clearDraft = useCallback((key: string) => {
    setDrafts((prev) => {
      if (!(key in prev)) return prev;
      const next = { ...prev };
      delete next[key];
      return next;
    });
  }, []);

  return { getDraft, setDraft, clearDraft };
}

export function buildChannelDraftKey(channelId: string): string {
  return `channel:${channelId}`;
}

export function buildDmDraftKey(conversationLegacyId: string): string {
  return `dm:${conversationLegacyId}`;
}
