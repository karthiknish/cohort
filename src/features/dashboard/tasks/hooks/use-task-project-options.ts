'use client';
import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { useAuth } from '@/shared/contexts/auth-context';
import { useClientContext } from '@/shared/contexts/client-context';
import { projectsApi } from '@/lib/convex-api';

type ProjectRow = {
    legacyId: string;
    name?: string;
    status?: string;
    clientId?: string | null;
    clientName?: string | null;
};

export type TaskProjectOption = {
    id: string;
    name: string;
    status?: string;
    clientId?: string | null;
    clientName?: string | null;
};

/**
 * Fetches a lightweight list of projects for the current workspace,
 * optionally scoped to the selected client. Used by task form project
 * pickers in the create/edit flows.
 */
export function useTaskProjectOptions(): {
    projects: TaskProjectOption[];
    loading: boolean;
} {
    const { user } = useAuth();
    const { selectedClientId } = useClientContext();
    const workspaceId = user?.agencyId ? String(user.agencyId) : null;

    const listArgs = workspaceId
        ? {
            workspaceId,
            limit: 200,
            clientId: selectedClientId ?? undefined,
        }
        : 'skip';

    const projectsRealtime = useQuery(projectsApi.list, listArgs) as
        | ProjectRow[]
        | undefined
        | null;

    const projects = useMemo(() => {
        const rows = Array.isArray(projectsRealtime) ? projectsRealtime : [];
        return rows.map((row) => ({
            id: String(row.legacyId),
            name: String(row.name ?? 'Untitled project'),
            status: typeof row.status === 'string' ? row.status : undefined,
            clientId: row.clientId ?? null,
            clientName: row.clientName ?? null,
        }));
    }, [projectsRealtime]);

    const loading = Boolean(workspaceId) && projectsRealtime === undefined;

    return { projects, loading };
}
