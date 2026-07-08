'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useClientContext } from '@/shared/contexts/client-context';
import { useUrlSearchParams } from '@/shared/hooks/use-url-search-params';
import { asErrorMessage } from '@/lib/convex-errors';
import { logger } from '@/lib/logger';
import { isFeatureEnabled } from '@/lib/features';

type NavigationState = {
  projectId: string | null;
  projectName: string | null;
  lastViewedTask: string | null;
  lastViewedChannel: string | null;
};

type NavigationContextValue = {
  navigationState: NavigationState;
  setProjectContext: (projectId: string | null, projectName: string | null) => void;
  setLastViewedTask: (taskId: string | null) => void;
  setLastViewedChannel: (channelId: string | null) => void;
  clearNavigationState: () => void;
  restoreNavigationState: () => void;
};

const STORAGE_PREFIX = 'cohorts.nav';
const STORAGE_KEYS = {
  PROJECT_ID: `${STORAGE_PREFIX}.projectId`,
  PROJECT_NAME: `${STORAGE_PREFIX}.projectName`,
  LAST_VIEWED_TASK: `${STORAGE_PREFIX}.lastViewedTask`,
  LAST_VIEWED_CHANNEL: `${STORAGE_PREFIX}.lastViewedChannel`,
} as const;

const EMPTY_STATE: NavigationState = {
  projectId: null,
  projectName: null,
  lastViewedTask: null,
  lastViewedChannel: null,
};

function getClientStorageKey(baseKey: string, clientId: string | null): string {
  return clientId ? `${baseKey}.${clientId}` : baseKey;
}

function loadFromStorage(selectedClientId: string | null): NavigationState {
  if (typeof window === 'undefined') return EMPTY_STATE;
  try {
    return {
      projectId: localStorage.getItem(getClientStorageKey(STORAGE_KEYS.PROJECT_ID, selectedClientId)),
      projectName: localStorage.getItem(getClientStorageKey(STORAGE_KEYS.PROJECT_NAME, selectedClientId)),
      lastViewedTask: localStorage.getItem(getClientStorageKey(STORAGE_KEYS.LAST_VIEWED_TASK, selectedClientId)),
      lastViewedChannel: localStorage.getItem(getClientStorageKey(STORAGE_KEYS.LAST_VIEWED_CHANNEL, selectedClientId)),
    };
  } catch {
    return EMPTY_STATE;
  }
}

function saveToStorage(state: NavigationState, selectedClientId: string | null): void {
  if (!isFeatureEnabled('NAVIGATION_PERSISTENCE') || typeof window === 'undefined') return;
  try {
    localStorage.setItem(getClientStorageKey(STORAGE_KEYS.PROJECT_ID, selectedClientId), state.projectId ?? '');
    localStorage.setItem(getClientStorageKey(STORAGE_KEYS.PROJECT_NAME, selectedClientId), state.projectName ?? '');
    localStorage.setItem(getClientStorageKey(STORAGE_KEYS.LAST_VIEWED_TASK, selectedClientId), state.lastViewedTask ?? '');
    localStorage.setItem(getClientStorageKey(STORAGE_KEYS.LAST_VIEWED_CHANNEL, selectedClientId), state.lastViewedChannel ?? '');
  } catch (error) {
    logger.warn('[useNavigationContext] Failed to save', { error: asErrorMessage(error) });
  }
}

function clearStorage(selectedClientId: string | null): void {
  if (typeof window === 'undefined') return;
  try {
    Object.values(STORAGE_KEYS).forEach((baseKey) => {
      localStorage.removeItem(getClientStorageKey(baseKey, selectedClientId));
    });
  } catch (error) {
    logger.warn('[useNavigationContext] Failed to clear', { error: asErrorMessage(error) });
  }
}

/**
 * Hook for navigation state — no provider needed.
 * Uses localStorage + internal state, scoped to the selected client.
 */
export function useNavigationContext(): NavigationContextValue {
  const { selectedClientId } = useClientContext();
  const searchParams = useUrlSearchParams();
  const [navigationState, setNavigationState] = useState<NavigationState>(EMPTY_STATE);
  const mountedRef = useRef(false);

  // Load from storage on mount and when client changes
  useEffect(() => {
    if (!isFeatureEnabled('NAVIGATION_PERSISTENCE')) return;
    if (mountedRef.current && typeof window !== 'undefined') {
      const frameId = window.requestAnimationFrame(() => {
        setNavigationState(loadFromStorage(selectedClientId));
      });
      return () => window.cancelAnimationFrame(frameId);
    }
    return;
  }, [selectedClientId]);

  // Init on first mount
  useEffect(() => {
    if (mountedRef.current) return;
    mountedRef.current = true;
    if (typeof window === 'undefined') return;
    if (isFeatureEnabled('NAVIGATION_PERSISTENCE')) {
      const frameId = window.requestAnimationFrame(() => {
        setNavigationState(loadFromStorage(selectedClientId));
      });
      return () => window.cancelAnimationFrame(frameId);
    }
    return;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Sync with URL params (URL takes precedence)
  useEffect(() => {
    if (!isFeatureEnabled('NAVIGATION_PERSISTENCE')) return;
    const urlProjectId = searchParams.get('projectId');
    const urlProjectName = searchParams.get('projectName');
    if (urlProjectId || urlProjectName) {
      const frameId = requestAnimationFrame(() => {
        setNavigationState((prev) => ({
          ...prev,
          projectId: urlProjectId,
          projectName: urlProjectName,
        }));
      });
      return () => cancelAnimationFrame(frameId);
    }
    return;
  }, [searchParams]);

  const setProjectContext = useCallback(
    (projectId: string | null, projectName: string | null) => {
      setNavigationState((prev) => {
        const newState = { ...prev, projectId, projectName };
        saveToStorage(newState, selectedClientId);
        return newState;
      });
    },
    [selectedClientId],
  );

  const setLastViewedTask = useCallback(
    (taskId: string | null) => {
      setNavigationState((prev) => {
        const newState = { ...prev, lastViewedTask: taskId };
        saveToStorage(newState, selectedClientId);
        return newState;
      });
    },
    [selectedClientId],
  );

  const setLastViewedChannel = useCallback(
    (channelId: string | null) => {
      setNavigationState((prev) => {
        const newState = { ...prev, lastViewedChannel: channelId };
        saveToStorage(newState, selectedClientId);
        return newState;
      });
    },
    [selectedClientId],
  );

  const clearNavigationState = useCallback(() => {
    setNavigationState(EMPTY_STATE);
    clearStorage(selectedClientId);
  }, [selectedClientId]);

  const restoreNavigationState = useCallback(() => {
    setNavigationState(loadFromStorage(selectedClientId));
  }, [selectedClientId]);

  return useMemo(
    () => ({
      navigationState,
      setProjectContext,
      setLastViewedTask,
      setLastViewedChannel,
      clearNavigationState,
      restoreNavigationState,
    }),
    [navigationState, setProjectContext, setLastViewedTask, setLastViewedChannel, clearNavigationState, restoreNavigationState],
  );
}
