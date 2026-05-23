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

import type { AuthRole } from '@/services/auth/types'
import type { DashboardCapability } from '@/lib/access-control/dashboard-access'

export type NavigationGroup = {
  id: string
  label: string
  items: {
    name: string
    href: string
    description: string
    icon: LucideIcon
    roles?: AuthRole[]
    capability?: DashboardCapability
  }[]
}

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
