import { describe, expect, it } from 'vitest'

import { navItemsForRole } from '@/lib/access-control/dashboard-access'

import { DASHBOARD_NAVIGATION_GROUPS, WORKFORCE_ROUTES } from './workforce-routes'

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
    const navByRole = new Map(
      (['admin', 'team', 'client'] as const).map((role) => [role, navItemsForRole(role)]),
    )

    for (const [, nav] of navByRole) {
      const coreById = new Map(nav.map((group) => [group.id, group]))
      const core = coreById.get('core')
      expect(core?.items.some((i) => i.href === '/dashboard/projects')).toBe(true)
      expect(core?.items.some((i) => i.href === '/dashboard/tasks')).toBe(true)
    }
  })

  it('shows Analytics and Proposals but not Ads/Socials for clients', () => {
    const nav = navItemsForRole('client')
    const agency = nav.find((g) => g.id === 'agency-tools')
    const hrefs = agency?.items.map((i) => i.href) ?? []
    expect(hrefs).toContain('/dashboard/analytics')
    expect(hrefs).toContain('/dashboard/proposals')
    expect(hrefs).not.toContain('/dashboard/ads')
    expect(hrefs).not.toContain('/dashboard/socials')
  })
})
