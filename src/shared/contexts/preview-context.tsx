'use client';

import { useCallback, useSyncExternalStore } from 'react';
import {
  isPreviewModeEnabled,
  isScreenRecordingModeEnabled,
  setPreviewModeEnabled,
  PREVIEW_MODE_EVENT,
  PREVIEW_MODE_STORAGE_KEY,
} from '@/lib/preview-data';

interface PreviewContextValue {
  isPreviewMode: boolean;
  togglePreviewMode: () => void;
  setPreviewMode: (enabled: boolean) => void;
}

const DEFAULT_PREVIEW_CONTEXT: PreviewContextValue = {
  isPreviewMode: false,
  togglePreviewMode: () => {},
  setPreviewMode: () => {},
};

function subscribe(onStoreChange: () => void): () => void {
  if (typeof window === 'undefined') return () => {};
  const onStorage = (event: StorageEvent) => {
    if (event.key === PREVIEW_MODE_STORAGE_KEY) onStoreChange();
  };
  const onPreviewEvent = () => onStoreChange();
  window.addEventListener('storage', onStorage);
  window.addEventListener(PREVIEW_MODE_EVENT, onPreviewEvent as EventListener);
  return () => {
    window.removeEventListener('storage', onStorage);
    window.removeEventListener(PREVIEW_MODE_EVENT, onPreviewEvent as EventListener);
  };
}

function getSnapshot(): boolean {
  return isPreviewModeEnabled();
}

function getServerSnapshot(): boolean {
  return false;
}

/**
 * Hook for preview mode state — no provider needed.
 * Backed by `useSyncExternalStore` reading from localStorage.
 */
export function usePreview(): PreviewContextValue {
  const storedPreviewMode = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
  const isPreviewModeForced = isScreenRecordingModeEnabled();
  const isPreviewMode = isPreviewModeForced || storedPreviewMode;

  const setPreviewMode = useCallback((enabled: boolean) => {
    if (isPreviewModeForced) return;
    setPreviewModeEnabled(enabled);
  }, [isPreviewModeForced]);

  const togglePreviewMode = useCallback(() => {
    if (isPreviewModeForced) return;
    setPreviewModeEnabled(!isPreviewMode);
  }, [isPreviewMode, isPreviewModeForced]);

  return { isPreviewMode, togglePreviewMode, setPreviewMode };
}
