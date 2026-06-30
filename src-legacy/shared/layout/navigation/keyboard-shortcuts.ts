'use client';
import { can, type DashboardCapability } from '@/lib/access-control/dashboard-access';
export type ShortcutRole = 'admin' | 'team' | 'client';
export type ShortcutContext = 'global' | 'proposal-builder';
export interface ShortcutDefinition {
    combo: string;
    description: string;
    group: 'Navigation' | 'Actions' | 'Panels' | 'Proposal Builder';
    context: ShortcutContext;
    /** @deprecated Prefer `capability`. */
    roles?: readonly ShortcutRole[];
    capability?: DashboardCapability;
}
const globalShortcuts: ShortcutDefinition[] = [
    {
        combo: 'mod+k',
        description: 'Open quick navigation',
        group: 'Panels',
        context: 'global',
    },
    {
        combo: 'shift+?',
        description: 'Show keyboard shortcuts',
        group: 'Panels',
        context: 'global',
    },
    {
        combo: 'g d',
        description: 'Go to dashboard',
        group: 'Navigation',
        context: 'global',
    },
    {
        combo: 'g t',
        description: 'Go to tasks',
        group: 'Navigation',
        context: 'global',
    },
    {
        combo: 'g m',
        description: 'Go to meetings',
        group: 'Navigation',
        context: 'global',
    },
    {
        combo: 'g a',
        description: 'Go to ads',
        group: 'Navigation',
        context: 'global',
        capability: 'agency.ads',
    },
    {
        combo: 'g p',
        description: 'Go to proposals',
        group: 'Navigation',
        context: 'global',
        capability: 'proposals.view',
    },
    {
        combo: 'g s',
        description: 'Go to settings',
        group: 'Navigation',
        context: 'global',
    },
    {
        combo: 'n t',
        description: 'Create a task',
        group: 'Actions',
        context: 'global',
    },
    {
        combo: 'n p',
        description: 'Create a proposal',
        group: 'Actions',
        context: 'global',
        capability: 'proposals.manage',
    },
];
const proposalBuilderShortcuts: ShortcutDefinition[] = [
    {
        combo: 'mod+s',
        description: 'Save draft now',
        group: 'Proposal Builder',
        context: 'proposal-builder',
    },
    {
        combo: 'mod+z',
        description: 'Undo last proposal edit',
        group: 'Proposal Builder',
        context: 'proposal-builder',
    },
    {
        combo: 'mod+shift+z',
        description: 'Redo proposal edit',
        group: 'Proposal Builder',
        context: 'proposal-builder',
    },
    {
        combo: 'escape',
        description: 'Close the proposal builder',
        group: 'Proposal Builder',
        context: 'proposal-builder',
    },
];
export const DASHBOARD_SHORTCUTS = [...globalShortcuts, ...proposalBuilderShortcuts];
export function getShortcutsForRole(userRole: string | null | undefined, context?: ShortcutContext): ShortcutDefinition[] {
    return DASHBOARD_SHORTCUTS.filter((shortcut) => {
        if (context && shortcut.context !== context) {
            return false;
        }
        if (shortcut.capability) {
            return can(userRole, shortcut.capability);
        }
        if (!shortcut.roles) {
            return true;
        }
        const role = (userRole ?? 'client') as ShortcutRole;
        return shortcut.roles.includes(role);
    });
}
