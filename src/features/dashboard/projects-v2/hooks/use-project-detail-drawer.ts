'use client';

import { useCallback, useState } from 'react';
import type { ProjectDetailDrawerState } from '../types';

export function useProjectDetailDrawer() {
  const [drawerState, setDrawerState] = useState<ProjectDetailDrawerState>({
    open: false,
    projectId: null,
  });

  const openDrawer = useCallback((projectId: string) => {
    setDrawerState({ open: true, projectId });
  }, []);

  const closeDrawer = useCallback(() => {
    setDrawerState((previous) => ({ ...previous, open: false }));
  }, []);

  const toggleDrawer = useCallback((projectId: string) => {
    setDrawerState((previous) =>
      previous.open && previous.projectId === projectId
        ? { open: false, projectId: null }
        : { open: true, projectId },
    );
  }, []);

  return { drawerState, openDrawer, closeDrawer, toggleDrawer };
}
