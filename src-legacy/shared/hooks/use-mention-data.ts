'use client';
import { useMemo } from 'react';
import { useQuery } from 'convex/react';
import { useAuth } from '@/shared/contexts/auth-context';
import { useClientContext } from '@/shared/contexts/client-context';
import type { MentionItem } from '@/shared/components/agent-mode/mention-dropdown';
import { projectsApi, usersApi } from '@/lib/convex-api';
interface Team {
    id: string;
    name: string;
    memberCount?: number;
}
interface TeamMember {
    id: string;
    name: string;
    email?: string;
    role?: string;
}
type ProjectRow = {
    legacyId: string;
    name?: string;
    status?: string;
};
const EMPTY_TEAM_MEMBERS: TeamMember[] = [];
export function useMentionData() {
    const { user } = useAuth();
    const { clients: contextClients } = useClientContext();
    // Use clients from context (already fetched by ClientProvider)
    const clients = contextClients.map((c) => ({ id: c.id, name: c.name, company: c.name }));
    const workspaceId = user?.agencyId ? String(user.agencyId) : null;
    const projectsRealtime = useQuery(projectsApi.list, !workspaceId
        ? 'skip'
        : {
            workspaceId,
            limit: 100,
        }) as ProjectRow[] | undefined;
    const projectsLoading = Boolean(workspaceId) && projectsRealtime === undefined;
    const teamMembers = useQuery(usersApi.listWorkspaceMembers, workspaceId
        ? {
            workspaceId,
            limit: 500,
        }
        : 'skip') as TeamMember[] | undefined;
    const teamLoading = Boolean(workspaceId) && teamMembers === undefined;
    const allUsersRealtime = useQuery(usersApi.listAllUsers, workspaceId
        ? {
            limit: 500,
        }
        : 'skip') as TeamMember[] | undefined;
    const allUsersLoading = Boolean(workspaceId) && allUsersRealtime === undefined;
    const projects = (() => {
        const rows = Array.isArray(projectsRealtime) ? projectsRealtime : [];
        return rows.map((row) => ({
            id: String(row.legacyId),
            name: String(row.name ?? ''),
            status: typeof row.status === 'string' ? row.status : undefined,
        }));
    })();
    const users = (() => {
        const merged = new Map<string, TeamMember>();
        for (const member of teamMembers ?? EMPTY_TEAM_MEMBERS) {
            if (!member?.id)
                continue;
            merged.set(member.id, member);
        }
        for (const member of allUsersRealtime ?? EMPTY_TEAM_MEMBERS) {
            if (!member?.id)
                continue;
            if (!merged.has(member.id)) {
                merged.set(member.id, member);
            }
        }
        return Array.from(merged.values()).toSorted((a, b) => a.name.localeCompare(b.name));
    })();
    // For now, treat teams as empty - could fetch actual team data if needed
    const teams: Team[] = [];
    const isLoading = projectsLoading || teamLoading || allUsersLoading;
    // Get all items as MentionItem array for quick access
    const allItems = ((): MentionItem[] => {
        const items: MentionItem[] = [];
        clients.forEach((c) => items.push({ id: c.id, name: c.name, type: 'client', subtitle: c.company }));
        projects.forEach((p) => items.push({ id: p.id, name: p.name, type: 'project', subtitle: p.status }));
        teams.forEach((t) => items.push({ id: t.id, name: t.name, type: 'team', subtitle: t.memberCount ? `${t.memberCount} members` : undefined }));
        users.forEach((u: TeamMember) => items.push({ id: u.id, name: u.name, type: 'user', subtitle: u.role || u.email }));
        return items;
    })();
    return {
        clients,
        projects,
        teams,
        users,
        allItems,
        isLoading,
    };
}
