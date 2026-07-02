import type { ComponentType } from 'react';
import { can, capabilityForHref, type DashboardCapability } from '@/lib/access-control/dashboard-access';
export const COMMAND_MENU_STATUS_ID = 'command-menu-status';
export type SearchableClient = {
    legacyId: string;
    name: string;
};
export type SearchableTask = {
    legacyId: string;
    title: string;
    status?: string | null;
    projectName?: string | null;
};
export type SearchableProject = {
    legacyId: string;
    name: string;
    status?: string | null;
};
export type SearchableProposal = {
    legacyId: string;
    clientName?: string | null;
    status?: string | null;
};
export type SearchEntityResult = {
    id: string;
    href: string;
    label: string;
    description: string;
    icon: ComponentType<{
        className?: string;
    }>;
    group: 'AI Search' | 'Clients' | 'Tasks' | 'Projects' | 'Proposals';
};
export interface CommandMenuProps {
    onOpenHelp?: () => void;
    onOpenShortcuts?: () => void;
}
export function includesQuery(value: string | null | undefined, query: string): boolean {
    return typeof value === 'string' && value.toLowerCase().includes(query);
}
export function limitResults<T>(items: T[], limit = 4): T[] {
    return items.slice(0, limit);
}
export function itemAllowed(userRole: string | null, capability?: DashboardCapability, href?: string) {
    const resolved = capability ?? (href ? capabilityForHref(href) : null);
    if (!resolved)
        return true;
    return can(userRole, resolved);
}
