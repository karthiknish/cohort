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
    description: 'Run clock-ins, review hours, and catch exceptions before payroll handoff.',
    section: 'operations',
    icon: Clock3,
    roles: ['admin', 'team'],
  },
  {
    id: 'scheduling',
    href: '/dashboard/scheduling',
    name: 'Scheduling',
    title: 'Scheduling and shifts',
    description: 'Plan coverage, resolve swaps, and keep delivery teams aligned on who is on point.',
    section: 'operations',
    icon: CalendarDays,
    roles: ['admin', 'team'],
  },
  {
    id: 'forms',
    href: '/dashboard/forms',
    name: 'Forms',
    title: 'Forms and checklists',
    description: 'Turn recurring work into repeatable checklists and track field completion quality.',
    section: 'operations',
    icon: FileText,
    roles: ['admin', 'team'],
  },
  {
    id: 'time-off',
    href: '/dashboard/time-off',
    name: 'Time off',
    title: 'Time off',
    description: 'Handle leave requests, approvals, and team availability without leaving the workspace.',
    section: 'people',
    icon: CalendarDays,
    roles: ['admin', 'team'],
  },
]

export const WORKFORCE_ROUTE_MAP = Object.fromEntries(
  WORKFORCE_ROUTES.map((route) => [route.id, route]),
) as Record<WorkforceRouteId, WorkforceRouteDefinition>

export const DASHBOARD_NAVIGATION_GROUPS: NavigationGroup[] = [
  {
    id: 'core',
    label: 'Core workspace',
    items: [
      { name: 'For You', href: '/for-you', icon: Home, description: 'Your workspace overview' },
      { name: 'Projects', href: '/dashboard/projects', icon: BriefcaseBusiness, description: 'Project management' },
      { name: 'Tasks', href: '/dashboard/tasks', icon: CheckSquare, description: 'Task management' },
      { name: 'Collaboration', href: '/dashboard/collaboration', icon: MessageSquare, description: 'Team chat' },
      { name: 'Meetings', href: '/dashboard/meetings', icon: Video, description: 'Schedule and run meetings' },
      { name: 'Notifications', href: '/dashboard/notifications', icon: Bell, description: 'System and mention alerts' },
    ],
  },
  {
    id: 'delivery',
    label: 'Delivery and growth',
    items: [
      { name: 'Analytics', href: '/dashboard/analytics', icon: BarChart3, description: 'Performance insights' },
      { name: 'Ads', href: '/dashboard/ads', icon: Megaphone, description: 'Ad integrations', roles: ['admin', 'team'] },
      { name: 'Socials', href: '/dashboard/socials', icon: Share2, description: 'Meta & Instagram insights', roles: ['admin', 'team'] },
      { name: 'Proposals', href: '/dashboard/proposals', icon: FileText, description: 'Create proposals', roles: ['admin', 'team'] },
      { name: 'Activity', href: '/dashboard/activity', icon: Activity, description: 'Recent actions and audit trail' },
    ],
  },
]
