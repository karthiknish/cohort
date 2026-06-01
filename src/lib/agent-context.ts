export type AgentContextIds = {
    activeProposalId?: string;
    activeProjectId?: string;
    activeClientId?: string;
};
export type AgentContextChip = {
    id: string;
    label: string;
    href?: string;
};
export { AGENT_DASHBOARD_SHORTCUTS, filterAgentDashboardShortcuts, getAgentQuickSuggestions, getAgentSuggestions, trackAgentSuggestionClick, type AgentDashboardShortcut, type AgentSuggestion, } from './agent-suggestions';
export function deriveActiveContextFromPath(pathname: string | null): AgentContextIds {
    if (!pathname)
        return {};
    const segments = pathname.split('/').filter(Boolean);
    const fromSection = (section: string): string | undefined => {
        const sectionIndex = segments.indexOf(section);
        if (sectionIndex === -1)
            return undefined;
        const candidate = segments[sectionIndex + 1];
        if (!candidate)
            return undefined;
        if (['new', 'viewer', 'deck'].includes(candidate))
            return undefined;
        return candidate;
    };
    return {
        activeProposalId: fromSection('proposals'),
        activeProjectId: fromSection('projects'),
        activeClientId: fromSection('clients'),
    };
}
export function buildAgentContextChips(options: {
    pathname: string | null;
    ids: AgentContextIds;
    selectedClientName?: string | null;
}): AgentContextChip[] {
    const chips: AgentContextChip[] = [];
    const path = options.pathname ?? '';
    if (options.selectedClientName) {
        chips.push({
            id: 'workspace-client',
            label: `Client: ${options.selectedClientName}`,
            href: options.ids.activeClientId ? `/dashboard/clients/${options.ids.activeClientId}` : '/dashboard/clients',
        });
    }
    if (options.ids.activeProjectId) {
        chips.push({
            id: 'active-project',
            label: `Project ${options.ids.activeProjectId.slice(0, 8)}…`,
            href: `/dashboard/projects?projectId=${encodeURIComponent(options.ids.activeProjectId)}`,
        });
    }
    if (options.ids.activeProposalId) {
        chips.push({
            id: 'active-proposal',
            label: `Proposal ${options.ids.activeProposalId.slice(0, 8)}…`,
            href: `/dashboard/proposals/${options.ids.activeProposalId}`,
        });
    }
    if (path.includes('/dashboard/analytics')) {
        chips.push({ id: 'page', label: 'Analytics', href: '/dashboard/analytics' });
    }
    else if (path.includes('/dashboard/ads')) {
        chips.push({ id: 'page', label: 'Ads', href: '/dashboard/ads' });
    }
    else if (path.includes('/dashboard/tasks')) {
        chips.push({ id: 'page', label: 'Tasks', href: '/dashboard/tasks' });
    }
    else if (path.includes('/dashboard/projects')) {
        chips.push({ id: 'page', label: 'Projects', href: '/dashboard/projects' });
    }
    else if (path.includes('/dashboard/proposals')) {
        chips.push({ id: 'page', label: 'Proposals', href: '/dashboard/proposals' });
    }
    else if (path.startsWith('/for-you')) {
        chips.push({ id: 'page', label: 'For You', href: '/for-you' });
    }
    else if (path === '/dashboard' || path.startsWith('/dashboard/home')) {
        chips.push({ id: 'page', label: 'Overview', href: '/dashboard' });
    }
    return chips;
}
