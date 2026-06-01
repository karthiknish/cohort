import Link from 'next/link';
import { BarChart3, Megaphone, FileText, MessageSquare, CheckSquare, Plus, Briefcase } from 'lucide-react';
import { useMemo } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/shared/ui/card';
import { Button } from '@/shared/ui/button';
import { Badge } from '@/shared/ui/badge';
import { can, type DashboardCapability } from '@/lib/access-control/dashboard-access';
import { useAuth } from '@/shared/contexts/auth-context';
type QuickLink = {
    title: string;
    description: string;
    href: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    badge: string | null;
    capability?: DashboardCapability;
};
type CreateAction = {
    label: string;
    href: string;
    icon: React.ComponentType<React.SVGProps<SVGSVGElement>>;
    description: string;
    capability?: DashboardCapability;
};
// Admin-specific quick links
const adminQuickLinks: QuickLink[] = [
    {
        title: 'Manage ad integrations',
        description: 'Connect platforms, refresh syncs, and review campaign metrics in the Ads hub.',
        href: '/dashboard/ads',
        icon: Megaphone,
        badge: null,
        capability: 'agency.ads',
    },
    {
        title: 'Manage projects',
        description: 'Review active projects, milestones, and delivery timelines in one place.',
        href: '/dashboard/projects',
        icon: Briefcase,
        badge: null,
    },
    {
        title: 'Deep-dive analytics',
        description: 'Use advanced breakdowns and visualizations to compare channel performance.',
        href: '/dashboard/analytics',
        icon: BarChart3,
        badge: null,
    },
];
// Client-specific quick links (simpler, focused on their needs)
const clientQuickLinks: QuickLink[] = [
    {
        title: 'View your projects',
        description: 'Check project status, timelines, and deliverables.',
        href: '/dashboard/projects',
        icon: Briefcase,
        badge: null,
    },
    {
        title: 'Track your tasks',
        description: 'See tasks assigned to you and their current status.',
        href: '/dashboard/tasks',
        icon: CheckSquare,
        badge: null,
    },
    {
        title: 'Team collaboration',
        description: 'Message your team and stay updated on discussions.',
        href: '/dashboard/collaboration',
        icon: MessageSquare,
        badge: null,
    },
];
const createActions: CreateAction[] = [
    {
        label: 'New Proposal',
        href: '/dashboard/proposals',
        icon: FileText,
        description: 'AI-powered',
        capability: 'proposals.manage',
    },
    {
        label: 'New Task',
        href: '/dashboard/tasks?action=create',
        icon: CheckSquare,
        description: 'Add task',
    },
    {
        label: 'Start Chat',
        href: '/dashboard/collaboration',
        icon: MessageSquare,
        description: 'Team discussion',
    },
];
interface QuickActionsProps {
    compact?: boolean;
}
export function QuickActions({ compact }: QuickActionsProps) {
    const { user } = useAuth();
    const userRole = user?.role ?? 'client';
    // Choose and filter quick links/actions based on role (memoized to avoid recreating arrays each render)
    const { filteredQuickLinks, filteredCreateActions } = (() => {
        const quickLinks = userRole === 'client' ? clientQuickLinks : adminQuickLinks;
        return {
            filteredQuickLinks: quickLinks.filter((link) => !link.capability || can(userRole, link.capability)),
            filteredCreateActions: createActions.filter((action) => !action.capability || can(userRole, action.capability)),
        };
    })();
    return (<Card className="shadow-sm">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Quick actions</CardTitle>
            {!compact && <CardDescription>Jump into the teams and workflows that need attention.</CardDescription>}
          </div>
          {!compact && (<div className="hidden sm:flex items-center gap-2">
              {filteredCreateActions.map((action) => {
                return (<Button key={action.href} asChild variant="outline" size="sm" className="gap-1.5">
                    <Link href={action.href}>
                      <Plus className="size-3.5"/>
                      {action.label}
                    </Link>
                  </Button>);
            })}
            </div>)}
        </div>
      </CardHeader>
      <CardContent>
        {/* Mobile create actions */}
        {!compact && (<div className="grid gap-3 sm:hidden mb-4">
            {filteredCreateActions.map((action) => {
                const Icon = action.icon;
                return (<Button key={action.href} asChild variant="outline" size="sm" className="justify-start gap-2">
                  <Link href={action.href}>
                    <Icon className="size-4"/>
                    {action.label}
                    <span className="ml-auto text-xs text-muted-foreground">{action.description}</span>
                  </Link>
                </Button>);
            })}
          </div>)}

        <div className={`grid gap-3 ${compact ? 'grid-cols-1' : 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3'}`}>
          {filteredQuickLinks.map((link) => {
            const Icon = link.icon;
            return (<Link key={link.href} href={link.href} className="group flex h-full flex-col justify-between rounded-lg border border-muted/60 bg-background p-4 transition hover:border-accent/80 hover:shadow-sm">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="inline-flex size-9 items-center justify-center rounded-full bg-accent/10 text-primary">
                      <Icon className="size-4"/>
                    </span>
                    {link.badge && (<Badge variant="secondary" className="text-xs">{link.badge}</Badge>)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-foreground group-hover:text-primary">{link.title}</p>
                    {!compact && <p className="mt-1 text-xs text-muted-foreground">{link.description}</p>}
                  </div>
                </div>
                {!compact && (<span className="mt-4 inline-flex items-center text-xs font-medium text-primary">
                    Go to {link.title.split(' ')[0]}
                  </span>)}
              </Link>);
        })}
        </div>
      </CardContent>
    </Card>);
}
