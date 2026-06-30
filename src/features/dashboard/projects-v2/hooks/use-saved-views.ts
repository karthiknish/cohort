'use client';

import { useCallback, useEffect, useState } from 'react';
import type { SavedView, SortDirection, SortField, StatusFilter, ViewMode } from '../types';

const SAVED_VIEWS_STORAGE_KEY = 'cohorts_projects_saved_views';

function loadSavedViews(): SavedView[] {
  if (typeof window === 'undefined') return [];
  try {
    const raw = window.localStorage.getItem(SAVED_VIEWS_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((entry): entry is SavedView =>
      entry &&
      typeof entry.id === 'string' &&
      typeof entry.name === 'string' &&
      typeof entry.statusFilter === 'string' &&
      typeof entry.sortField === 'string' &&
      typeof entry.sortDirection === 'string' &&
      typeof entry.searchQuery === 'string' &&
      typeof entry.viewMode === 'string' &&
      typeof entry.createdAt === 'number',
    );
  } catch {
    return [];
  }
}

function persistSavedViews(views: SavedView[]) {
  if (typeof window !== 'undefined') {
    window.localStorage.setItem(SAVED_VIEWS_STORAGE_KEY, JSON.stringify(views));
  }
}

export type SavedViewSnapshot = {
  statusFilter: StatusFilter;
  sortField: SortField;
  sortDirection: SortDirection;
  searchQuery: string;
  viewMode: ViewMode;
};

export function useSavedViews() {
  const [savedViews, setSavedViews] = useState<SavedView[]>([]);

  useEffect(() => {
    setSavedViews(loadSavedViews());
  }, []);

  const saveView = useCallback(
    (name: string, snapshot: SavedViewSnapshot) => {
      const view: SavedView = {
        id: `view-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        name: name.trim(),
        ...snapshot,
        createdAt: Date.now(),
      };
      setSavedViews((previous) => {
        const next = [...previous, view];
        persistSavedViews(next);
        return next;
      });
      return view;
    },
    [],
  );

  const deleteView = useCallback((id: string) => {
    setSavedViews((previous) => {
      const next = previous.filter((view) => view.id !== id);
      persistSavedViews(next);
      return next;
    });
  }, []);

  return { savedViews, saveView, deleteView };
}
