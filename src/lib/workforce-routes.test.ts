import { describe, expect, it } from 'vitest'

import {
  DASHBOARD_NAVIGATION_GROUPS,
  type NavigationGroup,
  WORKFORCE_ROUTES,
} from './workforce-routes'

/** Mirrors sidebar filtering in `src/shared/layout/navigation.tsx` */
function filterNavForRole(userRole: 'admin' | 'team' | 'client'): NavigationGroup[] {
  return DASHBOARD_NAVIGATION_GROUPS.map((group) => ({
    ...group,
    items: group.items.filter((item) => {
      if (!item.roles) return true
      return item.roles.includes(userRole)
    }),
  })).filter((group) => group.items.length > 0)
}

describe('workforce-routes (hybrid team ops nav)', () => {
  it('exposes team operations routes with expected hrefs', () => {
    const hrefs = WORKFORCE_ROUTES.map((r) => r.href)
    expect(hrefs).toEqual([
      '/dashboard/time',
      '/dashboard/scheduling',
      '/dashboard/forms',
      '/dashboard/time-off',
    ])
  })

  it('includes Team operations group with the same four links for admin/team', () => {
    const teamOps = DASHBOARD_NAVIGATION_GROUPS.find((g) => g.id === 'team-ops')
    expect(teamOps?.label).toBe('Team operations')
    expect(teamOps?.items.map((i) => i.href)).toEqual(WORKFORCE_ROUTES.map((r) => r.href))
  })

  it('uses Agency tools group for growth stack', () => {
    const agency = DASHBOARD_NAVIGATION_GROUPS.find((g) => g.id === 'agency-tools')
    expect(agency?.label).toBe('Agency tools')
    expect(agency?.items.some((i) => i.href === '/dashboard/analytics')).toBe(true)
    expect(agency?.items.some((i) => i.href === '/dashboard/proposals')).toBe(true)
  })

  it('hides Team operations group for client role (internal ops are admin/team only)', () => {
    const clientNav = filterNavForRole('client')
    expect(clientNav.some((g) => g.id === 'team-ops')).toBe(false)
  })

  it('shows full Team operations (4 links) for admin and team', () => {
    for (const role of ['admin', 'team'] as const) {
      const nav = filterNavForRole(role)
      const teamOps = nav.find((g) => g.id === 'team-ops')
      expect(teamOps?.items.map((i) => i.href)).toEqual(WORKFORCE_ROUTES.map((r) => r.href))
    }
  })

  it('keeps Workspace (core) before Team operations in group order for admin', () => {
    const adminNav = filterNavForRole('admin')
    const ids = adminNav.map((g) => g.id)
    const core = ids.indexOf('core')
    const teamOps = ids.indexOf('team-ops')
    expect(core).toBeGreaterThanOrEqual(0)
    expect(teamOps).toBeGreaterThanOrEqual(0)
    expect(core).toBeLessThan(teamOps)
  })
})
