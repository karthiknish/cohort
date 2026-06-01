import { getPreviewClients, isPreviewModeEnabled } from '@/lib/preview-data';
import type { ClientRecord, ClientTeamMember } from '@/types/clients';
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
export const STORAGE_KEY_SELECTED = 'cohorts.dashboard.selectedClient';
export type ConvexClientRow = {
    legacyId: string;
    workspaceId?: string | null;
    name: string;
    accountManager?: string | null;
    teamMembers?: unknown;
    createdAtMs?: number | null;
    updatedAtMs?: number | null;
};
export function isConvexClientRow(value: unknown): value is ConvexClientRow {
    return (typeof value === 'object' &&
        value !== null &&
        typeof (value as {
            legacyId?: unknown;
        }).legacyId === 'string' &&
        typeof (value as {
            name?: unknown;
        }).name === 'string');
}
export function mapClients(rows: unknown[]): ClientRecord[] {
    const list = rows.flatMap((row) => isConvexClientRow(row) ? [{
            id: row.legacyId,
            workspaceId: typeof row.workspaceId === 'string' ? row.workspaceId : null,
            name: row.name,
            accountManager: typeof row.accountManager === 'string' ? row.accountManager : '',
            teamMembers: Array.isArray(row.teamMembers) ? row.teamMembers : [],
            createdAt: row.createdAtMs ? new Date(row.createdAtMs).toISOString() : null,
            updatedAt: row.updatedAtMs ? new Date(row.updatedAtMs).toISOString() : null,
        }] : []);
    list.sort((a, b) => a.name.localeCompare(b.name));
    return list;
}
export function extractRows(convexClients: unknown): unknown[] {
    if (Array.isArray(convexClients))
        return convexClients;
    if (convexClients && typeof convexClients === 'object' && 'items' in convexClients && Array.isArray(convexClients.items)) {
        return convexClients.items;
    }
    return [];
}
export function resolveSelectedClientId(clients: ClientRecord[], currentSelection: string | null, storedSelection: string | null): string | null {
    if (currentSelection && clients.some((client) => client.id === currentSelection)) {
        return currentSelection;
    }
    if (storedSelection && clients.some((client) => client.id === storedSelection)) {
        return storedSelection;
    }
    return clients[0]?.id ?? null;
}
export function getInitialPreviewClientId(): string | null {
    return isPreviewModeEnabled() ? getPreviewClients()[0]?.id ?? null : null;
}
export type ClientProviderState = {
    selectedClientId: string | null;
    loading: boolean;
    error: string | null;
};
export type ClientProviderAction = {
    type: 'syncState';
    selectedClientId: string | null;
    loading: boolean;
    error: string | null;
} | {
    type: 'setSelectedClientId';
    selectedClientId: string | null;
} | {
    type: 'setError';
    error: string | null;
};
export function createInitialClientProviderState(): ClientProviderState {
    return {
        selectedClientId: getInitialPreviewClientId(),
        loading: false,
        error: null,
    };
}
export function clientProviderReducer(state: ClientProviderState, action: ClientProviderAction): ClientProviderState {
    switch (action.type) {
        case 'syncState':
            return {
                selectedClientId: action.selectedClientId,
                loading: action.loading,
                error: action.error,
            };
        case 'setSelectedClientId':
            return {
                ...state,
                selectedClientId: action.selectedClientId,
            };
        case 'setError':
            return {
                ...state,
                error: action.error,
            };
        default:
            return state;
    }
}
