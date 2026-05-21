import type { LucideIcon } from 'lucide-react'
import {
  BarChart3,
  BriefcaseBusiness,
  Bell,
  CheckSquare,
  FileText,
  Home,
  Megaphone,
  MessageSquare,
  Share2,
  Video,
} from 'lucide-react'

import type { DashboardCapability } from '@/lib/access-control/dashboard-access'
import type { WorkforceVisibility } from '@/types/workforce'

export type WorkforceRouteDefinition = {
  id: string
  href: string
  name: string
  title: string
  description: string
  section: 'operations' | 'communications' | 'people'
  icon: LucideIcon
  roles: WorkforceVisibility[]
}

export type NavigationGroup = {
  id: string
  label: string
  items: {
    name: string
    href: string
    description: string
    icon: LucideIcon
    /** @deprecated Prefer `capability`; kept for backward compatibility. */
    roles?: WorkforceVisibility[]
    capability?: DashboardCapability
  }[]
}

/** Standalone time / scheduling / time-off routes removed from the product. */
export const WORKFORCE_ROUTES: WorkforceRouteDefinition[] = []

export const WORKFORCE_ROUTE_MAP = Object.fromEntries(
  WORKFORCE_ROUTES.map((route) => [route.id, route]),
) as Record<string, WorkforceRouteDefinition>

export const DASHBOARD_NAVIGATION_GROUPS: NavigationGroup[] = [
  {
    id: 'core',
    label: 'Workspace',
    items: [
      { name: 'For You', href: '/for-you', icon: Home, description: 'Your day and priorities' },
      { name: 'Projects', href: '/dashboard/projects', icon: BriefcaseBusiness, description: 'Client delivery and milestones' },
      { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare, description: 'Assignments and work tracking' },
      { name: 'Collaboration', href: '/dashboard/collaboration', icon: MessageSquare, description: 'Chat and shared context' },
      { name: 'Meetings', href: '/dashboard/meetings', icon: Video, description: 'Schedule and run meetings' },
      { name: 'Notifications', href: '/dashboard/notifications', icon: Bell, description: 'Mentions and system alerts' },
    ],
  },
  {
    id: 'agency-tools',
    label: 'Agency tools',
    items: [
      {
        name: 'Analytics',
        href: '/dashboard/analytics',
        icon: BarChart3,
        description: 'Traffic, funnels, and client performance',
        capability: 'analytics.view',
      },
      {
        name: 'Ads',
        href: '/dashboard/ads',
        icon: Megaphone,
        description: 'Ad integrations and pacing',
        capability: 'agency.ads',
        roles: ['admin', 'team'],
      },
      {
        name: 'Socials',
        href: '/dashboard/socials',
        icon: Share2,
        description: 'Social and content sync',
        capability: 'agency.socials',
        roles: ['admin', 'team'],
      },
      {
        name: 'Proposals',
        href: '/dashboard/proposals',
        icon: FileText,
        description: 'Shared proposals and decks from your agency',
        capability: 'proposals.view',
      },
    ],
  },
]
