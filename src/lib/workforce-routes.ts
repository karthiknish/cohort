import type { LucideIcon } from 'lucide-react'
import {
  Activity,
  BarChart3,
  BriefcaseBusiness,
  Bell,
  CalendarDays,
  CheckSquare,
  Clock3,
  FileText,
  Home,
  Megaphone,
  MessageSquare,
  Palmtree,
  Share2,
  Video,
} from 'lucide-react'

import type { WorkforceRouteId, WorkforceVisibility } from '@/types/workforce'

export type WorkforceRouteDefinition = {
  id: WorkforceRouteId
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
    roles?: WorkforceVisibility[]
  }[]
}

export const WORKFORCE_ROUTES: WorkforceRouteDefinition[] = [
  {
    id: 'time',
    href: '/dashboard/time',
    name: 'Time',
    title: 'Time and attendance',
    description: 'Clock in and out, breaks, sessions, and timesheet review in your workspace.',
    section: 'operations',
    icon: Clock3,
    roles: ['admin', 'team'],
  },
  {
    id: 'scheduling',
    href: '/dashboard/scheduling',
    name: 'Scheduling',
    title: 'Scheduling and shifts',
    description: 'Shifts, open coverage, swaps, and availability for the team schedule.',
    section: 'operations',
    icon: CalendarDays,
    roles: ['admin', 'team'],
  },
  {
    id: 'forms',
    href: '/dashboard/forms',
    name: 'Forms',
    title: 'Forms and checklists',
    description: 'Checklist templates, submissions, and follow-ups for recurring work.',
    section: 'operations',
    icon: FileText,
    roles: ['admin', 'team'],
  },
  {
    id: 'time-off',
    href: '/dashboard/time-off',
    name: 'Time off',
    title: 'Time off',
    description: 'Leave balances, requests, and approvals.',
    section: 'operations',
    icon: Palmtree,
    roles: ['admin', 'team'],
  },
]

export const WORKFORCE_ROUTE_MAP = Object.fromEntries(
  WORKFORCE_ROUTES.map((route) => [route.id, route]),
) as Record<WorkforceRouteId, WorkforceRouteDefinition>

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
    id: 'team-ops',
    label: 'Team operations',
    items: WORKFORCE_ROUTES.map((route) => ({
      name: route.name,
      href: route.href,
      description: route.description,
      icon: route.icon,
      roles: route.roles,
    })),
  },
  {
    id: 'agency-tools',
    label: 'Agency tools',
    items: [
      { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, description: 'Traffic, funnels, and client performance' },
      { name: 'Ads', href: '/dashboard/ads', icon: Megaphone, description: 'Ad integrations and pacing', roles: ['admin', 'team'] },
      { name: 'Socials', href: '/dashboard/socials', icon: Share2, description: 'Social and content sync', roles: ['admin', 'team'] },
      { name: 'Proposals', href: '/dashboard/proposals', icon: FileText, description: 'Proposals and decks for clients', roles: ['admin', 'team'] },
      { name: 'Activity', href: '/dashboard/activity', icon: Activity, description: 'Recent actions and audit trail' },
    ],
  },
]
