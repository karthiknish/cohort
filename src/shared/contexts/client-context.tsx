'use client';

import {
  createContext,
  use,
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useSyncExternalStore,
} from 'react';
import { useMutation, useQuery } from 'convex/react';
import { useAuth } from '@/shared/contexts/auth-context';
import type { ClientRecord, ClientTeamMember } from '@/types/clients';
import { clientsApi } from '@/lib/convex-api';
import { asErrorMessage, isNotFoundAppError } from '@/lib/convex-errors';
import { logger } from '@/lib/logger';
import { reportConvexFailure } from '@/lib/handle-convex-error';
import {
  getPreviewClients,
  isPreviewModeEnabled,
  PREVIEW_MODE_EVENT,
  PREVIEW_MODE_STORAGE_KEY,
} from '@/lib/preview-data';
import { getWorkspaceId } from '@/lib/utils';

// ── Types ──────────────────────────────────────────────────────────────

export type ClientContextValue = {
  workspaceId: string | null;
  clients: ClientRecord[];
  selectedClientId: string | null;
  selectedClient: ClientRecord | null;
  loading: boolean;
  error: string | null;
  refreshClients: () => Promise<ClientRecord[]>;
  retryClients: () => void;
  selectClient: (clientId: string | null) => void;
  createClient: (input: {
    name: string;
    accountManager: string;
    teamMembers: ClientTeamMember[];
  }) => Promise<ClientRecord>;
  removeClient: (clientId: string) => void;
};

// ── Helpers (inlined from client-context-types) ────────────────────────

const STORAGE_KEY_SELECTED = 'cohorts.dashboard.selectedClient';

type ConvexClientRow = {
  legacyId: string;
  workspaceId?: string | null;
  name: string;
  accountManager?: string | null;
  teamMembers?: unknown;
  createdAtMs?: number | null;
  updatedAtMs?: number | null;
};

function isConvexClientRow(value: unknown): value is ConvexClientRow {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as { legacyId?: unknown }).legacyId === 'string' &&
    typeof (value as { name?: unknown }).name === 'string'
  );
}

function mapClients(rows: unknown[]): ClientRecord[] {
  const list = rows.flatMap((row) =>
    isConvexClientRow(row)
      ? [{
          id: row.legacyId,
          workspaceId: typeof row.workspaceId === 'string' ? row.workspaceId : null,
          name: row.name,
          accountManager: typeof row.accountManager === 'string' ? row.accountManager : '',
          teamMembers: Array.isArray(row.teamMembers) ? row.teamMembers : [],
          createdAt: row.createdAtMs ? new Date(row.createdAtMs).toISOString() : null,
          updatedAt: row.updatedAtMs ? new Date(row.updatedAtMs).toISOString() : null,
        }]
      : [],
  );
  list.sort((a, b) => a.name.localeCompare(b.name));
  return list;
}

function extractRows(convexClients: unknown): unknown[] {
  if (Array.isArray(convexClients)) return convexClients;
  if (convexClients && typeof convexClients === 'object' && 'items' in convexClients && Array.isArray(convexClients.items)) {
    return convexClients.items;
  }
  return [];
}

function resolveSelectedClientId(
  clients: ClientRecord[],
  currentSelection: string | null,
  storedSelection: string | null,
): string | null {
  if (currentSelection && clients.some((c) => c.id === currentSelection)) return currentSelection;
  if (storedSelection && clients.some((c) => c.id === storedSelection)) return storedSelection;
  return clients[0]?.id ?? null;
}

function getInitialPreviewClientId(): string | null {
  return isPreviewModeEnabled() ? getPreviewClients()[0]?.id ?? null : null;
}

// ── Reducer ────────────────────────────────────────────────────────────

type ClientProviderState = {
  selectedClientId: string | null;
  loading: boolean;
  error: string | null;
};

type ClientProviderAction =
  | { type: 'syncState'; selectedClientId: string | null; loading: boolean; error: string | null }
  | { type: 'setSelectedClientId'; selectedClientId: string | null }
  | { type: 'setError'; error: string | null };

function createInitialClientProviderState(): ClientProviderState {
  return { selectedClientId: getInitialPreviewClientId(), loading: false, error: null };
}

function clientProviderReducer(state: ClientProviderState, action: ClientProviderAction): ClientProviderState {
  switch (action.type) {
    case 'syncState':
      return { selectedClientId: action.selectedClientId, loading: action.loading, error: action.error };
    case 'setSelectedClientId':
      return { ...state, selectedClientId: action.selectedClientId };
    case 'setError':
      return { ...state, error: action.error };
    default:
      return state;
  }
}

// ── Context + Provider ─────────────────────────────────────────────────

const ClientContext = createContext<ClientContextValue | undefined>(undefined);

