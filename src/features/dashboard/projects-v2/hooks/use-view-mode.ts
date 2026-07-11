'use client';

import { useCallback, useEffect, useState } from 'react';
import { usePathname, useRouter, useSearchParams } from '@/shared/ui/navigation';
import type { ViewMode } from '../types';

export const PROJECTS_VIEW_MODE_STORAGE_KEY = 'cohorts_projects_view_mode';
export const VIEW_MODE_QUERY_PARAM = 'view';

const VIEW_MODES: ViewMode[] = ['list', 'grid', 'board', 'gantt', 'calendar'];

export function isViewMode(value: string | null | undefined): value is ViewMode {
  return value !== null && value !== undefined && (VIEW_MODES as string[]).includes(value);
}

export function loadStoredViewMode(): ViewMode {
  if (typeof window === 'undefined') return 'list';
  const stored = window.localStorage.getItem(PROJECTS_VIEW_MODE_STORAGE_KEY);
  return isViewMode(stored) ? stored : 'list';
}

export function useViewMode() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const resolveInitialViewMode = useCallback((): ViewMode => {
    const fromUrl = searchParams.get(VIEW_MODE_QUERY_PARAM);
    if (isViewMode(fromUrl)) return fromUrl;
    return loadStoredViewMode();
  }, [searchParams]);

  const [viewMode, setViewModeState] = useState<ViewMode>(() => resolveInitialViewMode());

  useEffect(() => {
    const fromUrl = searchParams.get(VIEW_MODE_QUERY_PARAM);
    if (isViewMode(fromUrl) && fromUrl !== viewMode) {
      setViewModeState(fromUrl);
    }
  }, [searchParams, viewMode]);

  const setViewMode = useCallback(
    (mode: ViewMode) => {
      setViewModeState(mode);
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(PROJECTS_VIEW_MODE_STORAGE_KEY, mode);
      }

      const params = new URLSearchParams(searchParams.toString());
      params.set(VIEW_MODE_QUERY_PARAM, mode);
      router.replace(`${pathname}?${params.toString()}`, { scroll: false });
    },
    [router, pathname, searchParams],
  );

  return { viewMode, setViewMode };
}
