'use client';

import { useCallback, useSyncExternalStore } from 'react';
import { useRouter, usePathname } from '@/shared/ui/navigation';
import { useClientContext } from '@/shared/contexts/client-context';
import { useAuth } from '@/shared/contexts/auth-context';
import { useUrlSearchParams } from '@/shared/hooks/use-url-search-params';
import type { ProjectRecord } from '@/types/projects';

type ProjectContextValue = {
  selectedProjectId: string | null;
  selectedProject: ProjectRecord | null;
  selectProject: (projectId: string | null) => void;
  clearProject: () => void;
  isFromUrl: boolean;
};

// Module-level store for project selection (shared across components without a provider)
type ProjectState = {
  manualProjectId: string | null;
};

let projectState: ProjectState = { manualProjectId: null };
const projectListeners = new Set<() => void>();

function emitProjectChange() {
  projectListeners.forEach((l) => l());
}

function subscribeProject(listener: () => void): () => void {
  projectListeners.add(listener);
  return () => projectListeners.delete(listener);
}

function getProjectSnapshot(): ProjectState {
  return projectState;
}

function setManualProjectId(id: string | null) {
  projectState = { manualProjectId: id };
  emitProjectChange();
}

/**
 * Hook for project selection — no provider needed.
 * Uses a module-level store + URL search params.
 */
export function useProjectContext(): ProjectContextValue {
  const { selectedClient } = useClientContext();
  const { user } = useAuth();
  const searchParams = useUrlSearchParams();
  const { push } = useRouter();
  const pathname = usePathname();

  const { manualProjectId } = useSyncExternalStore(subscribeProject, getProjectSnapshot, getProjectSnapshot);

  const urlProjectId = selectedClient?.id ? searchParams.get('projectId') : null;
  const selectedProjectId = urlProjectId ?? manualProjectId;
  const isFromUrl = urlProjectId !== null;

  const selectedProject: ProjectRecord | null = (() => {
    if (!selectedProjectId || !selectedClient?.id) return null;
    const projectName = searchParams.get('projectName');
    const now = new Date().toISOString();
    return {
      id: selectedProjectId,
      name: projectName || 'Unknown Project',
      description: null,
      status: 'active' as const,
      clientId: selectedClient.id,
      clientName: selectedClient.name,
      startDate: null,
      endDate: null,
      tags: [],
      ownerId: user?.id || null,
      createdAt: now,
      updatedAt: now,
      taskCount: 0,
      openTaskCount: 0,
      recentActivityAt: now,
    } as ProjectRecord;
  })();

  const selectProject = useCallback(
    (projectId: string | null) => {
      setManualProjectId(projectId);
      if (projectId && !searchParams.get('projectId')) {
        const newParams = new URLSearchParams(searchParams.toString());
        newParams.set('projectId', projectId);
        push(`${pathname}?${newParams.toString()}`);
      }
    },
    [searchParams, push, pathname],
  );

  const clearProject = useCallback(() => {
    setManualProjectId(null);
    const newParams = new URLSearchParams(searchParams.toString());
    newParams.delete('projectId');
    newParams.delete('projectName');
    push(`${pathname}?${newParams.toString()}`);
  }, [searchParams, push, pathname]);

  return {
    selectedProjectId,
    selectedProject,
    selectProject,
    clearProject,
    isFromUrl,
  };
}
