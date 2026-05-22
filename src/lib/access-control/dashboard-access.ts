import { normalizeRole } from '@/services/auth/utils'
import type { AuthRole } from '@/services/auth/types'
import {
  DASHBOARD_NAVIGATION_GROUPS,
  type NavigationGroup,
} from '@/lib/workforce-routes'

export type { AuthRole }

export type DashboardCapability =
  | 'analytics.view'
  | 'proposals.view'
  | 'proposals.manage'
  | 'agency.ads'
  | 'agency.socials'
  | 'admin.directory'

const ALL_ROLES: readonly AuthRole[] = ['admin', 'team', 'client']
const AGENCY_ROLES: readonly AuthRole[] = ['admin', 'team']

const CAPABILITY_ROLES: Record<DashboardCapability, readonly AuthRole[]> = {
  'analytics.view': ALL_ROLES,
  'proposals.view': ALL_ROLES,
  'proposals.manage': AGENCY_ROLES,
  'agency.ads': AGENCY_ROLES,
  'agency.socials': AGENCY_ROLES,
  'admin.directory': ['admin'],
}

/** Longest-prefix-first route guards (pathname must match or start with prefix + /). */
export const ROUTE_ACCESS: ReadonlyArray<{ prefix: string; capability: DashboardCapability }> = [
  { prefix: '/admin/clients', capability: 'admin.directory' },
  { prefix: '/dashboard/ads', capability: 'agency.ads' },
  { prefix: '/dashboard/socials', capability: 'agency.socials' },
  { prefix: '/dashboard/proposals', capability: 'proposals.view' },
  { prefix: '/dashboard/analytics', capability: 'analytics.view' },
]

const HREF_CAPABILITY: Record<string, DashboardCapability> = {
  '/dashboard/analytics': 'analytics.view',
  '/dashboard/ads': 'agency.ads',
  '/dashboard/socials': 'agency.socials',
  '/dashboard/proposals': 'proposals.view',
  '/admin/clients': 'admin.directory',
}

export function normalizeAuthRole(role: string | null | undefined): AuthRole {
  return normalizeRole(role)
}

export function can(
  role: string | null | undefined,
  capability: DashboardCapability,
): boolean {
  const normalized = normalizeAuthRole(role)
  return CAPABILITY_ROLES[capability].includes(normalized)
}

export function capabilityForHref(href: string): DashboardCapability | null {
  return HREF_CAPABILITY[href] ?? null
}

export function rolesForCapability(capability: DashboardCapability): readonly AuthRole[] {
  return CAPABILITY_ROLES[capability]
}

/** Prefixes that require agency-only capabilities (Ads + Socials). */
export function agencyOnlyPrefixes(): readonly string[] {
  return ROUTE_ACCESS.flatMap((entry) =>
    entry.capability === 'agency.ads' || entry.capability === 'agency.socials'
      ? [entry.prefix]
      : [],
  )
}

function matchesRoutePrefix(pathname: string, prefix: string): boolean {
  return pathname === prefix || pathname.startsWith(`${prefix}/`)
}

export function canAccessPath(role: string | null | undefined, pathname: string): boolean {
  for (const entry of ROUTE_ACCESS) {
    if (matchesRoutePrefix(pathname, entry.prefix)) {
      return can(role, entry.capability)
    }
  }
  return true
}

export function navItemsForRole(
  role: string | null | undefined,
  groups: NavigationGroup[] = DASHBOARD_NAVIGATION_GROUPS,
): NavigationGroup[] {
  const normalized = normalizeAuthRole(role)
  return groups.flatMap((group) => {
    const items = group.items.filter((item) => {
      const capability = item.capability ?? capabilityForHref(item.href)
      if (!capability) return true
      return CAPABILITY_ROLES[capability].includes(normalized)
    })
    return items.length > 0 ? [{ ...group, items }] : []
  })
}

export type AccessDeniedContent = {
  title: string
  message: string
  actionLabel: string
  actionHref: string
}

export function accessDeniedContentForCapability(
  capability: DashboardCapability,
  role: AuthRole,
): AccessDeniedContent {
  if (capability === 'admin.directory') {
    return {
      title: 'Administrator access required',
      message: 'Client directory and workspace administration are limited to administrators.',
      actionLabel: 'Back to For You',
      actionHref: '/for-you',
    }
  }

  if (capability === 'agency.ads' || capability === 'agency.socials') {
    return {
      title: 'Agency tools only',
      message:
        role === 'client'
          ? 'Paid media and social sync tools are managed by your agency team. You can still view Analytics and shared Proposals for your workspace.'
          : 'This area is for agency team members with the right permissions.',
      actionLabel: 'Back to For You',
      actionHref: '/for-you',
    }
  }

  return {
    title: 'Access restricted',
    message: "You don't have permission to view this page with your current role.",
    actionLabel: 'Back to For You',
    actionHref: '/for-you',
  }
}

export function accessDeniedContentForPath(
  pathname: string,
  role: string | null | undefined,
): AccessDeniedContent | null {
  const normalized = normalizeAuthRole(role)
  for (const entry of ROUTE_ACCESS) {
    if (matchesRoutePrefix(pathname, entry.prefix) && !can(normalized, entry.capability)) {
      return accessDeniedContentForCapability(entry.capability, normalized)
    }
  }
  return null
}
