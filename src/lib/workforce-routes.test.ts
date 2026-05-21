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

describe('workforce-routes', () => {
  it('does not expose removed time / scheduling / time-off routes', () => {
    expect(WORKFORCE_ROUTES).toEqual([])
  })

  it('does not include a Team operations nav group', () => {
    expect(DASHBOARD_NAVIGATION_GROUPS.some((g) => g.id === 'team-ops')).toBe(false)
  })

  it('uses Agency tools group for growth stack', () => {
    const agency = DASHBOARD_NAVIGATION_GROUPS.find((g) => g.id === 'agency-tools')
    expect(agency?.label).toBe('Agency tools')
    expect(agency?.items.some((i) => i.href === '/dashboard/analytics')).toBe(true)
    expect(agency?.items.some((i) => i.href === '/dashboard/proposals')).toBe(true)
  })

  it('includes Workspace core links for all roles', () => {
    for (const role of ['admin', 'team', 'client'] as const) {
      const nav = filterNavForRole(role)
      const core = nav.find((g) => g.id === 'core')
      expect(core?.items.some((i) => i.href === '/dashboard/projects')).toBe(true)
      expect(core?.items.some((i) => i.href === '/dashboard/tasks')).toBe(true)
    }
  })
})
