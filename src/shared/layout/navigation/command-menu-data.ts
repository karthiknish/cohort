import type { ComponentType } from 'react';
import { BarChart3, CheckSquare, FileText, MessageSquare, Home, Briefcase, Megaphone, Video, Activity, Users, Plus, Share2, } from 'lucide-react';
import type { DashboardCapability } from '@/lib/access-control/dashboard-access';
import { itemAllowed } from './command-menu-types';
export const navigationItemDefs: Array<{
    name: string;
    href: string;
    icon: ComponentType<{
        className?: string;
    }>;
    description: string;
    capability?: DashboardCapability;
}> = [
    { name: 'Dashboard', href: '/dashboard', icon: Home, description: 'Overview and stats' },
    {
        name: 'Clients',
        href: '/admin/clients',
        icon: Users,
        description: 'Manage client workspaces',
        capability: 'admin.directory',
    },
    { name: 'For You', href: '/for-you', icon: Activity, description: 'Personalized activity feed' },
    {
        name: 'Analytics',
        href: '/dashboard/analytics',
        icon: BarChart3,
        description: 'Performance insights',
        capability: 'analytics.view',
    },
    {
        name: 'Ads',
        href: '/dashboard/ads',
        icon: Megaphone,
        description: 'Ad platform integrations',
        capability: 'agency.ads',
    },
    {
        name: 'Socials',
        href: '/dashboard/socials',
        icon: Share2,
        description: 'Meta social insights & AI suggestions',
        capability: 'agency.socials',
    },
    { name: 'Meetings', href: '/dashboard/meetings', icon: Video, description: 'Schedule and run meetings' },
    { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare, description: 'Task management' },
    {
        name: 'Proposals',
        href: '/dashboard/proposals',
        icon: FileText,
        description: 'View shared proposals and decks',
        capability: 'proposals.view',
    },
    { name: 'Collaboration', href: '/dashboard/collaboration', icon: MessageSquare, description: 'Team chat' },
    { name: 'Projects', href: '/dashboard/projects', icon: Briefcase, description: 'Project management' },
];
export const quickActions: Array<{
    name: string;
    action: string;
    icon: ComponentType<{
        className?: string;
    }>;
    description: string;
    capability?: DashboardCapability;
}> = [
    {
        name: 'Create proposal',
        action: '/dashboard/proposals',
        icon: Plus,
        description: 'Generate new proposal',
        capability: 'proposals.manage',
    },
    { name: 'Add task', action: '/dashboard/tasks?action=create', icon: Plus, description: 'Create a new task' },
    { name: 'Open projects', action: '/dashboard/projects', icon: Plus, description: 'Jump to active projects' },
];
export function getNavigationItemsForUserRole(userRole: string | null) {
    return navigationItemDefs.filter((item) => itemAllowed(userRole, item.capability, item.href));
}
export function getQuickActionsForUserRole(userRole: string | null) {
    return quickActions.filter((item) => itemAllowed(userRole, item.capability, item.action));
}