export function ClientProvider({ children }: { children: React.ReactNode }) {
  const { user, loading: authLoading, isSyncing, authPhase } = useAuth();
  const [{ selectedClientId, loading, error }, dispatch] = useReducer(
    clientProviderReducer,
    undefined,
    createInitialClientProviderState,
  );
  const hasInitializedRef = useRef(false);

  const previewEnabled = useSyncExternalStore(
    (onStoreChange) => {
      if (typeof window === 'undefined') return () => undefined;
      const handler = () => onStoreChange();
      window.addEventListener('storage', handler);
      window.addEventListener(PREVIEW_MODE_EVENT, handler);
      return () => {
        window.removeEventListener('storage', handler);
        window.removeEventListener(PREVIEW_MODE_EVENT, handler);
      };
    },
    () => isPreviewModeEnabled(),
    () => false,
  );

  const selectionBeforePreviewRef = useRef<string | null>(null);
  const previousPreviewEnabledRef = useRef(previewEnabled);
  const workspaceId = getWorkspaceId(user);
  const canQuery = authPhase === 'ready_active' && !authLoading && !isSyncing && !!workspaceId;
  const isAdmin = user?.role === 'admin';
  const shouldSkipClients = previewEnabled || !canQuery || !user?.agencyId;
  const convexClientsArgs = shouldSkipClients
    ? 'skip'
    : { workspaceId, limit: 100, includeAllWorkspaces: isAdmin };
  const convexClients = useQuery(clientsApi.list, convexClientsArgs);
  const convexCreateClient = useMutation(clientsApi.create);
  const convexSoftDeleteClient = useMutation(clientsApi.softDelete);
  const storageKey = workspaceId ? `${STORAGE_KEY_SELECTED}:${workspaceId}` : STORAGE_KEY_SELECTED;
  const selectedClientIdRef = useRef(selectedClientId);

  useEffect(() => {
    selectedClientIdRef.current = selectedClientId;
  }, [selectedClientId]);

  useEffect(() => {
    if (previousPreviewEnabledRef.current === previewEnabled) return;
    previousPreviewEnabledRef.current = previewEnabled;
    if (previewEnabled) {
      selectionBeforePreviewRef.current = selectedClientIdRef.current;
      const previewClients = getPreviewClients();
      dispatch({ type: 'syncState', selectedClientId: previewClients[0]?.id ?? null, loading: false, error: null });
    } else if (selectionBeforePreviewRef.current !== null) {
      dispatch({ type: 'setSelectedClientId', selectedClientId: selectionBeforePreviewRef.current });
      selectionBeforePreviewRef.current = null;
    }
  }, [previewEnabled]);

  const applyClientSelectionSync = useCallback(() => {
    if (previewEnabled) {
      const previewClients = getPreviewClients();
      const currentSelection = selectedClientIdRef.current;
      const targetId =
        currentSelection && previewClients.some((client) => client.id === currentSelection)
          ? currentSelection
          : previewClients[0]?.id ?? null;
      dispatch({ type: 'syncState', selectedClientId: targetId, loading: false, error: null });
      return;
    }
    if (authLoading || isSyncing) return;
    if (!workspaceId) {
      dispatch({ type: 'syncState', selectedClientId: null, loading: false, error: null });
      return;
    }
    if (convexClients === undefined) {
      dispatch({ type: 'syncState', selectedClientId: selectedClientIdRef.current, loading: true, error: null });
      return;
    }
    const rows = extractRows(convexClients);
    if (rows.length === 0) {
      dispatch({ type: 'syncState', selectedClientId: null, loading: false, error: 'No clients found for this workspace' });
      return;
    }
    const clients = mapClients(rows);
    const currentSelection = selectedClientIdRef.current;
    const stored = typeof window !== 'undefined' ? window.localStorage.getItem(storageKey) : null;
    const targetId = resolveSelectedClientId(clients, currentSelection, stored);
    hasInitializedRef.current = true;
    dispatch({ type: 'syncState', selectedClientId: targetId, loading: false, error: null });
  }, [previewEnabled, authLoading, isSyncing, workspaceId, convexClients, storageKey]);

  useEffect(() => {
    applyClientSelectionSync();
  }, [applyClientSelectionSync]);

  useEffect(() => {
    if (typeof window === 'undefined' || previewEnabled || !workspaceId) return;
    if (selectedClientId) {
      try {
        window.localStorage.setItem(storageKey, selectedClientId);
      } catch (e) {
        logger.warn('[ClientProvider] failed to persist client selection', { error: asErrorMessage(e) });
      }
    } else if (hasInitializedRef.current) {
      window.localStorage.removeItem(storageKey);
    }
  }, [previewEnabled, selectedClientId, storageKey, workspaceId]);

  const resolvedClients = useMemo(() => {
    if (previewEnabled) return getPreviewClients();
    if (!workspaceId || convexClients === undefined) return [];
    return mapClients(extractRows(convexClients));
  }, [previewEnabled, workspaceId, convexClients]);

  const clientsRef = useRef(resolvedClients);
  useEffect(() => {
    clientsRef.current = resolvedClients;
  }, [resolvedClients]);

  const refreshClients = useCallback(async () => clientsRef.current, []);
  const retryClients = useCallback(() => {
    dispatch({ type: 'setError', error: null });
    applyClientSelectionSync();
  }, [applyClientSelectionSync]);
  const selectClient = useCallback((clientId: string | null) => {
    dispatch({ type: 'setSelectedClientId', selectedClientId: clientId });
  }, []);

  const createClient = useCallback(async (input: {
    name: string;
    accountManager: string;
    teamMembers: ClientTeamMember[];
  }): Promise<ClientRecord> => {
    if (!workspaceId) throw new Error('Workspace is required to create a client');
    const name = input.name.trim();
    const accountManager = input.accountManager.trim();
    if (!name || !accountManager) throw new Error('Client name and account manager are required');
    const teamMembers = input.teamMembers.flatMap((member) => {
      const normalized = { name: member.name.trim(), role: typeof member.role === 'string' ? member.role.trim() : '' };
      return normalized.name.length > 0 ? [normalized] : [];
    });
    if (!teamMembers.some((m) => m.name.toLowerCase() === accountManager.toLowerCase())) {
      teamMembers.unshift({ name: accountManager, role: 'Account Manager' });
    }
    try {
      const res = await convexCreateClient({ workspaceId, name, accountManager, teamMembers, createdBy: user?.id ?? null });
      const created: ClientRecord = {
        id: res.legacyId,
        workspaceId,
        name,
        accountManager,
        teamMembers,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      dispatch({ type: 'setSelectedClientId', selectedClientId: created.id });
      return created;
    } catch (err) {
      reportConvexFailure({
        error: err,
        context: 'ClientProvider:createClient',
        title: 'Could not create client',
        fallbackMessage: 'Unable to create the client. Please try again.',
      });
      throw err;
    }
  }, [workspaceId, convexCreateClient, user]);

  const removeClient = useCallback(async (clientId: string) => {
    if (!workspaceId) throw new Error('Workspace is required to remove a client');
    const targetClient = clientsRef.current.find((c) => c.id === clientId);
    const targetWorkspaceId = targetClient?.workspaceId ?? workspaceId;
    const remainingClients = clientsRef.current.filter((c) => c.id !== clientId);
    const fallbackClientId = resolveSelectedClientId(remainingClients, selectedClientIdRef.current, null);
    try {
      await convexSoftDeleteClient({ workspaceId: targetWorkspaceId, legacyId: clientId, deletedAtMs: Date.now() });
    } catch (error) {
      if (!isNotFoundAppError(error)) throw error;
    }
    dispatch({
      type: 'setSelectedClientId',
      selectedClientId: selectedClientIdRef.current === clientId ? fallbackClientId : selectedClientIdRef.current,
    });
  }, [workspaceId, convexSoftDeleteClient]);

  useEffect(() => {
    if (loading) return;
    if (!selectedClientId) {
      if (previewEnabled) {
        const fallbackClientId = getPreviewClients()[0]?.id ?? null;
        if (fallbackClientId) {
          dispatch({ type: 'setSelectedClientId', selectedClientId: fallbackClientId });
        }
      }
      return;
    }
    if (resolvedClients.some((c) => c.id === selectedClientId)) return;
    const fallbackClientId = resolveSelectedClientId(resolvedClients, null, null);
    dispatch({ type: 'setSelectedClientId', selectedClientId: fallbackClientId });
  }, [loading, previewEnabled, resolvedClients, selectedClientId]);

  const selectedClient = selectedClientId
    ? resolvedClients.find((c) => c.id === selectedClientId) ?? null
    : null;

  const value = useMemo<ClientContextValue>(
    () => ({
      workspaceId,
      clients: resolvedClients,
      selectedClientId,
      selectedClient,
      loading,
      error,
      refreshClients,
      retryClients,
      selectClient,
      createClient,
      removeClient,
    }),
    [workspaceId, resolvedClients, selectedClientId, selectedClient, loading, error, refreshClients, retryClients, selectClient, createClient, removeClient],
  );

  return <ClientContext.Provider value={value}>{children}</ClientContext.Provider>;
}

export function useClientContext(): ClientContextValue {
  const context = use(ClientContext);
  if (!context) throw new Error('useClientContext must be used within a ClientProvider');
  return context;
}
