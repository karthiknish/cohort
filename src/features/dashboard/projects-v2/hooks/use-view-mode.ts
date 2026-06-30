'use client';

import { useCallback, useState } from 'react';
import type { ViewMode } from '../types';

export const PROJECTS_VIEW_MODE_STORAGE_KEY = 'cohorts_projects_view_mode';

export function loadStoredViewMode(): ViewMode {
  if (typeof window === 'undefined') return 'list';
  const stored = window.localStorage.getItem(PROJECTS_VIEW_MODE_STORAGE_KEY);
  if (stored === 'list' || stored === 'grid' || stored === 'board' || stored === 'gantt') return stored;
  return 'list';
}

export function useViewMode() {
  const [viewMode, setViewModeState] = useState<ViewMode>(() => loadStoredViewMode());

  const setViewMode = useCallback((mode: ViewMode) => {
    setViewModeState(mode);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem(PROJECTS_VIEW_MODE_STORAGE_KEY, mode);
    }
  }, []);

  return { viewMode, setViewMode };
}
